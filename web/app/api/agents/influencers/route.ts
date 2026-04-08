import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("zeniva_session")?.value || "";
    const rolesCookie = request.cookies.get("zeniva_roles")?.value || "";
    const hasSession = sessionCookie.length > 10 && (rolesCookie.includes("hq") || rolesCookie.includes("admin") || rolesCookie.includes("agent"));
    if (!hasSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { client } = getSupabaseAdminClient();
    const { data, error } = await client
      .from("accounts")
      .select("id, name, email, role, roles, status, created_at")
      .contains("roles", ["influencer"])
      .order("created_at", { ascending: false });

    if (error) {
      console.error("influencers query error:", error.message);
      return NextResponse.json({ agents: [] });
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
    console.error("influencers endpoint error:", err?.message);
    return NextResponse.json({ agents: [] });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
