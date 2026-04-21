import { NextResponse } from "next/server";
import {
  LINA_REALTIME_MODEL,
  LINA_REALTIME_VOICE,
  LINA_REALTIME_INSTRUCTIONS,
  LINA_REALTIME_TOOLS,
  LINA_REALTIME_TURN_DETECTION,
  LINA_REALTIME_INPUT_TRANSCRIPTION,
} from "../../../src/lib/linaRealtimeConfig";

export async function POST() {
  try {
    const res = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: LINA_REALTIME_MODEL,
        voice: LINA_REALTIME_VOICE,
        modalities: ["text", "audio"],
        instructions: LINA_REALTIME_INSTRUCTIONS,
        tools: LINA_REALTIME_TOOLS,
        input_audio_transcription: LINA_REALTIME_INPUT_TRANSCRIPTION,
        turn_detection: LINA_REALTIME_TURN_DETECTION,
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
