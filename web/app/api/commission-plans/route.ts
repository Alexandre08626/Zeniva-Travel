import { NextResponse } from "next/server";
import { assertBackendEnv, dbQuery } from "../../../src/lib/server/db";
import { requireRbacPermission } from "../../../src/lib/server/rbac";

export async function GET(request: Request) {
  try {
    assertBackendEnv();
    const gate = await requireRbacPermission(request, "accounts:manage");
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

    const { rows } = await dbQuery(
      "SELECT id, start_date, end_date, influencer_pct, created_at FROM commission_plans ORDER BY start_date DESC"
    );
    return NextResponse.json({ data: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load commission plans" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    assertBackendEnv();
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

    const { rows } = await dbQuery(
      "INSERT INTO commission_plans (id, start_date, end_date, influencer_pct, created_at) VALUES ($1,$2,$3,$4, now()) ON CONFLICT (id) DO UPDATE SET start_date=EXCLUDED.start_date, end_date=EXCLUDED.end_date, influencer_pct=EXCLUDED.influencer_pct RETURNING id, start_date, end_date, influencer_pct, created_at",
      [id, startDate, endDate, influencerPct]
    );

    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save commission plan" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
