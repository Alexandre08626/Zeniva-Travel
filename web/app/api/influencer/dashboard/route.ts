import { NextResponse } from "next/server";
import { getSessionCookieName, verifySession } from "../../../../src/lib/server/auth";
import { buildInfluencerCode } from "../../../../src/lib/influencerShared";
import { normalizeRbacRole } from "../../../../src/lib/rbac";
import { requireRbacPermission } from "../../../../src/lib/server/rbac";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

function getSession(request: Request) {
  const cookies = request.headers.get("cookie") || "";
  const token = cookies
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${getSessionCookieName()}=`))
    ?.split("=")[1] || "";
  return verifySession(token);
}

async function getCurrentCommissionRate(dateIso: string) {
  void dateIso;
  return 5;
}

export async function GET(request: Request) {
  try {
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

    const { client: admin } = getSupabaseAdminClient();

    // Referrals
    let referralsQuery = admin
      .from("influencer_referrals")
      .select("referral_code, captured_at")
      .eq("referral_code", referralCode);
    if (start) referralsQuery = referralsQuery.gte("captured_at", start);
    if (end) referralsQuery = referralsQuery.lte("captured_at", end);
    const { data: referralsData } = await referralsQuery;

    // Clicks
    let clicksQuery = admin
      .from("influencer_clicks")
      .select("id")
      .eq("referral_code", referralCode);
    if (start) clicksQuery = clicksQuery.gte("created_at", start);
    if (end) clicksQuery = clicksQuery.lte("created_at", end);
    const { data: clicksData } = await clicksQuery;

    // Commissions
    let commissionsQuery = admin
      .from("influencer_commissions")
      .select("amount, currency, booking_date, booking_id, traveler_email, status")
      .eq("referral_code", referralCode)
      .order("booking_date", { ascending: false });
    if (start) commissionsQuery = commissionsQuery.gte("booking_date", start);
    if (end) commissionsQuery = commissionsQuery.lte("booking_date", end);
    const { data: commissionsData } = await commissionsQuery;

    // Leads
    let leadsQuery = admin
      .from("influencer_referral_leads")
      .select("id, form_id, traveler_name, traveler_email, phone, destination, start_date, end_date, budget, notes, created_at")
      .eq("referral_code", referralCode)
      .order("created_at", { ascending: false });
    if (start) leadsQuery = leadsQuery.gte("created_at", start);
    if (end) leadsQuery = leadsQuery.lte("created_at", end);
    const { data: leadsData } = await leadsQuery;

    // Forms
    const { data: formsData } = await admin
      .from("influencer_referral_forms")
      .select("id, slug, title, created_at")
      .eq("referral_code", referralCode)
      .order("created_at", { ascending: false });

    // Payouts
    let payoutsQuery = admin
      .from("influencer_payouts")
      .select("id, amount, currency, status, paid_at, created_at")
      .eq("referral_code", referralCode)
      .order("created_at", { ascending: false });
    if (start) payoutsQuery = payoutsQuery.gte("created_at", start);
    if (end) payoutsQuery = payoutsQuery.lte("created_at", end);
    const { data: payoutsData } = await payoutsQuery;

    const commissions = commissionsData || [];
    const payouts = payoutsData || [];

    const commissionTotal = commissions.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const pendingTotal = commissions.reduce(
      (sum, row) => sum + ((row.status || "pending") === "pending" ? Number(row.amount || 0) : 0),
      0
    );
    const approvedTotal = commissions.reduce(
      (sum, row) => sum + ((row.status || "pending") === "approved" ? Number(row.amount || 0) : 0),
      0
    );
    const paidTotal = payouts.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const commissionRate = await getCurrentCommissionRate(new Date().toISOString().slice(0, 10));

    return NextResponse.json({
      data: {
        referralCode,
        influencerId: referralCode,
        clicks: (clicksData || []).length,
        signups: (referralsData || []).length,
        leads: (leadsData || []).length,
        bookings: commissions.length,
        commissionTotal,
        commissionRate,
        commissionPending: pendingTotal,
        commissionApproved: approvedTotal,
        commissionPaid: paidTotal,
        commissions: commissions.map((row) => ({
          ...row,
          status: row.status || "pending",
        })),
        forms: formsData || [],
        leadsList: leadsData || [],
        payouts: payouts,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load influencer dashboard" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
