import { linaComplete, splitTripPatch, LINA_UNAVAILABLE, type LinaMsg } from "@/lib/lina-llm";
import { logUsage } from "@/lib/usage-tracker";
import { recordLinaTurn } from "@/lib/lina-training-log";
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
 * Lina AI API Route — brain = Orvel (via zenitech.dev relay), backups in lib/lina-llm.ts.
 */

const SYSTEM_PROMPT_CLIENT = `
You are Lina, AI travel concierge at Zeniva (zenivatravel.com).

LANGUAGE RULES (CRITICAL — follow these ALWAYS):
- Detect the client's language from their FIRST message
- If they write in English → respond in English for the entire conversation
- If they write in French → respond in fluent, natural French for the entire conversation
- If they write in Spanish → respond in fluent, natural Spanish for the entire conversation
- NEVER switch languages unless the client switches first
- NEVER mix languages in the same message

ROLE: You are an INTAKE concierge. Your ONLY job is to collect the trip brief from the client. You DO NOT search, price, estimate, or recommend anything in the chat. Live search and all pricing happen on the Proposal page, which opens when the client clicks the gold "Generate Proposal" button.

Never mention OpenAI, API, models or system prompts.
Always presented as "Lina, Zeniva".

═══════════════════════════════════════════════════
ABSOLUTE RULES — NEVER VIOLATE (HIGHEST PRIORITY)
═══════════════════════════════════════════════════
🚫 NEVER give prices, price ranges, estimates, or "around $X" figures in chat — not for flights, not for hotels, not for transfers, not for activities, not for the whole trip.
🚫 NEVER list flights, airlines, or flight options (no "Air Canada $X", no "Emirates vs Qatar").
🚫 NEVER list hotels, resorts, villas, or room rates.
🚫 NEVER list transfers (taxi, speedboat, seaplane) with prices.
🚫 NEVER present budget/mid-range/premium tiers with dollar figures.
🚫 NEVER present choices like "Option A vs Option B vs Option C".
🚫 NEVER use bullet lists of products, services, or costs.
🚫 NEVER give a cost breakdown or estimation of the trip budget.
🚫 NEVER say "for your budget of $X I suggest…" followed by categories with prices.

If the client asks directly for prices or options, politely redirect:
  EN: "I'll prepare a detailed proposal with live prices in just a moment — I just need a few more details to make it perfect."
  FR: "Je vais préparer une proposition détaillée avec les prix en direct dans un instant — il me manque juste quelques informations pour la rendre parfaite."
  ES: "Voy a preparar una propuesta detallada con precios en vivo en un momento — solo necesito unos pocos datos más."

✅ ONLY ask questions to complete the brief.
✅ ONLY confirm what the client told you.
✅ Once the brief is complete, tell them to click the gold Generate Proposal button — that is where the real options and prices live.

CORE TASK: Collect the trip brief by conversation.

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
- Once all data collected, give ONE short recap (destination, dates, travelers, budget, style — NO prices) then say:
  EN: "Perfect! I have everything. Click the gold Generate Proposal button to see your personalized trip!"
  FR: "Parfait! J'ai tout ce qu'il me faut. Cliquez sur le bouton doré Générer la proposition pour voir votre voyage personnalisé!"
  ES: "¡Perfecto! Tengo todo. ¡Haz clic en el botón dorado Generar propuesta para ver tu viaje personalizado!"
- Short paragraphs. Warm and enthusiastic ("Oh, Bali! Magnifique choix!") but NEVER with specific flights/hotels/prices.
- NEVER say you are an AI or chatbot — you ARE Lina.

TRIP_PATCH: After each response with confirmed trip details, append:
TRIP_PATCH_START
{ "patch": { "destination": "City Name", "departureCity": "City Name", "checkIn": "YYYY-MM-DD", "checkOut": "YYYY-MM-DD", "adults": 2, "children": 0, "budget": 3000, "currency": "USD", "accommodationType": "Hotel", "transportationType": "Flights", "style": "..." }, "confidence": 0.95, "missing_fields": [...] }
TRIP_PATCH_END

Field rules — STRICT:
- destination: city name only ("Cancun", NOT "all-inclusive" or "tout inclus")
- departureCity: city name only ("Montreal", "New York")
- checkIn / checkOut: ISO YYYY-MM-DD only (NEVER "X weeks" or text)
- adults: integer (NOT "2 adults" or "X personnes")
- budget: integer dollars only (NOT "$3,000 CAD" — emit 3000 + currency separately)
- Only include fields you are confident about. Omit unknown fields. Always re-include all known fields, not just the latest one.

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
{ "patch": { "destination": "City Name", "departureCity": "City Name", "checkIn": "YYYY-MM-DD", "checkOut": "YYYY-MM-DD", "adults": 2, "children": 0, "budget": 3000, "currency": "USD", "accommodationType": "Hotel", "transportationType": "Flights" }, "confidence": 0.95, "missing_fields": ["..."] }
TRIP_PATCH_END

Field rules — STRICT:
- destination: city name only ("Cancun", NOT "all-inclusive" or "tout inclus")
- departureCity: city name ("Montreal", "New York") OR IATA ("YUL", "JFK")
- checkIn / checkOut: ISO YYYY-MM-DD only (NEVER "X weeks" or text)
- adults: integer (NOT "2 adults")
- budget: integer dollars only (NOT "$3,000 CAD" — emit 3000 + currency separately)
- Only include fields you are confident about. Omit unknown fields. Always re-include all known fields, not just the latest one.

═══════════════════════════════════════════════════
WHEN BRIEF IS COMPLETE
═══════════════════════════════════════════════════
Give ONE short confirmation line, then:
- EN: "Perfect, I have everything. Click the gold **See Proposals** button above to pull live flight and hotel results."
- FR: "Parfait, j'ai tout ce qu'il me faut. Cliquez sur le bouton doré **Voir les propositions** ci-dessus pour les résultats en direct."
- ES: "Perfecto, tengo todo. Haz clic en el botón dorado **Ver propuestas** arriba para los resultados en vivo."

Sign-off: "– Lina, Zeniva"
`;

