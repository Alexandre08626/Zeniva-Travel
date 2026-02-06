import { NextResponse } from "next/server";
import crypto from "crypto";
import { assertBackendEnv, dbQuery, normalizeEmail } from "../../../../src/lib/server/db";
import { getSessionCookieName, verifySession } from "../../../../src/lib/server/auth";

function getSession(request: Request) {
  const cookies = request.headers.get("cookie") || "";
  const token = cookies
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${getSessionCookieName()}=`))
    ?.split("=")[1] || "";
  return verifySession(token);
}

async function getCommissionPlan(dateIso: string) {
  const { rows } = await dbQuery(
    "SELECT id, start_date, end_date, influencer_pct FROM commission_plans WHERE start_date <= $1 AND (end_date IS NULL OR end_date >= $1) ORDER BY start_date DESC LIMIT 1",
    [dateIso]
  );
  if (rows[0]) return rows[0];
  return { id: "fallback", influencer_pct: 5 };
}

export async function POST(request: Request) {
  try {
    assertBackendEnv();
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

    if (!bookingId || !travelerEmail || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Missing booking details" }, { status: 400 });
    }

    const referral = await dbQuery(
      "SELECT referral_code, influencer_id FROM influencer_referrals WHERE lower(traveler_email) = lower($1) ORDER BY captured_at DESC LIMIT 1",
      [travelerEmail]
    );
    if (!referral.rows.length) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const referralCode = referral.rows[0].referral_code;
    const influencerId = referral.rows[0].influencer_id;
    const plan = await getCommissionPlan(bookingDate.slice(0, 10));
    const pct = Number(plan.influencer_pct || 5);
    const commission = Math.round((amount * pct) / 100);

    const id = `inf-comm-${crypto.randomUUID()}`;
    await dbQuery(
      "INSERT INTO influencer_commissions (id, referral_code, influencer_id, booking_id, traveler_email, amount, currency, booking_date, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8, now())",
      [id, referralCode, influencerId, bookingId, travelerEmail, commission, currency, bookingDate]
    );

    return NextResponse.json({ ok: true, data: { id, referralCode, influencerId, amount: commission, currency, bookingDate } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to record commission" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
