import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const OPENAI_KEY = process.env.OPENAI_API_KEY || "";

const SUBS = [
  "travel",
  "solotravel",
  "TravelHacks",
  "Honeymoontravel",
  "Luxurytravel",
  "TravelAdvice",
  "Cruise",
  "disneyvacation",
  "roadtrip",
  "backpacking",
  "itinerary",
  "JapanTravel",
  "ItalyTravel",
  "MexicoTravel",
  "Caribbean",
];

type RedditPost = {
  sub: string;
  username: string;
  title: string;
  text: string;
  permalink: string;
  created: number;
};

const subStats: Record<string, { status: number; fetched: number; kept: number }> = {};

async function fetchRedditPosts(): Promise<RedditPost[]> {
  const candidates: RedditPost[] = [];
  const seen = new Set<string>();
  for (const sub of SUBS) {
    subStats[sub] = { status: 0, fetched: 0, kept: 0 };
    try {
      const r = await fetch(`https://www.reddit.com/r/${sub}/new.json?limit=50&raw_json=1`, {
        headers: {
          "User-Agent": "ZenivaTravelBot/1.0 by u/zenivatravel",
          Accept: "application/json",
        },
        cache: "no-store",
      });
      subStats[sub].status = r.status;
      console.log(`[reddit] r/${sub} -> HTTP ${r.status}`);
      if (!r.ok) {
        const errBody = await r.text().catch(() => "");
        console.log(`[reddit] r/${sub} err body: ${errBody.slice(0, 200)}`);
        continue;
      }
      const j: any = await r.json();
      const posts = j?.data?.children || [];
      subStats[sub].fetched = posts.length;
      for (const p of posts) {
        const d = p?.data;
        if (!d || d.over_18 || d.stickied || d.removed_by_category) continue;
        if (!d.author || d.author === "[deleted]" || d.author === "AutoModerator") continue;
        const ageHours = (Date.now() / 1000 - (d.created_utc || 0)) / 3600;
        if (ageHours > 168) continue; // 7 days
        const key = d.author + "|" + (d.title || "").slice(0, 60);
        if (seen.has(key)) continue;
        seen.add(key);
        subStats[sub].kept++;
        candidates.push({
          sub,
          username: d.author,
          title: d.title || "",
          text: (d.selftext || "").slice(0, 1200),
          permalink: `https://reddit.com${d.permalink || ""}`,
          created: d.created_utc || 0,
        });
      }
    } catch (e: any) {
      console.log(`[reddit] r/${sub} threw: ${e?.message || e}`);
    }
  }
  console.log(`[reddit] total candidates: ${candidates.length}`, subStats);
  return candidates;
}

type Scored = {
  i: number;
  score: number;
  destination: string;
  budget: number | null;
  timeline: string;
  intent: string;
};

