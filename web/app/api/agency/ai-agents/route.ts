import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/src/lib/supabase/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const { client } = getSupabaseAdminClient();
  const { data } = await client.from("ai_agents").select("*").order("sort_order");
  return NextResponse.json({ ok: true, agents: data || [] });
}
