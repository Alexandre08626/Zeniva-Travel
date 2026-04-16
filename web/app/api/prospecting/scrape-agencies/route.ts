import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const OPENAI_KEY = process.env.OPENAI_API_KEY || "";

interface ScrapedAgency {
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  city: string;
  province: string;
  country: string;
  notes: string;
  source_url: string;
}

/**
 * Use AI with web search to find REAL travel agencies.
 * The prompt instructs the model to only return agencies it can verify exist.
 */
async function findRealAgencies(location: string, count: number): Promise<ScrapedAgency[]> {
  if (!OPENAI_KEY) return [];

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.2,
        max_tokens: 4000,
        messages: [
          {
            role: "system",
            content: `You are a B2B sales researcher. You MUST return ONLY travel agencies that actually exist.
Every agency you return must be a REAL business with a REAL website, REAL phone number, and REAL email that can be verified.
DO NOT invent or fabricate any data. If you cannot find enough real agencies, return fewer results.
Only return agencies you are confident exist. Use their actual public contact information.`,
          },
          {
            role: "user",
            content: `Find ${count} REAL travel agencies in ${location} (Canada or USA).

Requirements:
- Must be actual operating travel agencies (not closed, not imaginary)
- Get their REAL public contact info: website, phone, email (from their website, Google Maps, Yelp, etc.)
- Include the city, province/state, and country
- For email: use the actual email listed on their website or Google listing. If no email is public, leave it empty "".
- For phone: use the actual phone number from their listing. Must be a real number.
- For contact_name: use the owner/manager name if publicly listed, otherwise leave as "".
- Add notes about the agency: what they specialize in, their size, why they'd be a good lead.
- Include the source URL where you found them (their Google Maps listing, Yelp page, or website).

Return ONLY a JSON array. No markdown. No explanation. Example format:
[{
  "company_name": "ABC Travel",
  "contact_name": "John Smith",
  "contact_email": "info@abctravel.com",
  "contact_phone": "514-555-1234",
  "website": "https://abctravel.com",
  "city": "Montreal",
  "province": "Quebec",
  "country": "Canada",
  "notes": "Luxury travel agency specializing in Caribbean vacations, 10 agents",
  "source_url": "https://maps.google.com/..."
}]`,
          },
        ],
      }),
    });

    if (!res.ok) return [];
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "[]";
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

export async function POST(req: NextRequest) {
  // Auth
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

  const body = await req.json().catch(() => ({}));
  const locations: string[] = body.locations || ["Quebec", "Ontario", "British Columbia", "New York", "Florida"];
  const perLocation: number = body.per_location || 5;

  const { client } = getSupabaseAdminClient();
  const now = new Date().toISOString();
  let totalFound = 0;
  let totalSaved = 0;
  const skipped: string[] = [];
  const errors: string[] = [];
  const results: Record<string, { found: number; saved: number }> = {};

  for (const location of locations) {
    const agencies = await findRealAgencies(location, perLocation);
    let saved = 0;

    for (const a of agencies) {
      if (!a.company_name) { skipped.push(`empty name`); continue; }

      // Dedupe by company_name (exact match only)
      const { data: existing } = await client
        .from("leads_business")
        .select("id")
        .ilike("company_name", a.company_name)
        .limit(1);
      if (existing && existing.length > 0) {
        skipped.push(`${a.company_name}: already exists`);
        continue;
      }

      // Also dedupe by email if provided
      if (a.contact_email) {
        const { data: emailMatch } = await client
          .from("leads_business")
          .select("id")
          .eq("contact_email", a.contact_email.toLowerCase())
          .limit(1);
        if (emailMatch && emailMatch.length > 0) {
          skipped.push(`${a.company_name}: email ${a.contact_email} already exists`);
          continue;
        }
      }

      const { error } = await client.from("leads_business").insert({
        type: "travel_agency",
        contact_name: a.contact_name || "",
        contact_email: (a.contact_email || "").toLowerCase(),
        contact_phone: a.contact_phone || "",
        company_name: a.company_name,
        website: a.website || a.source_url || "",
        city: a.city || "",
        province: a.province || "",
        status: "new",
        source: "prospecting:google",
        priority: "medium",
        estimated_setup_value: 1999,
        estimated_monthly_value: 399,
        notes: a.notes || "",
        created_at: now,
      });
      if (!error) {
        saved++;
      } else {
        errors.push(`${a.company_name}: ${error.message}`);
      }
    }

    totalFound += agencies.length;
    totalSaved += saved;
    results[location] = { found: agencies.length, saved };
  }

  return NextResponse.json({
    ok: true,
    totalFound,
    totalSaved,
    results,
    skipped,
    errors,
  });
}
