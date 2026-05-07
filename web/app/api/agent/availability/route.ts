import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Upsert an agent's availability heartbeat. Called by the dashboard either
 * when the agent flips the toggle or via a periodic ping while the dashboard
 * is open.
 */
const ALLOWED = new Set(["available", "paused", "offline"]);

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const agentId = String(body?.agent_id || "").trim();
    const status = String(body?.status || "").trim();
    if (!agentId || !ALLOWED.has(status)) {
      return NextResponse.json({ ok: false, error: "Missing or invalid agent_id/status" }, { status: 400 });
    }

    const { client } = getSupabaseAdminClient();
    const now = new Date().toISOString();
    const { error } = await client
      .from("agents_availability")
      .upsert({ agent_id: agentId, status, last_active_at: now, updated_at: now }, { onConflict: "agent_id" });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed to update availability" }, { status: 500 });
  }
}
