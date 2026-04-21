import { NextRequest, NextResponse } from "next/server";

/**
 * Free French/English/Spanish TTS proxy using Google Translate's public TTS
 * endpoint. Returns MP3 audio. Google Translate TTS:
 *  - Returns neural Google voices (much better than browser speechSynthesis)
 *  - Is free (no API key)
 *  - Limits each request to ~200 characters (client must split sentences)
 *  - Requires a realistic User-Agent header, otherwise returns HTML/403.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const text = (url.searchParams.get("text") || "").trim();
  const lang = url.searchParams.get("lang") || "en";

  if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });
  if (text.length > 200) {
    return NextResponse.json(
      { error: "text too long, split into sentences ≤200 chars" },
      { status: 400 }
    );
  }

  const googleUrl =
    "https://translate.google.com/translate_tts?" +
    new URLSearchParams({
      ie: "UTF-8",
      q: text,
      tl: lang,
      client: "tw-ob",
      ttsspeed: "1.0",
    }).toString();

  try {
    const resp = await fetch(googleUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "audio/mpeg, */*",
        "Accept-Language": "en-US,en;q=0.9,fr;q=0.8",
        Referer: "https://translate.google.com/",
      },
    });

    if (!resp.ok || !resp.body) {
      const body = await resp.text().catch(() => "");
      return NextResponse.json(
        { error: `Upstream ${resp.status}`, detail: body.slice(0, 200) },
        { status: 502 }
      );
    }

    const ct = resp.headers.get("content-type") || "audio/mpeg";
    if (!ct.startsWith("audio/")) {
      return NextResponse.json(
        { error: "Upstream returned non-audio", contentType: ct },
        { status: 502 }
      );
    }

    return new Response(resp.body, {
      status: 200,
      headers: {
        "Content-Type": ct,
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "fetch failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";
