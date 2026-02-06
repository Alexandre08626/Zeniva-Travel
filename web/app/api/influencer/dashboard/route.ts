import { NextResponse } from "next/server";
import { assertBackendEnv, dbQuery } from "../../../../src/lib/server/db";
import { getSessionCookieName, verifySession } from "../../../../src/lib/server/auth";
import { buildInfluencerCode } from "../../../../src/lib/influencerShared";
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

export async function GET(request: Request) {
  try {
    assertBackendEnv();
    const gate = await requireRbacPermission(request, "referrals:read");
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

    const session = getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const referralCode = buildInfluencerCode(session.email);
    const referrals = await dbQuery(
      "SELECT referral_code FROM influencer_referrals WHERE referral_code = $1",
      [referralCode]
    );
    const commissions = await dbQuery(
      "SELECT amount, booking_date, booking_id, traveler_email FROM influencer_commissions WHERE referral_code = $1 ORDER BY booking_date DESC",
      [referralCode]
    );

    const commissionTotal = commissions.rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);

    return NextResponse.json({
      data: {
        referralCode,
        influencerId: referralCode,
        clicks: 0,
        signups: referrals.rows.length,
        bookings: commissions.rows.length,
        commissionTotal,
        commissions: commissions.rows,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load influencer dashboard" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
