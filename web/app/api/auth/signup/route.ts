import { NextResponse } from "next/server";
import { assertBackendEnv, dbQuery, normalizeEmail } from "../../../../src/lib/server/db";
import { getSessionCookieName, hashPassword, signSession } from "../../../../src/lib/server/auth";

const AGENT_INVITE_CODES = ["ZENIVA-AGENT", "ZENIVA-ADMIN", "ZENIVA-HQ"];

export async function POST(request: Request) {
  try {
    assertBackendEnv();
    const body = await request.json();
    const name = String(body?.name || "").trim() || "Traveler";
    const email = normalizeEmail(String(body?.email || ""));
    const password = String(body?.password || "");
    const role = String(body?.role || "traveler");
    const roles = Array.isArray(body?.roles) && body.roles.length ? body.roles : [role];
    const divisions = Array.isArray(body?.divisions) ? body.divisions : [];
    const inviteCode = body?.inviteCode ? String(body.inviteCode).trim() : "";
    const agentLevel = body?.agentLevel ? String(body.agentLevel) : null;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const isAgentRole = roles.some((r: string) => ["hq", "admin", "travel-agent", "yacht-partner", "finance", "support", "agent"].includes(r));
    if (isAgentRole && !AGENT_INVITE_CODES.includes(inviteCode)) {
      return NextResponse.json({ error: "Invite code required or invalid for agents" }, { status: 400 });
    }

    const existing = await dbQuery("SELECT id FROM accounts WHERE email = $1", [email]);
    if (existing.rows.length) {
      return NextResponse.json({ error: "Account already exists" }, { status: 409 });
    }

    const id = `acct-${email.replace(/[^a-z0-9]/gi, "-")}`;
    const passwordHash = hashPassword(password);
    const { rows } = await dbQuery(
      "INSERT INTO accounts (id, name, email, role, roles, divisions, status, agent_level, invite_code, password_hash, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now()) RETURNING id, name, email, role, roles, divisions, status, agent_level, invite_code, partner_id, partner_company, traveler_profile",
      [id, name, email, role, roles, divisions, "active", agentLevel, inviteCode || null, passwordHash]
    );

    const account = rows[0];
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
    }, { status: 201 });

    response.cookies.set(getSessionCookieName(), token, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Signup failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";