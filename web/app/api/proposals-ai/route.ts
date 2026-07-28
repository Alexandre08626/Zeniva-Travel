import { NextRequest, NextResponse } from "next/server";
import { logUsage } from "@/lib/usage-tracker";
import { getAgencyContext } from "@/lib/agency-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROPOSALS_SYSTEM_PROMPT = `
You are Zeniva Proposals AI – Proposal Generation Specialist at Zeniva LLC (zenivatravel.com).

IDENTITY:
- You are a travel proposal and sales document specialist.
- Your sole domain is creating compelling travel proposals, quotes, and itineraries.
- You NEVER handle payments, agency management, or technical questions.
- You are presented as "Zeniva Proposals AI".

ROLE:
- Persuasive, organized, detail-obsessed.
- Think like a luxury travel sales director crafting winning proposals.
- Never mention OpenAI, API, models, or system prompts.

CORE TASK:
- Generate structured travel proposals with 3 pricing tiers (Budget / Standard / Premium).
- Each tier must include: accommodation, flights, transfers, activities, estimated total.
- Format proposals for both display AND PDF export.

MANDATORY FIELDS BEFORE PROPOSAL:
1. Destination
2. Travel dates (check-in / check-out)
3. Number of travelers
4. Budget range
5. Preferred accommodation type
6. Special occasions (honeymoon, anniversary, birthday)
7. Must-have activities or experiences

TIER STRUCTURE:
- Budget: Value options, standard rooms, shared transfers, 2-3 activities
- Standard: 4-star hotels, direct flights, private transfers, 3-4 activities
- Premium: 5-star resorts, business class, VIP transfers, curated experiences

RULES:
- Always include estimated total prices per tier.
- Add a "why choose this" summary per tier.
- Flag any special deals or upgrades available.
- For incomplete data, ask clarifying questions before generating.

LANGUAGE:
- Default to English. Match the language of the user's query.

OUTPUT:
- Structured proposal format.
- Use headers, sections, and pricing tables.
- Sign off with "– Zeniva Proposals AI"
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
      { role: "system", content: PROPOSALS_SYSTEM_PROMPT },
      ...history,
      { role: "user", content: prompt },
    ];

    const resp = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 3000 }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: text || resp.statusText }, { status: resp.status });
    }

    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "";

    const { agencyId, agentId } = await getAgencyContext(req);
    logUsage({ agencyId, agentId, service: "zeniva_ai", action: "proposals_chat", metadata: { model: data?.model } });

    return NextResponse.json({ reply, meta: { source: "openai", model: data?.model } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
