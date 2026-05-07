import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Mark a handoff request as completed (with optional payment link), or as
 * abandoned. Called by the agent when the call/chat ends.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const requestId = String(body?.request_id || "").trim();
    const outcome = body?.outcome === "abandoned" ? "abandoned" : "completed";
    const paymentLinkUrl = typeof body?.payment_link_url === "string" ? body.payment_link_url : null;
    if (!requestId) {
      return NextResponse.json({ ok: false, error: "Missing request_id" }, { status: 400 });
    }

    const { client } = getSupabaseAdminClient();
    const { data, error } = await client
      .from("human_handoff_requests")
      .update({
        status: outcome,
        completed_at: new Date().toISOString(),
        ...(paymentLinkUrl ? { payment_link_url: paymentLinkUrl } : {}),
      })
      .eq("id", requestId)
      .select("id, status, payment_link_url")
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ ok: false, error: "Request not found" }, { status: 404 });
    return NextResponse.json({ ok: true, request: data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed to complete request" }, { status: 500 });
  }
}
