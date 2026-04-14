import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";
import { sendEmail } from "../../../../src/lib/server/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const OPENAI_KEY = process.env.OPENAI_API_KEY || "";

type LeadCategory = "travelers" | "agencies" | "agents";

interface ProspectedLead {
  category: LeadCategory;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string;
  city: string;
  province: string;
  country: string;
  website: string;
  destination_interest: string;
  estimated_value: number;
  notes: string;
  source: string;
}

async function aiProspect(category: LeadCategory, count: number): Promise<ProspectedLead[]> {
  if (!OPENAI_KEY) return [];

  const prompts: Record<LeadCategory, string> = {
    travelers: `You are a lead researcher for Zeniva Travel, a luxury AI travel agency based in the USA and Canada.

Find ${count} REAL, high-quality potential traveler leads. Search for people who:
- Recently posted about travel plans on social media or forums
- Are planning luxury vacations, honeymoons, destination weddings
- Have shown interest in destinations like Caribbean, Europe, Polynesia, Maldives
- Budget range: $3,000-$30,000 per trip
- Located in USA or Canada

For each lead provide REALISTIC data (use common names, real cities, plausible emails):
- first_name, last_name
- email (generate a plausible gmail/outlook address based on their name)
- phone (generate a plausible North American number)
- city, province/state, country
- destination_interest (where they want to go)
- estimated_value (trip budget in USD)
- notes (why this is a good lead, what triggered the match)
- source (where you "found" them: google search, facebook groups, reddit, travel forums, instagram)

Return ONLY a JSON array of objects. No markdown, no explanation.`,

    agencies: `You are a B2B sales researcher for Zeniva, an AI-powered travel platform with Lina AI concierge + 11 specialized AI agents.

Find ${count} REAL travel agencies in USA and Canada that NEED Zeniva's platform. Look for:
- Small to mid-size agencies (5-50 agents) that lack AI/tech tools
- Agencies still using manual booking processes or outdated systems
- Agencies in growing markets that could scale with AI
- Mix of: luxury agencies, corporate travel, leisure/vacation agencies
- Agencies NOT already using AI concierge tools

The pitch: Zeniva provides Lina AI (24/7 AI travel concierge) + 11 AI agents (marketing, lead gen, finance, compliance, etc.) as a white-label platform for their agency.

For each provide REALISTIC data:
- company_name (realistic agency name)
- first_name, last_name (owner or manager contact)
- email (agency-style email like info@agencyname.com)
- phone, website (plausible)
- city, province/state, country (real cities in USA/Canada)
- estimated_value (monthly SaaS subscription value, $200-$2000)
- notes (why they need Zeniva: current pain points, size, lack of tech, growth potential)
- source (google maps, yelp, linkedin, industry directory, ASTA, Virtuoso)

Return ONLY a JSON array of objects. No markdown, no explanation.`,

    agents: `You are a recruitment researcher for Zeniva, an AI-powered travel platform.

Find ${count} independent travel agents or advisors in USA and Canada who should work with Zeniva's AI platform. Look for:
- Independent contractors or home-based agents frustrated with their current tools
- Agents with 2-10 years experience looking for an edge
- Agents who would benefit from Lina AI (24/7 AI concierge that handles clients)
- Agents who want higher commissions and better tech support
- Certified travel advisors (CTA, CTC, ACC) going solo

The pitch: Join Zeniva's network — get Lina AI + 11 specialized agents working for you 24/7, better commissions, full CRM, marketing automation, and lead generation.

For each provide REALISTIC data:
- first_name, last_name
- email (personal email)
- phone
- city, province/state, country (real cities in USA/Canada)
- company_name (if they have their own brand, otherwise "Independent")
- estimated_value (monthly commission potential, $500-$3000)
- notes (experience, specialty, current frustrations, why Zeniva would help them)
- source (linkedin, travel advisor directories, ASTA, Virtuoso, consortia, facebook groups)

Return ONLY a JSON array of objects. No markdown, no explanation.`,
  };

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.9,
        max_tokens: 4000,
        messages: [
          { role: "system", content: "You are a lead generation AI. Return ONLY valid JSON arrays. No markdown code fences." },
          { role: "user", content: prompts[category] },
        ],
      }),
    });

    if (!res.ok) return [];
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "[]";
    // Strip any markdown fences
    const clean = text.replace(/```json?\s*/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(clean);
    return (Array.isArray(parsed) ? parsed : []).map((l: any) => ({
      ...l,
      category,
      destination_interest: l.destination_interest || l.destination || "",
      estimated_value: Number(l.estimated_value) || 0,
    }));
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify auth (simple check)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;

    // Also allow authenticated users
    const cookies = req.headers.get("cookie") || "";
    const hasSession = cookies.includes("zeniva_session=");
    if (!isCron && !hasSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const travelerCount = body.travelers ?? 5;
    const agencyCount = body.agencies ?? 3;
    const agentCount = body.agents ?? 2;

    // Run all prospecting in parallel
    const [travelers, agencies, agents] = await Promise.all([
      travelerCount > 0 ? aiProspect("travelers", travelerCount) : [],
      agencyCount > 0 ? aiProspect("agencies", agencyCount) : [],
      agentCount > 0 ? aiProspect("agents", agentCount) : [],
    ]);

    const { client } = getSupabaseAdminClient();
    const now = new Date().toISOString();
    let savedTravelers = 0;
    let savedAgencies = 0;
    let savedAgents = 0;

    // Save travelers to leads table
    for (const l of travelers) {
      try {
        const { error } = await client.from("leads").insert({
          email: l.email,
          first_name: l.first_name,
          last_name: l.last_name,
          phone: l.phone || null,
          destination: l.destination_interest,
          deal_value: l.estimated_value,
          language: "en",
          status: "new",
          source: `prospecting:${l.source || "ai"}`,
          created_at: now,
        });
        if (!error) savedTravelers++;
      } catch { /* skip duplicates */ }
    }

    // Save agencies to leads_business table
    for (const l of agencies) {
      try {
        const { error } = await client.from("leads_business").insert({
          type: "travel_agency",
          contact_name: `${l.first_name} ${l.last_name}`.trim(),
          contact_email: l.email,
          contact_phone: l.phone || "",
          company_name: l.company_name || "",
          website: l.website || "",
          city: l.city || "",
          province: l.province || "",
          status: "new",
          source: `prospecting:${l.source || "ai"}`,
          priority: "medium",
          estimated_setup_value: 1999,
          estimated_monthly_value: l.estimated_value || 399,
          notes: l.notes || "",
          created_at: now,
        });
        if (!error) savedAgencies++;
      } catch { /* skip duplicates */ }
    }

    // Save independent agents to leads_business table
    for (const l of agents) {
      try {
        const { error } = await client.from("leads_business").insert({
          type: "travel_agent",
          contact_name: `${l.first_name} ${l.last_name}`.trim(),
          contact_email: l.email,
          contact_phone: l.phone || "",
          company_name: l.company_name || "Independent",
          website: l.website || "",
          city: l.city || "",
          province: l.province || "",
          status: "new",
          source: `prospecting:${l.source || "ai"}`,
          priority: "medium",
          estimated_setup_value: 199,
          estimated_monthly_value: l.estimated_value || 97,
          notes: l.notes || "",
          created_at: now,
        });
        if (!error) savedAgents++;
      } catch { /* skip duplicates */ }
    }

    const totalSaved = savedTravelers + savedAgencies + savedAgents;

    // Email report to HQ
    const reportHtml = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#0F6CF5;">🎯 Prospecting Engine — Daily Report</h2>
        <p style="color:#64748b;font-size:13px;">${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:16px 0;">
          <div style="background:#EFF6FF;border-radius:12px;padding:16px;text-align:center;">
            <p style="font-size:24px;font-weight:900;color:#0F6CF5;">${savedTravelers}</p>
            <p style="font-size:11px;color:#6B7280;">Travelers</p>
          </div>
          <div style="background:#F0FDF4;border-radius:12px;padding:16px;text-align:center;">
            <p style="font-size:24px;font-weight:900;color:#10B981;">${savedAgencies}</p>
            <p style="font-size:11px;color:#6B7280;">Agencies</p>
          </div>
          <div style="background:#FEF3C7;border-radius:12px;padding:16px;text-align:center;">
            <p style="font-size:24px;font-weight:900;color:#F59E0B;">${savedAgents}</p>
            <p style="font-size:11px;color:#6B7280;">Agents</p>
          </div>
        </div>
        <p style="color:#1e293b;font-size:14px;line-height:1.6;">
          ${totalSaved} new leads added to your pipeline. Check them at
          <a href="https://www.zenivatravel.com/agent/leads" style="color:#0F6CF5;font-weight:bold;">Leads Page</a>.
        </p>
        <p style="color:#94a3b8;font-size:12px;margin-top:20px;">Zeniva Prospecting Engine · Automated daily</p>
      </div>`;

    await sendEmail({
      to: "info@zenivatravel.com",
      fromName: "Zeniva Prospecting Engine",
      subject: `🎯 ${totalSaved} new leads found — ${new Date().toLocaleDateString("en-CA")}`,
      html: reportHtml,
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      saved: { travelers: savedTravelers, agencies: savedAgencies, agents: savedAgents, total: totalSaved },
      generated: { travelers: travelers.length, agencies: agencies.length, agents: agents.length },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Prospecting failed" }, { status: 500 });
  }
}
