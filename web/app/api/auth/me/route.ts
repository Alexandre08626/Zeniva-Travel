import { NextResponse } from "next/server";
import { assertBackendEnv } from "../../../../src/lib/server/db";
import { getCookieDomain, getSessionCookieName, signSession, verifySession } from "../../../../src/lib/server/auth";
import { canPreviewRole, normalizeRbacRole } from "../../../../src/lib/rbac";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

function shouldUseSecureCookies(request: Request) {
  try {
    const proto = request.headers.get("x-forwarded-proto") || "";
    if (proto) return proto.includes("https");
    const url = new URL(request.url);
    return url.protocol === "https:";
  } catch {
    return process.env.NODE_ENV === "production";
  }
}

function getSessionTokenFromRequest(request: Request): string {
  const cookies = request.headers.get("cookie") || "";
  return (
    cookies
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${getSessionCookieName()}=`))
      ?.split("=")[1] || ""
  );
}

function getSessionEmailFromRequest(request: Request) {
  const token = getSessionTokenFromRequest(request);
  // Allow slightly expired tokens (grace period: 30 days) for refresh
  if (!token || !token.includes(".")) return null;
  try {
    const [data] = token.split(".");
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    return payload?.email || null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    assertBackendEnv();
    // First try strict verification; fall back to email extraction for refresh
    const token = getSessionTokenFromRequest(request);
    const verified = verifySession(token);
    const sessionEmail = verified?.email || getSessionEmailFromRequest(request);
    if (!sessionEmail) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const { client: admin } = getSupabaseAdminClient();
    const { data: account, error } = await admin
      .from("accounts")
      .select("id, name, email, role, roles, divisions, status, agent_level, invite_code, partner_id, partner_company, traveler_profile")
      .eq("email", sessionEmail)
      .maybeSingle();
    if (error) {
      console.error("Supabase account fetch error", { message: error.message });
      return NextResponse.json({ error: "Failed to load session" }, { status: 500 });
    }
    if (!account) return NextResponse.json({ user: null }, { status: 200 });

    const rawRoles = Array.isArray(account.roles) && account.roles.length ? account.roles : account.role ? [account.role] : ["traveler"];
    const normalizedRoles = rawRoles.map((role) => normalizeRbacRole(role) || role);
    const previewRole = request.headers.get("cookie")?.includes("zeniva_effective_role")
      ? (() => {
          const cookie = request.headers.get("cookie") || "";
          const match = cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith("zeniva_effective_role="));
          if (!match) return null;
          const value = decodeURIComponent(match.split("=")[1] || "");
          return normalizeRbacRole(value);
        })()
      : null;
    const effectiveRole = canPreviewRole({ id: account.id, email: account.email }) ? previewRole : null;

    const response = NextResponse.json({
      user: {
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role,
        roles: normalizedRoles,
        divisions: account.divisions || [],
        status: account.status || "active",
        agentLevel: account.agent_level || null,
        inviteCode: account.invite_code || null,
        partnerId: account.partner_id || null,
        partnerCompany: account.partner_company || null,
        travelerProfile: account.traveler_profile || null,
        effectiveRole,
      },
    });

    // Auto-refresh the session JWT on every /api/auth/me call (30-day rolling expiry)
    try {
      const newExp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
      const newToken = signSession({ email: account.email, roles: normalizedRoles, exp: newExp });
      const secureCookies = shouldUseSecureCookies(request);
      const cookieDomain = getCookieDomain();
      response.cookies.set(getSessionCookieName(), newToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: secureCookies,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        ...(cookieDomain ? { domain: cookieDomain } : {}),
      });
      // Also refresh zeniva_roles cookie (used by middleware) with current DB roles
      response.cookies.set("zeniva_roles", encodeURIComponent(JSON.stringify(normalizedRoles)), {
        httpOnly: false,
        sameSite: "lax",
        secure: secureCookies,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        ...(cookieDomain ? { domain: cookieDomain } : {}),
      });
      response.cookies.set("zeniva_email", encodeURIComponent(account.email), {
        httpOnly: false,
        sameSite: "lax",
        secure: secureCookies,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        ...(cookieDomain ? { domain: cookieDomain } : {}),
      });
    } catch { /* ignore refresh errors */ }

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load session" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    assertBackendEnv();
    const sessionEmail = getSessionEmailFromRequest(request);
    if (!sessionEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const displayName = String(body?.displayName || "").trim();
    const phone = String(body?.phone || "").trim();
    const bookingEmail = String(body?.bookingEmail || "").trim().toLowerCase();

    const { client: admin } = getSupabaseAdminClient();
    const { data: account, error } = await admin
      .from("accounts")
      .select("id, name, email, traveler_profile")
      .eq("email", sessionEmail)
      .maybeSingle();

    if (error) {
      console.error("Supabase account fetch error", { message: error.message });
      return NextResponse.json({ error: "Failed to load account" }, { status: 500 });
    }
    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const currentProfile = (account.traveler_profile && typeof account.traveler_profile === "object")
      ? account.traveler_profile as Record<string, unknown>
      : {};

    const nextTravelerProfile: Record<string, unknown> = {
      ...currentProfile,
      ...(displayName ? { displayName } : {}),
      ...(phone ? { phone } : {}),
      ...(bookingEmail ? { bookingEmail } : {}),
      updatedAt: new Date().toISOString(),
    };

    const nextName = displayName || account.name;

    const { error: updateError } = await admin
      .from("accounts")
      .update({
        name: nextName,
        traveler_profile: nextTravelerProfile,
      })
      .eq("id", account.id);

    if (updateError) {
      console.error("Supabase account update error", { message: updateError.message });
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, travelerProfile: nextTravelerProfile });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to update profile" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";