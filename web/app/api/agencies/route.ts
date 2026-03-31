import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { client } = getSupabaseAdminClient();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    let query = client.from("agencies").select("*").order("created_at", { ascending: false });
    if (id) query = query.eq("id", id);

    const { data, error } = await query;
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, agencies: data || [] });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const allowedFields = [
      "name", "slug", "domain", "logo_url", "primary_color", "secondary_color",
      "contact_email", "contact_phone", "is_active", "setup_fee_paid", "config",
    ];

    const record: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of allowedFields) {
      if (key in updates) record[key] = updates[key];
    }

    const { client } = getSupabaseAdminClient();
    const { data, error } = await client.from("agencies").update(record).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, agency: data });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
