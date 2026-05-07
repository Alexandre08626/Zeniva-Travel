import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Create a human-handoff request. Called when a visitor clicks "Confirm with
 * a human agent" on a recap page. Returns the request id (used as the room
 * id by the call provider) and a snapshot of agent availability.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { client } = getSupabaseAdminClient();
    const id = `hh_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
    const contactMethod = body?.contact_method === "call" ? "call" : "chat";

    const insert = {
      id,
      client_id: typeof body?.client_id === "string" ? body.client_id : null,
      client_email: typeof body?.client_email === "string" ? body.client_email : null,
      client_name: typeof body?.client_name === "string" ? body.client_name : null,
      contact_method: contactMethod,
      status: "pending",
      cart_snapshot: body?.cart_snapshot && typeof body.cart_snapshot === "object" ? body.cart_snapshot : {},
      source_page: typeof body?.source_page === "string" ? body.source_page : null,
      locale: typeof body?.locale === "string" && /^[a-z]{2}$/i.test(body.locale) ? body.locale : "en",
      client_metadata: body?.client_metadata && typeof body.client_metadata === "object" ? body.client_metadata : {},
    };

    const { error: insertError } = await client.from("human_handoff_requests").insert(insert);
    if (insertError) throw insertError;

    const [{ count: availableAgents }, { count: queueAhead }] = await Promise.all([
      client
        .from("agents_availability")
        .select("agent_id", { count: "exact", head: true })
        .eq("status", "available"),
      client
        .from("human_handoff_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending")
        .lt("requested_at", new Date().toISOString()),
    ]);

    return NextResponse.json({
      ok: true,
      id,
      contact_method: contactMethod,
      available_agents: availableAgents || 0,
      queue_ahead: Math.max(0, (queueAhead || 1) - 1),
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed to create handoff request" }, { status: 500 });
  }
}
