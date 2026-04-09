import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../src/lib/supabase/server";
import { requireRbacPermission } from "../../../src/lib/server/rbac";

export async function GET(request: Request) {
  try {
    const gate = await requireRbacPermission(request, "accounts:manage");
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

    const { client: admin } = getSupabaseAdminClient();
    const { data, error } = await admin
      .from("commission_plans")
      .select("id, start_date, end_date, influencer_pct, created_at")
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Supabase commission_plans fetch error", { message: error.message });
      return NextResponse.json({ error: "Failed to load commission plans" }, { status: 500 });
    }
    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load commission plans" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const gate = await requireRbacPermission(request, "accounts:manage");
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

    const body = await request.json();
    const id = String(body?.id || "").trim();
    const startDate = String(body?.startDate || "").trim();
    const endDate = body?.endDate ? String(body.endDate).trim() : null;
    const influencerPct = Number(body?.influencerPct);

    if (!id || !startDate || !Number.isFinite(influencerPct)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { client: admin } = getSupabaseAdminClient();
    const { data, error } = await admin
      .from("commission_plans")
      .upsert(
        {
          id,
          start_date: startDate,
          end_date: endDate,
          influencer_pct: influencerPct,
          created_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select("id, start_date, end_date, influencer_pct, created_at")
      .single();

    if (error) {
      console.error("Supabase commission_plans upsert error", { message: error.message });
      return NextResponse.json({ error: "Failed to save commission plan" }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save commission plan" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
