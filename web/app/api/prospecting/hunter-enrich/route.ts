import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Hunter.io email finder — enrich existing Facebook/Reddit leads with real emails.
 *
 * ENV: HUNTER_API_KEY (free tier: 25 requests/month at hunter.io/api_keys).
 *
 * Strategy:
 *   1. Pull leads where email ends in "@*.zeniva" (placeholder) and source_ref is a URL
 *   2. For each, try to extract a domain from source_ref (business Facebook pages) or
 *      guess from name + common travel domains
 *   3. Call Hunter.io email-finder → update lead.email if found
 *
 * Body: { limit?: number }  — max leads to attempt (default 10, Hunter free tier = 25/month)
 */

const HUNTER_KEY = process.env.HUNTER_API_KEY || "";

async function findEmail(firstName: string, lastName: string, domain: string): Promise<{ email: string; confidence: number } | null> {
  try {
    const url = `https://api.hunter.io/v2/email-finder?domain=${encodeURIComponent(domain)}&first_name=${encodeURIComponent(firstName)}&last_name=${encodeURIComponent(lastName)}&api_key=${HUNTER_KEY}`;
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return null;
    const j: any = await r.json();
    const email = j?.data?.email;
    const score = Number(j?.data?.score || 0);
    if (email && score >= 50) return { email, confidence: score };
    return null;
  } catch {
    return null;
  }
}

function extractDomainFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host.includes("facebook.com") || host.includes("reddit.com") || host.includes("instagram.com")) return null;
    return host;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookies = req.headers.get("cookie") || "";
    const authHeader = req.headers.get("authorization") || "";
    const cronSecret = process.env.CRON_SECRET;
    const n8nSecret = process.env.N8N_WEBHOOK_SECRET || "zeniva-n8n-2026";
    const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
    const isN8n = authHeader === `Bearer ${n8nSecret}`;
    const hasSession = cookies.includes("zeniva_session=");
    if (!isCron && !isN8n && !hasSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!HUNTER_KEY) {
      return NextResponse.json({
        ok: false,
        error: "HUNTER_API_KEY env var missing. Get a free key at hunter.io/api_keys (25 searches/month).",
      }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const limit: number = Math.min(Math.max(Number(body?.limit ?? 10), 1), 25);

    const { client } = getSupabaseAdminClient();

    // Pull placeholder leads (those created by Marco/Reddit/FB prospecting)
    const { data: leads, error: qErr } = await client
      .from("leads")
      .select("id, email, first_name, last_name, source_ref")
      .like("email", "%@%.zeniva")
      .eq("status", "new")
      .not("source_ref", "is", null)
      .limit(limit);

    if (qErr) {
      return NextResponse.json({ ok: false, error: qErr.message }, { status: 500 });
    }
    if (!leads || !leads.length) {
      return NextResponse.json({ ok: true, attempted: 0, enriched: 0, message: "No placeholder leads to enrich." });
    }

    let attempted = 0;
    let enriched = 0;
    const results: any[] = [];

    for (const lead of leads) {
      const firstName = (lead.first_name || "").trim();
      const lastName = (lead.last_name || "").trim();
      if (!firstName || firstName === "Lead" || firstName === "FB User" || firstName === "not") {
        results.push({ id: lead.id, skipped: "no usable name" });
        continue;
      }
      const domain = extractDomainFromUrl(lead.source_ref || "");
      if (!domain) {
        results.push({ id: lead.id, skipped: "no business domain (social-only profile)" });
        continue;
      }
      attempted++;
      const found = await findEmail(firstName, lastName || "", domain);
      if (found) {
        const { error: uErr } = await client
          .from("leads")
          .update({ email: found.email, updated_at: new Date().toISOString() })
          .eq("id", lead.id);
        if (!uErr) {
          enriched++;
          results.push({ id: lead.id, name: `${firstName} ${lastName}`, email: found.email, confidence: found.confidence, domain });
        } else {
          results.push({ id: lead.id, name: `${firstName} ${lastName}`, error: uErr.message });
        }
      } else {
        results.push({ id: lead.id, name: `${firstName} ${lastName}`, domain, noMatch: true });
      }
    }

    return NextResponse.json({ ok: true, attempted, enriched, total: leads.length, results });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Hunter enrich failed" }, { status: 500 });
  }
}
