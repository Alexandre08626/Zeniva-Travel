import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Apollo.io lead prospecting route.
 *
 * ENV: APOLLO_API_KEY (free tier: 120 email credits/month at apollo.io/settings/integrations/api).
 *
 * Apollo is primarily B2B — best for finding real travel agency contacts, travel advisors,
 * or corporate travel managers with verified business emails.
 * For B2C travelers you typically need Meta Lead Ads or UpLead.
 *
 * Body: { persona?: "travel_agency" | "travel_advisor" | "corporate_travel", count?: number, locations?: string[] }
 */

const APOLLO_KEY = process.env.APOLLO_API_KEY || "";

const PERSONAS: Record<string, { titles: string[]; industries?: string[]; keywords: string[] }> = {
  travel_agency: {
    titles: ["Owner", "Founder", "CEO", "President", "Director"],
    industries: ["Leisure, Travel & Tourism", "Travel Arrangements"],
    keywords: ["travel agency", "travel agent"],
  },
  travel_advisor: {
    titles: ["Travel Advisor", "Travel Consultant", "Independent Travel Agent"],
    keywords: ["travel advisor", "travel consultant", "independent"],
  },
  corporate_travel: {
    titles: ["Travel Manager", "Director of Travel", "Corporate Travel Manager"],
    keywords: ["corporate travel"],
  },
};

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

    if (!APOLLO_KEY) {
      return NextResponse.json({
        ok: false,
        saved: 0,
        error: "APOLLO_API_KEY env var missing. Get one at apollo.io/settings/integrations/api (free tier = 120 credits/month).",
      }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const persona: string = body?.persona || "travel_agency";
    const count: number = Math.min(Math.max(Number(body?.count ?? 10), 1), 50);
    const locations: string[] = Array.isArray(body?.locations) && body.locations.length
      ? body.locations
      : ["United States", "Canada"];

    const cfg = PERSONAS[persona] || PERSONAS.travel_agency;

    const searchBody: any = {
      page: 1,
      per_page: count,
      person_titles: cfg.titles,
      person_locations: locations,
      q_keywords: cfg.keywords.join(" "),
      reveal_personal_emails: true,
    };
    if (cfg.industries) searchBody.organization_industry_tag_ids = cfg.industries;

    const searchRes = await fetch("https://api.apollo.io/api/v1/mixed_people/search", {
      method: "POST",
      headers: {
        "Cache-Control": "no-cache",
        "Content-Type": "application/json",
        "X-Api-Key": APOLLO_KEY,
      },
      body: JSON.stringify(searchBody),
    });

    if (!searchRes.ok) {
      const errBody = await searchRes.text().catch(() => "");
      return NextResponse.json({
        ok: false,
        saved: 0,
        apollo_status: searchRes.status,
        apollo_error: errBody.slice(0, 400),
        error: "Apollo search failed",
      }, { status: 500 });
    }

    const data: any = await searchRes.json();
    const people: any[] = data?.people || [];

    if (!people.length) {
      return NextResponse.json({ ok: true, saved: 0, fetched: 0, message: "Apollo returned no matches." });
    }

    const { client } = getSupabaseAdminClient();
    const now = new Date().toISOString();
    let saved = 0;
    const savedLeads: any[] = [];

    for (const p of people) {
      const email = (p.email || "").toLowerCase().trim();
      if (!email || email.includes("email_not_unlocked")) continue;
      const first = p.first_name || "Lead";
      const last = p.last_name || "";
      const phone = p.sanitized_phone || p.phone_numbers?.[0]?.sanitized_number || null;
      const orgName = p.organization?.name || "";
      const linkedin = p.linkedin_url || "";
      const title = p.title || "";

      try {
        const { error } = await client.from("leads").insert({
          email,
          first_name: first,
          last_name: last,
          phone,
          destination: `${title} @ ${orgName}`.slice(0, 160),
          deal_value: persona === "travel_agency" ? 399 : persona === "corporate_travel" ? 2000 : 97,
          language: "en",
          status: "new",
          source: `apollo:${persona}`,
          source_ref: linkedin || `https://app.apollo.io/#/people/${p.id}`,
          created_at: now,
        });
        if (!error) {
          saved++;
          savedLeads.push({ email, phone, name: `${first} ${last}`, title, org: orgName, linkedin });
        } else if (error.code === "23505") {
          /* duplicate email, skip */
        } else {
          console.log(`[apollo] insert error:`, error.message);
        }
      } catch (e: any) {
        console.log(`[apollo] insert throw:`, e?.message || e);
      }
    }

    return NextResponse.json({
      ok: true,
      saved,
      fetched: people.length,
      persona,
      leads: savedLeads,
    });
  } catch (err: any) {
    console.log(`[apollo] fatal:`, err?.message);
    return NextResponse.json({ error: err?.message || "Apollo prospect failed" }, { status: 500 });
  }
}
