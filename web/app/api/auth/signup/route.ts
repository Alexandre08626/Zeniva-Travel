import { NextResponse } from "next/server";
import { assertBackendEnv, normalizeEmail } from "../../../../src/lib/server/db";
import { getCookieDomain, getSessionCookieName, signSession } from "../../../../src/lib/server/auth";
import { getSupabaseAdminClient, getSupabaseServerClient } from "../../../../src/lib/supabase/server";

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

function getSupabaseHost(rawUrl: string) {
  if (!rawUrl) return "";
  try {
    const normalized = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
    return new URL(normalized).host;
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
  try {
    const requestId = (globalThis.crypto?.randomUUID?.() || `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`) as string;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
    const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const contentType = request.headers.get("content-type") || "";
    const origin = request.headers.get("origin") || "";
    const referer = request.headers.get("referer") || "";
    console.info("Signup request received", {
      requestId,
      url: request.url,
      contentType,
      origin,
      referer,
      supabaseHost: getSupabaseHost(supabaseUrl),
      hasSupabaseUrl: Boolean(supabaseUrl),
      hasSupabaseAnon: Boolean(supabaseAnon),
      hasSupabaseService: Boolean(supabaseService),
    });
    assertBackendEnv();
    if (!supabaseUrl) {
      return NextResponse.json({ error: "missing_env_var", name: "NEXT_PUBLIC_SUPABASE_URL", requestId }, { status: 500 });
    }
    if (!supabaseAnon) {
      return NextResponse.json({ error: "missing_env_var", name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", requestId }, { status: 500 });
    }
    if (!supabaseService) {
      return NextResponse.json({ error: "missing_env_var", name: "SUPABASE_SERVICE_ROLE_KEY", requestId }, { status: 500 });
    }
    let body: any = {};
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Signup request JSON parse error", { message: (parseError as Error)?.message });
      return NextResponse.json({
        error: "invalid_json",
        message: (parseError as Error)?.message || "Invalid JSON body",
        stack: (parseError as Error)?.stack || null,
        requestId,
      }, { status: 400 });
    }
    const bodyKeys = Object.keys(body || {});
    const bodyTypes = bodyKeys.reduce<Record<string, string>>((acc, key) => {
      const value = (body as Record<string, unknown>)[key];
      acc[key] = Array.isArray(value) ? "array" : value === null ? "null" : typeof value;
      return acc;
    }, {});
    console.info("Signup body received", { requestId, keys: bodyKeys, types: bodyTypes });

    const space = String(body?.space || body?.role || "traveler").toLowerCase();
    const resolvedRole = space === "agent" || space === "zeniva agent" ? "agent" : space === "partner" ? "partner_owner" : "traveler";
    const name = String(body?.full_name || body?.name || body?.fullName || "").trim() || "Traveler";
    const email = normalizeEmail(String(body?.email || ""));
    const password = String(body?.password || "");
    const role = String(body?.role || resolvedRole);
    const roles = normalizeStringArray(body?.roles, [role]);
    const divisions = normalizeStringArray(body?.divisions, []);
    const inviteCode = body?.invite_code
      ? String(body.invite_code).trim()
      : body?.inviteCode
        ? String(body.inviteCode).trim()
        : "";
    const agentLevel = body?.agent_role
      ? String(body.agent_role)
      : body?.agentLevel
        ? String(body.agentLevel)
        : null;

    if (!email) {
      return NextResponse.json({ error: "missing_field", name: "email", requestId }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: "missing_field", name: "password", requestId }, { status: 400 });
    }

    const isAgentRole = roles.some((r: string) => ["hq", "admin", "travel-agent", "yacht-partner", "finance", "support", "agent"].includes(r));
    if (isAgentRole && !AGENT_INVITE_CODES.includes(inviteCode)) {
      return NextResponse.json({ error: "Invite code required or invalid for agents" }, { status: 400 });
    }

    const { client: supabase } = getSupabaseServerClient();
    const { client: admin } = getSupabaseAdminClient();
    console.info("Auth provider: supabase:anon");
    console.info(`Auth signup email: ${email}`);

    const metadata = cleanJsonObject({
      name,
      role,
      roles: Array.isArray(roles) ? roles : [role],
      divisions: Array.isArray(divisions) ? divisions : [],
      agentLevel,
      inviteCode: inviteCode || undefined,
      agent_role: agentLevel || undefined,
      invite_code: inviteCode || undefined,
    });

    console.info("before supabase.auth.signUp", { requestId });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    console.info("after supabase.auth.signUp", { requestId });

    console.info("Supabase signUp response", {
      requestId,
      hasUser: Boolean(data?.user?.id),
      errorCode: error?.code || null,
      errorMessage: error?.message || null,
    });

    if (error || !data?.user) {
      console.error("Supabase signup error", { code: error?.code, message: error?.message });
      const isEmailExists = /already registered|already exists/i.test(error?.message || "");
      if (isEmailExists) {
        const { client: admin } = getSupabaseAdminClient();
        const { data: authList, error: authLookupError } = await admin.auth.admin.listUsers({ email });
        const authUserId = authList?.users?.[0]?.id || null;

        const { data: existingAccount, error: fetchError } = await admin
          .from("accounts")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (fetchError) {
          console.error("Supabase account fetch error", { message: fetchError.message });
          return NextResponse.json({ error: "email_exists", code: "accounts_fetch_error", requestId }, { status: 409 });
        }

        if (authUserId && !existingAccount?.id) {
          console.info("Auth user exists, creating missing account row", { requestId });
          const { data: account, error: insertError } = await admin
            .from("accounts")
            .insert({
              id: authUserId,
              name,
              email,
              role,
              roles,
              divisions,
              status: "active",
              agent_level: agentLevel,
              invite_code: inviteCode || null,
              created_at: new Date().toISOString(),
            })
            .select("id")
            .single();

          if (insertError) {
            console.error("Supabase account insert error", { message: insertError.message, code: (insertError as any)?.code || null });
            return NextResponse.json({ error: "accounts_insert_error", requestId }, { status: 500 });
          }

          return NextResponse.json({
            ok: true,
            userId: account.id,
            requestId,
          }, { status: 200 });
        }

        if (existingAccount?.id && !authUserId) {
          return NextResponse.json({ error: "inconsistent_state", requestId }, { status: 409 });
        }

        return NextResponse.json({ error: "email_exists", requestId }, { status: 409 });
      }

      return NextResponse.json({ error: error?.message || "Signup failed", code: error?.code || null, requestId }, { status: 400 });
    }

    console.info("before accounts lookup", { requestId });
    const { data: existingAccount, error: fetchError } = await admin
      .from("accounts")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    console.info("after accounts lookup", { requestId });

    console.info("Accounts lookup", {
      found: Boolean(existingAccount?.id),
      error: fetchError?.message || null,
    });

    if (fetchError) {
      console.error("Supabase account fetch error", { message: fetchError.message });
      return NextResponse.json({ error: "Signup failed", code: "accounts_fetch_error", requestId }, { status: 500 });
    }

    const accountPayload = {
      id: data.user.id,
      name,
      email,
      role,
      roles,
      divisions,
      status: "active",
      agent_level: agentLevel,
      invite_code: inviteCode || null,
      created_at: new Date().toISOString(),
    };

    console.info("before accounts insert", { requestId });
    const { data: account, error: insertError } = existingAccount
      ? await admin.from("accounts").select("id, name, email, role, roles, divisions, status, agent_level, invite_code, partner_id, partner_company, traveler_profile").eq("email", email).single()
      : await admin
          .from("accounts")
          .insert(accountPayload)
          .select("id, name, email, role, roles, divisions, status, agent_level, invite_code, partner_id, partner_company, traveler_profile")
          .single();
    console.info("after accounts insert", { requestId });

    console.info("Accounts insert", {
      inserted: Boolean(account?.id),
      error: insertError?.message || null,
    });

    if (insertError) {
      console.error("Supabase account insert error", { message: insertError.message, code: (insertError as any)?.code || null });
      return NextResponse.json({ error: "Signup failed", code: "accounts_insert_error", requestId }, { status: 500 });
    }
    console.info("Account profile created", { accountId: account.id });
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
    console.info("Signup response", { requestId, status: 201, email });
    return response;
  } catch (err: any) {
    console.error("Signup handler crash", err);
    return NextResponse.json({
      error: "signup_handler_crash",
      message: err?.message || "Signup failed",
      stack: err?.stack || null,
      requestId: (globalThis as any)?.crypto?.randomUUID ? (globalThis as any).crypto.randomUUID() : null,
    }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";