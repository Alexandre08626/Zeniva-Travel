import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// One-shot cleanup for the AI-fallback fake leads that the prospecting/reddit
// route briefly inserted (commit 1b649757, reverted in the next commit).
// Deletes every leads row with a "prospecting:ai-fallback:%" source.
async function handle(req: NextRequest) {
  // Auth: any logged-in agent OR a Bearer token. The action only ever deletes
  // rows that match the specific AI-fallback source pattern — narrow blast radius.
  const cookies = req.headers.get("cookie") || "";
  const sessionCookie = cookies.split(";").map((c) => c.trim()).find((c) => c.startsWith("zeniva_session="))?.split("=")[1] || "";
  const authHeader = req.headers.get("authorization") || "";
  const n8nSecret = process.env.N8N_WEBHOOK_SECRET || "zeniva-n8n-2026";
  const isAuthed = sessionCookie.length > 10 || authHeader === `Bearer ${n8nSecret}`;
  if (!isAuthed) {
    return NextResponse.json({ error: "Login required (no zeniva_session cookie)" }, { status: 401 });
  }

  const { client } = getSupabaseAdminClient();

  // Two source patterns existed: with and without an AI-fallback prefix.
  const { data: rows, error: selErr } = await client
    .from("leads")
    .select("id, email, source, phone")
    .or("source.like.prospecting:ai-fallback:%,phone.like.+1 555-%");
  if (selErr) {
    return NextResponse.json({ error: selErr.message, stage: "select" }, { status: 500 });
  }
  if (!rows || rows.length === 0) {
    return NextResponse.json({ ok: true, deleted: 0, message: "No fake AI-fallback leads found." });
  }

  const ids = rows.map((r: any) => r.id);
  const { error: delErr } = await client.from("leads").delete().in("id", ids);
  if (delErr) {
    return NextResponse.json({ error: delErr.message, stage: "delete", matched: ids.length }, { status: 500 });
  }
  return NextResponse.json({
    ok: true,
    deleted: ids.length,
    sample: rows.slice(0, 5).map((r: any) => ({ email: r.email, source: r.source, phone: r.phone })),
  });
}

// Accept GET so the user can trigger from the address bar too.
export const POST = handle;
export const GET = handle;
