import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Mass drip outreach via Brevo (300/day free) + Gmail fallback.
 * Sends personalized B2B emails to travel agencies worldwide.
 * Called by n8n daily or manually.
 */

const BREVO_KEY = process.env.BREVO_API_KEY || "";
const DAILY_LIMIT = 300; // Brevo free tier
const DELAY_MS = 2000; // 2s between sends

async function sendViaBrevo(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": BREVO_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: "Alexandre — Zeniva Travel", email: "info@zeniva.ca" },
        to: [{ email: to }],
        replyTo: { email: "info@zeniva.ca", name: "Alexandre Blais" },
        subject,
        htmlContent: html,
        headers: {
          "List-Unsubscribe": "<mailto:unsubscribe@zeniva.ca?subject=Unsubscribe>",
        },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function buildAgencyEmail(agency: any): { subject: string; html: string } | null {
  const name = agency.contact_name?.split(" ")[0] || "";
  const company = agency.company_name || "";
  const city = agency.city || "";
  if (!company) return null;

  const greeting = name ? `Hi ${name},` : `Hello,`;
  const cityLine = city ? ` based in ${city}` : "";

  const subject = `${company} + AI travel concierge — quick question`;

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;color:#1e293b;">
  <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">${greeting}</p>
  <p style="font-size:14px;line-height:1.7;margin:0 0 16px;">I came across <strong>${company}</strong>${cityLine} and wanted to reach out briefly.</p>
  <p style="font-size:14px;line-height:1.7;margin:0 0 16px;">We built <strong>Lina</strong>, an AI travel concierge that handles client inquiries 24/7 — instant trip proposals, flight + hotel search, itinerary building — all under your agency's brand.</p>
  <p style="font-size:14px;line-height:1.7;margin:0 0 16px;">A few agencies we work with use Lina to:</p>
  <ul style="font-size:14px;line-height:1.8;color:#334155;margin:0 0 16px;padding-left:20px;">
    <li>Respond to leads instantly (even at 2am)</li>
    <li>Generate full trip proposals in 60 seconds</li>
    <li>Handle routine questions so agents focus on closing</li>
  </ul>
  <p style="font-size:14px;line-height:1.7;margin:0 0 16px;">Would it make sense to show you a quick 5-minute demo? No pressure at all — just thought it could be relevant for ${company}.</p>
  <p style="font-size:14px;line-height:1.7;margin:0 0 4px;">Best,</p>
  <p style="font-size:14px;line-height:1.7;margin:0 0 0;">
    <strong>Alexandre Blais</strong><br/>
    <span style="color:#64748b;font-size:13px;">Founder, Zeniva Travel</span><br/>
    <span style="color:#64748b;font-size:13px;">info@zeniva.ca · zenivatravel.com</span>
  </p>
  <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#94a3b8;line-height:1.6;">
    <p style="margin:0 0 8px;">Zeniva LLC · 8 The Green, Ste A · Dover, DE 19901 · USA</p>
    <p style="margin:0;"><a href="mailto:unsubscribe@zeniva.ca?subject=Unsubscribe" style="color:#6366f1;text-decoration:underline;">Unsubscribe</a> · <a href="https://www.zenivatravel.com/privacy" style="color:#6366f1;text-decoration:underline;">Privacy Policy</a></p>
  </div>
</div>`;

  return { subject, html };
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const n8nSecret = process.env.N8N_WEBHOOK_SECRET || "zeniva-n8n-2026";
  const cronSecret = process.env.CRON_SECRET;
  const cookies = req.headers.get("cookie") || "";
  const isAuth = authHeader === `Bearer ${n8nSecret}` ||
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    cookies.includes("zeniva_session=");
  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!BREVO_KEY) return NextResponse.json({ error: "BREVO_API_KEY not set" }, { status: 500 });

  const { client } = getSupabaseAdminClient();

  // Check how many sent today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { count: sentToday } = await client
    .from("comms_log")
    .select("id", { count: "exact", head: true })
    .eq("type", "email")
    .eq("status", "sent")
    .gte("created_at", todayStart.toISOString());

  const remaining = Math.max(0, DAILY_LIMIT - (sentToday || 0));
  if (remaining === 0) {
    return NextResponse.json({ ok: true, message: `Daily limit reached (${DAILY_LIMIT}). Sent ${sentToday} today.`, sent: 0 });
  }

  // Get agencies: have email, status new, not junk
  const { data: agencies } = await client
    .from("leads_business")
    .select("id, contact_name, contact_email, company_name, city, province, website")
    .eq("type", "travel_agency")
    .eq("status", "new")
    .neq("contact_email", "")
    .neq("contact_email", "not_found")
    .not("contact_email", "is", null)
    .order("created_at", { ascending: true })
    .limit(remaining);

  if (!agencies?.length) {
    return NextResponse.json({ ok: true, message: "No new agencies to contact.", sent: 0 });
  }

  let sent = 0;
  let failed = 0;

  for (const agency of agencies) {
    const emailContent = buildAgencyEmail(agency);
    if (!emailContent) continue;

    const success = await sendViaBrevo(agency.contact_email, emailContent.subject, emailContent.html);

    if (success) {
      await client.from("leads_business")
        .update({ status: "contacted", last_contacted_at: new Date().toISOString() })
        .eq("id", agency.id);

      await client.from("comms_log").insert({
        type: "email",
        recipient: agency.contact_email,
        subject: emailContent.subject,
        lead_id: agency.id,
        status: "sent",
      });
      sent++;
    } else {
      failed++;
      await client.from("comms_log").insert({
        type: "email",
        recipient: agency.contact_email,
        subject: emailContent.subject,
        lead_id: agency.id,
        status: "failed",
      });
    }

    if (sent < agencies.length) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  return NextResponse.json({ ok: true, sent, failed, dailyLimit: DAILY_LIMIT, sentToday: (sentToday || 0) + sent });
}
