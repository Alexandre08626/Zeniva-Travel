import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SUBS = ["travel", "solotravel", "Honeymoontravel", "Luxurytravel", "TravelAdvice"];

export async function GET(_req: NextRequest) {
  const OPENAI_KEY = process.env.OPENAI_API_KEY || "";
  const subStats: Record<string, { status: number; fetched: number; sample?: string; errBody?: string }> = {};

  for (const sub of SUBS) {
    subStats[sub] = { status: 0, fetched: 0 };
    try {
      const r = await fetch(`https://www.reddit.com/r/${sub}/new.json?limit=5&raw_json=1`, {
        headers: {
          "User-Agent": "ZenivaTravelBot/1.0 by u/zenivatravel",
          Accept: "application/json",
        },
        cache: "no-store",
      });
      subStats[sub].status = r.status;
      if (!r.ok) {
        const errBody = await r.text().catch(() => "");
        subStats[sub].errBody = errBody.slice(0, 300);
        continue;
      }
      const j: any = await r.json();
      const posts = j?.data?.children || [];
      subStats[sub].fetched = posts.length;
      if (posts.length) {
        subStats[sub].sample = (posts[0]?.data?.title || "").slice(0, 120);
      }
    } catch (e: any) {
      subStats[sub].errBody = `THROW: ${e?.message || e}`;
    }
  }

  return NextResponse.json({
    ok: true,
    openai_key_set: !!OPENAI_KEY,
    node: process.version,
    region: process.env.VERCEL_REGION || "unknown",
    subStats,
  });
}
