import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

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

    const { client: admin } = getSupabaseAdminClient();

    // Fix old HQ email variants — update owner_email and assigned_agents
    const { data: fixedRows, error: fixErr } = await admin
      .from("clients")
      .update({
        owner_email: "info@zeniva.ca",
        assigned_agents: ["info@zeniva.ca"],
      })
      .in("owner_email", ["info@zenivatravel.com", "info@zeniva.com"])
      .select("id");

    if (fixErr) {
      console.error("Supabase fix-hq-owners error", { message: fixErr.message });
    }
    const fixed = (fixedRows || []).length;

    // Also delete obvious test leads
    const { data: deletedRows, error: delErr } = await admin
      .from("clients")
      .delete()
      .in("email", ["testclient999@zeniva-test.com", "testclient@zeniva-test.com"])
      .select("id");

    if (delErr) {
      console.error("Supabase delete test clients error", { message: delErr.message });
    }
    const deleted = (deletedRows || []).length;

    // Delete test accounts too
    await admin
      .from("accounts")
      .delete()
      .in("email", ["testclient999@zeniva-test.com", "testclient@zeniva-test.com"])
      .then(() => {})
      .catch(() => {});

    return NextResponse.json({ ok: true, fixedOwners: fixed, deletedTests: deleted });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export const runtime = "nodejs";
