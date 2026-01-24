import { NextResponse } from "next/server";
import { assertBackendEnv, dbQuery } from "../../../../src/lib/server/db";
import { getSessionCookieName, verifySession } from "../../../../src/lib/server/auth";

export async function GET(request: Request) {
  try {
    assertBackendEnv();
    const cookies = request.headers.get("cookie") || "";
    const sessionToken = cookies
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${getSessionCookieName()}=`))
      ?.split("=")[1] || "";

    const payload = verifySession(sessionToken);
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const { rows } = await dbQuery(
      "SELECT id, name, email, role, roles, divisions, status, agent_level, invite_code, partner_id, partner_company, traveler_profile FROM accounts WHERE email = $1",
      [payload.email]
    );
    const account = rows[0];
    if (!account) return NextResponse.json({ user: null }, { status: 200 });

    return NextResponse.json({
      user: {
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role,
        roles: Array.isArray(account.roles) && account.roles.length ? account.roles : account.role ? [account.role] : ["traveler"],
        divisions: account.divisions || [],
        status: account.status || "active",
        agentLevel: account.agent_level || null,
        inviteCode: account.invite_code || null,
        partnerId: account.partner_id || null,
        partnerCompany: account.partner_company || null,
        travelerProfile: account.traveler_profile || null,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load session" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";