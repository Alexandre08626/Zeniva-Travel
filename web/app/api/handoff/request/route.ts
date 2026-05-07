import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NOTIFY_EMAIL = "info@zeniva.ca";
const PUSH_AUTH = "Bearer zeniva-secret-2025";

/**
 * Create a human-handoff request. Called when a visitor clicks "Confirm with
 * a human agent" on a recap page. Returns the request id (used as the room
 * id by the call provider) and a snapshot of agent availability.
 *
 * Side effects (best-effort, non-blocking):
 *  - Email NOTIFY_EMAIL with the request details + accept link
 *  - Web push to all subscribed agents via /api/push/send so they get
 *    notified even when /agent isn't open
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

    // Best-effort fan-out. We don't await — the visitor shouldn't wait on
    // SMTP / push transports to receive their request id.
    const origin = new URL(request.url).origin;
    void notifyAgents({ id, insert, origin }).catch((err) => {
      console.warn("[handoff/request] agent notify failed (non-fatal)", err?.message || err);
    });

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

async function notifyAgents({
  id,
  insert,
  origin,
}: {
  id: string;
  insert: any;
  origin: string;
}) {
  const acceptUrl = insert.contact_method === "call"
    ? `${origin}/agent/handoff/${encodeURIComponent(id)}?locale=${insert.locale}`
    : `${origin}/agent/chat?handoff=${encodeURIComponent(id)}`;
  const subject = `[Handoff ${insert.contact_method === "call" ? "📹 CALL" : "🗨️ CHAT"}] from ${insert.client_name || insert.client_email || "anonymous"}`;
  const cartTotal = (() => {
    const total = insert.cart_snapshot?.total;
    if (typeof total === "number" || (typeof total === "string" && total)) {
      return `${total} ${insert.cart_snapshot?.currency || "USD"}`;
    }
    return "—";
  })();
  const body = [
    `A visitor just requested a human agent.`,
    ``,
    `Method:      ${insert.contact_method.toUpperCase()}`,
    `Name:        ${insert.client_name || "—"}`,
    `Email:       ${insert.client_email || "—"}`,
    `Cart total:  ${cartTotal}`,
    `Page:        ${insert.source_page || "—"}`,
    `Request id:  ${id}`,
    ``,
    `Accept here: ${acceptUrl}`,
  ].join("\n");

  await Promise.allSettled([sendEmail(subject, body), sendPush({ id, insert, acceptUrl, origin })]);
}

async function sendEmail(subject: string, body: string) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || NOTIFY_EMAIL;
  if (!host || !user || !pass) {
    console.info("[handoff/request] SMTP not configured — skipping email notification");
    return;
  }
  const nodemailer = await import("nodemailer");
  const transport = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
  await transport.sendMail({ from, to: NOTIFY_EMAIL, subject, text: body });
}

async function sendPush({
  id,
  insert,
  acceptUrl,
  origin,
}: {
  id: string;
  insert: any;
  acceptUrl: string;
  origin: string;
}) {
  try {
    const res = await fetch(`${origin}/api/push/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: PUSH_AUTH },
      body: JSON.stringify({
        title: insert.contact_method === "call" ? "📹 New call request" : "🗨️ New chat request",
        body: `${insert.client_name || insert.client_email || "A visitor"} wants to talk to a human.`,
        url: acceptUrl,
        tag: `handoff-${id}`,
      }),
    });
    if (!res.ok) {
      console.warn(`[handoff/request] push send returned ${res.status}`);
    }
  } catch (err: any) {
    console.warn("[handoff/request] push send failed", err?.message || err);
  }
}
