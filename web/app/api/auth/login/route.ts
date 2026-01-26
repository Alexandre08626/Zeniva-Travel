import { NextResponse } from "next/server";
import { assertBackendEnv, normalizeEmail } from "../../../../src/lib/server/db";
import { getCookieDomain, getSessionCookieName, signSession } from "../../../../src/lib/server/auth";
import { getSupabaseAdminClient, getSupabaseServerClient } from "../../../../src/lib/supabase/server";

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

    const { client: supabase } = getSupabaseServerClient();
    const { client: admin } = getSupabaseAdminClient();
    console.info("Auth provider: supabase:anon");
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
    const metaAgentLevel = typeof metadata.agentLevel === "string"
      ? metadata.agentLevel
      : typeof metadata.agent_role === "string"
        ? metadata.agent_role
        : null;
    const metaInviteCode = typeof metadata.inviteCode === "string"
      ? metadata.inviteCode
      : typeof metadata.invite_code === "string"
        ? metadata.invite_code
        : null;

    const { data: existingAccount, error: accountError } = await admin
      .from("accounts")
      .select("id, name, email, role, roles, divisions, status, agent_level, invite_code, partner_id, partner_company, traveler_profile")
      .eq("email", email)
      .maybeSingle();

    if (accountError) {
      console.error("Supabase account fetch error", { message: accountError.message });
      return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }

    let account = existingAccount;
    if (!account) {
      const { data: inserted, error: insertError } = await admin
        .from("accounts")
        .insert({
          id: data.user.id,
          name: (typeof metadata.name === "string" && metadata.name.trim()) || data.user.email || "Account",
          email,
          role: metaRole,
          roles: metaRoles.length ? metaRoles : [metaRole],
          divisions: metaDivisions,
          status: "active",
          agent_level: metaAgentLevel,
          invite_code: metaInviteCode,
          created_at: new Date().toISOString(),
        })
        .select("id, name, email, role, roles, divisions, status, agent_level, invite_code, partner_id, partner_company, traveler_profile")
        .single();

      if (insertError) {
        console.error("Supabase account insert error", { message: insertError.message });
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
      }
      account = inserted;
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