import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export async function GET() {
  try {
    const { client } = getSupabaseAdminClient();
    const { data: sequences, error } = await client
      .from("outreach_sequences")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;

    // Get step counts and enrollment counts for each sequence
    const enriched = await Promise.all(
      (sequences || []).map(async (seq: any) => {
        const [stepsRes, enrollRes, activeRes] = await Promise.all([
          client.from("outreach_sequence_steps").select("id", { count: "exact", head: true }).eq("sequence_id", seq.id),
          client.from("outreach_sequence_enrollments").select("id", { count: "exact", head: true }).eq("sequence_id", seq.id),
          client.from("outreach_sequence_enrollments").select("id", { count: "exact", head: true }).eq("sequence_id", seq.id).eq("status", "active"),
        ]);
        return { ...seq, step_count: stepsRes.count || 0, enrolled_count: enrollRes.count || 0, active_count: activeRes.count || 0 };
      })
    );

    return NextResponse.json({ sequences: enriched });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { client } = getSupabaseAdminClient();
    const body = await request.json();
    const { name, description, audience_type, steps } = body;

    if (!name || !steps?.length) {
      return NextResponse.json({ error: "Name and at least one step required" }, { status: 400 });
    }

    // Create sequence
    const { data: seq, error: seqErr } = await client
      .from("outreach_sequences")
      .insert({ name, description: description || null, audience_type: audience_type || "agencies", status: "draft" })
      .select()
      .single();
    if (seqErr) throw seqErr;

    // Create steps
    const stepRows = steps.map((s: any, i: number) => ({
      sequence_id: seq.id,
      step_order: i + 1,
      delay_days: s.delay_days || 1,
      subject: s.subject,
      html_body: s.html_body,
    }));

    const { error: stepsErr } = await client.from("outreach_sequence_steps").insert(stepRows);
    if (stepsErr) throw stepsErr;

    return NextResponse.json({ sequence: seq }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
