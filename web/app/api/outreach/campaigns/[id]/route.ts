import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/src/lib/supabase/server";
import { verifySession, getSessionCookieName } from "@/src/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getAuth(req: NextRequest) {
  const ck = req.headers.get("cookie") || "";
  const cn = getSessionCookieName();
  const m = ck.match(new RegExp(cn + "=([^;]+)"));
  const t = m?.[1];
  if (!t) return null;
  const s = verifySession(t);
  return s?.email ? s : null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { client } = getSupabaseAdminClient();

  const { data: campaign, error } = await client
    .from("email_campaigns")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: recipients } = await client
    .from("email_campaign_recipients")
    .select("*")
    .eq("campaign_id", id)
    .order("sent_at", { ascending: false });

  return NextResponse.json({ ok: true, campaign, recipients: recipients || [] });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = getAuth(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { client } = getSupabaseAdminClient();

  // Recipients are cascade deleted via FK
  const { error } = await client
    .from("email_campaigns")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
