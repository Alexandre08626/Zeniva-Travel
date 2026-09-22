import { NextRequest, NextResponse } from "next/server";

const GROQ_KEY = process.env.GROQ_API_KEY;
// whisper-large-v3-turbo: 2.1x faster than large-v3, same quality for clean audio.
// Free on Groq. Supports 99 languages including French (Québec accent handled well).
const WHISPER_MODEL = process.env.GROQ_STT_MODEL || "whisper-large-v3-turbo";

/**
 * Speech-to-text proxy → Groq Whisper. Multipart form with "file" field.
 * Optional "language" hint (ISO-639-1) speeds transcription and improves
 * accuracy on short utterances.
 */
export async function POST(req: NextRequest) {
  if (!GROQ_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY missing" }, { status: 500 });
  }

  let clientForm: FormData;
  try {
    clientForm = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = clientForm.get("file");
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ error: "file missing or empty" }, { status: 400 });
  }
  if (file.size > 24 * 1024 * 1024) {
    return NextResponse.json({ error: "file > 24MB" }, { status: 413 });
  }

  const language = (clientForm.get("language") as string | null) || undefined;

  const groqForm = new FormData();
  // Groq requires a filename with a recognized extension.
  groqForm.append("file", file, "audio.webm");
  groqForm.append("model", WHISPER_MODEL);
  groqForm.append("response_format", "json");
  groqForm.append("temperature", "0");
  if (language) groqForm.append("language", language);

  try {
    const resp = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${GROQ_KEY}` },
      body: groqForm,
    });

    if (!resp.ok) {
      const detail = await resp.text();
      return NextResponse.json(
        { error: `Groq ${resp.status}`, detail: detail.slice(0, 400) },
        { status: 502 }
      );
    }

    const data = await resp.json();
    return NextResponse.json({ text: String(data?.text || "").trim() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "stt failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";
