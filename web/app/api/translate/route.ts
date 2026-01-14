import { NextResponse } from "next/server";

const DEFAULT_API_URL = "https://libretranslate.de/translate";
const API_URL = process.env.TRANSLATION_API_URL || DEFAULT_API_URL;
const API_KEY = process.env.TRANSLATION_API_KEY;

export async function POST(req: Request) {
  try {
    const { text, target, source } = await req.json();

    if (!text || !target) {
      return NextResponse.json({ error: "'text' and 'target' are required" }, { status: 400 });
    }

    const payload = {
      q: text,
      source: source || "auto",
      target,
      format: "text",
      api_key: API_KEY || undefined,
    };

    const upstream = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      const body = await upstream.text();
      return NextResponse.json({ error: `Upstream translation failed (${upstream.status}): ${body}` }, { status: 502 });
    }

    const data = await upstream.json();
    const translated =
      data?.translatedText ||
      data?.translation ||
      data?.data?.translations?.[0]?.translatedText;

    if (!translated || typeof translated !== "string") {
      return NextResponse.json({ error: "No translated text returned" }, { status: 500 });
    }

    return NextResponse.json({ translated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
