import { NextRequest, NextResponse } from "next/server";
import { assertBackendEnv, dbQuery } from "../../../../src/lib/server/db";

/**
 * One-time migration: fix old owner_email values
 * POST /api/admin/fix-hq-owners
 * Authorization: Bearer zeniva-secret-2025
 */
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    if (auth !== "Bearer zeniva-secret-2025") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    assertBackendEnv();

    // Fix old HQ email variants
    const { rowCount: fixed } = await dbQuery(
      `UPDATE clients SET owner_email = 'info@zeniva.ca', assigned_agents = jsonb_set(
        COALESCE(assigned_agents, '[]'::jsonb),
        '{0}', '"info@zeniva.ca"'
      ) WHERE owner_email IN ('info@zenivatravel.com', 'info@zeniva.com') RETURNING id`
    );

    // Also delete obvious test leads
    const { rowCount: deleted } = await dbQuery(
      `DELETE FROM clients WHERE email IN ('testclient999@zeniva-test.com', 'testclient@zeniva-test.com') RETURNING id`
    );

    // Delete test accounts too
    await dbQuery(
      `DELETE FROM accounts WHERE email IN ('testclient999@zeniva-test.com', 'testclient@zeniva-test.com')`
    ).catch(() => {});

    return NextResponse.json({ ok: true, fixedOwners: fixed, deletedTests: deleted });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export const runtime = "nodejs";
