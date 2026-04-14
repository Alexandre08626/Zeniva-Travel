import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export async function GET() {
  try {
    const { client } = getSupabaseAdminClient();
    const { data, error } = await client
      .from("accounts")
      .select("id, name, email, role, agent_level, commission_rate, status")
      .in("role", ["travel_agent", "yacht_broker", "influencer", "hq", "admin"])
      .order("name");
    if (error) throw error;
    return NextResponse.json({ agents: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { client } = getSupabaseAdminClient();
    const body = await req.json();
    const { email, commission_rate } = body;

    if (!email || commission_rate === undefined) {
      return NextResponse.json({ error: "email and commission_rate required" }, { status: 400 });
    }

    const rate = parseFloat(commission_rate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      return NextResponse.json({ error: "commission_rate must be 0-100" }, { status: 400 });
    }

    const { error } = await client
      .from("accounts")
      .update({ commission_rate: rate, updated_at: new Date().toISOString() })
      .eq("email", email.toLowerCase());

    if (error) throw error;
    return NextResponse.json({ ok: true, email, commission_rate: rate });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
