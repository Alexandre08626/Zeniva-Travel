import { logUsage } from "@/lib/usage-tracker";
import { getAgencyContext } from "@/lib/agency-context";
import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";


/**
 * Build agency-specific system prompt for Lina
 */
function buildAgencySystemPrompt(agencyConfig: Record<string, unknown> | null, agencyName?: string): string | null {
  if (!agencyConfig) return null;
  
  const suppliers = (agencyConfig.suppliers as string[]) || [];
  const greeting = (agencyConfig.lina_greeting as string) || "";
  const overridePrompt = agencyConfig.lina_system_prompt_override as string;
  const tone = (agencyConfig.lina_tone as string) || "professional";
  const domain = (agencyConfig.agency_domain as string) || "";
  
  if (overridePrompt) return overridePrompt;
  
  const toneDesc: Record<string, string> = {
    professional: "professionnelle, chaleureuse et structuree",
    casual: "decontractee et amicale",
    luxury: "luxueuse et raffinee",
    adventure: "aventuriere et energique",
  };
  
  return `Tu es Lina, l'assistante de voyage IA de ${agencyName || "l'agence"}.
Tu travailles exclusivement avec les fournisseurs partenaires de ${agencyName || "l'agence"} :
${suppliers.length > 0 ? suppliers.join(", ") : "tous les fournisseurs disponibles"}.
${domain ? `Tu reponds aux visiteurs du site ${domain}.` : ""}
Tu es la pour aider les voyageurs a planifier et reserver leur voyage.

TON: ${toneDesc[tone] || toneDesc.professional}.

T CHE PRINCIPALE: Aide les clients a planifier des voyages complets (vols, transferts, hebergements, activites).

DONNEES A COLLECTER:
1) Ville et pays de depart
2) Destination (ville ou region)
3) Dates de voyage exactes (arrivee / depart, AAAA-MM-JJ)
4) Nombre d'adultes
5) Enfants + ages
6) Budget approximatif (CAD)
7) Type d'hebergement prefere
8) Transport (vols inclus ou non)

REGLES:
- Pose les questions dans l'ordre logique, ne saute aucune etape.
- Si les reponses sont vagues, pose des questions de suivi.
- Une fois toutes les donnees collectees, fais un recapitulatif clair.
- Reponds en francais par defaut. Si le client ecrit en anglais, reponds en anglais.
- Paragraphes courts, points de forme. Concret, pas de blabla.

Quand un visiteur est pret a reserver, capture ses coordonnees et transfere le dossier a un agent de ${agencyName || "l'agence"}.
Mentionne "Propulse par Zeniva" uniquement si le client demande quelle technologie tu utilises.

Signature: "- Lina, ${agencyName || "l'agence"}"
`;
}

/**
 * Lina AI API Route
 * Primary: Routes through Zeniva VPS API (Claude Sonnet)
 * Fallback: Direct OpenAI call if VPS is unreachable
 */

const ZENIVA_API_URL =
  process.env.ZENIVA_API_URL ||
  "https://vmi3097009.contaboserver.net/chat";

