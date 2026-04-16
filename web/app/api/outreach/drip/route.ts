import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/src/lib/supabase/server";
import { sendEmail } from "@/src/lib/server/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Daily drip outreach — sends personalized emails to agencies in small batches.
 *
 * Warmup schedule (protects sender reputation):
 * - Day 1-7:   15 emails/day
 * - Day 8-14:  30 emails/day
 * - Day 15-21: 50 emails/day
 * - Day 22+:   75 emails/day
 *
 * Called daily by n8n via POST.
 */

const WARMUP_START = "2026-04-16"; // today
const DELAY_MS = 8000; // 8 seconds between emails

function getDailyLimit(): number {
  const start = new Date(WARMUP_START).getTime();
  const now = Date.now();
  const daysSinceStart = Math.floor((now - start) / 86400000);
  if (daysSinceStart < 7) return 15;
  if (daysSinceStart < 14) return 30;
  if (daysSinceStart < 21) return 50;
  return 75;
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
</div>`;

  return { subject, html };
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const n8nSecret = process.env.N8N_WEBHOOK_SECRET || "zeniva-n8n-2026";
  const cronSecret = process.env.CRON_SECRET;
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
  const isN8n = authHeader === `Bearer ${n8nSecret}`;
  const cookies = req.headers.get("cookie") || "";
  const hasSession = cookies.includes("zeniva_session=");

  if (!isCron && !isN8n && !hasSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dailyLimit = getDailyLimit();
  const { client } = getSupabaseAdminClient();

  // Check how many we already sent today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count: sentToday } = await client
    .from("comms_log")
    .select("id", { count: "exact", head: true })
    .eq("type", "email")
    .eq("status", "sent")
    .gte("created_at", todayStart.toISOString());

  const remaining = Math.max(0, dailyLimit - (sentToday || 0));
  if (remaining === 0) {
    return NextResponse.json({
      ok: true,
      message: `Daily limit reached (${dailyLimit}/day). Already sent ${sentToday} today.`,
      sent: 0,
      dailyLimit,
    });
  }

  // Get agencies that haven't been contacted yet, with email
  const { data: agencies } = await client
    .from("leads_business")
    .select("id, contact_name, contact_email, company_name, city, province, website")
    .eq("type", "travel_agency")
    .eq("status", "new")
    .neq("contact_email", "")
    .not("contact_email", "is", null)
    .order("created_at", { ascending: true })
    .limit(remaining);

  if (!agencies || agencies.length === 0) {
    return NextResponse.json({
      ok: true,
      message: "No new agencies to contact.",
      sent: 0,
      dailyLimit,
    });
  }

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const agency of agencies) {
    const emailContent = buildAgencyEmail(agency);
    if (!emailContent) continue;

    try {
      await sendEmail({
        to: agency.contact_email,
        from: "info@zeniva.ca",
        fromName: "Alexandre — Zeniva",
        replyTo: "info@zeniva.ca",
        subject: emailContent.subject,
        html: emailContent.html,
      });

      // Mark as contacted
      await client
        .from("leads_business")
        .update({
          status: "contacted",
          last_contacted_at: new Date().toISOString(),
        })
        .eq("id", agency.id);

      // Log it
      await client.from("comms_log").insert({
        type: "email",
        recipient: agency.contact_email,
        subject: emailContent.subject,
        lead_id: agency.id,
        status: "sent",
      });

      sent++;

      // Throttle
      if (sent < agencies.length) {
        await new Promise((r) => setTimeout(r, DELAY_MS));
      }
    } catch (err: any) {
      failed++;
      errors.push(`${agency.company_name}: ${err?.message || "failed"}`);

      await client.from("comms_log").insert({
        type: "email",
        recipient: agency.contact_email,
        subject: emailContent.subject,
        lead_id: agency.id,
        status: "failed",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    failed,
    dailyLimit,
    warmupDay: Math.floor((Date.now() - new Date(WARMUP_START).getTime()) / 86400000) + 1,
    errors: errors.length > 0 ? errors : undefined,
  });
}
