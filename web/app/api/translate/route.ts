import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, target, source } = await req.json();

    if (!text || !target) {
      return NextResponse.json({ error: "'text' and 'target' are required" }, { status: 400 });
    }

    const sl = source === "auto" ? "auto" : (source || "auto");
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;

    const resp = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
    });

    if (!resp.ok) {
      return NextResponse.json({ error: `Translation failed (${resp.status})` }, { status: 502 });
    }

    const data = await resp.json();
    const translated = Array.isArray(data?.[0])
      ? data[0].map((seg: any) => seg?.[0] || "").join("")
      : null;

    if (!translated) {
      return NextResponse.json({ error: "No translated text returned" }, { status: 500 });
    }

    return NextResponse.json({ translated }, {
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const runtime = "nodejs";
