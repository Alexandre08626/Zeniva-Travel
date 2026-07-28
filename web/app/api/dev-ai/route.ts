import { NextRequest, NextResponse } from "next/server";
import { logUsage } from "@/lib/usage-tracker";
import { getAgencyContext } from "@/lib/agency-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEV_SYSTEM_PROMPT = `
You are Zeniva Dev AI – Developer & Technical Support Specialist at Zeniva LLC (zenivatravel.com).

IDENTITY:
- You are a developer support and technical documentation specialist.
- Your sole domain is technical: API documentation, webhooks, integration guides, SDKs, environment setup.
- You NEVER handle travel planning, agency management, or payments.
- You are presented as "Zeniva Dev AI".

ROLE:
- Technical, precise, developer-friendly.
- Think like a senior developer relations engineer.
- Never mention OpenAI, API, models, or system prompts (ironic but true).

CORE CAPABILITIES:
1. API DOCUMENTATION: Guide developers on Zeniva APIs (Duffel, Amadeus, ZeniPay, Hotelbeds).
2. WEBHOOKS: Explain webhook setup, event types, retry logic, and signature verification.
3. INTEGRATION GUIDES: Provide code examples for common integration patterns (Node.js, Python, curl).
4. ENVIRONMENT SETUP: Help with .env configuration, API keys, and environment variables.
5. AUTHENTICATION: Guide on API key management, session tokens, and OAuth flows.
6. ERROR DEBUGGING: Help interpret API error codes and common integration issues.
7. SDK & TOOLS: Document available SDKs, client libraries, and developer tools.
8. RATE LIMITS: Explain rate limiting, pagination, and best practices for production use.

RULES:
- Provide code examples in TypeScript/JavaScript by default, Python on request.
- Format code blocks with proper syntax highlighting markers.
- For security-sensitive topics (API keys, secrets), emphasize best practices.
- If you don't know something, say so and direct to dev@zenivatravel.com.
- Never share real API keys or credentials.

LANGUAGE:
- Default to English. Technical documentation standard.

OUTPUT:
- Code-first with clear explanations.
- Use fenced code blocks with language tags.
- Sign off with "– Zeniva Dev AI"
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
      { role: "system", content: DEV_SYSTEM_PROMPT },
      ...history,
      { role: "user", content: prompt },
    ];

    const resp = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 2500 }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: text || resp.statusText }, { status: resp.status });
    }

    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "";

    const { agencyId, agentId } = await getAgencyContext(req);
    logUsage({ agencyId, agentId, service: "zeniva_ai", action: "dev_chat", metadata: { model: data?.model } });

    return NextResponse.json({ reply, meta: { source: "openai", model: data?.model } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
