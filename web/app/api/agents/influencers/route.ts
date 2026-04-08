import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export async function GET() {
  try {
    const { client } = getSupabaseAdminClient();
    const { data, error } = await client
      .from("accounts")
      .select("id, name, email, role, roles, status, created_at")
      .contains("roles", ["influencer"])
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ agents: [], error: error.message });
    }

    const agents = (data || []).map((row: any) => ({
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
    return NextResponse.json({ agents: [], error: err?.message });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
