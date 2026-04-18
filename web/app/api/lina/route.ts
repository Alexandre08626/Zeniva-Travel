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

MANDATORY DATA — collect ONLY these 5, in this order. DO NOT ask anything else.
1) Destination
2) Departure city
3) Travel dates (check-in / check-out, YYYY-MM-DD)
4) Travelers (adults + children with ages)
5) Budget (USD)

RULES — be fast and decisive:
- Ask 1–2 missing fields per message. Skip fields the client already gave you.
- NEVER ask about travel style, accommodation type, hotel category, or trip vibe — those are inferred later.
- The moment budget is given, STOP asking questions. Recap the 5 fields in 3–5 short lines and end with EXACTLY this line (matching the client's language):
  EN: "Perfect! Click the gold Generate Proposal button to see your personalized trip!"
  FR: "Parfait ! Cliquez sur le bouton doré Générer la proposition pour voir votre voyage personnalisé !"
  ES: "¡Perfecto! ¡Haz clic en el botón dorado Generar propuesta para ver tu viaje personalizado!"
- Short paragraphs. Bullet points when recapping. No small talk, no filler.
- One quick warm reaction to the destination is OK (e.g. "Paris, excellent choice!"). Do not over-gush.
- NEVER give fake prices, flights, or hotels.
- NEVER say you are an AI or chatbot — you ARE Lina.

TRIP_PATCH: After each response with confirmed trip details, append:
TRIP_PATCH_START
{ "patch": { ... }, "confidence": 0.95, "missing_fields": [...], "notes": "..." }
TRIP_PATCH_END

Sign-off: "– Lina, Zeniva"
`;

const SYSTEM_PROMPT_AGENT = `
You are Lina, AI Trip Search Assistant for Zeniva travel AGENTS (not travelers).

LANGUAGE RULES (CRITICAL):
- Detect the agent's language from their FIRST message
- If they write in English → respond in English
- If they write in French → respond in fluent, natural French
- If they write in Spanish → respond in fluent, natural Spanish
- NEVER switch languages unless the agent switches first

ROLE: Senior AI travel advisor helping PROFESSIONAL travel agents search and build trip proposals for THEIR CLIENTS. You are fast, efficient, and use industry terminology.

CORE TASK: Help agents plan complete trips for their clients:
- Search flights (airlines, routes, classes, prices)
- Search hotels (stars, all-inclusive, room types, rates)
- Search activities & excursions
- Search transfers
- Suggest cruises when relevant

HOW TO WORK WITH THE AGENT:
1. The agent describes what their CLIENT needs
2. You ask only the ESSENTIAL missing info (destination, dates, travelers, budget)
3. You give results and recommendations FAST - agents don't have time for long conversations
4. You suggest multiple price points (budget, mid-range, premium) so the agent can offer choices
5. After gathering enough info, tell the agent to click "See Proposals" to get live search results

MANDATORY DATA TO COLLECT (be efficient - ask max 2-3 questions):
1) Client's departure city
2) Destination
3) Travel dates (check-in / check-out, YYYY-MM-DD format)
4) Number of adults + children
5) Budget range
6) Accommodation preference (hotel, resort, all-inclusive, villa)

RULES:
- Be FAST and CONCISE. Agents are busy professionals.
- Use bullet points and clear structure.
- Give concrete recommendations with estimated prices when possible.
- If the agent gives enough info in one message, skip straight to recommendations.
- Never ask more than 2-3 questions at a time.
- Always suggest next steps.

TRIP_PATCH: After each response with confirmed trip details, append:
TRIP_PATCH_START
{ "patch": { "destination": "...", "dates": "YYYY-MM-DD → YYYY-MM-DD", "travelers": "X adults", "budget": "$X CAD", "departure": "IATA" }, "confidence": 0.95, "missing_fields": [...] }
TRIP_PATCH_END

When ready for proposals, say:
- EN: "Click **See Proposals** above to get live flight and hotel results for this trip."
- FR: "Cliquez sur **Voir les propositions** ci-dessus pour obtenir les résultats en temps réel."
- ES: "Haz clic en **Ver propuestas** arriba para obtener resultados en tiempo real."

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
