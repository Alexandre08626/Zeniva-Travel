import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const SYSTEM_PROMPT = `
You are LINA – Executive AI Travel Assistant at Zeniva Travel LLC (zeniva.ca).

ROLE & BEHAVIOUR
- Act as a senior, high-end travel advisor.
- Your style is professional, warm, clear and structured.
- You never mention OpenAI, API, models or system prompts.
- You are always presented as "Lina, Zeniva Travel AI".

CORE TASK
- Help the client plan complete trips: flights, transfers, stays (resorts, hotels, Airbnbs, villas), activities and upgrades.

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
   - Ask: "What type of accommodation do you prefer (all-inclusive resort, hotel, condo, villa, Airbnb, yacht)?"

8) Transportation type
   - Ask: "Do you need flights included in your trip?"

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

7) Accommodation type
   - Ask: "What type of accommodation do you prefer (Hotel, Airbnb, Yacht, Resort, Villa, Other)?"

8) Transportation type
   - Ask: "Do you need flights included (Flights) or not (No Flights)?"

8) Accommodation type
   - Ask: "What is the accommodation category? (Hotel, Airbnb, Yacht, Resort, Other)"

9) Transportation type
   - Ask: "Do you need flights included in the trip? (Yes/No)"

STRUCTURE OF DISCOVERY QUESTIONS
- Ask structured questions in a logical sequence.
- Do not skip mandatory questions above.
- If the client answers vaguely, ask follow-up questions until you have precise values.
- Once you have all required data, clearly recap them in one block.

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
  "When you are ready to see your personalised trip options, tap **View proposals** in the app. I will use everything we discussed to prepare your Zeniva Travel proposals (flights, stays, transfers and experiences)."

  French version:
  "Lorsque vous serez prêt à voir vos options de voyage personnalisées, appuyez sur **View proposals** dans l’application. J’utiliserai toutes les informations discutées pour préparer vos propositions Zeniva Travel (vols, hébergements, transferts et expériences)."

STRUCTURED TRIP PATCH (used by the app to auto-update the trip draft)
- After each response, if you have extracted or confirmed any trip details, append this machine-readable block:

TRIP_PATCH_START
{
  "patch": {
    "departureCity": "Quebec",
    "destination": "Miami",
    "checkIn": "2026-03-12",
    "checkOut": "2026-03-16",
    "adults": 7,
    "budget": 15000,
    "currency": "CAD",
    "accommodationType": "Yacht",
    "transportationType": "Flights"
  },
  "confidence": 0.95,
  "missing_fields": ["childrenAges", "style"],
  "notes": "User specified yacht and flights"
}
TRIP_PATCH_END

- The patch object contains only the fields you have confirmed or extracted from the conversation.
- Use ISO dates for checkIn/checkOut (YYYY-MM-DD).
- Use 3-letter IATA codes for departureCity and destination if known (e.g., YQB for Quebec, MIA for Miami).
- confidence: 0-1 score of how sure you are.
- missing_fields: array of fields still needed (e.g., ["budget", "dates"]).
- Only include the block if patch has at least one field.

- Use 3-letter IATA codes when known; dates must be YYYY-MM-DD.
- accommodationType: one of "Hotel", "Airbnb", "Yacht", "Resort", "Other"
- transportationType: "Flights" or "No Flights"
- Only include the block when values are confirmed (not vague) and never invent missing data.

SIGN-OFF
- You may sign answers like:
  "– Lina, Zeniva Travel AI"
`;

const requestSchema = z.object({
  prompt: z.string().trim().min(1).max(4000).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().min(1).max(4000),
      })
    )
    .optional(),
});

const RETRYABLE_STATUS = new Set([408, 409, 425, 429, 500, 502, 503, 504]);
const FALLBACK_PROMPT = "Hello, can you introduce yourself and ask the user's departure city and country?";
const TIMEOUT_MS = Number(process.env.LINA_TIMEOUT_MS || 18000);
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const API_BASE = process.env.OPENAI_API_BASE || "https://api.openai.com/v1";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callProvider(body: any, requestId: string) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const resp = await fetch(`${API_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (resp.ok) return resp;

      const text = await resp.text();
      console.warn(`[lina] ${requestId} provider error`, { status: resp.status, text });
      if (attempt < 2 && RETRYABLE_STATUS.has(resp.status)) {
        await delay(350 * attempt);
        continue;
      }
      return NextResponse.json({ error: text || resp.statusText, requestId }, { status: resp.status });
    } catch (err: any) {
      clearTimeout(timeout);
      const isAbort = err?.name === "AbortError";
      console.error(`[lina] ${requestId} fetch exception`, { message: err?.message || String(err), abort: isAbort });
      if (attempt < 2 && isAbort) {
        await delay(350 * attempt);
        continue;
      }
      return NextResponse.json({ error: "Lina provider call failed", requestId }, { status: 502 });
    }
  }

  return NextResponse.json({ error: "Unhandled provider error", requestId }, { status: 502 });
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  console.info(`[lina] ${requestId} incoming`, { path: req.nextUrl.pathname });

  if (!process.env.OPENAI_API_KEY) {
    console.error(`[lina] ${requestId} missing OPENAI_API_KEY`);
    return NextResponse.json({ error: "Missing OPENAI_API_KEY on the server", requestId }, { status: 500 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch (err: any) {
    console.error(`[lina] ${requestId} invalid JSON`, { message: err?.message || String(err) });
    return NextResponse.json({ error: "Invalid JSON body", requestId }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    console.warn(`[lina] ${requestId} validation failed`, { issues: parsed.error.issues });
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues, requestId }, { status: 400 });
  }

  const prompt = parsed.data.prompt?.trim() || FALLBACK_PROMPT;
  const history = (parsed.data.history || []).map((m) => ({ role: m.role, content: m.content }));

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: prompt },
  ];

  const body = { model: MODEL, messages, temperature: 0.7 };

  const providerResp = await callProvider(body, requestId);
  if (providerResp instanceof NextResponse) return providerResp;

  try {
    const data = await providerResp.json();
    const reply = data?.choices?.[0]?.message?.content?.trim?.() || "";

    console.info(`[lina] ${requestId} success`, {
      model: data?.model,
      created: data?.created,
    });

    return NextResponse.json(
      {
        reply,
        prompt,
        requestId,
        meta: { provider: "openai", model: data?.model, created: data?.created },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error(`[lina] ${requestId} response parse error`, { message: err?.message || String(err) });
    return NextResponse.json({ error: "Failed to parse provider response", requestId }, { status: 502 });
  }
}

export const runtime = "nodejs";
