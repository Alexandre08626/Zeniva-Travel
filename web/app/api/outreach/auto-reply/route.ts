import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/src/lib/supabase/server";
import { sendEmail } from "@/src/lib/server/email";
import Imap from "imap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const OPENAI_KEY = process.env.OPENAI_API_KEY || "";

/**
 * Smart auto-reply for B2B agency outreach.
 *
 * Flow:
 * 1. IMAP scan Gmail for new replies from contacted agencies
 * 2. GPT crafts an intelligent, personalized response
 * 3. Sends reply from info@zeniva.ca
 * 4. Notifies Alexandre via email
 * 5. Updates lead status to "replied"
 *
 * Run every 15 minutes via n8n.
 */

interface InboundEmail {
  from: string;
  subject: string;
  body: string;
  date: string;
  uid: number;
}

function scanImap(): Promise<InboundEmail[]> {
  return new Promise((resolve) => {
    const user = process.env.IMAP_USER || process.env.SMTP_USER || "";
    const pass = process.env.IMAP_PASS || process.env.SMTP_PASS || "";
    if (!user || !pass) { resolve([]); return; }

    const imap = new Imap({
      user,
      password: pass,
      host: "imap.gmail.com",
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      connTimeout: 10000,
      authTimeout: 10000,
    });

    const emails: InboundEmail[] = [];

    imap.once("ready", () => {
      imap.openBox("INBOX", true, (err) => {
        if (err) { imap.end(); resolve([]); return; }

        // Search for unseen emails from the last 24h
        const since = new Date();
        since.setHours(since.getHours() - 24);

        imap.search(["UNSEEN", ["SINCE", since]], (err2, uids) => {
          if (err2 || !uids?.length) { imap.end(); resolve([]); return; }

          const fetch = imap.fetch(uids.slice(0, 20), {
            bodies: ["HEADER.FIELDS (FROM SUBJECT DATE)", "TEXT"],
            struct: true,
          });

          fetch.on("message", (msg, seqno) => {
            let header = "";
            let body = "";
            let uid = 0;

            msg.on("body", (stream, info) => {
              let buf = "";
              stream.on("data", (chunk) => { buf += chunk.toString("utf8"); });
              stream.on("end", () => {
                if (info.which.includes("HEADER")) header = buf;
                else body = buf;
              });
            });
            msg.once("attributes", (attrs) => { uid = attrs.uid; });
            msg.once("end", () => {
              const fromMatch = header.match(/From:\s*(.+)/i);
              const subjMatch = header.match(/Subject:\s*(.+)/i);
              const dateMatch = header.match(/Date:\s*(.+)/i);
              const fromRaw = fromMatch?.[1]?.trim() || "";
              const emailMatch = fromRaw.match(/<([^>]+)>/) || fromRaw.match(/([\w.-]+@[\w.-]+)/);

              emails.push({
                from: emailMatch?.[1]?.toLowerCase() || fromRaw.toLowerCase(),
                subject: subjMatch?.[1]?.trim() || "",
                body: body.slice(0, 2000),
                date: dateMatch?.[1]?.trim() || "",
                uid,
              });
            });
          });

          fetch.once("end", () => { imap.end(); });
          fetch.once("error", () => { imap.end(); resolve([]); });
        });
      });
    });

    imap.once("end", () => resolve(emails));
    imap.once("error", () => resolve([]));
    imap.connect();
  });
}

