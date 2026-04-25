import { NextRequest, NextResponse } from "next/server";

/**
 * ElevenLabs TTS proxy. Streams MP3 audio of Lina's real voice
 * (Jessica · eleven_multilingual_v2). Multilingual model auto-detects
 * French / English / Spanish from the text — no need to force a language.
 *
 * Required env: ELEVENLABS_API_KEY
 * Optional env: ELEVENLABS_VOICE_ID (defaults to Jessica)
 *               ELEVENLABS_MODEL_ID  (defaults to eleven_multilingual_v2)
 */

const DEFAULT_VOICE_ID = "cgSgspJ2msm6clMCkdW9"; // Jessica
const DEFAULT_MODEL_ID = "eleven_multilingual_v2";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const text = (url.searchParams.get("text") || "").trim();

  if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });
  if (text.length > 2000) {
    return NextResponse.json({ error: "text too long (max 2000)" }, { status: 400 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY not configured" },
      { status: 500 }
    );
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;
  const modelId = process.env.ELEVENLABS_MODEL_ID || DEFAULT_MODEL_ID;

  const elevenUrl =
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}` +
    `?output_format=mp3_44100_128`;

  try {
    const resp = await fetch(elevenUrl, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    });

    if (!resp.ok || !resp.body) {
      const body = await resp.text().catch(() => "");
      return NextResponse.json(
        { error: `ElevenLabs ${resp.status}`, detail: body.slice(0, 300) },
        { status: 502 }
      );
    }

    return new Response(resp.body, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "fetch failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";