async function scoreLeads(posts: RedditPost[], count: number): Promise<Scored[]> {
  if (!posts.length) return [];

  if (!OPENAI_KEY) {
    const intentRegex =
      /\b(honeymoon|planning|itinerary|budget|book(ing)?|trip to|travel(l)?ing to|vacation|recommend|help me plan|looking for)\b/i;
    return posts
      .map((p, i) => {
        const text = p.title + " " + p.text;
        const score = intentRegex.test(text) ? 75 : 30;
        const destMatch = text.match(/\bto\s+([A-Z][a-zA-Z\s]{2,25})/);
        const budgetMatch = text.match(/\$\s*([\d,]{3,7})|\b([\d,]{3,7})\s*(usd|dollars|budget)/i);
        return {
          i,
          score,
          destination: destMatch?.[1]?.trim() || "",
          budget: budgetMatch ? Number((budgetMatch[1] || budgetMatch[2]).replace(/,/g, "")) : null,
          timeline: "",
          intent: p.title.slice(0, 100),
        } as Scored;
      })
      .filter((s) => s.score >= 60)
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }

  const batch = posts.slice(0, 60);
  const postText = batch
    .map((c, i) => `[${i}] r/${c.sub} u/${c.username}\nTITLE: ${c.title}\nBODY: ${c.text.slice(0, 500)}`)
    .join("\n\n---\n\n");

  const systemMsg =
    "You score Reddit posts for a luxury travel agency. Return ONLY JSON: {\"leads\":[{\"i\":number,\"score\":number,\"destination\":string,\"budget\":number|null,\"timeline\":string,\"intent\":string}]}.";
  const userMsg = `Score each post 0-100 for lead quality for a luxury travel agency (USA/Canada).

SCORING:
- 90+ : explicit trip planning with destination AND budget AND dates
- 70-89 : explicit planning with destination OR budget
- 50-69 : soft interest, asking for recs
- <50  : not a lead (news, reviews only, complaints, already booked)

Extract for each:
- destination : city/region/country mentioned
- budget : number in USD or null
- timeline : e.g. "June 2026" or "" if none
- intent : short reason in <=80 chars (why it's a lead)

Include ALL posts in output with their score; I will filter.

Posts:
${postText}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 3500,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemMsg },
          { role: "user", content: userMsg },
        ],
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content || "{}");
    const leads: Scored[] = Array.isArray(parsed?.leads) ? parsed.leads : [];
    console.log(`[reddit] GPT returned ${leads.length} scored, top scores: ${leads.slice(0, 5).map(l => l.score).join(",")}`);
    return leads
      .filter((s) => s && typeof s.i === "number" && s.score >= 60 && s.i >= 0 && s.i < batch.length)
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  } catch (e: any) {
    console.log(`[reddit] GPT error: ${e?.message || e}`);
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookies = req.headers.get("cookie") || "";
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
    const hasSession = cookies.includes("zeniva_session=");
    if (!isCron && !hasSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const count: number = Math.min(Math.max(Number(body?.count ?? 10), 1), 25);

    const posts = await fetchRedditPosts();
    if (!posts.length) {
      return NextResponse.json({
        ok: true,
        saved: 0,
        fetched: 0,
        qualified: 0,
        subStats,
        openai_key_set: !!OPENAI_KEY,
        message: "No Reddit posts fetched. Reddit likely blocked Vercel IP. Check subStats for HTTP codes.",
      });
    }

    const scored = await scoreLeads(posts, count);
    console.log(`[reddit] scored ${scored.length} qualified leads`);
    if (!scored.length) {
      return NextResponse.json({
        ok: true,
        saved: 0,
        fetched: posts.length,
        qualified: 0,
        subStats,
        openai_key_set: !!OPENAI_KEY,
        samplePosts: posts.slice(0, 5).map(p => ({ sub: p.sub, user: p.username, title: p.title.slice(0, 100) })),
        message: "Fetched posts but none scored >= 60. Threshold may be too strict, or GPT returned nothing.",
      });
    }

    const { client } = getSupabaseAdminClient();
    const now = new Date().toISOString();
    let saved = 0;
    const savedLeads: any[] = [];

    for (const s of scored) {
      const c = posts[s.i];
      if (!c) continue;
      const placeholderEmail = `${c.username}@reddit.zeniva`;
      const destBits = [s.destination, s.timeline, s.budget ? `$${s.budget}` : ""].filter(Boolean);
      const destinationText = (destBits.length ? destBits.join(" · ") : c.title).slice(0, 160);
      try {
        const { error } = await client.from("leads").insert({
          email: placeholderEmail,
          first_name: c.username,
          last_name: `Reddit · r/${c.sub}`,
          phone: null,
          destination: destinationText,
          deal_value: s.budget || 0,
          language: "en",
          status: "new",
          source: "prospecting:reddit",
          source_ref: c.permalink,
          created_at: now,
        });
        if (!error) {
          saved++;
          savedLeads.push({
            username: c.username,
            sub: c.sub,
            title: c.title,
            permalink: c.permalink,
            destination: s.destination,
            budget: s.budget,
            timeline: s.timeline,
            score: s.score,
            intent: s.intent,
          });
        }
      } catch {
        /* skip duplicates */
      }
    }

    return NextResponse.json({
      ok: true,
      fetched: posts.length,
      qualified: scored.length,
      saved,
      leads: savedLeads,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Reddit prospecting failed" }, { status: 500 });
  }
}