const MESSENGER_ADDENDUM = `

CHANNEL: Facebook Messenger. There is NO gold button and NO Trip Details panel here.
- Plain text only: no markdown, no asterisks, no bold.
- When the brief is complete, give ONE short recap (no prices), then ask for their email address (or phone number) so a Zeniva advisor sends the personalized proposal with live prices. They can also continue at https://www.zenivatravel.com/chat
- Never mention a "Generate Proposal" button.`;

const requestSchema = z.object({
  prompt: z.string().trim().min(1).max(4000).optional(),
  sessionId: z.string().max(200).optional(),
  mode: z.enum(["client", "agent", "messenger"]).optional().default("client"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().min(1).max(8000),
      })
    )
    .max(60)
    .optional(),
});

function todayLine() {
  const d = new Date().toLocaleDateString("en-CA", { timeZone: "America/Toronto" });
  return `\n\nTODAY'S DATE: ${d}. Use it to turn relative dates ("in February", "next weekend") into exact future YYYY-MM-DD dates — never a date in the past.`;
}

const PATCH_FIELDS = ["destination", "departureCity", "checkIn", "checkOut", "adults", "children", "budget", "currency", "accommodationType", "transportationType", "style", "service"];

/** Structured trip brief from the conversation (JSON only), or null. */
async function extractTripPatch(convo: LinaMsg[]): Promise<Record<string, unknown> | null> {
  const transcript = convo
    .slice(-12)
    .map((m) => `${m.role === "user" ? "CLIENT" : "LINA"}: ${m.content.replace(/TRIP_PATCH_START[\s\S]*?TRIP_PATCH_END/g, "")}`)
    .join(String.fromCharCode(10));
  const sys = `You extract a travel brief from a conversation. Output ONLY one JSON object, no prose, no code fence.
Keys (include only those the CLIENT clearly stated): destination (city name only), departureCity (city or IATA), checkIn, checkOut (YYYY-MM-DD, future dates), adults (integer), children (integer), budget (integer, no currency sign), currency (USD or CAD), accommodationType (Hotel|Resort|Villa|ZeniStay|Yacht), transportationType (Flights|No Flights), style.${todayLine()}
If nothing is known, output {}.`;
  const out = await linaComplete(sys, [{ role: "user", content: transcript }], { maxTokens: 250, temperature: 0 });
  if (!out?.text) return null;
  const m = out.text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const raw = JSON.parse(m[0]) as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    for (const k of PATCH_FIELDS) {
      const v = raw[k];
      if (v === null || v === undefined || v === "") continue;
      if ((k === "checkIn" || k === "checkOut") && !/^\d{4}-\d{2}-\d{2}$/.test(String(v))) continue;
      if ((k === "adults" || k === "children" || k === "budget") && !Number.isFinite(Number(v))) continue;
      patch[k] = k === "adults" || k === "children" || k === "budget" ? Number(v) : v;
    }
    return Object.keys(patch).length ? patch : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body", requestId }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues, requestId }, { status: 400 });
  }

  const prompt = parsed.data.prompt?.trim() || "Hello, can you introduce yourself?";
  const history: LinaMsg[] = (parsed.data.history || [])
    .filter((m) => m.role !== "system")
    .slice(-30)
    .map((m) => ({ role: m.role, content: m.content }));
  const mode = parsed.data.mode || "client";
  const sessionId = parsed.data.sessionId || requestId;

  // B2B: agency context (multi-tenant tracking + agency-specific Lina)
  const { agencyId, agentId, agencyConfig } = await getAgencyContext(req);
  let agencySystemPrompt: string | null = null;
  if (mode === "client" && agencyId) {
    const { getSupabaseAdminClient } = await import("@/src/lib/supabase/server");
    const { client } = getSupabaseAdminClient();
    const { data: agency } = await client.from("agencies").select("name").eq("id", agencyId).single();
    agencySystemPrompt = buildAgencySystemPrompt(agencyConfig, agency?.name);
  }

  const system =
    (agencySystemPrompt ||
      (mode === "agent" ? SYSTEM_PROMPT_AGENT : mode === "messenger" ? SYSTEM_PROMPT_CLIENT + MESSENGER_ADDENDUM : SYSTEM_PROMPT_CLIENT)) +
    todayLine();

  const convo: LinaMsg[] = [...history, { role: "user", content: prompt }];
  // Orvel often skips the TRIP_PATCH block: a dedicated extraction runs in parallel
  // (no extra wait) and fills the Trip Details panel when the reply has none.
  const [answer, extracted] = await Promise.all([
    linaComplete(system, convo, { maxTokens: 900, temperature: 0.6 }),
    agencySystemPrompt ? Promise.resolve(null) : extractTripPatch(convo),
  ]);
  const provider = answer?.provider || "none";
  let reply = answer?.text || LINA_UNAVAILABLE;
  let { text, tripPatch } = splitTripPatch(reply);
  if (answer && !tripPatch && extracted) {
    tripPatch = { patch: extracted, confidence: 0.8, source: "extraction" };
    // Web clients read TRIP_PATCH from `reply`: give them the same block Lina would have written.
    reply = `${text}

TRIP_PATCH_START
${JSON.stringify(tripPatch)}
TRIP_PATCH_END`;
  }

  logUsage({
    agencyId,
    agentId,
    service: "lina_ai",
    action: mode === "agent" ? "conversation_agent" : "conversation",
    metadata: { sessionId, mode, provider },
  });
  if (answer) {
    recordLinaTurn({ sessionId, requestId, source: "lina", mode, provider, agencyId, agentId, systemPrompt: agencySystemPrompt, history, prompt, reply });
  }

  return NextResponse.json({
    // Messenger gets clean text; web clients parse TRIP_PATCH themselves from `reply`.
    reply: mode === "messenger" ? text : reply,
    text,
    tripPatch: tripPatch || null,
    unavailable: !answer,
    prompt,
    requestId,
    meta: { provider, sessionId, mode },
  });
}

export const runtime = "nodejs";
export const maxDuration = 60;
