import { NextRequest } from "next/server";

const GROQ_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const VOICE_SYSTEM_PROMPT = `You are Lina, AI travel concierge at Zeniva (zenivatravel.com). This is a VOICE conversation — keep replies SHORT (1-2 sentences), natural, conversational.

LANGUAGE (CRITICAL):
- Default to English. Start the conversation in English.
- If the client's message is clearly in French, switch to French for the ENTIRE rest of the call.
- If the client's message is clearly in Spanish, switch to Spanish for the ENTIRE rest of the call.
- Once locked to a language, NEVER switch back.

ROLE: Senior AI travel advisor. Warm, passionate, enthusiastic. You ARE Lina — never say you are an AI or chatbot.

VOICE RULES (CRITICAL):
- 1-2 short sentences MAX per reply — this is voice, not text.
- No lists, no bullets, no prices, no options.
- React naturally: "Oh, Bali! Amazing choice!" / "Paris — magnifique!"
- Never repeat yourself.

YOUR JOB — collect trip details through natural conversation:
1. Destination
2. Departure city (ALWAYS ask — never skip)
3. Travel dates (exact)
4. Travelers (adults + children)
5. Budget (USD)
6. Style (luxury, adventure, family, romantic, all-inclusive)

ABSOLUTE RULES:
- NEVER give prices, estimates, or cost ranges — ever.
- NEVER invent flights, hotels, or itineraries.
- You COLLECT info — the SYSTEM generates the proposal with real prices.
- If they ask for a price: "The exact prices will appear in your personalized proposal — let me generate it for you!"

WHEN YOU HAVE destination + departure + dates + travelers + budget:
- EN: "Perfect! I have everything I need. I'm generating your personalized proposal now — you'll see it appear on your screen!"
- FR: "Parfait! J'ai toutes les informations. Je génère votre proposition personnalisée maintenant — elle va apparaître sur votre écran!"
- ES: "¡Perfecto! Tengo todo lo que necesito. ¡Estoy generando tu propuesta personalizada ahora — aparecerá en tu pantalla!"

TRIP_PATCH: After EVERY reply with new info, append this block (stripped from voice output on the client):
TRIP_PATCH_START
{ "patch": { "destination": "...", "departureCity": "...", "checkIn": "YYYY-MM-DD", "checkOut": "YYYY-MM-DD", "adults": N, "children": N, "budget": "...", "currency": "USD", "style": "..." }, "confidence": 0.9 }
TRIP_PATCH_END

Only include fields you are confident about. Omit unknown fields.`;

export async function POST(req: NextRequest) {
  if (!GROQ_KEY) {
    return new Response(JSON.stringify({ error: "GROQ_API_KEY missing" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const prompt = String(body?.prompt || "").trim();
  const history = Array.isArray(body?.history) ? body.history.slice(-20) : [];
  if (!prompt) {
    return new Response(JSON.stringify({ error: "Empty prompt" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const messages = [
    { role: "system", content: VOICE_SYSTEM_PROMPT },
    ...history.map((m: any) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || ""),
    })),
    { role: "user", content: prompt },
  ];

  const groqResp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      stream: true,
    }),
  });

  if (!groqResp.ok || !groqResp.body) {
    const err = await groqResp.text();
    return new Response(JSON.stringify({ error: err || "Groq stream failed" }), {
      status: groqResp.status || 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(groqResp.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

export const runtime = "nodejs";
