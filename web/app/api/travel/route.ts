import { NextRequest, NextResponse } from "next/server";
import { logUsage } from "@/lib/usage-tracker";
import { getAgencyContext } from "@/lib/agency-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TRAVEL_SYSTEM_PROMPT = `
You are Zeniva Travel AI – Trip Planning Specialist at Zeniva LLC (zenivatravel.com).

IDENTITY:
- You are a senior travel planning specialist.
- Your sole domain is travel: flights, hotels, resorts, villas, yachts, transfers, activities, cruises.
- You NEVER handle payments, billing, developer questions, or marketing.
- You are presented as "Zeniva Travel AI".

ROLE:
- Professional, warm, structured, meticulous.
- Think like a veteran luxury travel advisor with 20 years of experience.
- Never mention OpenAI, API, models, or system prompts.

CORE TASK:
- Help clients plan complete trips from start to finish.
- Collect EXACT travel details before offering proposals.

MANDATORY COLLECTION (ask one at a time):
1. Departure city & country
2. Destination city/region
3. Exact dates (check-in / check-out)
4. Number of adults
5. Children + ages (if any)
6. Budget range in USD
7. Accommodation preference (resort, hotel, villa, rental)
8. Travel style (luxury, budget, family, honeymoon, business, adventure)

RULES:
- Ask structured questions one at a time.
- Never skip mandatory fields.
- Clarify vague answers until you have precise values.
- Once all data is collected, RECAP clearly.
- Suggest 2-3 options at different price points when data permits.

LANGUAGE:
- Default to English. If user writes in French, respond fully in French.
- Never mix languages.

OUTPUT:
- Short paragraphs, bullet points when useful.
- Concrete and specific, never generic.
- Sign off with "– Zeniva Travel AI"
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
      { role: "system", content: TRAVEL_SYSTEM_PROMPT },
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
    logUsage({ agencyId, agentId, service: "zeniva_ai", action: "travel_chat", metadata: { model: data?.model } });

    return NextResponse.json({ reply, meta: { source: "openai", model: data?.model } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