const SYSTEM_PROMPT_CLIENT = `
You are Lina, AI travel concierge at Zeniva (zenivatravel.com).

LANGUAGE RULES (CRITICAL — follow these ALWAYS):
- Detect the client's language from their FIRST message
- If they write in English → respond in English for the entire conversation
- If they write in French → respond in fluent, natural French for the entire conversation
- If they write in Spanish → respond in fluent, natural Spanish for the entire conversation
- NEVER switch languages unless the client switches first
- NEVER mix languages in the same message

ROLE: Senior AI travel advisor. Professional, warm, passionate about travel.
Never mention OpenAI, API, models or system prompts.
Always presented as "Lina, Zeniva".

CORE TASK: Help clients plan complete trips (flights, transfers, stays, activities).

MANDATORY DATA TO COLLECT (in natural conversation order):
1) Destination — where do they want to go?
2) Departure city — where are they flying from? (ALWAYS ask — never skip)
3) Travel dates — exact check-in / check-out (YYYY-MM-DD)
4) Travelers — adults + children (with ages if children)
5) Budget range (USD)
6) Style — luxury, adventure, budget, all-inclusive, romantic, family?
7) Accommodation type (Hotel, Resort, Villa, ZeniStay, Yacht)
8) Transportation (Flights / No Flights)

RULES:
- Ask questions naturally, one or two at a time — not all at once
- If answers are vague, ask follow-up for precision
- Once all data collected, recap clearly then say:
  EN: "Perfect! I have everything. Click the gold Generate Proposal button to see your personalized trip!"
  FR: "Parfait! J'ai tout ce qu'il me faut. Cliquez sur le bouton doré Générer la proposition pour voir votre voyage personnalisé!"
  ES: "¡Perfecto! Tengo todo. ¡Haz clic en el botón dorado Generar propuesta para ver tu viaje personalizado!"
- Short paragraphs, bullet points. Concrete, no fluff.
- Be enthusiastic: "Oh, Bali! Amazing choice!" / "Cancún — excellent!"
- NEVER give fake prices, fake flights, or fake hotels
- NEVER say you are an AI or chatbot — you ARE Lina

TRIP_PATCH: After each response with confirmed trip details, append:
TRIP_PATCH_START
{ "patch": { ... }, "confidence": 0.95, "missing_fields": [...], "notes": "..." }
TRIP_PATCH_END

Sign-off: "– Lina, Zeniva"
`;

const SYSTEM_PROMPT_AGENT = `
You are Lina, AI Trip Search Assistant for Zeniva travel AGENTS.

LANGUAGE RULES (CRITICAL):
- Detect the agent's language from their FIRST message
- English → respond in English. French → French. Spanish → Spanish.
- NEVER switch languages unless the agent switches first.

ROLE: You are an INTAKE assistant. Your ONLY job is to collect the trip brief from the agent and populate the Trip Details panel on the right side of the chat. You DO NOT search, price, or recommend anything in the chat. Live search happens on the Proposals page.

═══════════════════════════════════════════════════
ABSOLUTE RULES — NEVER VIOLATE
═══════════════════════════════════════════════════
🚫 NEVER list flights, airlines, or flight prices in chat (no Emirates $X, no Qatar $Y).
🚫 NEVER list hotels, resorts, villas, or room rates in chat.
🚫 NEVER list transfers (speedboat, seaplane) with prices.
🚫 NEVER suggest "budget / mid-range / premium" options with $$$ in chat.
🚫 NEVER give estimated prices, fake prices, or "around $X" figures.
🚫 NEVER present choices like "Option A vs Option B vs Option C".
🚫 NEVER use bullet lists of products with prices attached.

✅ ONLY ask questions to fill the Trip Details fields.
✅ ONLY confirm what the agent told you.
✅ When the brief is complete, redirect to the Proposals page — that is where options and prices live.

═══════════════════════════════════════════════════
TRIP DETAILS — THE ONLY 5 FIELDS YOU CARE ABOUT
═══════════════════════════════════════════════════
These populate the panel at the right of the chat:
1) 📍 destination
2) 📅 dates (YYYY-MM-DD → YYYY-MM-DD)
3) 👥 travelers (e.g. "2 adults", "2 adults + 1 child")
4) 💰 budget (e.g. "$5000 CAD")
5) ✈️ departure (IATA or city, e.g. "YUL" or "Montreal")

You may also note (useful but not in the panel): travel style, accommodation preference, children ages, special requests.

═══════════════════════════════════════════════════
HOW TO WORK
═══════════════════════════════════════════════════
1. Read what the agent gave you.
2. Identify which of the 5 fields are still missing.
3. Ask for the 1–2 most important missing ones in a short, friendly message.
4. After EVERY reply, emit a TRIP_PATCH block with everything you have so far (see format below) — this is how the Trip Details panel on the right gets filled.
5. When all 5 fields are filled, give a short one-line recap (no prices, no options) and tell the agent to click the gold "See Proposals" button.

═══════════════════════════════════════════════════
RESPONSE STYLE
═══════════════════════════════════════════════════
- 1–3 short sentences max per reply. No long paragraphs.
- No bullet lists of products.
- Warm, fast, professional. You are helping a busy travel agent.
- Enthusiasm allowed ("Maldives — magnifique choix!") but NO specifics about hotels/flights/prices.
- If the agent asks you for prices or options directly, politely redirect: the Proposals page will pull live rates; you just need to finish the brief.

═══════════════════════════════════════════════════
TRIP_PATCH — REQUIRED AT END OF EVERY REPLY
═══════════════════════════════════════════════════
After every single message, append this block (it is stripped from the visible chat and used to fill the Trip Details panel):

TRIP_PATCH_START
{ "patch": { "destination": "...", "dates": "YYYY-MM-DD → YYYY-MM-DD", "travelers": "X adults", "budget": "$X CAD", "departure": "IATA" }, "confidence": 0.95, "missing_fields": ["..."] }
TRIP_PATCH_END

Only include fields you are confident about. Omit unknown fields (don't guess). Always include every field you already know, not just the newest one.

═══════════════════════════════════════════════════
WHEN BRIEF IS COMPLETE
═══════════════════════════════════════════════════
Give ONE short confirmation line, then:
- EN: "Perfect, I have everything. Click the gold **See Proposals** button above to pull live flight and hotel results."
- FR: "Parfait, j'ai tout ce qu'il me faut. Cliquez sur le bouton doré **Voir les propositions** ci-dessus pour les résultats en direct."
- ES: "Perfecto, tengo todo. Haz clic en el botón dorado **Ver propuestas** arriba para los resultados en vivo."

Sign-off: "– Lina, Zeniva"
`;

