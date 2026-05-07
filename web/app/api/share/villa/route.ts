/**
 * POST /api/share/villa
 *
 * Body: { slug: string }
 * Returns: { code, shortUrl, targetPath }
 *
 * Looks up an existing short link for /zenistay/{slug}; creates one
 * (random 6-char code) if none exists yet. Reused codes mean every
 * email/SMS Alex sends for the same villa points at the same URL.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE = "https://www.zenivatravel.com";
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // no 0/o/1/i/l confusables
const CODE_LEN = 6;

function makeCode(): string {
  let out = "";
  for (let i = 0; i < CODE_LEN; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

function normalizeSlug(raw: string): string | null {
  const s = String(raw || "").trim().toLowerCase();
  if (!s) return null;
  if (!/^[a-z0-9-]+$/.test(s)) return null;
  if (s.length > 120) return null;
  return s;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slug = normalizeSlug(body?.slug || "");
    if (!slug) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const targetPath = `/zenistay/${slug}`;
    const { client } = getSupabaseAdminClient();

    // Reuse the existing short code so the same villa always shares
    // the same short URL.
    const { data: existing } = await client
      .from("short_links")
      .select("code")
      .eq("target_path", targetPath)
      .eq("kind", "villa")
      .limit(1)
      .maybeSingle();

    if (existing?.code) {
      return NextResponse.json({
        code: existing.code,
        shortUrl: `${SITE}/s/${existing.code}`,
        targetPath,
      });
    }

    // Insert a fresh code, retrying on the rare PK collision.
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = makeCode();
      const { error } = await client
        .from("short_links")
        .insert({ code, target_path: targetPath, kind: "villa" });
      if (!error) {
        return NextResponse.json({
          code,
          shortUrl: `${SITE}/s/${code}`,
          targetPath,
        });
      }
      // 23505 = unique_violation in Postgres — try a fresh code.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any).code !== "23505") {
        console.error("[share/villa] insert error:", error.message);
        return NextResponse.json({ error: "Failed to create short link" }, { status: 500 });
      }
    }

    return NextResponse.json({ error: "Could not allocate a short code" }, { status: 500 });
  } catch (err) {
    console.error("[share/villa] fatal:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
