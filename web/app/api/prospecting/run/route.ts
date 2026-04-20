import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";
import { sendEmail } from "../../../../src/lib/server/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const OPENAI_KEY = process.env.OPENAI_API_KEY || "";
const GROQ_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

async function callAIText(systemMsg: string, userMsg: string, maxTokens: number, temperature: number): Promise<string | null> {
  const messages = [
    { role: "system", content: systemMsg },
    { role: "user", content: userMsg },
  ];
  // Primary: Groq
  if (GROQ_KEY) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: GROQ_MODEL, temperature, max_tokens: maxTokens, messages }),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) return content;
      }
    } catch { /* fall through */ }
  }
  // Fallback: OpenAI
  if (!OPENAI_KEY) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", temperature, max_tokens: maxTokens, messages }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || null;
  } catch {
    return null;
  }
}

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
  if (!GROQ_KEY && !OPENAI_KEY) return [];

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
    const text = await callAIText(
      "You are a lead generation AI. Return ONLY valid JSON arrays. No markdown code fences.",
      prompts[category],
      4000,
      0.9
    );
    if (!text) return [];
    // Strip markdown fences and extract JSON array
    let clean = text.replace(/```json?\s*/g, "").replace(/```/g, "").trim();
    const arrStart = clean.indexOf("[");
    const arrEnd = clean.lastIndexOf("]");
    if (arrStart >= 0 && arrEnd > arrStart) clean = clean.slice(arrStart, arrEnd + 1);
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

    // Run sequentially to avoid OpenAI rate limits
    const travelers = travelerCount > 0 ? await aiProspect("travelers", travelerCount) : [];
    const agencies = agencyCount > 0 ? await aiProspect("agencies", agencyCount) : [];
    const agents = agentCount > 0 ? await aiProspect("agents", agentCount) : [];

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

    // ─── Sofia Auto-Outreach: email + SMS to new leads ───
    const allNewLeads = [...travelers, ...agencies, ...agents];
    let emailsSent = 0;
    let smsSent = 0;

    for (const lead of allNewLeads) {
      const name = lead.first_name || lead.contact_name?.split(" ")[0] || "there";
      const dest = lead.destination_interest || lead.destination || "";
      const lang = (lead.language || "en").toLowerCase();
      const isAgency = lead.category === "agencies";
      const isAgent = lead.category === "agents";
      const email = lead.email || lead.contact_email;
      if (!email) continue;

      // Build personalized email based on lead type and language
      let subject = "";
      let greeting = "";
      let body = "";
      let cta = "";

      if (lang === "fr") {
        if (isAgency) {
          subject = `${lead.company_name || "Votre agence"} + Zeniva AI = plus de revenus`;
          greeting = `Bonjour ${name},`;
          body = `Je suis Lina, l'IA concierge de Zeniva. Nous aidons les agences de voyage comme la vôtre à automatiser leur service client avec 12 agents IA spécialisés. Plus de revenus, moins de travail manuel.`;
          cta = "Découvrir Zeniva";
        } else if (isAgent) {
          subject = `${name}, rejoignez le réseau Zeniva — IA + commissions supérieures`;
          greeting = `Bonjour ${name},`;
          body = `Vous êtes conseiller en voyage indépendant? Zeniva vous offre Lina AI (concierge 24/7) + 11 agents IA, un CRM complet, et des commissions plus élevées. Travaillez plus intelligemment.`;
          cta = "Rejoindre Zeniva";
        } else {
          subject = dest ? `${name}, votre voyage à ${dest} — 15% de rabais` : `${name}, 15% sur votre premier voyage de luxe`;
          greeting = `Bonjour ${name}!`;
          body = dest
            ? `J'ai remarqué que ${dest} vous intéresse! Je suis Lina, votre concierge voyage IA chez Zeniva. Je peux planifier votre voyage complet en 60 secondes — vols, hôtels, expériences. Et vous avez 15% de rabais sur votre première réservation avec le code WELCOME15.`
            : `Je suis Lina, votre concierge voyage IA chez Zeniva. Je planifie des voyages de luxe en 60 secondes — vols, hôtels, expériences. Profitez de 15% de rabais sur votre première réservation avec le code WELCOME15.`;
          cta = "Planifier mon voyage";
        }
      } else {
        if (isAgency) {
          subject = `${lead.company_name || "Your agency"} + Zeniva AI = more revenue`;
          greeting = `Hi ${name},`;
          body = `I'm Lina, Zeniva's AI concierge. We help travel agencies like yours automate client service with 12 specialized AI agents. More revenue, less manual work. Let me show you how.`;
          cta = "Discover Zeniva";
        } else if (isAgent) {
          subject = `${name}, join Zeniva's network — AI tools + better commissions`;
          greeting = `Hi ${name},`;
          body = `As an independent travel advisor, you deserve better tools. Zeniva gives you Lina AI (24/7 concierge) + 11 specialized AI agents, a full CRM, marketing automation, and higher commissions. Work smarter, not harder.`;
          cta = "Join Zeniva";
        } else {
          subject = dest ? `${name}, your trip to ${dest} — 15% OFF` : `${name}, 15% OFF your first luxury trip`;
          greeting = `Hi ${name}!`;
          body = dest
            ? `I noticed you're interested in ${dest}! I'm Lina, your AI travel concierge at Zeniva. I can plan your complete trip in 60 seconds — flights, hotels, experiences. And you get 15% OFF your first booking with code WELCOME15.`
            : `I'm Lina, your AI travel concierge at Zeniva. I plan luxury trips in 60 seconds — flights, hotels, experiences. Get 15% OFF your first booking with code WELCOME15.`;
          cta = "Plan my trip";
        }
      }

      const ctaUrl = isAgency ? "https://www.zenivatravel.com/partners" : isAgent ? "https://www.zenivatravel.com/signup?space=agent" : "https://www.zenivatravel.com/chat";

      // Send email
      try {
        await sendEmail({
          to: email,
          fromName: "Lina — Zeniva AI",
          subject,
          html: `<div style="font-family:-apple-system,sans-serif;max-width:540px;margin:0 auto;">
            <div style="background:linear-gradient(135deg,#0B1B4D,#0F3A8A);border-radius:20px 20px 0 0;padding:28px;text-align:center;">
              <img src="https://www.zenivatravel.com/branding/lina-avatar.png" width="56" height="56" style="border-radius:50%;border:3px solid rgba(255,255,255,0.3);" alt="Lina">
              <p style="margin:10px 0 0;font-size:18px;font-weight:900;color:white;">${subject}</p>
            </div>
            <div style="background:white;padding:28px;">
              <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 16px;">${greeting}</p>
              <p style="font-size:14px;color:#475569;line-height:1.7;margin:0 0 24px;">${body}</p>
              <div style="text-align:center;">
                <a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(90deg,#0F6CF5,#0B1B4D);color:white;font-size:14px;font-weight:800;padding:14px 36px;border-radius:50px;text-decoration:none;">${cta}</a>
              </div>
            </div>
            <div style="background:#F8FAFC;border-radius:0 0 20px 20px;padding:20px;text-align:center;border-top:1px solid #E2E8F0;">
              <p style="margin:0;font-size:11px;color:#94A3B8;">Zeniva Inc. · Delaware, USA · zenivatravel.com</p>
            </div>
          </div>`,
        });
        emailsSent++;
      } catch { /* skip failed emails */ }

      // Send SMS if phone available
      const phone = lead.phone || lead.contact_phone;
      if (phone && phone.length >= 10) {
        try {
          const smsBody = isAgency
            ? `Hi ${name}! Zeniva's AI platform can help ${lead.company_name || "your agency"} automate & grow. 12 AI agents working for you 24/7. Learn more: zenivatravel.com/partners — Lina, Zeniva AI`
            : isAgent
            ? `Hi ${name}! Independent advisor? Zeniva gives you Lina AI + 11 agents, better commissions & full CRM. Join: zenivatravel.com/signup — Lina`
            : dest
            ? `Hi ${name}! Dreaming of ${dest}? Get 15% OFF with code WELCOME15. I'll plan your trip in 60s: zenivatravel.com/chat — Lina, Zeniva AI`
            : `Hi ${name}! Get 15% OFF your first luxury trip with code WELCOME15: zenivatravel.com/chat — Lina, Zeniva AI`;

          await fetch("https://vmi3097009.contaboserver.net/sms/send", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: "Bearer zeniva-secret-2025" },
            body: JSON.stringify({ to: phone, body: smsBody }),
          });
          smsSent++;
        } catch { /* skip failed SMS */ }
      }
    }

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
          ${totalSaved} new leads added to your pipeline. Sofia sent ${emailsSent} emails${smsSent > 0 ? ` and ${smsSent} SMS` : ""}. Check them at
          <a href="https://www.zenivatravel.com/agent/outreach/newLeads" style="color:#0F6CF5;font-weight:bold;">Leads Page</a>.
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
      sofia: { emailsSent, smsSent },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Prospecting failed" }, { status: 500 });
  }
}
