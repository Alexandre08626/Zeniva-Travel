import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../../../src/lib/supabase/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { client } = getSupabaseAdminClient();
    const body = await req.json();
    const { contacts } = body;

    if (!contacts?.length) {
      return NextResponse.json({ error: "No contacts provided" }, { status: 400 });
    }

    // Get first step to calculate next_send_at
    const { data: steps } = await client
      .from("outreach_sequence_steps")
      .select("delay_days")
      .eq("sequence_id", id)
      .order("step_order")
      .limit(1);

    const firstDelay = steps?.[0]?.delay_days || 1;
    const nextSend = new Date();
    nextSend.setDate(nextSend.getDate() + firstDelay);

    const rows = contacts.map((c: any) => ({
      sequence_id: id,
      contact_email: c.email,
      contact_name: c.name || null,
      source_table: c.source_table || null,
      source_id: c.source_id || null,
      variables: c.variables || {},
      current_step: 0,
      status: "active",
      next_send_at: nextSend.toISOString(),
    }));

    const { data, error } = await client
      .from("outreach_sequence_enrollments")
      .upsert(rows, { onConflict: "sequence_id,contact_email", ignoreDuplicates: true })
      .select();

    if (error) throw error;
    return NextResponse.json({ enrolled: data?.length || 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
