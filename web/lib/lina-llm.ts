/**
 * Lina's brain = Orvel (Zenitech's GPU model), reached server-to-server through
 * zenitech.dev (/api/orvel/widget/lina-relay, shared key LINA_RELAY_KEY).
 *
 * Order: Orvel → Groq → Gemini → OpenAI. Each step is skipped when its key is missing,
 * so Lina only goes silent if every engine is down.
 */

export type LinaMsg = { role: "system" | "user" | "assistant"; content: string };
export type LinaAnswer = { text: string; provider: string };

const RELAY_URL = (process.env.LINA_RELAY_URL || "https://zenitech.dev/api/orvel/widget/lina-relay").trim();
const RELAY_KEY = (process.env.LINA_RELAY_KEY || "").trim();

const GROQ_KEY = process.env.GROQ_API_KEY;
const GROQ_DEFAULT_MODEL = "openai/gpt-oss-120b";
const GROQ_MODEL = process.env.GROQ_MODEL || GROQ_DEFAULT_MODEL;
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE = (process.env.OPENAI_API_BASE || "https://api.openai.com/v1").trim();
const OPENAI_MODEL = (process.env.OPENAI_MODEL || "gpt-4o-mini").trim();

const TIMEOUT_MS = Number(process.env.LINA_TIMEOUT_MS || 45000);

export const LINA_UNAVAILABLE =
  "Désolée, je suis momentanément indisponible. Écrivez-nous à info@zeniva.ca ou appelez-nous, un conseiller vous répond rapidement. / Sorry, I'm temporarily unavailable — please email info@zeniva.ca.";

const stripThink = (s: string) =>
  String(s || "").replace(/<think>[\s\S]*?<\/think>/g, "").replace(/^[\s\S]*?<\/think>/, "").trim();

async function timed(url: string, init: RequestInit, ms = TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

function withSystem(system: string, messages: LinaMsg[]): LinaMsg[] {
  return [{ role: "system", content: system }, ...messages.filter((m) => m.role !== "system" && m.content)];
}

async function viaOrvel(all: LinaMsg[], maxTokens: number, temperature: number): Promise<string | null> {
  if (!RELAY_KEY) return null;
  try {
    const r = await timed(RELAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-lina-key": RELAY_KEY },
      body: JSON.stringify({ messages: all, max_tokens: maxTokens, temperature }),
    });
    if (!r.ok) {
      console.warn(`[lina] Orvel relay HTTP ${r.status}`);
      return null;
    }
    const data = await r.json();
    return stripThink(data?.choices?.[0]?.message?.content) || null;
  } catch (e) {
    console.warn(`[lina] Orvel relay error: ${(e as Error).message}`);
    return null;
  }
}

function groqCall(body: Record<string, unknown>, model: string) {
  return timed("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({ ...body, model }),
  });
}

/** Groq decommissions models: on model_not_found, retry once with the known-good default. */
async function groqResponse(body: Record<string, unknown>): Promise<Response | null> {
  if (!GROQ_KEY) return null;
  let r = await groqCall(body, GROQ_MODEL);
  if (!r.ok && GROQ_MODEL !== GROQ_DEFAULT_MODEL) {
    const err = await r.clone().text().catch(() => "");
    if (r.status === 404 || /model_not_found|decommissioned/i.test(err)) r = await groqCall(body, GROQ_DEFAULT_MODEL);
  }
  return r;
}

async function viaGroq(all: LinaMsg[], maxTokens: number, temperature: number): Promise<string | null> {
  try {
    const r = await groqResponse({ messages: all, temperature, max_tokens: maxTokens });
    if (!r?.ok) return null;
    const data = await r.json();
    return stripThink(data?.choices?.[0]?.message?.content) || null;
  } catch {
    return null;
  }
}

async function viaGemini(system: string, messages: LinaMsg[], maxTokens: number, temperature: number): Promise<string | null> {
  if (!GEMINI_KEY) return null;
  try {
    const r = await timed(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents: messages
            .filter((m) => m.role !== "system")
            .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
          generationConfig: { temperature, maxOutputTokens: maxTokens },
        }),
      }
    );
    if (!r.ok) return null;
    const data = await r.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch {
    return null;
  }
}

async function viaOpenAI(all: LinaMsg[], maxTokens: number, temperature: number): Promise<string | null> {
  if (!OPENAI_KEY) return null;
  try {
    const r = await timed(`${OPENAI_BASE}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({ model: OPENAI_MODEL, messages: all, temperature, max_tokens: maxTokens }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    return data?.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

/** One full answer from Lina. Returns null only when every engine failed. */
export async function linaComplete(
  system: string,
  messages: LinaMsg[],
  opts: { maxTokens?: number; temperature?: number } = {}
): Promise<LinaAnswer | null> {
  const maxTokens = opts.maxTokens ?? 900;
  const temperature = opts.temperature ?? 0.6;
  const all = withSystem(system, messages);

  const orvel = await viaOrvel(all, maxTokens, temperature);
  if (orvel) return { text: orvel, provider: "orvel" };
  const groq = await viaGroq(all, maxTokens, temperature);
  if (groq) return { text: groq, provider: "groq" };
  const gemini = await viaGemini(system, messages, maxTokens, temperature);
  if (gemini) return { text: gemini, provider: "gemini" };
  const openai = await viaOpenAI(all, maxTokens, temperature);
  if (openai) return { text: openai, provider: "openai" };
  console.error("[lina] every engine failed (Orvel, Groq, Gemini, OpenAI)");
  return null;
}

/**
 * Streaming answer (voice call). Returns an OpenAI-format SSE stream
 * (`data: {"choices":[{"delta":{"content":"…"}}]}`) — Orvel first, Groq as backup.
 */
export async function linaStream(
  system: string,
  messages: LinaMsg[],
  opts: { maxTokens?: number; temperature?: number } = {}
): Promise<{ body: ReadableStream<Uint8Array>; provider: string } | null> {
  const maxTokens = opts.maxTokens ?? 600;
  const temperature = opts.temperature ?? 0.7;
  const all = withSystem(system, messages);

  if (RELAY_KEY) {
    try {
      const r = await timed(
        RELAY_URL,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-lina-key": RELAY_KEY },
          body: JSON.stringify({ messages: all, max_tokens: maxTokens, temperature, stream: true }),
        },
        120000
      );
      if (r.ok && r.body) return { body: r.body, provider: "orvel" };
      console.warn(`[lina-stream] Orvel relay HTTP ${r.status}`);
    } catch (e) {
      console.warn(`[lina-stream] Orvel relay error: ${(e as Error).message}`);
    }
  }

  try {
    const r = await groqResponse({ messages: all, temperature, max_tokens: maxTokens, stream: true });
    if (r?.ok && r.body) return { body: r.body, provider: "groq" };
  } catch { /* fall through */ }
  return null;
}

/** Splits a TRIP_PATCH block out of Lina's reply: { clean text, parsed patch }. */
export function splitTripPatch(reply: string): { text: string; tripPatch?: Record<string, unknown> } {
  const m = reply.match(/TRIP_PATCH_START([\s\S]*?)(TRIP_PATCH_END|$)/);
  if (!m) return { text: reply.trim() };
  let tripPatch: Record<string, unknown> | undefined;
  try {
    const raw = m[1].trim().replace(/^```(?:json)?/, "").replace(/```$/, "").trim();
    tripPatch = JSON.parse(raw);
  } catch { /* malformed block: still hide it */ }
  return { text: reply.replace(m[0], "").trim(), tripPatch };
}
