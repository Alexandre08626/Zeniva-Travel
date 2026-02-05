import { NextResponse } from "next/server";

import { assertBackendEnv, normalizeEmail } from "../../../../src/lib/server/db";
import { getCookieDomain, getSessionCookieName, signSession, hashPassword } from "../../../../src/lib/server/auth";
import { getSupabaseAdminClient, getSupabaseAnonClient } from "../../../../src/lib/supabase/server";

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

function normalizeSupabaseUrl(rawUrl: string) {
  if (!rawUrl) return "";
  const trimmed = rawUrl.trim();
  try {
    const normalized = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    return new URL(normalized).toString().replace(/\/$/, "");
  } catch {
    return trimmed;
  }
}

function keyPrefix(value: string) {
  if (!value) return "";
  const idx = value.indexOf("_");
  return idx > 0 ? value.slice(0, idx + 1) : value.slice(0, 12);
}

function errorResponse(stage: string, message: string, status = 500, details?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, stage, message, details }, { status });
}

export async function POST(request: Request) {
  const requestId =
    (globalThis.crypto?.randomUUID?.() ||
      `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`) as string;

  try {
    assertBackendEnv();

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return errorResponse("validate", "Content-Type must be application/json", 415, { requestId });
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch (parseError: any) {
      return errorResponse("parse", "Invalid JSON", 400, {
        requestId,
        message: parseError?.message || "Invalid JSON body",
      });
    }

    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const supabaseUrl = normalizeSupabaseUrl(rawUrl);
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    console.info("supabase_env", {
      requestId,
      supabaseUrl,
      hasAnon: Boolean(anonKey),
      hasService: Boolean(serviceKey),
    });

    // ---- Inputs
    const space = String(body?.space || body?.role || "traveler").toLowerCase();
    const resolvedRole =
      space === "agent" || space === "zeniva agent"
        ? "agent"
        : space === "partner"
          ? "partner_owner"
          : "traveler";

    const name = String(body?.full_name || body?.fullName || body?.name || "").trim();
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

    const isAgentRole = roles.some((r: string) =>
      ["hq", "admin", "travel-agent", "yacht-partner", "finance", "support", "agent"].includes(r)
    );

    // ---- Validate
    const missing: string[] = [];
    if (!email) missing.push("email");
    if (!password) missing.push("password");
    if (!space) missing.push("space");
    if (!name) missing.push("fullName/name");
    if (isAgentRole && !inviteCode) missing.push("inviteCode");
    if (isAgentRole && !agentLevel) missing.push("agentRole");
    if (missing.length) {
      return errorResponse("validate", "Missing required fields", 400, { missing, requestId });
    }

    if (isAgentRole && !AGENT_INVITE_CODES.includes(inviteCode)) {
      return NextResponse.json({ ok: false, message: "Invite code required or invalid for agents" }, { status: 400 });
    }

    // ---- Clients (IMPORTANT)
    // ANON client for auth.signUp
    const { client: supabaseAnonClient } = getSupabaseAnonClient();

    // ADMIN client only for DB insert (accounts)
    const { client: supabaseAdminClient } = getSupabaseAdminClient();

    // ---- Auth signup
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

    console.info("auth_signup_start", {
      requestId,
      key: "anon",
      url: supabaseUrl || null,
      anonPrefix: keyPrefix(anonKey),
      anonLength: anonKey.length,
    });
    const { data, error } = await supabaseAnonClient.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error || !data?.user) {
      console.error("auth_signup_error", {
        requestId,
        url: supabaseUrl || null,
        code: (error as any)?.code || null,
        message: error?.message || null,
      });
      return errorResponse("auth_signup_error", error?.message || "Signup failed", 400, {
        requestId,
        code: (error as any)?.code || null,
      });
    }

    // ---- Insert account row (admin)
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
      password_hash: hashPassword(password),
      created_at: new Date().toISOString(),
    };

    console.info("accounts_insert_start", { requestId, key: "service_role", url: supabaseUrl || null });
    const { data: account, error: insertError } = await supabaseAdminClient
      .from("accounts")
      .insert(accountPayload)
      .select("id, name, email, role, roles, divisions, status, agent_level, invite_code, partner_id, partner_company, traveler_profile")
      .single();

    if (insertError) {
      const code = (insertError as any)?.code || null;
      const isDuplicate = code === "23505" || /duplicate|already exists/i.test(insertError.message || "");
      if (isDuplicate) {
        const { data: existing, error: fetchError } = await supabaseAdminClient
          .from("accounts")
          .select("id, name, email, role, roles, divisions, status, agent_level, invite_code, partner_id, partner_company, traveler_profile")
          .eq("email", email)
          .maybeSingle();
        if (!fetchError && existing) {
          const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
          const token = signSession({ email: existing.email, roles: existing.roles || [existing.role || "traveler"], exp });
          const response = NextResponse.json({ user: existing }, { status: 200 });
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
        }
      }

      return errorResponse("accounts_insert_error", "Accounts insert failed", 500, {
        requestId,
        message: insertError.message,
        code,
      });
    }

    // ---- Create session cookie (your custom token)
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
    const token = signSession({ email: account.email, roles, exp });

    const response = NextResponse.json(
      {
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
      },
      { status: 201 }
    );

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
    return errorResponse("crash", err?.message || "Signup failed", 500, {
      requestId,
      stack: err?.stack || null,
    });
  }
}
