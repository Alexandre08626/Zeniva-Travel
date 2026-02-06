import { NextResponse } from "next/server";
import { assertBackendEnv, dbQuery } from "../../../../src/lib/server/db";
import { getSessionCookieName, verifySession } from "../../../../src/lib/server/auth";
import { buildInfluencerCode } from "../../../../src/lib/influencerShared";
import { normalizeRbacRole } from "../../../../src/lib/rbac";
import { requireRbacPermission } from "../../../../src/lib/server/rbac";

function getSession(request: Request) {
  const cookies = request.headers.get("cookie") || "";
  const token = cookies
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${getSessionCookieName()}=`))
    ?.split("=")[1] || "";
  return verifySession(token);
}

function buildDateFilter(column: string, start?: string, end?: string, offset = 1) {
  const clauses: string[] = [];
  const params: any[] = [];
  if (start) {
    params.push(start);
    clauses.push(`${column} >= $${params.length + offset}`);
  }
  if (end) {
    params.push(end);
    clauses.push(`${column} <= $${params.length + offset}`);
  }
  const sql = clauses.length ? ` AND ${clauses.join(" AND ")}` : "";
  return { sql, params };
}

async function getCurrentCommissionRate(dateIso: string) {
  const { rows } = await dbQuery(
    "SELECT influencer_pct FROM commission_plans WHERE start_date <= $1 AND (end_date IS NULL OR end_date >= $1) ORDER BY start_date DESC LIMIT 1",
    [dateIso]
  );
  if (rows[0]) return Number(rows[0].influencer_pct || 0);
  return 5;
}

export async function GET(request: Request) {
  try {
    assertBackendEnv();
    const gate = await requireRbacPermission(request, "referrals:read");
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

    const session = getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const start = url.searchParams.get("start") || "";
    const end = url.searchParams.get("end") || "";
    const queryEmail = url.searchParams.get("email") || "";
    const queryCode = url.searchParams.get("code") || "";

    const roles = Array.isArray(session.roles) ? session.roles : [];
    const normalized = roles.map((role) => normalizeRbacRole(role)).filter(Boolean) as string[];
    const isHQorAdmin = normalized.includes("hq") || normalized.includes("admin");

    const referralCode = isHQorAdmin
      ? queryCode || (queryEmail ? buildInfluencerCode(queryEmail) : "") || buildInfluencerCode(session.email)
      : buildInfluencerCode(session.email);

    const referralFilter = "referral_code = $1";

    const referralsFilter = buildDateFilter("captured_at", start, end);
    const referrals = await dbQuery(
      `SELECT referral_code, captured_at FROM influencer_referrals WHERE ${referralFilter}${referralsFilter.sql}`,
      [referralCode, ...referralsFilter.params]
    );

    const clicksFilter = buildDateFilter("created_at", start, end);
    const clicks = await dbQuery(
      `SELECT id FROM influencer_clicks WHERE ${referralFilter}${clicksFilter.sql}`,
      [referralCode, ...clicksFilter.params]
    );

    const commissionsFilter = buildDateFilter("booking_date", start, end);
    const commissions = await dbQuery(
      `SELECT amount, currency, booking_date, booking_id, traveler_email, status FROM influencer_commissions WHERE ${referralFilter}${commissionsFilter.sql} ORDER BY booking_date DESC`,
      [referralCode, ...commissionsFilter.params]
    );

    const leadsFilter = buildDateFilter("created_at", start, end);
    const leads = await dbQuery(
      `SELECT id, form_id, traveler_name, traveler_email, phone, destination, start_date, end_date, budget, notes, created_at FROM influencer_referral_leads WHERE ${referralFilter}${leadsFilter.sql} ORDER BY created_at DESC`,
      [referralCode, ...leadsFilter.params]
    );

    const forms = await dbQuery(
      "SELECT id, slug, title, created_at FROM influencer_referral_forms WHERE referral_code = $1 ORDER BY created_at DESC",
      [referralCode]
    );

    const payoutsFilter = buildDateFilter("created_at", start, end);
    const payouts = await dbQuery(
      `SELECT id, amount, currency, status, paid_at, created_at FROM influencer_payouts WHERE ${referralFilter}${payoutsFilter.sql} ORDER BY created_at DESC`,
      [referralCode, ...payoutsFilter.params]
    );

    const commissionTotal = commissions.rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const pendingTotal = commissions.rows.reduce(
      (sum, row) => sum + ((row.status || "pending") === "pending" ? Number(row.amount || 0) : 0),
      0
    );
    const approvedTotal = commissions.rows.reduce(
      (sum, row) => sum + ((row.status || "pending") === "approved" ? Number(row.amount || 0) : 0),
      0
    );
    const paidTotal = payouts.rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const commissionRate = await getCurrentCommissionRate(new Date().toISOString().slice(0, 10));

    return NextResponse.json({
      data: {
        referralCode,
        influencerId: referralCode,
        clicks: clicks.rows.length,
        signups: referrals.rows.length,
        leads: leads.rows.length,
        bookings: commissions.rows.length,
        commissionTotal,
        commissionRate,
        commissionPending: pendingTotal,
        commissionApproved: approvedTotal,
        commissionPaid: paidTotal,
        commissions: commissions.rows.map((row) => ({
          ...row,
          status: row.status || "pending",
        })),
        forms: forms.rows,
        leadsList: leads.rows,
        payouts: payouts.rows,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load influencer dashboard" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
