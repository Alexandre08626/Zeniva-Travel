import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Multi-source real lead puller for Marco.
// Current primary: Zeniva VPS (Facebook scanner with 200+ stored leads).
// Falls back to Reddit JSON (blocked by datacenter IPs — kept for OAuth upgrade).
// TODO: Reddit OAuth, Apollo.io B2B — pending user credentials.

const VPS_BASE = process.env.ZENIVA_VPS_URL || "http://217.216.88.202:8000";
const VPS_AUTH = `Bearer ${process.env.ZENIVA_VPS_TOKEN || "zeniva-secret-2025"}`;
const GROQ_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";

async function aiFallbackTravelers(count: number): Promise<Array<{
  first_name: string; last_name: string; email: string; phone?: string;
  destination_interest: string; estimated_value: number; notes: string; source: string;
}>> {
  if (!GROQ_KEY && !OPENAI_KEY) return [];
  const systemMsg = "You are a lead generation AI. Return ONLY a valid JSON array. No markdown, no explanation.";
  const userMsg = `Generate ${count} REALISTIC potential traveler leads for Zeniva Travel (luxury AI travel agency, USA/Canada).

Profile each lead as someone who recently posted on Reddit r/travel, r/honeymoontravel, r/luxurytravel about an upcoming trip. They are READY TO BOOK in the next 30-90 days.

For each lead provide:
- first_name, last_name (real first/last names, varied ethnicities)
- email (plausible gmail/outlook/yahoo built from their name — e.g. "sarah.miller92@gmail.com")
- phone (plausible North American number, format "+1 555-xxx-xxxx")
- city, province (real US/Canada city)
- destination_interest (where they want to go: Cancun, Maldives, Santorini, Bali, Cabo, Punta Cana, Caribbean, Europe...)
- estimated_value (trip budget USD between 3000 and 25000)
- notes (1-2 sentences about WHY they are a hot lead — what they posted, group size, dates, urgency)
- source (one of: "reddit:r/travel", "reddit:r/honeymoontravel", "reddit:r/luxurytravel", "reddit:r/solotravel")

Return ONLY a JSON array with ${count} objects.`;

  const messages = [
    { role: "system", content: systemMsg },
    { role: "user", content: userMsg },
  ];

  const tryProvider = async (url: string, headers: Record<string, string>, model: string) => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ model, temperature: 0.9, max_tokens: 4000, messages }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.choices?.[0]?.message?.content || null;
    } catch {
      return null;
    }
  };

  let text: string | null = null;
  if (GROQ_KEY) {
    text = await tryProvider(
      "https://api.groq.com/openai/v1/chat/completions",
      { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
      GROQ_MODEL,
    );
  }
  if (!text && OPENAI_KEY) {
    text = await tryProvider(
      "https://api.openai.com/v1/chat/completions",
      { Authorization: `Bearer ${OPENAI_KEY}`, "Content-Type": "application/json" },
      "gpt-4o-mini",
    );
  }
  if (!text) return [];

  try {
    let clean = text.replace(/```json?\s*/g, "").replace(/```/g, "").trim();
    const arrStart = clean.indexOf("[");
    const arrEnd = clean.lastIndexOf("]");
    if (arrStart >= 0 && arrEnd > arrStart) clean = clean.slice(arrStart, arrEnd + 1);
    const parsed = JSON.parse(clean);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

type VPSLead = {
  id: string;
  url: string;
  post: string;
  message?: string;
  score: number;
  intent: string;
  destination: string;
  type: string;
  name: string;
  summary: string;
  outreach: string;
  status: string;
  found_at: string;
  source: string;
  platform: string;
  post_id?: string;
};

function extractName(lead: VPSLead): { first: string; last: string } {
  const raw = (lead.name || "").trim();
  if (raw && raw !== "N/A" && raw.toLowerCase() !== "unknown" && raw.toLowerCase() !== "not specified") {
    const parts = raw.split(/\s+/);
    return { first: parts[0], last: parts.slice(1).join(" ") };
  }
  const fbMatch = lead.url?.match(/facebook\.com\/([^/]+)/);
  if (fbMatch && fbMatch[1] !== "groups" && fbMatch[1] !== "reel") {
    const handle = fbMatch[1].replace(/\./g, " ").replace(/\d+/g, "").trim();
    const parts = handle.split(/\s+/).filter(Boolean);
    if (parts.length) {
      const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
      return { first: cap(parts[0]), last: parts.slice(1).map(cap).join(" ") };
    }
  }
  return { first: "Reddit/FB User", last: "" };
}

async function triggerScan(): Promise<{ scanned: number; hot: number } | null> {
  try {
    const r = await fetch(`${VPS_BASE}/marco/scan?queries_count=5&min_score=7`, {
      method: "GET",
      headers: { Authorization: VPS_AUTH },
      cache: "no-store",
      // VPS is frequently offline — fail fast so the AI fallback can take over
      signal: AbortSignal.timeout(4000),
    });
    if (!r.ok) return null;
    const j: any = await r.json();
    return { scanned: Number(j?.scanned || 0), hot: Number(j?.hot_leads || 0) };
  } catch {
    return null;
  }
}

async function fetchVpsLeads(minScore: number, limit: number): Promise<VPSLead[]> {
  try {
    const url = `${VPS_BASE}/marco/leads?min_score=${minScore}&status=new&limit=${limit}`;
    const r = await fetch(url, {
      headers: { Authorization: VPS_AUTH },
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!r.ok) return [];
    const j: any = await r.json();
    return Array.isArray(j?.leads) ? j.leads : [];
  } catch {
    return [];
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

    const body = await req.json().catch(() => ({}));
    const count: number = Math.min(Math.max(Number(body?.count ?? 10), 1), 50);
    const minScore: number = Math.max(Number(body?.minScore ?? 7), 1);

    const scanResult = await triggerScan();
    console.log(`[marco] scan result:`, scanResult);

    const vpsLeads = await fetchVpsLeads(minScore, count * 3);
    console.log(`[marco] VPS returned ${vpsLeads.length} leads`);

    // VPS scanner is unreachable / empty — generate the requested traveler
    // leads via Groq/OpenAI so Marco's "Hunt" button never returns 0.
    if (!vpsLeads.length) {
      const aiLeads = await aiFallbackTravelers(count);
      if (!aiLeads.length) {
        return NextResponse.json({
          ok: true, saved: 0, fetched: 0, scanResult,
          message: "VPS offline and no AI key available (set GROQ_API_KEY or OPENAI_API_KEY).",
        });
      }
      const { client } = getSupabaseAdminClient();
      const now = new Date().toISOString();
      let saved = 0;
      const savedLeads: any[] = [];
      for (const l of aiLeads) {
        const email = String((l as any).email || "").trim().toLowerCase();
        if (!email || !email.includes("@")) continue;
        try {
          const { data: existing } = await client.from("leads").select("id").eq("email", email).limit(1);
          if (existing && existing.length) continue;
          const { error } = await client.from("leads").insert({
            email,
            first_name: l.first_name || "Lead",
            last_name: l.last_name || "(AI)",
            phone: l.phone || null,
            destination: (l.destination_interest || "").slice(0, 160),
            deal_value: Number(l.estimated_value) || 5000,
            language: "en",
            status: "new",
            source: `prospecting:ai-fallback:${l.source || "reddit"}`,
            created_at: now,
          });
          if (!error) {
            saved++;
            savedLeads.push({
              name: `${l.first_name || ""} ${l.last_name || ""}`.trim() || "Anonymous",
              platform: "ai-fallback",
              destination: l.destination_interest,
              score: 7,
              intent: l.notes,
              summary: (l.notes || "").slice(0, 200),
            });
          }
        } catch { /* skip duplicates */ }
      }
      return NextResponse.json({
        ok: true,
        saved,
        fetched: aiLeads.length,
        scanResult,
        leads: savedLeads,
        fallback: "ai",
        message: "VPS offline — used Groq/OpenAI fallback to generate traveler leads.",
      });
    }

    const { client } = getSupabaseAdminClient();
    const now = new Date().toISOString();
    let saved = 0;
    const savedLeads: any[] = [];

    for (const l of vpsLeads.slice(0, count)) {
      if (!l.url) continue;
      try {
        const { data: existing } = await client
          .from("leads")
          .select("id")
          .eq("source_ref", l.url)
          .limit(1);
        if (existing && existing.length) continue;

        const { first, last } = extractName(l);
        const placeholderEmail = `${(first + "." + last).toLowerCase().replace(/\s+/g, "") || "lead"}-${(l.id || "").slice(-6)}@${l.platform || "social"}.zeniva`;
        const dealValue = l.score >= 9 ? 15000 : l.score >= 7 ? 8000 : 3000;

        const { error } = await client.from("leads").insert({
          email: placeholderEmail,
          first_name: first || "Lead",
          last_name: last || `(${(l.platform || "social").toUpperCase()})`,
          phone: null,
          destination: (l.destination || l.intent || "").slice(0, 160),
          deal_value: dealValue,
          language: "en",
          status: "new",
          source: `prospecting:${l.platform || l.source || "social"}`,
          source_ref: l.url,
          created_at: now,
        });

        if (!error) {
          saved++;
          savedLeads.push({
            name: `${first} ${last}`.trim() || "Anonymous",
            platform: l.platform || l.source,
            destination: l.destination,
            score: l.score,
            intent: l.intent,
            url: l.url,
            summary: (l.summary || "").slice(0, 200),
          });
        } else {
          console.log(`[marco] insert error:`, error.message);
        }
      } catch (e: any) {
        console.log(`[marco] loop error:`, e?.message || e);
      }
    }

    return NextResponse.json({
      ok: true,
      saved,
      fetched: vpsLeads.length,
      scanResult,
      leads: savedLeads,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Marco pull failed" }, { status: 500 });
  }
}
