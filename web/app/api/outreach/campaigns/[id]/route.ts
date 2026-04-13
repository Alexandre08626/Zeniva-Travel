import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/src/lib/supabase/server";
import { getOutreachAuth } from "../../auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  const session = getOutreachAuth(req);
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
