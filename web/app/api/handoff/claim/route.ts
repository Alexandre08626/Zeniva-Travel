import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Agent claims a pending handoff request. Atomic — the WHERE clause prevents
 * two agents from racing on the same row.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const requestId = String(body?.request_id || "").trim();
    const agentId = String(body?.agent_id || "").trim();
    if (!requestId || !agentId) {
      return NextResponse.json({ ok: false, error: "Missing request_id or agent_id" }, { status: 400 });
    }

    const { client } = getSupabaseAdminClient();
    const { data, error } = await client
      .from("human_handoff_requests")
      .update({
        status: "claimed",
        claimed_by_agent_id: agentId,
        claimed_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .eq("status", "pending")
      .select("id, contact_method, client_email, client_name, cart_snapshot, locale")
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ ok: false, error: "Request no longer available" }, { status: 409 });
    }
    return NextResponse.json({ ok: true, request: data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed to claim request" }, { status: 500 });
  }
}
