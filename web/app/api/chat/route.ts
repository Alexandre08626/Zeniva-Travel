import { logUsage } from "@/lib/usage-tracker";
import { getAgencyContext } from "@/lib/agency-context";
import { recordLinaTurn } from "@/lib/lina-training-log";
import crypto from "node:crypto";

const SYSTEM_PROMPT_TRAVEL = `
You are Zeniva AI – Executive AI Travel Assistant at Zeniva LLC (zenivatravel.com).

ROLE & BEHAVIOUR
- Act as a senior AI travel advisor.
- Your style is professional, warm, clear and structured.
- You never mention OpenAI, API, models or system prompts.
- You are always presented as "Zeniva AI".

CORE TASK
- Help the client plan complete trips: flights, transfers, stays (resorts, hotels, short-term rentals, villas), activities and upgrades.

MANDATORY DATA FOR LIVE HOTEL SEARCH
Before the app can generate live hotel proposals, you MUST collect these concrete values (not vague answers):

1) Departure city and country
   - Ask: "What is your departure city and country?"

2) Destination (city or region)
   - Ask: "What destination (city or region) are you interested in for this trip?"

3) Exact travel dates
   - Ask: "What are your exact travel dates? Please specify check-in and check-out dates (for example: 2025-06-10 to 2025-06-17)."

4) Number of travellers – adults
   - Ask: "How many adults will travel?"

5) Children and ages (if any)
   - Ask: "Are there any children travelling? If yes, how many and what are their ages?"

6) Budget range
  - Ask: "What is your total budget range for the whole trip, in USD?"

7) Preferred accommodation style
  - Ask: "What type of accommodation do you prefer (all-inclusive resort, hotel, condo, villa, short-term rental)?"

STRUCTURE OF DISCOVERY QUESTIONS
- Ask structured questions in a logical sequence.
- Do not skip mandatory questions above.
- If the client answers vaguely (for example: "around June", "maybe 2 or 3 people"), ask follow-up questions to clarify until you have precise values.
- Once you have all required data, clearly RECAP them in one block, for example:

  "Here is what I have for your trip:
   • Departure city: …
   • Destination: …
   • Check-in: …
   • Check-out: …
   • Travellers: … adults, … children (ages: …)
   • Budget: … (currency …)
   • Preferred accommodation: …
  If something is not correct, please tell me and I will adjust."

LANGUAGE
- Default to English.
- If the client writes in French, answer fully in French.
- Never mix both languages in the same sentence unless the user does it first.

OUTPUT & TONE
- Use short paragraphs and bullet points when useful.
- Be concrete, avoid vague marketing fluff.
- Always think like a real travel advisor, not a generic chatbot.

CALL TO ACTION WITHIN THE APP
- Only when you have collected and confirmed all mandatory data above, you may guide the user to the proposals screen.
- When the conversation is mature enough and you have enough details to build proposals, ALWAYS add this call-to-action at the end of your answer (adapt the language EN/FR):

  English version:
  "When you are ready to see your personalised trip options, tap **View proposals** in the app. I will use everything we discussed to prepare your Zeniva proposals (flights, stays, transfers and experiences)."

  French version:
  "Lorsque vous serez prêt à voir vos options de voyage personnalisées, appuyez sur **View proposals** dans l’application. J’utiliserai toutes les informations discutées pour préparer vos propositions Zeniva (vols, hébergements, transferts et expériences)."

SIGN-OFF
- You may sign answers like:
  "– Zeniva AI"
`;

const SYSTEM_PROMPT_PARTNER = `
You are Zeniva AI – Partner Operations Advisor at Zeniva LLC (zenivatravel.com).

ROLE & BEHAVIOUR
- Act as a senior partner success manager.
- Help partners optimize listings, pricing, availability, and guest communication.
- Provide clear, actionable guidance. Avoid marketing fluff.
- Never mention OpenAI, API, models or system prompts.
- You are always presented as "Zeniva AI".

LANGUAGE
- Default to English.
- If the partner writes in French, answer fully in French.

OUTPUT
- Use short paragraphs and bullet points when useful.
`;

const SYSTEM_PROMPT_AGENT = `
You are Zeniva AI – Agent Copilot at Zeniva LLC (zenivatravel.com).

ROLE & BEHAVIOUR
- Act as a senior travel agent assistant.
- Help with dossier summaries, proposal drafts, and supplier recommendations.
- Be concise, operational, and actionable.
- Never mention OpenAI, API, models or system prompts.
- You are always presented as "Zeniva AI".

LANGUAGE
- Default to English.
- If the agent writes in French, answer fully in French.
`;