async function generateReply(agencyName: string, contactName: string, theirMessage: string): Promise<string> {
  if (!OPENAI_KEY) return "";

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content: `You are Alexandre Blais, founder of Zeniva Travel. You're replying to a travel agency that responded to your outreach email about Lina AI (an AI travel concierge for agencies).

Rules:
- Be warm, professional, and brief (3-5 sentences max)
- Match their tone and language (if they write in French, reply in French)
- If they're interested: propose a quick 5-10 min demo call, suggest a few time slots this week
- If they have questions: answer briefly and offer to show them in a demo
- If they want to unsubscribe: be polite, apologize, confirm removal
- Sign as "Alexandre Blais, Founder — Zeniva Travel"
- Include your contact: info@zeniva.ca | zenivatravel.com
- Keep it conversational, NOT salesy
- Do NOT use emojis
- Do NOT write a subject line, just the body`,
          },
          {
            role: "user",
            content: `Agency: ${agencyName}\nContact: ${contactName}\nTheir reply:\n${theirMessage}`,
          },
        ],
      }),
    });

    if (!res.ok) return "";
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  } catch {
    return "";
  }
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

  const { client } = getSupabaseAdminClient();

  // 1. Get all contacted agencies' emails
  const { data: contactedAgencies } = await client
    .from("leads_business")
    .select("id, contact_email, contact_name, company_name")
    .eq("type", "travel_agency")
    .eq("status", "contacted")
    .neq("contact_email", "")
    .not("contact_email", "is", null);

  if (!contactedAgencies?.length) {
    return NextResponse.json({ ok: true, message: "No contacted agencies to monitor", processed: 0 });
  }

  const agencyByEmail = new Map(
    contactedAgencies.map((a) => [a.contact_email.toLowerCase(), a])
  );

  // 2. Scan Gmail IMAP for new replies
  const inboundEmails = await scanImap();

  let replied = 0;
  let notified = 0;
  const results: any[] = [];

  for (const email of inboundEmails) {
    const agency = agencyByEmail.get(email.from);
    if (!agency) continue; // Not from a contacted agency

    // Check if we already auto-replied to this
    const { data: existing } = await client
      .from("comms_log")
      .select("id")
      .eq("recipient", email.from)
      .eq("type", "auto-reply")
      .gte("created_at", new Date(Date.now() - 86400000).toISOString())
      .limit(1);

    if (existing?.length) continue; // Already replied in last 24h

    // 3. Generate smart reply
    const replyText = await generateReply(
      agency.company_name,
      agency.contact_name,
      email.body
    );

    if (!replyText) continue;

    // 4. Send reply
    try {
      await sendEmail({
        to: email.from,
        from: "info@zeniva.ca",
        fromName: "Alexandre — Zeniva Travel",
        replyTo: "info@zeniva.ca",
        subject: `Re: ${email.subject}`,
        html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;color:#1e293b;">
          ${replyText.split("\n").map((line: string) =>
            `<p style="font-size:14px;line-height:1.7;margin:0 0 12px;">${line}</p>`
          ).join("")}
        </div>`,
      });

      // Log
      await client.from("comms_log").insert({
        type: "auto-reply",
        recipient: email.from,
        subject: `Re: ${email.subject}`,
        lead_id: agency.id,
        status: "sent",
      });

      // Update lead status
      await client
        .from("leads_business")
        .update({ status: "demo_scheduled", last_contacted_at: new Date().toISOString() })
        .eq("id", agency.id);

      replied++;
      results.push({ agency: agency.company_name, email: email.from, status: "replied" });
    } catch (err: any) {
      results.push({ agency: agency.company_name, email: email.from, status: "failed", error: err?.message });
    }

    // 5. Notify Alexandre
    try {
      await sendEmail({
        to: "info@zeniva.ca",
        fromName: "Marco — Lead Alert",
        subject: `${agency.company_name} a repondu! — ${agency.contact_name || email.from}`,
        html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
          <div style="background:#10b981;color:white;padding:16px 20px;border-radius:12px 12px 0 0;">
            <h2 style="margin:0;font-size:18px;">Une agence a repondu!</h2>
          </div>
          <div style="background:white;padding:20px;border:1px solid #e2e8f0;border-radius:0 0 12px 12px;">
            <p style="margin:0 0 12px;"><strong>Agence:</strong> ${agency.company_name}</p>
            <p style="margin:0 0 12px;"><strong>Contact:</strong> ${agency.contact_name || "—"} (${email.from})</p>
            <p style="margin:0 0 12px;"><strong>Sujet:</strong> ${email.subject}</p>
            <div style="background:#f8fafc;padding:12px;border-radius:8px;margin:12px 0;">
              <p style="margin:0;font-size:13px;color:#64748b;font-weight:bold;">Leur message:</p>
              <p style="margin:8px 0 0;font-size:14px;color:#1e293b;white-space:pre-wrap;">${email.body.slice(0, 500)}</p>
            </div>
            <div style="background:#f0fdf4;padding:12px;border-radius:8px;margin:12px 0;">
              <p style="margin:0;font-size:13px;color:#16a34a;font-weight:bold;">Auto-reply envoye:</p>
              <p style="margin:8px 0 0;font-size:14px;color:#1e293b;white-space:pre-wrap;">${replyText.slice(0, 500)}</p>
            </div>
            <p style="margin:16px 0 0;font-size:13px;color:#ef4444;font-weight:bold;">A toi de closer maintenant!</p>
          </div>
        </div>`,
      });
      notified++;
    } catch { /* silent */ }
  }

  return NextResponse.json({
    ok: true,
    scannedEmails: inboundEmails.length,
    agencyRepliesFound: results.length,
    autoReplied: replied,
    alexandreNotified: notified,
    results,
  });
}
