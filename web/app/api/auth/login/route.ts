import { NextResponse } from "next/server";
import { assertBackendEnv, dbQuery, normalizeEmail } from "../../../../src/lib/server/db";
import { getCookieDomain, getSessionCookieName, hashPassword, signSession, verifyPassword } from "../../../../src/lib/server/auth";

const HQ_EMAIL = "info@zeniva.ca";
const HQ_PASSWORD = "Baton08!!";

export async function POST(request: Request) {
  try {
    assertBackendEnv();
    const body = await request.json();
    const email = normalizeEmail(String(body?.email || ""));
    const password = String(body?.password || "");
    if (!email || !password) {
      return NextResponse.json({ error: "Credentials required" }, { status: 400 });
    }

    const { rows } = await dbQuery(
      "SELECT id, name, email, role, roles, divisions, status, agent_level, invite_code, partner_id, partner_company, traveler_profile, password_hash FROM accounts WHERE email = $1",
      [email]
    );

    let account = rows[0];
    if (!account && email === normalizeEmail(HQ_EMAIL) && password === HQ_PASSWORD) {
      const id = `acct-${email.replace(/[^a-z0-9]/gi, "-")}`;
      const insert = await dbQuery(
        "INSERT INTO accounts (id, name, email, role, roles, divisions, status, password_hash, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8, now()) RETURNING id, name, email, role, roles, divisions, status, agent_level, invite_code, partner_id, partner_company, traveler_profile, password_hash",
        [id, "Zeniva HQ", email, "hq", ["hq", "admin", "agent"], ["TRAVEL", "YACHT", "VILLAS", "GROUPS", "RESORTS"], "active", hashPassword(HQ_PASSWORD)]
      );
      account = insert.rows[0];
    }

    if (account && !account.password_hash && email === normalizeEmail(HQ_EMAIL) && password === HQ_PASSWORD) {
      const hashed = hashPassword(HQ_PASSWORD);
      await dbQuery(
        "UPDATE accounts SET password_hash = $2, role = $3, roles = $4, divisions = $5, status = $6, updated_at = now() WHERE email = $1",
        [email, hashed, "hq", ["hq", "admin", "agent"], ["TRAVEL", "YACHT", "VILLAS", "GROUPS", "RESORTS"], "active"]
      );
      const refreshed = await dbQuery(
        "SELECT id, name, email, role, roles, divisions, status, agent_level, invite_code, partner_id, partner_company, traveler_profile, password_hash FROM accounts WHERE email = $1",
        [email]
      );
      account = refreshed.rows[0];
    }

    if (!account || !account.password_hash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!verifyPassword(password, account.password_hash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const roles = Array.isArray(account.roles) && account.roles.length ? account.roles : account.role ? [account.role] : ["traveler"];
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
    const token = signSession({ email: account.email, roles, exp });

    const response = NextResponse.json({
      user: {
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role,
        roles,
        divisions: account.divisions || [],
        status: account.status || "active",
        agentLevel: account.agent_level || null,
        inviteCode: account.invite_code || null,
        partnerId: account.partner_id || null,
        partnerCompany: account.partner_company || null,
        travelerProfile: account.traveler_profile || null,
      },
    });

    const cookieDomain = getCookieDomain();
    response.cookies.set(getSessionCookieName(), token, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      ...(cookieDomain ? { domain: cookieDomain } : {}),
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Login failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";