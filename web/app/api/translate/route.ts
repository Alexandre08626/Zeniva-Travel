import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, target, source } = await req.json();

    if (!text || !target) {
      return NextResponse.json({ error: "'text' and 'target' are required" }, { status: 400 });
    }

    // Use Google Translate unofficial API (no key needed, rate limited but works for UI)
    const sl = source === "auto" ? "auto" : (source || "auto");
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;

    const resp = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!resp.ok) {
      return NextResponse.json({ error: `Translation failed (${resp.status})` }, { status: 502 });
    }

    const data = await resp.json();
    // Google returns [[["translated","original",...],...],...]
    const translated = Array.isArray(data?.[0])
      ? data[0].map((seg: any) => seg?.[0] || "").join("")
      : null;

    if (!translated) {
      return NextResponse.json({ error: "No translated text returned" }, { status: 500 });
    }

    return NextResponse.json({ translated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
