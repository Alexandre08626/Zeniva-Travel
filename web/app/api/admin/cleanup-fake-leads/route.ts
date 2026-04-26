import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// One-shot cleanup for the AI-fallback fake leads that the prospecting/reddit
// route briefly inserted (commit 1b649757, reverted in the next commit).
// Deletes every leads row with a "prospecting:ai-fallback:%" source.
export async function POST(req: NextRequest) {
  const cookies = req.headers.get("cookie") || "";
  const rolesCookie = cookies.split(";").map((c) => c.trim()).find((c) => c.startsWith("zeniva_roles="))?.split("=")[1] || "";
  const isHQ = /hq|admin/i.test(decodeURIComponent(rolesCookie));
  if (!isHQ) {
    return NextResponse.json({ error: "HQ only" }, { status: 401 });
  }

  const { client } = getSupabaseAdminClient();
  const { data: rows, error: selErr } = await client
    .from("leads")
    .select("id, email, source")
    .like("source", "prospecting:ai-fallback:%");
  if (selErr) {
    return NextResponse.json({ error: selErr.message }, { status: 500 });
  }
  if (!rows || rows.length === 0) {
    return NextResponse.json({ ok: true, deleted: 0, message: "Nothing to delete." });
  }

  const ids = rows.map((r: any) => r.id);
  const { error: delErr } = await client.from("leads").delete().in("id", ids);
  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 });
  }
  return NextResponse.json({
    ok: true,
    deleted: ids.length,
    sample: rows.slice(0, 5).map((r: any) => ({ email: r.email, source: r.source })),
  });
}
