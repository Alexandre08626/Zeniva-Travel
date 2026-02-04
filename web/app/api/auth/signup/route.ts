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

async function checkSupabaseAuthHealth(url: string, anonKey: string, requestId: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  const healthUrl = url.replace(/\/$/, "") + "/auth/v1/health";
  try {
    const response = await fetch(healthUrl, {
      method: "GET",
      headers: {
        apikey: anonKey,
      },
      signal: controller.signal,
    });
    const text = await response.text();
    console.info("supabase_health_response", {
      requestId,
      status: response.status,
      ok: response.ok,
      body: text.slice(0, 200),
    });
    return { ok: response.ok, status: response.status };
  } catch (error: any) {
    console.error("supabase_health_error", {
      requestId,
      message: error?.message || "fetch failed",
      name: error?.name || null,
      cause: error?.cause || null,
      stack: error?.stack || null,
    });
    return { ok: false, status: 0, error };
  } finally {
    clearTimeout(timeout);
  }
}

function errorResponse(stage: string, message: string, status = 500, details?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, stage, message, details }, { status });
}

export async function POST(request: Request) {
  const requestId = (globalThis.crypto?.randomUUID?.() || `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`) as string;
  try {
    const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
    const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const contentType = request.headers.get("content-type") || "";
    const origin = request.headers.get("origin") || "";
    const referer = request.headers.get("referer") || "";
    const supabaseHost = getSupabaseHost(supabaseUrl);
    console.info("Signup request received", {
      requestId,
      url: request.url,
      contentType,
      origin,
      referer,
      supabaseHost,
    });
    console.info("Env check", {
      requestId,
      hasUrl: Boolean(supabaseUrl),
      hasAnon: Boolean(supabaseAnon),
      hasServiceRole: Boolean(supabaseService),
    });
    assertBackendEnv();
    if (!supabaseUrl) {
      return errorResponse("env", "Missing env var", 500, { name: "NEXT_PUBLIC_SUPABASE_URL", requestId });
    }
    if (!supabaseAnon) {
      return errorResponse("env", "Missing env var", 500, { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", requestId });
    }
    if (!supabaseService) {
      return errorResponse("env", "Missing env var", 500, { name: "SUPABASE_SERVICE_ROLE_KEY", requestId });
    }
    if (!supabaseHost || !supabaseHost.includes(".")) {
      return errorResponse("env", "Invalid SUPABASE URL", 500, {
        name: "NEXT_PUBLIC_SUPABASE_URL",
        requestId,
        host: supabaseHost || null,
      });
    }
    if (!contentType.toLowerCase().includes("application/json")) {
      return errorResponse("validate", "Content-Type must be application/json", 415, { requestId });
    }
    let body: any = {};
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Signup request JSON parse error", { message: (parseError as Error)?.message });
      return errorResponse("parse", "Invalid JSON", 400, {
        message: (parseError as Error)?.message || "Invalid JSON body",
        stack: (parseError as Error)?.stack || null,
        requestId,
      });
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

    const missing: string[] = [];
    if (!email) missing.push("email");
    if (!password) missing.push("password");
    if (!space) missing.push("space");
    if (!name) missing.push("fullName/name");
    if (!inviteCode) missing.push("inviteCode");
    if (!agentLevel) missing.push("agentRole");
    if (missing.length) {
      return errorResponse("validate", "Missing required fields", 400, { missing, requestId });
    }

    const isAgentRole = roles.some((r: string) => ["hq", "admin", "travel-agent", "yacht-partner", "finance", "support", "agent"].includes(r));
    if (isAgentRole && !AGENT_INVITE_CODES.includes(inviteCode)) {
      return NextResponse.json({ error: "Invite code required or invalid for agents" }, { status: 400 });
    }

    const { client: supabase } = getSupabaseServerClient();
    const { client: admin } = getSupabaseAdminClient();
    console.info("signup_start", { requestId, email });
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

    const health = await checkSupabaseAuthHealth(supabaseUrl, supabaseAnon, requestId);
    if (!health.ok) {
      const healthError = health.error as any;
      console.warn("supabase_health_error", {
        requestId,
        status: health.status || 0,
        host: supabaseHost,
        healthUrl: supabaseUrl.replace(/\/$/, "") + "/auth/v1/health",
        errorName: healthError?.name || null,
        errorMessage: healthError?.message || null,
      });
    }

    console.info("auth_signup_start", { requestId });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    console.info("auth_signup_response", {
      requestId,
      status: error ? "error" : "ok",
      errorMessage: error?.message || null,
      userId: data?.user?.id || null,
    });
    if (error || !data?.user) {
      console.error("auth_signup_error", { requestId, message: error?.message || "Signup failed" });
      return errorResponse("auth_signup_error", error?.message || "Signup failed", 400, { requestId, code: error?.code || null });
    }
    console.info("auth_signup_success", { requestId, userId: data.user.id });

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

    console.info("accounts_insert_start", { requestId });
    const { data: account, error: insertError } = await admin
      .from("accounts")
      .insert(accountPayload)
      .select("id, name, email, role, roles, divisions, status, agent_level, invite_code, partner_id, partner_company, traveler_profile")
      .single();

    if (insertError) {
      console.error("accounts_insert_error", { requestId, message: insertError.message, code: (insertError as any)?.code || null });
      return errorResponse("accounts_insert_error", "Accounts insert failed", 500, { requestId, message: insertError.message });
    }
    console.info("accounts_insert_success", { requestId, accountId: account.id });
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
    console.info("signup_end", { requestId, status: 201, email });
    return response;
  } catch (err: any) {
    console.error("Signup handler crash", err);
    return errorResponse("crash", err?.message || "Signup failed", 500, {
      stack: err?.stack || null,
      requestId,
    });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";