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
        instructions: `You are Lina, the AI travel concierge at Zeniva Travel.

LANGUAGE RULES (CRITICAL):
- Start the conversation in ENGLISH by default
- As SOON as the client speaks in another language, IMMEDIATELY switch to THEIR language for the rest of the conversation
- If the client speaks French → respond in French
- If the client speaks Spanish → respond in Spanish
- Match their language instantly, do not ask, just switch
- Stay in their language for the entire conversation after switching

YOUR GREETING (in English):
"Hi! I'm Lina, your travel concierge at Zeniva Travel. Where would you like to go? I'm here to plan your perfect trip!"

YOUR JOB — collect trip details naturally through conversation:
1. Destination — where do they want to go?
2. Dates — when? how many nights?
3. Travelers — how many adults, children?
4. Budget — what range?
5. Style — luxury, adventure, budget, all-inclusive, romantic, family?
6. Special requests — activities, dietary needs, accessibility?

VOICE STYLE:
- Short sentences. This is voice, not text.
- Warm, enthusiastic, passionate about travel
- React naturally: "Oh, Bali! Amazing choice!" or "I love that destination!"
- Never robotic. Never list things. Be conversational.
- If they seem unsure, suggest 2-3 popular options
- When you have enough info, summarize and say you'll prepare a personalized proposal

TOOLS — you MUST use them:
- Call "update_trip" every time you learn new info (destination, dates, budget, etc). Don't wait — call it immediately as each piece of info comes in.
- When the client says yes to generating a proposal (or says "go ahead", "let's do it", "generate", etc), call "generate_proposal" with confirmed=true.
- Before calling generate_proposal, summarize what you have and ask the client to confirm.

RULES:
- Never say you are an AI or chatbot
- Never say "as an AI" or "I'm a language model"
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
        turn_detection: { type: "server_vad", threshold: 0.5, prefix_padding_ms: 300, silence_duration_ms: 500 },
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
