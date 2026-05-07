import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Fallback when no agent is available. Persists the lead in
 * human_handoff_requests with status='no_agent' so the existing inbox UIs
 * surface it for follow-up. An email notification to info@zeniva.ca is
 * attempted via nodemailer if SMTP env is wired; otherwise it's logged.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const phone = String(body?.phone || "").trim();
    const message = String(body?.message || "").trim();
    const cartSnapshot = body?.cart_snapshot && typeof body.cart_snapshot === "object" ? body.cart_snapshot : {};
    const locale = typeof body?.locale === "string" && /^[a-z]{2}$/i.test(body.locale) ? body.locale : "en";

    if (!email || !name) {
      return NextResponse.json({ ok: false, error: "Missing name or email" }, { status: 400 });
    }

    const id = `hh_lead_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
    const { client } = getSupabaseAdminClient();
    const { error: insertError } = await client.from("human_handoff_requests").insert({
      id,
      client_email: email,
      client_name: name,
      contact_method: "chat",
      status: "no_agent",
      cart_snapshot: cartSnapshot,
      locale,
      client_metadata: { phone, message },
      source_page: typeof body?.source_page === "string" ? body.source_page : null,
    });
    if (insertError) throw insertError;

    // Best-effort email notification.
    void sendNoAgentEmail({ id, name, email, phone, message }).catch((err) => {
      console.warn("[handoff/lead-capture] email send failed (non-fatal)", err?.message || err);
    });

    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed to capture lead" }, { status: 500 });
  }
}

async function sendNoAgentEmail(args: { id: string; name: string; email: string; phone: string; message: string }) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || "info@zeniva.ca";
  if (!host || !user || !pass) {
    console.info("[handoff/lead-capture] SMTP not configured — lead saved to DB only");
    return;
  }
  const nodemailer = await import("nodemailer");
  const transport = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
  await transport.sendMail({
    from,
    to: "info@zeniva.ca",
    subject: `[Handoff] No-agent lead from ${args.name}`,
    text: [
      `A visitor requested a human agent but none were available.`,
      ``,
      `Request id: ${args.id}`,
      `Name:    ${args.name}`,
      `Email:   ${args.email}`,
      `Phone:   ${args.phone || "—"}`,
      `Message: ${args.message || "—"}`,
      ``,
      `View in Supabase: human_handoff_requests where id = '${args.id}'`,
    ].join("\n"),
  });
}
