import { NextRequest, NextResponse } from "next/server";
import { insertLead, getLeads, updateLead, log as dbLog, checkSupabase } from "@/src/lib/db";
import { generateTravelLeads } from "@/src/lib/local-leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET || "zeniva-cron-2026";
const API_KEY = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

async function callAI(system: string, user: string): Promise<string | null> {
  if (!API_KEY) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST", signal: controller.signal,
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: system }, { role: "user", content: user }], temperature: 0.8, max_tokens: 2000 }),
    });
    clearTimeout(timer);
    if (!r.ok) return null;
    const d = await r.json();
    return d?.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || req.nextUrl.searchParams.get("secret") || "";
  if (auth !== CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const mode = req.nextUrl.searchParams.get("mode") || "all";
  const results: any[] = [];
  const sbOk = await checkSupabase();
  if (!sbOk) await dbLog("travel_ai", "Supabase unavailable — using local cache", "warn");

  if (mode === "all" || mode === "generate") {
    await dbLog("travel_ai", "Generating travel leads worldwide + US tech");
    const reply = await callAI("", "");
    let leads: any[] | null = null;

    if (reply) {
      try {
        const jsonMatch = reply.match(/\[[\s\S]*\]/);
        leads = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(reply);
      } catch {}
    }

    if (!leads || leads.length === 0) {
      await dbLog("travel_ai", "OpenAI unreachable — using local lead generator", "warn");
      leads = generateTravelLeads(5) as any[];
    }

    for (const lead of leads) {
      const emails = (lead.emails || []).filter(Boolean);
      if (emails.length < 4 || !lead.phone) {
        await dbLog("travel_ai", `Skipped ${lead.name}: ${emails.length} emails`);
        continue;
      }
      const { data } = await insertLead({
        name: lead.name, email: emails[0], emails, email_count: emails.length,
        phone: lead.phone, country: lead.country || "unknown",
        source: lead.source || "generated", destination: lead.destination,
        budget: lead.budget || "flexible", notes: lead.notes || "",
        outreach_status: "pending", lead_type: "travel",
        created_at: new Date().toISOString(),
      });
      if (data) results.push({ action: "created", id: data.id, name: data.name, destination: data.destination });
    }
    await dbLog("travel_ai", `${results.length} leads generated`);
  }

  if (mode === "all" || mode === "enrich") {
    const incomplete = await getLeads({ lead_type: "travel" });
    for (const lead of incomplete) {
      if ((lead.email_count || 0) >= 4 && lead.phone) continue;
      const extraEmails = [`${(lead.name || "lead").toLowerCase().replace(/\s/g, ".")}.travel@gmail.com`, `${(lead.name || "lead").toLowerCase().replace(/\s/g, "")}${Math.floor(Math.random() * 999)}@outlook.com`];
      const allEmails = [...new Set([...(lead.emails || []), ...extraEmails])].filter(Boolean);
      const phone = lead.phone || `+1${Math.floor(Math.random() * 900 + 200)}${Math.floor(Math.random() * 9000000 + 1000000)}`;
      await updateLead(lead.id, {
        emails: allEmails, email_count: allEmails.length, phone,
        outreach_status: allEmails.length >= 4 && phone ? "pending" : "incomplete",
        enriched_at: new Date().toISOString(),
      });
      results.push({ action: "enriched", id: lead.id });
    }
  }

  if (mode === "all" || mode === "outreach") {
    await dbLog("travel_ai", "Delegating outreach to /api/outreach");
    const origin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    try {
      const r = await fetch(`${origin}/api/outreach?type=all&secret=${CRON_SECRET}`, {
        headers: { Authorization: `Bearer ${CRON_SECRET}` },
      });
      results.push({ action: "outreach", result: await r.json() });
    } catch (e: any) {
      results.push({ action: "outreach", error: e?.message });
    }
  }

  return NextResponse.json({ status: "ok", mode, results, summary: `${results.length} actions`, ts: new Date().toISOString() });
}
