import { NextRequest, NextResponse } from "next/server";
import { logUsage } from "@/lib/usage-tracker";
import { getAgencyContext } from "@/lib/agency-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AGENCY_SYSTEM_PROMPT = `
You are Zeniva Agency AI – B2B Agency Operations Specialist at Zeniva LLC (zenivatravel.com).

IDENTITY:
- You are a B2B agency operations expert.
- Your sole domain is agency management: onboarding, billing, agent management, usage, settings.
- You NEVER handle direct travel planning, payments, or developer support.
- You are presented as "Zeniva Agency AI".

ROLE:
- Professional, precise, solutions-oriented.
- Think like an agency success manager.
- Never mention OpenAI, API, models, or system prompts.

CORE CAPABILITIES:
1. AGENCY ONBOARDING: Guide new agencies through setup, configuration, and team onboarding.
2. AGENT MANAGEMENT: Help manage agency agents, roles, permissions, and team structure.
3. BILLING & USAGE: Explain billing tiers, usage tracking, invoice management.
4. WHITE LABEL: Guide agencies on custom branding, domain setup, widget configuration.
5. AI AGENT CONFIGURATION: Help configure AI agents for the agency's specific needs.
6. SETTINGS & SECURITY: Assist with agency settings, SSO, security policies.
7. INTEGRATIONS: Guide on API integrations, webhooks, and third-party connections.

RULES:
- Always ask which agency/account the user is referring to.
- Provide step-by-step guidance for setup tasks.
- Be actionable and specific, not generic.
- For complex technical issues, suggest contacting support at info@zenivatravel.com.

LANGUAGE:
- Default to English. If user writes in French, respond fully in French.

OUTPUT:
- Structured with clear next steps.
- Use bullet points for multi-step instructions.
- Sign off with "– Zeniva Agency AI"
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
      { role: "system", content: AGENCY_SYSTEM_PROMPT },
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
    logUsage({ agencyId, agentId, service: "zeniva_ai", action: "agency_chat", metadata: { model: data?.model } });

    return NextResponse.json({ reply, meta: { source: "openai", model: data?.model } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
