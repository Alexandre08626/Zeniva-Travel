import { NextResponse } from "next/server";
import crypto from "crypto";
import { normalizeEmail } from "../../../../src/lib/server/db";
import { getSessionCookieName, verifySession } from "../../../../src/lib/server/auth";
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

export async function POST(request: Request) {
  try {
    const session = getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const bookingId = String(body?.bookingId || "").trim();
    const travelerEmail = body?.travelerEmail ? normalizeEmail(String(body.travelerEmail)) : "";
    const amount = Number(body?.amount || 0);
    const currency = String(body?.currency || "USD");
    const bookingDate = body?.bookingDate ? new Date(body.bookingDate).toISOString() : new Date().toISOString();
    const bookingType = body?.bookingType === "agent_built" ? "agent_built" : body?.bookingType === "yacht" ? "yacht" : "zeniva_managed";
    const partnerFeePct = body?.partnerFeePct ? Number(body.partnerFeePct) : body?.partnerBooking ? 0.025 : 0;

    if (!bookingId || !travelerEmail || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Missing booking details" }, { status: 400 });
    }

    const { client: admin } = getSupabaseAdminClient();

    const { data: referralData } = await admin
      .from("influencer_referrals")
      .select("referral_code, influencer_id")
      .ilike("traveler_email", travelerEmail)
      .order("captured_at", { ascending: false })
      .limit(1);

    if (!(referralData || []).length) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const referralCode = referralData![0].referral_code;
    const influencerId = referralData![0].influencer_id;
    if (bookingType === "agent_built") {
      return NextResponse.json({ ok: true, skipped: true, reason: "Agent-built bookings are not influencer-commissioned." });
    }

    // Dynamic commission rate based on leads count
    const { count: leadsCount } = await admin
      .from("influencer_referral_leads")
      .select("id", { count: "exact", head: true })
      .eq("referral_code", referralCode);
    const lc = leadsCount ?? 0;
    const pct = lc >= 150 ? 5 : lc >= 100 ? 4 : lc >= 50 ? 3.5 : 3;
    let baseAmount = amount;
    if (bookingType === "yacht") {
      baseAmount = Math.round(baseAmount * 0.05);
    }
    if (Number.isFinite(partnerFeePct) && partnerFeePct > 0) {
      baseAmount = Math.max(0, Math.round(baseAmount - baseAmount * partnerFeePct));
    }
    const commission = Math.round((baseAmount * pct) / 100);

    const id = `inf-comm-${crypto.randomUUID()}`;
    await admin
      .from("influencer_commissions")
      .insert({
        id,
        referral_code: referralCode,
        influencer_id: influencerId,
        booking_id: bookingId,
        traveler_email: travelerEmail,
        amount: commission,
        currency,
        booking_date: bookingDate,
        status: "pending",
        created_at: new Date().toISOString(),
      });

    return NextResponse.json({ ok: true, data: { id, referralCode, influencerId, amount: commission, currency, bookingDate } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to record commission" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
