import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";
import { sendEmail } from "../../../../src/lib/server/email";

const VPS = "https://vmi3097009.contaboserver.net";
const AUTH = "Bearer zeniva-secret-2025";
const SITE = "https://www.zenivatravel.com";
const ZENIPAY = "https://www.zenipay.com";
const HQ_EMAILS = ["info@zeniva.ca", "info@zenivatravel.com", "info@zeniva.com"];

export async function POST(req: NextRequest) {
  // Auth: HQ only
  const sessionCookie = req.cookies.get("zeniva_session")?.value || "";
  const rolesCookie = decodeURIComponent(req.cookies.get("zeniva_roles")?.value || "");
  if (sessionCookie.length < 10 || !rolesCookie.includes("hq")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { client } = getSupabaseAdminClient();

    // Get all active clients
    const { data: clients } = await client
      .from("clients")
      .select("id, name, email, notes, lead_source, created_at")
      .order("created_at", { ascending: false });

    const validClients = (clients || []).filter(
      (c: any) => c.email && !HQ_EMAILS.includes(c.email.toLowerCase()) && !c.email.includes("test")
    );

    let sent = 0;
    let errors = 0;

    for (const cl of validClients) {
      const firstName = (cl.name || "").split(" ")[0] || "Traveler";
      const destMatch = (cl.notes || "").match(/destination:\s*([^|]+)/i);
      const destination = destMatch?.[1]?.trim() || null;

      // Ask Lina to generate a personalized package
      let packageHtml = "";
      try {
        const prompt = `You are Sofia, the email marketing AI at Zeniva Travel.
Generate a personalized all-inclusive travel package for ${cl.name || "a traveler"}${destination ? ` interested in ${destination}` : ""}.

Include:
- A catchy package name
- Destination with 2-3 sentence description
- 3-star hotel name (make it sound real and luxurious)
- Flight details (departure from a North American city)
- 3 included experiences/activities
- Price starting from (realistic, between $2,000-$8,000 per person)
- "Book now and get 15% OFF" mention

Format the response as clean HTML using inline styles. Use:
- A hero section with the destination name in large text
- A details section with bullet points for what's included
- A price section with the starting price
- Use colors: #0B1B4D (navy), #0F6CF5 (blue), #E6B85A (gold), #10b981 (green)
- Make it look like a premium travel brochure email
- DO NOT include <html>, <head>, or <body> tags - just the content div`;

        const res = await fetch(`${VPS}/chat`, {
          method: "POST",
          headers: { Authorization: AUTH, "Content-Type": "application/json" },
          body: JSON.stringify({ message: prompt, sessionId: `sofia-pkg-${cl.id}-${Date.now()}`, source: "sofia-batch" }),
        });

        if (res.ok) {
          const data = await res.json();
          packageHtml = data?.response || "";
          // Clean up any markdown code fences
          packageHtml = packageHtml.replace(/```html\n?/gi, "").replace(/```\n?/g, "");
        }
      } catch { /* fallback below */ }

      if (!packageHtml) {
        packageHtml = `<div style="text-align:center;padding:40px;">
          <h2 style="color:#0B1B4D;font-size:24px;">Exclusive All-Inclusive Package</h2>
          <p style="color:#64748b;font-size:16px;">A personalized travel experience curated just for you by Lina AI.</p>
          <div style="background:#10b981;color:#fff;display:inline-block;padding:12px 24px;border-radius:8px;font-weight:bold;margin:16px 0;">15% OFF your first booking</div>
        </div>`;
      }

      // Send the email
      try {
        await sendEmail({
          to: cl.email,
          fromName: "Sofia — Zeniva Travel",
          subject: `${firstName}, an exclusive package curated just for you — 15% OFF`,
          html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;background:#f8fafc;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

<tr><td style="background:linear-gradient(135deg,#0B1B4D,#0F6CF5);padding:30px;text-align:center;">
  <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">A Package Just For You, ${firstName}</h1>
  <p style="margin:8px 0 0;color:#c7d2fe;font-size:14px;">Curated by Lina AI · Exclusive to Zeniva</p>
</td></tr>

<tr><td style="padding:30px;">
  ${packageHtml}

  <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr><td align="center">
    <a href="${SITE}/chat" style="display:inline-block;background:linear-gradient(135deg,#0F6CF5,#0B1B4D);color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:700;">
      Book Now — Get 15% OFF →
    </a>
  </td></tr>
  </table>
</td></tr>

<tr><td style="background:#f8fafc;padding:24px 30px;text-align:center;border-top:1px solid #e2e8f0;">
  <p style="margin:0 0 8px;color:#64748b;font-size:12px;">Sofia — AI Email Assistant at Zeniva Travel</p>
  <p style="margin:0;color:#94a3b8;font-size:11px;">
    <a href="${SITE}" style="color:#0F6CF5;text-decoration:none;">zenivatravel.com</a> ·
    <a href="${ZENIPAY}" style="color:#0F6CF5;text-decoration:none;">zenipay.com</a>
  </p>
  <p style="margin:8px 0 0;color:#cbd5e1;font-size:10px;">
    <a href="mailto:unsubscribe@zenivatravel.com?subject=unsubscribe" style="color:#cbd5e1;text-decoration:underline;">Unsubscribe</a>
  </p>
</td></tr>

</table>
</td></tr></table>
</body></html>`,
        });
        sent++;
      } catch (err) {
        console.error(`Sofia package email failed for ${cl.email}:`, err);
        errors++;
      }

      // Rate limit: wait 3 seconds between emails
      await new Promise((r) => setTimeout(r, 3000));
    }

    return NextResponse.json({ ok: true, total: validClients.length, sent, errors });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
