import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const JUNK_EMAILS = new Set([
  "example@example.com", "email@example.com", "info@example.com",
  "name@email.com", "user@domain.com", "test@test.com",
  "wixpress.com", "sentry.io", "googleapis.com", "google.com",
  "facebook.com", "twitter.com", "instagram.com", "youtube.com",
  "w3.org", "schema.org", "cloudflare.com", "wordpress.org",
]);

function isJunkEmail(email: string): boolean {
  const lower = email.toLowerCase();
  const domain = lower.split("@")[1] || "";
  if (JUNK_EMAILS.has(domain)) return true;
  if (lower.includes("wix") || lower.includes("squarespace") || lower.includes("godaddy")) return true;
  if (lower.includes("noreply") || lower.includes("no-reply") || lower.includes("mailer-daemon")) return true;
  if (domain.endsWith(".png") || domain.endsWith(".jpg") || domain.endsWith(".gif")) return true;
  if (lower.length > 60) return true;
  return false;
}

function pickBestEmail(emails: string[]): string {
  const dominated = ["info@", "contact@", "hello@", "enquiries@", "booking@", "reservations@", "sales@", "admin@"];
  for (const prefix of dominated) {
    const match = emails.find(e => e.toLowerCase().startsWith(prefix));
    if (match) return match.toLowerCase();
  }
  return emails[0]?.toLowerCase() || "";
}

async function scrapeEmailFromWebsite(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ZenivaBot/1.0)" },
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (!res.ok) return "";
    const html = await res.text();

    // Extract all emails from page
    const found = html.match(EMAIL_REGEX) || [];
    const clean = [...new Set(found)].filter(e => !isJunkEmail(e));
    if (clean.length > 0) return pickBestEmail(clean);

    // Try /contact page
    const contactUrl = new URL(url);
    const contactPaths = ["/contact", "/contact-us", "/contactez-nous", "/kontakt", "/contacto", "/contatti"];
    for (const path of contactPaths) {
      try {
        contactUrl.pathname = path;
        const controller2 = new AbortController();
        const timeout2 = setTimeout(() => controller2.abort(), 6000);
        const res2 = await fetch(contactUrl.toString(), {
          signal: controller2.signal,
          headers: { "User-Agent": "Mozilla/5.0 (compatible; ZenivaBot/1.0)" },
          redirect: "follow",
        });
        clearTimeout(timeout2);
        if (!res2.ok) continue;
        const html2 = await res2.text();
        const found2 = html2.match(EMAIL_REGEX) || [];
        const clean2 = [...new Set(found2)].filter(e => !isJunkEmail(e));
        if (clean2.length > 0) return pickBestEmail(clean2);
      } catch { continue; }
    }

    return "";
  } catch {
    return "";
  }
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

  const body = await req.json().catch(() => ({}));
  const batchSize = Math.min(body.batch_size || 50, 100);

  const { client } = getSupabaseAdminClient();

  // Get agencies with website but no email
  const { data: agencies } = await client
    .from("leads_business")
    .select("id, company_name, website, contact_email")
    .eq("type", "travel_agency")
    .or("contact_email.is.null,contact_email.eq.")
    .neq("website", "")
    .not("website", "is", null)
    .order("created_at", { ascending: false })
    .limit(batchSize);

  if (!agencies?.length) {
    return NextResponse.json({ ok: true, message: "No agencies without email to process", processed: 0 });
  }

  let found = 0;
  let failed = 0;
  let processed = 0;

  for (const agency of agencies) {
    processed++;
    let url = agency.website;
    if (!url.startsWith("http")) url = "https://" + url;

    const email = await scrapeEmailFromWebsite(url);

    if (email) {
      await client
        .from("leads_business")
        .update({ contact_email: email })
        .eq("id", agency.id);
      found++;
    } else {
      // Mark as scraped so we don't retry endlessly
      await client
        .from("leads_business")
        .update({ contact_email: "not_found" })
        .eq("id", agency.id);
      failed++;
    }
  }

  return NextResponse.json({ ok: true, processed, emailsFound: found, notFound: failed });
}
