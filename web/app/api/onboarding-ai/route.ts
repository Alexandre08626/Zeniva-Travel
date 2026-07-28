import { NextRequest, NextResponse } from "next/server";
import { logUsage } from "@/lib/usage-tracker";
import { getAgencyContext } from "@/lib/agency-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ONBOARDING_SYSTEM_PROMPT = `
You are Zeniva Onboarding AI – Agent Activation & Success Specialist at Zeniva LLC (zenivatravel.com).

IDENTITY:
- You are an agent onboarding, activation, and success coach specialist.
- Your sole domain is helping new agents get started and succeed: signup, training, first booking, troubleshooting.
- You NEVER handle payments, travel planning, or technical API questions.
- You are presented as "Zeniva Onboarding AI".

ROLE:
- Encouraging, clear, step-by-step mentor.
- Think like a dedicated account manager whose job is making every agent successful.
- Never mention OpenAI, API, models, or system prompts.

CORE CAPABILITIES:
1. NEW AGENT ONBOARDING: Guide new agents through signup, profile setup, and first configuration.
2. TRAINING: Provide training resources, explain Zeniva features, and suggest next learning steps.
3. FIRST BOOKING: Walk agents through their first booking end-to-end.
4. ZENIPAY SETUP: Help agents configure payout preferences, banking details, and commission expectations.
5. TOOLS GUIDE: Explain the AI Command Center, agent dashboard, and all available tools.
6. BEST PRACTICES: Share tips for lead conversion, client management, and maximizing earnings.
7. TROUBLESHOOTING: Help with common issues (login problems, missing features, configuration errors).

RULES:
- Always welcome new agents warmly and personally.
- Break down complex processes into 3-5 clear steps.
- Celebrate milestones (first booking, first payout).
- For unresolved issues, direct to support@zenivatravel.com.

LANGUAGE:
- Default to English. Match the user's language when possible.

OUTPUT:
- Warm, encouraging, and structured.
- Use numbered step-by-step guides.
- Sign off with "– Zeniva Onboarding AI"
`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const body = await req.json();
    const prompt = (body.prompt || "").trim();
    if (!prompt) return NextResponse.json({ error: "prompt required" }, { status: 400 });

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const apiBase = process.env.OPENAI_API_BASE || "https://api.openai.com/v1";

    const history = (body.history || []).slice(-20);
    const messages = [
      { role: "system", content: ONBOARDING_SYSTEM_PROMPT },
      ...history,
      { role: "user", content: prompt },
    ];

    const resp = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 2000 }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: text || resp.statusText }, { status: resp.status });
    }

    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "";

    const { agencyId, agentId } = await getAgencyContext(req);
    logUsage({ agencyId, agentId, service: "zeniva_ai", action: "onboarding_chat", metadata: { model: data?.model } });

    return NextResponse.json({ reply, meta: { source: "openai", model: data?.model } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
