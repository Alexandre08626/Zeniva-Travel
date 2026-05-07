/**
 * GET /s/[code]
 *
 * Resolves a short_links code to its target_path and 308-redirects.
 * Increments the click counter as a best-effort, fire-and-forget op
 * so a slow DB write never holds up the redirect.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const cleaned = String(code || "").trim().toLowerCase();

  if (!/^[a-z0-9]{4,12}$/.test(cleaned)) {
    return NextResponse.redirect(new URL("/", req.url), 302);
  }

  const { client } = getSupabaseAdminClient();
  const { data, error } = await client
    .from("short_links")
    .select("target_path, clicks")
    .eq("code", cleaned)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.redirect(new URL("/", req.url), 302);
  }

  // Bump the click counter without blocking the redirect.
  client
    .from("short_links")
    .update({ clicks: (data.clicks || 0) + 1 })
    .eq("code", cleaned)
    .then(() => undefined, () => undefined);

  // 302 (Found) so browsers don't aggressively cache the lookup —
  // makes click counts more accurate too.
  return NextResponse.redirect(new URL(data.target_path, req.url), 302);
}
