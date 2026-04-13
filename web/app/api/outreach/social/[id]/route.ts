import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../../src/lib/supabase/server";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { client } = getSupabaseAdminClient();
    const { error } = await client.from("social_posts").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { client } = getSupabaseAdminClient();
    const body = await req.json();
    const update: any = { updated_at: new Date().toISOString() };
    if (body.status) update.status = body.status;
    if (body.content_text) update.content_text = body.content_text;
    if (body.scheduled_at !== undefined) update.scheduled_at = body.scheduled_at;
    if (body.platform) update.platform = body.platform;

    const { error } = await client.from("social_posts").update(update).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
