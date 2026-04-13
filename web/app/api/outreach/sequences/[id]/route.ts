import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../../src/lib/supabase/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { client } = getSupabaseAdminClient();

    const [seqRes, stepsRes, enrollRes] = await Promise.all([
      client.from("outreach_sequences").select("*").eq("id", id).single(),
      client.from("outreach_sequence_steps").select("*").eq("sequence_id", id).order("step_order"),
      client.from("outreach_sequence_enrollments").select("*").eq("sequence_id", id).order("enrolled_at", { ascending: false }),
    ]);

    if (seqRes.error) throw seqRes.error;
    return NextResponse.json({ sequence: seqRes.data, steps: stepsRes.data || [], enrollments: enrollRes.data || [] });
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
    if (body.name) update.name = body.name;

    const { error } = await client.from("outreach_sequences").update(update).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { client } = getSupabaseAdminClient();
    const { error } = await client.from("outreach_sequences").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
