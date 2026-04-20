import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * SerpAPI Google-search email harvester.
 *
 * ENV: SERPAPI_KEY (free 100 searches/month at serpapi.com/users/sign_up).
 *
 * Strategy: search Google for public pages (forums, TripAdvisor, Reddit threads,
 * travel blog comments) where people leave their email + travel intent.
 * Extracts email addresses from snippets using regex.
 *
 * Body: {
 *   count?: number,         // leads to insert (max 50)
 *   intent?: "honeymoon" | "luxury" | "family" | "cruise" | "custom",
 *   custom_query?: string   // if intent="custom"
 * }
 */

const SERPAPI_KEY = process.env.SERPAPI_KEY || "";

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@(?:gmail|yahoo|outlook|hotmail|icloud|aol|live|proton|me)\.(?:com|ca|org|net|io|co)/g;

const INTENT_QUERIES: Record<string, string[]> = {
  honeymoon: [
    `"planning honeymoon" "@gmail.com" "looking for travel agent"`,
    `"our honeymoon" "contact me" "@gmail.com"`,
    `"honeymoon budget" site:tripadvisor.com "@gmail.com"`,
    `"honeymoon to" "email" site:reddit.com`,
  ],
  luxury: [
    `"luxury trip" "contact me" "@gmail.com"`,
    `"luxury vacation" "email me" -jobs`,
    `"planning a luxury" "@gmail.com"`,
  ],
  family: [
    `"family vacation" "planning" "@gmail.com" "looking for"`,
    `"family trip" "email me" "travel"`,
  ],
  cruise: [
    `"planning a cruise" "@gmail.com" "travel agent"`,
    `"cruise booking" "email me" "@gmail.com"`,
  ],
};

function pickNameFromEmail(email: string): { first: string; last: string } {
  const local = email.split("@")[0] || "";
  const parts = local.split(/[._+-]/).filter(Boolean);
  const clean = parts.map(p => p.replace(/\d+/g, "")).filter(Boolean);
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  if (clean.length >= 2) return { first: cap(clean[0]), last: cap(clean[1]) };
  if (clean.length === 1) return { first: cap(clean[0]), last: "" };
  return { first: "Lead", last: "" };
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

    if (!SERPAPI_KEY) {
      return NextResponse.json({
        ok: false,
        error: "SERPAPI_KEY env var missing. Get a free key at serpapi.com/users/sign_up (100 searches/month free).",
      }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const count: number = Math.min(Math.max(Number(body?.count ?? 10), 1), 50);
    const intent: string = body?.intent || "honeymoon";
    const customQuery: string = body?.custom_query || "";

    const queries = customQuery
      ? [customQuery]
      : (INTENT_QUERIES[intent] || INTENT_QUERIES.honeymoon);

    const foundEmails = new Set<string>();
    const harvestedLeads: Array<{
      email: string; context: string; url: string; intent: string;
    }> = [];

    for (const q of queries) {
      if (harvestedLeads.length >= count * 2) break;
      try {
        const serpUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(q)}&api_key=${SERPAPI_KEY}&num=20`;
        const r = await fetch(serpUrl, { cache: "no-store" });
        if (!r.ok) continue;
        const data: any = await r.json();
        const organic: any[] = data?.organic_results || [];

        for (const res of organic) {
          const snippet: string = (res.snippet || "") + " " + (res.title || "");
          const matches = snippet.match(EMAIL_REGEX) || [];
          for (const email of matches) {
            const normalized = email.toLowerCase().trim();
            if (foundEmails.has(normalized)) continue;
            if (/noreply|no-reply|mailer|admin@|info@|support@|example\.com/.test(normalized)) continue;
            foundEmails.add(normalized);
            harvestedLeads.push({
              email: normalized,
              context: (res.snippet || "").slice(0, 300),
              url: res.link || "",
              intent,
            });
            if (harvestedLeads.length >= count * 2) break;
          }
          if (harvestedLeads.length >= count * 2) break;
        }
      } catch (e: any) {
        console.log(`[serp] query fail: ${e?.message}`);
      }
    }

    if (!harvestedLeads.length) {
      return NextResponse.json({
        ok: true,
        saved: 0,
        fetched: 0,
        message: "No emails harvested from Google SERPs. Try a different intent or custom_query.",
      });
    }

    const { client } = getSupabaseAdminClient();
    const now = new Date().toISOString();
    let saved = 0;
    const savedLeads: any[] = [];

    for (const h of harvestedLeads.slice(0, count)) {
      try {
        const { data: existing } = await client
          .from("leads")
          .select("id")
          .eq("email", h.email)
          .limit(1);
        if (existing && existing.length) continue;

        const { first, last } = pickNameFromEmail(h.email);
        const { error } = await client.from("leads").insert({
          email: h.email,
          first_name: first,
          last_name: last || "(SERP harvest)",
          phone: null,
          destination: h.intent,
          deal_value: 5000,
          language: "en",
          status: "new",
          source: "serp:google",
          source_ref: h.url,
          created_at: now,
        });
        if (!error) {
          saved++;
          savedLeads.push({ email: h.email, name: `${first} ${last}`, intent: h.intent, url: h.url });
        }
      } catch (e: any) {
        console.log(`[serp] insert throw: ${e?.message}`);
      }
    }

    return NextResponse.json({
      ok: true,
      saved,
      fetched: harvestedLeads.length,
      queries_used: queries,
      leads: savedLeads,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "SERP harvest failed" }, { status: 500 });
  }
}
