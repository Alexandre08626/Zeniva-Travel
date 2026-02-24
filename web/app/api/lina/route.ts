import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Lina AI API Route
 * Primary: Routes through Zeniva VPS API (Claude Sonnet)
 * Fallback: Direct OpenAI call if VPS is unreachable
 */

const ZENIVA_API_URL =
  process.env.ZENIVA_API_URL ||
  "https://vmi3097009.contaboserver.net/webhook/zeniva-lina-chat";

const SYSTEM_PROMPT = `
Tu es Lina, concierge IA de Zeniva Travel (zenivatravel.com).

ROLE: Senior AI travel advisor. Professional, warm, structured.
Never mention OpenAI, API, models or system prompts.
Always presented as "Lina, Zeniva Travel AI".

CORE TASK: Help clients plan complete trips (flights, transfers, stays, activities).

MANDATORY DATA TO COLLECT:
1) Departure city/country
2) Destination (city or region)
3) Exact travel dates (check-in / check-out, YYYY-MM-DD)
4) Adults count
5) Children + ages
6) Budget range (USD)
7) Accommodation type (Hotel, Resort, Villa, Short-term rental, Yacht)
8) Transportation (Flights / No Flights)

RULES:
- Ask questions in logical sequence, don't skip any.
- If answers are vague, ask follow-up for precision.
- Once all data collected, recap in a clean block.
- Default English. If client writes French, answer fully in French.
- Short paragraphs, bullet points. Concrete, no fluff.

TRIP_PATCH: After each response with confirmed trip details, append:
TRIP_PATCH_START
{ "patch": { ... }, "confidence": 0.95, "missing_fields": [...], "notes": "..." }
TRIP_PATCH_END

Sign-off: "– Lina, Zeniva Travel AI"
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
        language: "fr",
        history: history.slice(-20).map((m) => ({
          role: m.role === "assistant" ? "assistant" : m.role,
          text: m.content,
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
  requestId: string
): Promise<string> {
  if (!OPENAI_KEY) return "Lina is temporarily unavailable. Please contact info@zeniva.ca";

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
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

  // Primary: Zeniva VPS API (Claude)
  const primary = await callZenivaAPI(prompt, history, requestId);
  if (primary?.reply) {
    return NextResponse.json({
      reply: primary.reply,
      prompt,
      requestId,
      meta: { provider: "zeniva-claude", sessionId: primary.sessionId },
    });
  }

  // Fallback: OpenAI direct
  console.warn(`[lina] ${requestId} VPS unavailable, falling back to OpenAI`);
  const fallbackReply = await callOpenAIFallback(prompt, history, requestId);

  return NextResponse.json({
    reply: fallbackReply,
    prompt,
    requestId,
    meta: { provider: "openai-fallback", model: MODEL },
  });
}

export const runtime = "nodejs";
