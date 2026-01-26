import { NextResponse } from "next/server";
import { assertBackendEnv, dbQuery, normalizeEmail } from "../../../../src/lib/server/db";
import { getCookieDomain, getSessionCookieName, signSession } from "../../../../src/lib/server/auth";
import { getSupabaseServerClient } from "../../../../src/lib/server/supabase";

function normalizeStringArray(value: unknown, fallback: string[] = []) {
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string" && item.trim());
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return fallback;
}

export async function POST(request: Request) {
  try {
    assertBackendEnv();
    const body = await request.json();
    const email = normalizeEmail(String(body?.email || ""));
    const password = String(body?.password || "");
    if (!email || !password) {
      return NextResponse.json({ error: "Credentials required" }, { status: 400 });
    }

    const { client: supabase, usingServiceKey } = getSupabaseServerClient();
    console.info(`Auth provider: supabase${usingServiceKey ? ":service" : ":anon"}`);
    console.info(`Auth login email: ${email}`);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data?.user) {
      console.error("Supabase login error", { code: error?.code, message: error?.message });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const metadata = (data.user.user_metadata || {}) as Record<string, unknown>;
    const metaRoles = normalizeStringArray(metadata.roles, []);
    const metaRole = typeof metadata.role === "string" && metadata.role ? metadata.role : metaRoles[0] || "traveler";
    const metaDivisions = normalizeStringArray(metadata.divisions, []);
    const metaAgentLevel = typeof metadata.agentLevel === "string" ? metadata.agentLevel : null;
    const metaInviteCode = typeof metadata.inviteCode === "string" ? metadata.inviteCode : null;

    const { rows } = await dbQuery(
      "SELECT id, name, email, role, roles, divisions, status, agent_level, invite_code, partner_id, partner_company, traveler_profile FROM accounts WHERE email = $1",
      [email]
    );

    let account = rows[0];
    if (!account) {
      const id = `acct-${email.replace(/[^a-z0-9]/gi, "-")}`;
      const insert = await dbQuery(
        "INSERT INTO accounts (id, name, email, role, roles, divisions, status, agent_level, invite_code, password_hash, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now()) RETURNING id, name, email, role, roles, divisions, status, agent_level, invite_code, partner_id, partner_company, traveler_profile",
        [
          id,
          (typeof metadata.name === "string" && metadata.name.trim()) || data.user.email || "Account",
          email,
          metaRole,
          metaRoles.length ? metaRoles : [metaRole],
          metaDivisions,
          "active",
          metaAgentLevel,
          metaInviteCode,
          null,
        ]
      );
      account = insert.rows[0];
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