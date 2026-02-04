import { NextResponse } from "next/server";
import { assertBackendEnv, normalizeEmail } from "../../../../src/lib/server/db";
import { getCookieDomain, getSessionCookieName, signSession } from "../../../../src/lib/server/auth";
import { getSupabaseAdminClient, getSupabaseAnonClient } from "../../../../src/lib/supabase/server";

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

    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const supabaseUrl = rawUrl ? rawUrl.replace(/\/$/, "") : "";
    const hasAnon = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);
    const hasService = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.info("supabase_env", { supabaseUrl, hasAnon, hasService });

    const { client: supabase } = getSupabaseAnonClient();
    const { client: admin } = getSupabaseAdminClient();
    console.info("Auth provider: supabase:anon");
    console.info(`Auth login email: ${email}`);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data?.user) {
      console.error("Supabase login error", {
        url: supabaseUrl || null,
        code: error?.code || null,
        message: error?.message || null,
      });
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

    const account = existingAccount;
    if (!account) {
      return NextResponse.json({ error: "account_missing" }, { status: 403 });
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