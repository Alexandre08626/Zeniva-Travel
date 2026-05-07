import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Live snapshot of agent availability + waiting queue. Powers the modal's
 * "X agents available" / "Y clients ahead of you" display before the user
 * commits to chat or call.
 *
 * Stale-rule: an agent counts as "available" only if their last_active_at is
 * within the last 90 seconds. Anything older is treated as a stale heartbeat
 * (the agent closed their tab without going offline).
 */
const STALE_AFTER_SECONDS = 90;

export async function GET() {
  try {
    const { client } = getSupabaseAdminClient();
    const cutoff = new Date(Date.now() - STALE_AFTER_SECONDS * 1000).toISOString();

    const [{ count: available }, { count: pending }] = await Promise.all([
      client
        .from("agents_availability")
        .select("agent_id", { count: "exact", head: true })
        .eq("status", "available")
        .gte("last_active_at", cutoff),
      client
        .from("human_handoff_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

    const queue = pending || 0;
    const agents = available || 0;
    const estimatedWaitMinutes = agents === 0 ? null : Math.max(1, Math.ceil(queue / Math.max(agents, 1)) * 2);

    return NextResponse.json({
      ok: true,
      available_agents: agents,
      pending_requests: queue,
      estimated_wait_minutes: estimatedWaitMinutes,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed to load availability" }, { status: 500 });
  }
}
