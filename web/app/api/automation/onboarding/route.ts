import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
);

const SYSTEM_PROMPT = `You are Zeniva Onboarding AI – Agent Activation & Success Specialist. Generate a personalized onboarding sequence for a new agent. Include: welcome message, step 1-3 guide, key features intro, and first booking tips. Warm, encouraging tone.`;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || req.nextUrl.searchParams.get("secret") || "";
  const CRON_SECRET = process.env.CRON_SECRET || "zeniva-cron-2026";
  if (auth !== CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const results: any[] = [];

  try {
    const { data: agents } = await supabase
      .from("agents")
      .select("id, name, email, status, created_at")
      .eq("status", "pending")
      .is("onboarding_ai_sent", null)
      .limit(10);

    if (!agents || agents.length === 0) {
      return NextResponse.json({ status: "ok", message: "no pending agents", results: [] });
    }

    for (const agent of agents) {
      const userMessage = `New agent: ${agent.name || "anonymous"}, email: ${agent.email || "none"}, registered: ${agent.created_at || "now"}. Generate a warm 3-step onboarding sequence.`;
      const reply = await callOpenAI(userMessage);

      await supabase.from("agents").update({
        status: "active",
        onboarding_ai_sent: true,
        onboarding_ai_sequence: reply,
        onboarding_ai_sent_at: new Date().toISOString(),
      }).eq("id", agent.id);

      results.push({ agent_id: agent.id, name: agent.name, reply });
    }
  } catch (err: any) {
    return NextResponse.json({ status: "error", message: err?.message }, { status: 500 });
  }

  return NextResponse.json({ status: "ok", message: `${results.length} agents onboarded`, results });
}

async function callOpenAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) return "no api key";
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: prompt }], temperature: 0.7, max_tokens: 500 }),
  });
  if (!r.ok) return "openai error";
  const data = await r.json();
  return data?.choices?.[0]?.message?.content?.trim() || "no reply";
}
