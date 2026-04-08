import { NextResponse } from "next/server";
import { assertBackendEnv, dbQuery } from "../../../../src/lib/server/db";
import { requireRbacPermission } from "../../../../src/lib/server/rbac";

export async function GET(request: Request) {
  try {
    assertBackendEnv();
    const gate = await requireRbacPermission(request, "referrals:read");
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

    const { rows } = await dbQuery(
      `SELECT id, name, email, role, roles, status, created_at
       FROM accounts
       WHERE roles::text LIKE '%influencer%'
       ORDER BY created_at DESC`,
      []
    );

    const agents = rows.map((row: any) => ({
      id: row.id,
      name: row.name || "Influencer",
      email: row.email,
      agent_type: "influencer",
      status: row.status || "active",
      leads_count: 0,
      commission_rate: 5,
      ref_code: "",
      created_at: row.created_at,
    }));

    return NextResponse.json({ agents });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
