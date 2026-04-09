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
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const API_BASE = process.env.OPENAI_API_BASE || "https://api.openai.com/v1";
const OPENAI_KEY =
  process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

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
    return { reply, sessionId: data?.sessionId };
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

/**
 * Fallback: direct OpenAI call
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

  // Agent mode: try VPS first (Claude), fallback to OpenAI
  if (mode === "agent") {
    // Try VPS first
    const vpsPrimary = await callZenivaAPI(prompt, history, sessionId);
    if (vpsPrimary?.reply) {
      logUsage({ agencyId, agentId, service: "lina_ai", action: "conversation_agent", metadata: { sessionId, mode, provider: "zeniva-claude-agent" } });
      return NextResponse.json({
        reply: vpsPrimary.reply,
        prompt,
        requestId,
        meta: { provider: "zeniva-claude-agent", sessionId: vpsPrimary.sessionId, mode },
      });
    }
    // Fallback to OpenAI
    const agentReply = await callOpenAIFallback(prompt, history, sessionId, mode, null);
    logUsage({ agencyId, agentId, service: "lina_ai", action: "conversation_agent", metadata: { sessionId, mode, provider: "openai-agent" } });
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

  // Primary: Zeniva VPS API (Claude) - only for client mode (skip for agency-specific)
  const primary = agencySystemPrompt ? null : await callZenivaAPI(prompt, history, sessionId);
  if (primary?.reply) {
    logUsage({ agencyId, agentId, service: "lina_ai", action: "conversation", metadata: { sessionId, mode, provider: "zeniva-claude" } });
    return NextResponse.json({
      reply: primary.reply,
      prompt,
      requestId,
      meta: { provider: "zeniva-claude", sessionId: primary.sessionId, mode },
    });
  }

  // Fallback: OpenAI direct
  console.warn(`[lina] ${sessionId} VPS unavailable, falling back to OpenAI`);
  const fallbackReply = await callOpenAIFallback(prompt, history, sessionId, mode, agencySystemPrompt);
  logUsage({ agencyId, agentId, service: "lina_ai", action: "conversation", metadata: { sessionId, mode, provider: "openai-fallback" } });

  return NextResponse.json({
    reply: fallbackReply,
    prompt,
    requestId,
    meta: { provider: "openai-fallback", model: MODEL },
  });
}

export const runtime = "nodejs";