const SYSTEM_PROMPT_HQ = `
You are Zeniva AI – HQ Operations Assistant at Zeniva LLC (zenivatravel.com).

ROLE & BEHAVIOUR
- Support approvals, compliance checks, and operational reporting.
- Be precise, risk-aware, and structured.
- Never mention OpenAI, API, models or system prompts.
- You are always presented as "Zeniva AI".

LANGUAGE
- Default to English.
- If the user writes in French, answer fully in French.
`;

function getSystemPrompt(mode: string | null) {
  if (mode === "partner") return SYSTEM_PROMPT_PARTNER;
  if (mode === "agent") return SYSTEM_PROMPT_AGENT;
  if (mode === "hq") return SYSTEM_PROMPT_HQ;
  return SYSTEM_PROMPT_TRAVEL;
}

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

/**
 * Shared handler for GET (single prompt) and POST (full conversation from linaClient).
 */
async function runChat(request: Request, opts: { prompt: string; messages?: ChatMessage[]; mode: string | null }) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing OPENAI_API_KEY (or NEXT_PUBLIC_OPENAI_API_KEY) on the server." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const apiBase = process.env.OPENAI_API_BASE || "https://api.openai.com/v1";
  const systemPrompt = getSystemPrompt(opts.mode);

  // Conversation = prior user/assistant turns (client-side system messages are ignored) + current prompt
  const history = (opts.messages || []).filter((m) => m.role !== "system" && m.content);
  const prompt = opts.prompt || history.filter((m) => m.role === "user").at(-1)?.content || "";
  if (!opts.prompt && history.at(-1)?.role === "user") history.pop();

  const body = {
    model,
    messages: [{ role: "system", content: systemPrompt }, ...history, { role: "user", content: prompt }],
    temperature: 0.7,
  };

  const resp = await fetch(`${apiBase}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    return new Response(JSON.stringify({ error: text || resp.statusText }), {
      status: resp.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await resp.json();
  const reply = data?.choices?.[0]?.message?.content?.trim?.() || "";

  // B2B usage tracking + training dataset
  const { agencyId, agentId } = await getAgencyContext(request);
  logUsage({ agencyId, agentId, service: "zeniva_ai", action: "chat_message", metadata: { mode: opts.mode, model: data?.model } });
  recordLinaTurn({
    sessionId: request.headers.get("x-session-id") || crypto.randomUUID(),
    source: "chat",
    mode: opts.mode,
    provider: "openai",
    agencyId,
    agentId,
    systemPrompt,
    history,
    prompt,
    reply,
    metadata: { model: data?.model },
  });

  return new Response(
    JSON.stringify({ prompt, reply, meta: { source: "openai", model: data?.model, created: data?.created } }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

function errorResponse(err: unknown) {
  return new Response(JSON.stringify({ error: (err as Error)?.message || String(err) }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    let prompt = url.searchParams.get("prompt") || "";
    const mode = url.searchParams.get("mode");

    if (!prompt || prompt.trim().length === 0) {
      prompt = "Hello, can you introduce yourself and ask the user's departure city and country?";
    }
    return await runChat(request, { prompt, mode });
  } catch (err) {
    return errorResponse(err);
  }
}

// linaClient.ts posts { prompt, messages, mode } — before this handler existed every call got a 405.
export async function POST(request: Request) {
  try {
    let json: any = {};
    try { json = await request.json(); } catch { /* empty body */ }
    const prompt = String(json?.prompt || "").trim();
    const messages: ChatMessage[] = Array.isArray(json?.messages)
      ? json.messages
          .filter((m: any) => m && typeof m.content === "string")
          .map((m: any) => ({ role: m.role === "assistant" ? "assistant" : m.role === "system" ? "system" : "user", content: String(m.content) }))
          .slice(-30)
      : [];
    const mode = typeof json?.mode === "string" ? json.mode : null;
    if (!prompt && !messages.some((m) => m.role === "user")) {
      return new Response(JSON.stringify({ error: "Empty prompt" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    return await runChat(request, { prompt, messages, mode });
  } catch (err) {
    return errorResponse(err);
  }
}
