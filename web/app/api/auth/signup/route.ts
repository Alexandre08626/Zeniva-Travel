import { NextResponse } from "next/server";
import { assertBackendEnv, dbQuery, normalizeEmail } from "../../../../src/lib/server/db";
import { getCookieDomain, getSessionCookieName, signSession } from "../../../../src/lib/server/auth";
import { getSupabaseServerClient } from "../../../../src/lib/server/supabase";

const AGENT_INVITE_CODES = ["ZENIVA-AGENT", "ZENIVA-ADMIN", "ZENIVA-HQ"];

function normalizeStringArray(value: unknown, fallback: string[] = []) {
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string" && item.trim());
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return fallback;
}

function cleanJsonObject(value: Record<string, unknown>) {
  const entries = Object.entries(value).filter(([, v]) => v !== undefined);
  return Object.fromEntries(entries);
}

export async function POST(request: Request) {
  try {
    assertBackendEnv();
    const body = await request.json();
    const name = String(body?.name || "").trim() || "Traveler";
    const email = normalizeEmail(String(body?.email || ""));
    const password = String(body?.password || "");
    const role = String(body?.role || "traveler");
    const roles = normalizeStringArray(body?.roles, [role]);
    const divisions = normalizeStringArray(body?.divisions, []);
    const inviteCode = body?.inviteCode ? String(body.inviteCode).trim() : "";
    const agentLevel = body?.agentLevel ? String(body.agentLevel) : null;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const isAgentRole = roles.some((r: string) => ["hq", "admin", "travel-agent", "yacht-partner", "finance", "support", "agent"].includes(r));
    if (isAgentRole && !AGENT_INVITE_CODES.includes(inviteCode)) {
      return NextResponse.json({ error: "Invite code required or invalid for agents" }, { status: 400 });
    }

    const { client: supabase, usingServiceKey } = getSupabaseServerClient();
    console.info(`Auth provider: supabase${usingServiceKey ? ":service" : ":anon"}`);
    console.info(`Auth signup email: ${email}`);

    const existing = await dbQuery("SELECT id FROM accounts WHERE email = $1", [email]);
    if (existing.rows.length) {
      return NextResponse.json({ error: "Account already exists" }, { status: 409 });
    }

    const metadata = cleanJsonObject({
      name,
      role,
      roles,
      divisions,
      agentLevel,
      inviteCode: inviteCode || undefined,
    });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error || !data?.user) {
      console.error("Supabase signup error", { code: error?.code, message: error?.message });
      return NextResponse.json({ error: error?.message || "Signup failed" }, { status: 400 });
    }

    const id = `acct-${email.replace(/[^a-z0-9]/gi, "-")}`;
    const { rows } = await dbQuery(
      "INSERT INTO accounts (id, name, email, role, roles, divisions, status, agent_level, invite_code, password_hash, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now()) RETURNING id, name, email, role, roles, divisions, status, agent_level, invite_code, partner_id, partner_company, traveler_profile",
      [id, name, email, role, roles, divisions, "active", agentLevel, inviteCode || null, null]
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
    return NextResponse.json({ error: err?.message || "Signup failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";