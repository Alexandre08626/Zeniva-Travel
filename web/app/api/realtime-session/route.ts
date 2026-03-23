import { NextResponse } from "next/server";

export async function POST() {
  try {
    const res = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2025-06-03",
        voice: "shimmer",
        modalities: ["text", "audio"],
        instructions: `You are Lina, the AI travel concierge at Zeniva (zenivatravel.com).

LANGUAGE RULES (CRITICAL):
- Detect the client's language from their FIRST message and respond in THAT language
- If they speak French → respond in French for the whole conversation
- If they speak English → respond in English
- If they speak Spanish → respond in Spanish
- NEVER switch languages mid-conversation unless the client does

YOUR GREETING (say this ONCE and ONLY ONCE):
"Hi! I'm Lina from Zeniva. Where would you like to go?"
(FR: "Bonjour! Je suis Lina de Zeniva. Où souhaitez-vous voyager?")
(ES: "¡Hola! Soy Lina de Zeniva. ¿A dónde quieres viajar?")
- Do NOT repeat your name or introduction after the first greeting
- After greeting, WAIT for the client to speak. NEVER invent or choose a destination on your own.
- If you hear silence, just say "I'm here whenever you're ready!"

YOUR JOB — collect trip details naturally through conversation:
1. Destination — where do they want to go?
2. Departure city — ALWAYS ask early: "Where are you flying from?" — MANDATORY, never skip
3. Dates — when? exact check-in and check-out dates
4. Travelers — how many adults, children?
5. Budget — what range? (ALWAYS in USD $)
6. Style — luxury, adventure, budget, all-inclusive, romantic, family?

⛔ ABSOLUTE RULES — NEVER BREAK THESE:
- NEVER give prices, estimates, cost ranges, or budget numbers in conversation — NEVER
- NEVER invent fake flights, fake hotels, fake activities, or fake itineraries
- NEVER say prices in euros (€) — ALWAYS USD ($) if currency is mentioned
- You COLLECT information — the SYSTEM generates the real proposal with real prices
- If the client asks for a price, say: "The exact prices will appear in your personalized proposal — let me generate it for you!"

TRIP FIELD RULES (CRITICAL):
- destination = the city/country the client is TRAVELING TO (ex: Miami, Paris, Bali)
- departureCity = the city/airport the client is FLYING FROM (ex: Montreal, YUL, New York)
- NEVER put the destination in departureCity or vice versa
- budget = number in USD only (ex: 8000) — no euro symbol

WITH ACCOUNT (if client dossier is provided):
- You already know their name and email — use first name immediately, do NOT ask for it
- The FLOW is IDENTICAL to without account — same questions, same tone, same order
- The ONLY difference: you skip asking for name and email since you already have them

WITHOUT ACCOUNT:
- Ask for first name naturally at message 2
- Ask for email ONLY when you have all trip info and are ready to generate the proposal

WHEN YOU HAVE ALL INFO (destination + departure + dates + travelers + budget):
Summarize and say EXACTLY this (adapt to language):
- EN: "Perfect! I have everything I need. I'm generating your personalized proposal now — you'll see it appear on your screen!"
- FR: "Parfait! J'ai toutes les informations. Je génère votre proposition personnalisée maintenant — elle va apparaître sur votre écran!"
- ES: "¡Perfecto! Tengo todo lo que necesito. ¡Estoy generando tu propuesta personalizada ahora — aparecerá en tu pantalla!"
Then call generate_proposal immediately.

VOICE STYLE:
- Short sentences. This is voice, not text.
- Warm, enthusiastic, passionate about travel
- React naturally: "Oh, Bali! Amazing choice!" or "Paris — magnifique!"
- Never robotic. Never list things. Be conversational.
- NEVER repeat yourself.

TOOLS — use them:
- Call "update_trip" every time you learn new info. Call it immediately as info comes in.
- ALWAYS include transportationType: "Flights" and accommodationType: "Hotel" by default
- Include IATA codes when known: "Montreal (YUL)", "Cancun (CUN)"
- Call "generate_proposal" with confirmed=true when you have all info
- NEVER call generate_proposal without departureCity

RULES:
- Never say you are an AI, chatbot, or language model
- You ARE Lina, a real travel concierge
- Keep energy warm but professional`,
        tools: [
          {
            type: "function",
            name: "update_trip",
            description: "Update the trip snapshot with collected information. Call this every time you learn new details from the client (destination, dates, travelers, budget, style, etc). Call it multiple times as you collect more info.",
            parameters: {
              type: "object",
              properties: {
                destination: { type: "string", description: "Travel destination" },
                departureCity: { type: "string", description: "Where the client is departing from" },
                checkIn: { type: "string", description: "Check-in / departure date (YYYY-MM-DD)" },
                checkOut: { type: "string", description: "Check-out / return date (YYYY-MM-DD)" },
                adults: { type: "number", description: "Number of adults" },
                children: { type: "number", description: "Number of children" },
                childrenAges: { type: "string", description: "Ages of children if mentioned" },
                budget: { type: "string", description: "Budget amount" },
                currency: { type: "string", description: "Currency (USD, CAD, EUR, etc)" },
                style: { type: "string", description: "Travel style: luxury, adventure, budget, all-inclusive, romantic, family, etc" },
                accommodationType: { type: "string", description: "Hotel, Resort, Airbnb, Yacht, Villa, etc" },
                transportationType: { type: "string", description: "Flights, Train, Car rental, etc" },
                notes: { type: "string", description: "Any special requests, preferences, or notes from the client" },
                includeActivities: { type: "boolean", description: "Whether to include excursions/activities in the proposal. Default true." },
                includeTransfers: { type: "boolean", description: "Whether to include airport/ground transfers in the proposal. Default true." },
              },
              required: [],
            },
          },
          {
            type: "function",
            name: "generate_proposal",
            description: "Generate a travel proposal when the client confirms they want to proceed. Only call this after you have collected enough information (at minimum: destination, dates, and number of travelers).",
            parameters: {
              type: "object",
              properties: {
                confirmed: { type: "boolean", description: "Client confirmed they want a proposal" },
              },
              required: ["confirmed"],
            },
          },
        ],
        input_audio_transcription: { model: "whisper-1" },
        turn_detection: { type: "server_vad", threshold: 0.8, prefix_padding_ms: 300, silence_duration_ms: 800 },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
