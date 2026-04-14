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

/**
 * Dynamic commission rate based on confirmed leads count:
 *   0–49  leads → 3%
 *  50–99  leads → 3.5%
 * 100–149 leads → 4%
 * 150+    leads → 5%  (Premium)
 *
 * Override: if agent_level = 'Premium' in accounts → always 5% + isPremium
 */
async function getCommissionRateForInfluencer(
  admin: ReturnType<typeof getSupabaseAdminClient>["client"],
  referralCode: string,
  agentLevel?: string | null
): Promise<{ rate: number; leadsCount: number; isPremium: boolean }> {
  const { count: formCount } = await admin
    .from("influencer_referral_leads")
    .select("id", { count: "exact", head: true })
    .eq("referral_code", referralCode);
  const { count: signupCount } = await admin
    .from("influencer_referrals")
    .select("id", { count: "exact", head: true })
    .eq("referral_code", referralCode);

  const leadsCount = (formCount ?? 0) + (signupCount ?? 0);

  // Premium override from account level (set by HQ)
  if (agentLevel === "Premium") {
    return { rate: 5, leadsCount, isPremium: true };
  }

  const isPremium = leadsCount >= 150;

  let rate = 3;
  if (leadsCount >= 150) rate = 5;
  else if (leadsCount >= 100) rate = 4;
  else if (leadsCount >= 50) rate = 3.5;

  return { rate, leadsCount, isPremium };
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

    const influencerEmail = isHQorAdmin && queryEmail ? queryEmail : session.email;
    const referralCode = isHQorAdmin
      ? queryCode || (queryEmail ? buildInfluencerCode(queryEmail) : "") || buildInfluencerCode(session.email)
      : buildInfluencerCode(session.email);

    const { client: admin } = getSupabaseAdminClient();

    // Get account agent_level for premium override
    const { data: accountData } = await admin
      .from("accounts")
      .select("agent_level")
      .eq("email", influencerEmail.toLowerCase())
      .maybeSingle();
    const agentLevel = accountData?.agent_level || null;

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

    // Leads from form submissions
    let leadsQuery = admin
      .from("influencer_referral_leads")
      .select("id, form_id, traveler_name, traveler_email, phone, destination, start_date, end_date, budget, notes, created_at")
      .eq("referral_code", referralCode)
      .order("created_at", { ascending: false });
    if (start) leadsQuery = leadsQuery.gte("created_at", start);
    if (end) leadsQuery = leadsQuery.lte("created_at", end);
    const { data: leadsData } = await leadsQuery;

    // Also get leads from signup referrals (people who signed up via influencer link)
    let signupLeadsQuery = admin
      .from("influencer_referrals")
      .select("id, traveler_email, captured_at, created_at")
      .eq("referral_code", referralCode)
      .order("created_at", { ascending: false });
    if (start) signupLeadsQuery = signupLeadsQuery.gte("created_at", start);
    if (end) signupLeadsQuery = signupLeadsQuery.lte("created_at", end);
    const { data: signupLeadsData } = await signupLeadsQuery;

    // Merge: convert signup referrals to lead format + deduplicate by email
    const formLeadEmails = new Set((leadsData || []).map((l: any) => l.traveler_email?.toLowerCase()).filter(Boolean));
    const signupAsLeads = (signupLeadsData || [])
      .filter((s: any) => !formLeadEmails.has(s.traveler_email?.toLowerCase()))
      .map((s: any) => ({
        id: s.id,
        form_id: "signup",
        traveler_name: s.traveler_email?.split("@")[0] || "",
        traveler_email: s.traveler_email,
        phone: null,
        destination: null,
        start_date: null,
        end_date: null,
        budget: null,
        notes: "Signed up via referral link",
        created_at: s.created_at,
      }));
    const allLeads = [...(leadsData || []), ...signupAsLeads];

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
    const { rate: commissionRate, leadsCount: totalLeads, isPremium } =
      await getCommissionRateForInfluencer(admin, referralCode, agentLevel);

    return NextResponse.json({
      data: {
        referralCode,
        influencerId: referralCode,
        clicks: (clicksData || []).length,
        signups: (referralsData || []).length,
        leads: allLeads.length,
        bookings: commissions.length,
        commissionTotal,
        commissionRate,
        commissionPending: pendingTotal,
        commissionApproved: approvedTotal,
        commissionPaid: paidTotal,
        isPremium,
        totalLeads,
        premiumProgress: Math.min(totalLeads, 150),
        commissions: commissions.map((row) => ({
          ...row,
          status: row.status || "pending",
        })),
        forms: formsData || [],
        leadsList: allLeads,
        payouts: payouts,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load influencer dashboard" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
