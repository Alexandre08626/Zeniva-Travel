import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
);

const SYSTEM_PROMPT = `You are Zeniva Proposals AI – Proposal Generation Specialist. Generate a 3-tier travel proposal (Budget/Standard/Premium) from a qualified lead. Include: destination summary, tier descriptions, estimated price ranges, and recommendations. Format as structured markdown.`;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || req.nextUrl.searchParams.get("secret") || "";
  const CRON_SECRET = process.env.CRON_SECRET || "zeniva-cron-2026";
  if (auth !== CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const results: any[] = [];

  try {
    const { data: leads } = await supabase
      .from("leads")
      .select("id, name, email, destination, travel_dates, budget, travel_ai_analysis")
      .eq("travel_ai_qualified", true)
      .is("proposal_generated", null)
      .limit(5);

    if (!leads || leads.length === 0) {
      return NextResponse.json({ status: "ok", message: "no qualified leads for proposals", results: [] });
    }

    for (const lead of leads) {
      const userMessage = `Generate a 3-tier travel proposal for: ${lead.name || "Client"}, destination: ${lead.destination || "unknown"}, dates: ${lead.travel_dates || "flexible"}, budget: ${lead.budget || "not specified"}. AI analysis: ${lead.travel_ai_analysis || "none"}`;
      const reply = await callOpenAI(userMessage);

      const title = `${lead.destination || "Travel"} Proposal`;
      const { data: proposal } = await supabase.from("proposals").insert({
        lead_id: lead.id,
        title,
        content: reply,
        status: "draft",
        created_at: new Date().toISOString(),
      }).select().single();

      await supabase.from("leads").update({
        proposal_generated: true,
        proposal_id: proposal?.id,
        proposal_generated_at: new Date().toISOString(),
      }).eq("id", lead.id);

      results.push({ lead_id: lead.id, proposal_id: proposal?.id, title, destination: lead.destination });
    }
  } catch (err: any) {
    return NextResponse.json({ status: "error", message: err?.message }, { status: 500 });
  }

  return NextResponse.json({ status: "ok", message: `${results.length} proposals generated`, results });
}

async function callOpenAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) return "no api key";
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: prompt }], temperature: 0.7, max_tokens: 1000 }),
  });
  if (!r.ok) return "openai error";
  const data = await r.json();
  return data?.choices?.[0]?.message?.content?.trim() || "no reply";
}