const requestSchema = z.object({
  prompt: z.string().trim().min(1).max(4000).optional(),
  sessionId: z.string().optional(),
  mode: z.enum(["client", "agent"]).optional().default("client"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().min(1).max(4000),
      })
    )
    .optional(),
});

const TIMEOUT_MS = Number(process.env.LINA_TIMEOUT_MS || 30000);
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const GROQ_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const MODEL = (process.env.OPENAI_MODEL || "gpt-4o-mini").trim();
const API_BASE = (process.env.OPENAI_API_BASE || "https://api.openai.com/v1").trim();
const OPENAI_KEY =
  process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

const N8N_LINA_WEBHOOK_URL = process.env.N8N_LINA_WEBHOOK_URL;

/**
 * Fire-and-forget webhook to n8n for lead capture / automation.
 * No-op when N8N_LINA_WEBHOOK_URL is not set.
 */
function fireN8nWebhook(payload: Record<string, unknown>): void {
  if (!N8N_LINA_WEBHOOK_URL) return;
  fetch(N8N_LINA_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Primary path: call Zeniva VPS API (Claude Sonnet via our Python backend)
 */
async function callZenivaAPI(
  prompt: string,
  history: { role: string; content: string }[],
  requestId: string
): Promise<{ reply: string; sessionId?: string } | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(ZENIVA_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: prompt,
        sessionId: requestId,
        source: "zenivatravel.com",
        language: "fr",
        history: history.slice(-20).map((m) => ({
          role: m.role === "assistant" ? "assistant" : m.role,
          content: m.content,
        })),
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!resp.ok) return null;
    const data = await resp.json();
    const reply = data?.response || data?.reply || "";
    if (!reply) return null;
    // Detect VPS error messages — treat as failure so we fallback to Claude API
    if (/probl[eè]me technique|temporarily unavailable|erreur|indisponible/i.test(reply)) {
      console.warn(`[lina] VPS returned error message: ${reply.slice(0, 80)}`);
      return null;
    }
    return { reply, sessionId: data?.sessionId };
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

/**
 * Fallback 1: direct Anthropic Claude API call (preferred — same model as VPS)
 */
async function callClaudeFallback(
  prompt: string,
  history: { role: string; content: string }[],
  requestId: string,
  mode: "client" | "agent" = "client",
  agencySystemPrompt?: string | null
): Promise<string | null> {
  if (!ANTHROPIC_KEY) return null;

  const systemPrompt = agencySystemPrompt || (mode === "agent" ? SYSTEM_PROMPT_AGENT : SYSTEM_PROMPT_CLIENT);
  const messages = [
    ...history.map((m) => ({ role: m.role === "system" ? "user" as const : m.role as "user" | "assistant", content: m.content })),
    { role: "user" as const, content: prompt },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!resp.ok) return null;
    const data = await resp.json();
    const text = data?.content?.[0]?.text?.trim();
    return text || null;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

/**
 * Fallback 2: Groq (free tier — Llama 3.3 70B, 14400 req/day)
 */
async function callGroqFallback(
  prompt: string,
  history: { role: string; content: string }[],
  requestId: string,
  mode: "client" | "agent" = "client",
  agencySystemPrompt?: string | null
): Promise<string | null> {
  if (!GROQ_KEY) return null;

  const systemPrompt = agencySystemPrompt || (mode === "agent" ? SYSTEM_PROMPT_AGENT : SYSTEM_PROMPT_CLIENT);
  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: prompt },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({ model: GROQ_MODEL, messages, temperature: 0.7 }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!resp.ok) return null;
    const data = await resp.json();
    return data?.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

/**
 * Fallback 3: Google Gemini (free tier — 15 RPM)
 */
async function callGeminiFallback(
  prompt: string,
  history: { role: string; content: string }[],
  requestId: string,
  mode: "client" | "agent" = "client",
  agencySystemPrompt?: string | null
): Promise<string | null> {
  if (!GEMINI_KEY) return null;

  const systemPrompt = agencySystemPrompt || (mode === "agent" ? SYSTEM_PROMPT_AGENT : SYSTEM_PROMPT_CLIENT);
  const contents = [
    ...history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: prompt }] },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);
    if (!resp.ok) return null;
    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text || null;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

/**
 * Fallback 3: direct OpenAI call (last resort)
 */
async function callOpenAIFallback(
  prompt: string,
  history: { role: string; content: string }[],
  requestId: string,
  mode: "client" | "agent" = "client",
  agencySystemPrompt?: string | null
): Promise<string> {
  if (!OPENAI_KEY) return "Lina is temporarily unavailable. Please contact info@zeniva.ca";

  const systemPrompt = agencySystemPrompt || (mode === "agent" ? SYSTEM_PROMPT_AGENT : SYSTEM_PROMPT_CLIENT);
  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: prompt },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(`${API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({ model: MODEL, messages, temperature: 0.7 }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!resp.ok) return "Lina is temporarily unavailable. Please contact info@zeniva.ca";
    const data = await resp.json();
    return data?.choices?.[0]?.message?.content?.trim() || "";
  } catch {
    clearTimeout(timeout);
    return "Lina is temporarily unavailable. Please contact info@zeniva.ca";
  }
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body", requestId },
      { status: 400 }
    );
  }

  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues, requestId },
      { status: 400 }
    );
  }

  const prompt =
    parsed.data.prompt?.trim() ||
    "Hello, can you introduce yourself?";
  const history = (parsed.data.history || []).map((m) => ({
    role: m.role,
    content: m.content,
  }));
  const mode = parsed.data.mode || "client";

  const sessionId = parsed.data.sessionId || requestId;

  // B2B: extract agency context for multi-tenant tracking
  const { agencyId, agentId } = await getAgencyContext(req);

  // Agent mode: try Groq first (free/fast), then VPS, Claude, Gemini, OpenAI
  if (mode === "agent") {
    // Primary: Groq (Llama 3.3 — free tier, 14400 req/day)
    const groqAgentReply = await callGroqFallback(prompt, history, sessionId, mode, null);
    if (groqAgentReply) {
      logUsage({ agencyId, agentId, service: "lina_ai", action: "conversation_agent", metadata: { sessionId, mode, provider: "groq-agent" } });
      fireN8nWebhook({ sessionId, requestId, mode, provider: "groq-agent", agencyId, agentId, prompt, reply: groqAgentReply, timestamp: new Date().toISOString() });
      return NextResponse.json({
        reply: groqAgentReply,
        prompt,
        requestId,
        meta: { provider: "groq-agent", sessionId, mode },
      });
    }
    // Fallback 1: VPS (Claude Sonnet)
    const vpsPrimary = await callZenivaAPI(prompt, history, sessionId);
    if (vpsPrimary?.reply) {
      logUsage({ agencyId, agentId, service: "lina_ai", action: "conversation_agent", metadata: { sessionId, mode, provider: "zeniva-claude-agent" } });
      fireN8nWebhook({ sessionId, requestId, mode, provider: "zeniva-claude-agent", agencyId, agentId, prompt, reply: vpsPrimary.reply, timestamp: new Date().toISOString() });
      return NextResponse.json({
        reply: vpsPrimary.reply,
        prompt,
        requestId,
        meta: { provider: "zeniva-claude-agent", sessionId: vpsPrimary.sessionId, mode },
      });
    }
    // Fallback 2: Claude API direct
    const claudeReply = await callClaudeFallback(prompt, history, sessionId, mode, null);
    if (claudeReply) {
      logUsage({ agencyId, agentId, service: "lina_ai", action: "conversation_agent", metadata: { sessionId, mode, provider: "claude-api-agent" } });
      fireN8nWebhook({ sessionId, requestId, mode, provider: "claude-api-agent", agencyId, agentId, prompt, reply: claudeReply, timestamp: new Date().toISOString() });
      return NextResponse.json({
        reply: claudeReply,
        prompt,
        requestId,
        meta: { provider: "claude-api-agent", sessionId, mode },
      });
    }
    // Fallback 3: Gemini
    const geminiAgentReply = await callGeminiFallback(prompt, history, sessionId, mode, null);
    if (geminiAgentReply) {
      logUsage({ agencyId, agentId, service: "lina_ai", action: "conversation_agent", metadata: { sessionId, mode, provider: "gemini-agent" } });
      fireN8nWebhook({ sessionId, requestId, mode, provider: "gemini-agent", agencyId, agentId, prompt, reply: geminiAgentReply, timestamp: new Date().toISOString() });
      return NextResponse.json({
        reply: geminiAgentReply,
        prompt,
        requestId,
        meta: { provider: "gemini-agent", sessionId, mode },
      });
    }
    // Fallback 4: OpenAI
    const agentReply = await callOpenAIFallback(prompt, history, sessionId, mode, null);
    logUsage({ agencyId, agentId, service: "lina_ai", action: "conversation_agent", metadata: { sessionId, mode, provider: "openai-agent" } });
    fireN8nWebhook({ sessionId, requestId, mode, provider: "openai-agent", agencyId, agentId, prompt, reply: agentReply, timestamp: new Date().toISOString() });
    return NextResponse.json({
      reply: agentReply,
      prompt,
      requestId,
      meta: { provider: "openai-agent", sessionId, mode },
    });
  }

  // B2B: build agency-specific system prompt if agency context exists
  const { agencyConfig } = await getAgencyContext(req);
  let agencyName: string | undefined;
  if (agencyId) {
    const { getSupabaseAdminClient } = await import("@/src/lib/supabase/server");
    const { client } = getSupabaseAdminClient();
    const { data: agency } = await client.from("agencies").select("name").eq("id", agencyId).single();
    agencyName = agency?.name;
  }
  const agencySystemPrompt = buildAgencySystemPrompt(agencyConfig, agencyName);

  // Primary: Groq (Llama 3.3 — free/fast)
  const groqPrimary = await callGroqFallback(prompt, history, sessionId, mode, agencySystemPrompt);
  if (groqPrimary) {
    logUsage({ agencyId, agentId, service: "lina_ai", action: "conversation", metadata: { sessionId, mode, provider: "groq" } });
    fireN8nWebhook({ sessionId, requestId, mode, provider: "groq", agencyId, agentId, prompt, reply: groqPrimary, timestamp: new Date().toISOString() });
    return NextResponse.json({
      reply: groqPrimary,
      prompt,
      requestId,
      meta: { provider: "groq", model: GROQ_MODEL },
    });
  }

  // Fallback 1: Zeniva VPS (Claude) — skip if agency override active
  const primary = agencySystemPrompt ? null : await callZenivaAPI(prompt, history, sessionId);
  if (primary?.reply) {
    logUsage({ agencyId, agentId, service: "lina_ai", action: "conversation", metadata: { sessionId, mode, provider: "zeniva-claude" } });
    fireN8nWebhook({ sessionId, requestId, mode, provider: "zeniva-claude", agencyId, agentId, prompt, reply: primary.reply, timestamp: new Date().toISOString() });
    return NextResponse.json({
      reply: primary.reply,
      prompt,
      requestId,
      meta: { provider: "zeniva-claude", sessionId: primary.sessionId, mode },
    });
  }

  // Fallback 2: Claude API direct
  console.warn(`[lina] ${sessionId} Groq+VPS unavailable, trying Claude API direct`);
  const claudeFallback = await callClaudeFallback(prompt, history, sessionId, mode, agencySystemPrompt);
  if (claudeFallback) {
    logUsage({ agencyId, agentId, service: "lina_ai", action: "conversation", metadata: { sessionId, mode, provider: "claude-api-fallback" } });
    fireN8nWebhook({ sessionId, requestId, mode, provider: "claude-api-fallback", agencyId, agentId, prompt, reply: claudeFallback, timestamp: new Date().toISOString() });
    return NextResponse.json({
      reply: claudeFallback,
      prompt,
      requestId,
      meta: { provider: "claude-api-fallback", model: ANTHROPIC_MODEL },
    });
  }

  // Fallback 3: Gemini
  console.warn(`[lina] ${sessionId} Claude API unavailable, trying Gemini`);
  const geminiFallback = await callGeminiFallback(prompt, history, sessionId, mode, agencySystemPrompt);
  if (geminiFallback) {
    logUsage({ agencyId, agentId, service: "lina_ai", action: "conversation", metadata: { sessionId, mode, provider: "gemini-fallback" } });
    fireN8nWebhook({ sessionId, requestId, mode, provider: "gemini-fallback", agencyId, agentId, prompt, reply: geminiFallback, timestamp: new Date().toISOString() });
    return NextResponse.json({
      reply: geminiFallback,
      prompt,
      requestId,
      meta: { provider: "gemini-fallback", model: GEMINI_MODEL },
    });
  }

  // Fallback 4: OpenAI direct
  console.warn(`[lina] ${sessionId} Gemini unavailable, falling back to OpenAI`);
  const fallbackReply = await callOpenAIFallback(prompt, history, sessionId, mode, agencySystemPrompt);
  logUsage({ agencyId, agentId, service: "lina_ai", action: "conversation", metadata: { sessionId, mode, provider: "openai-fallback" } });
  fireN8nWebhook({ sessionId, requestId, mode, provider: "openai-fallback", agencyId, agentId, prompt, reply: fallbackReply, timestamp: new Date().toISOString() });

  return NextResponse.json({
    reply: fallbackReply,
    prompt,
    requestId,
    meta: { provider: "openai-fallback", model: MODEL },
  });
}

export const runtime = "nodejs";
