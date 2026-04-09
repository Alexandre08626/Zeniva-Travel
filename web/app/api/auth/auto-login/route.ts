import { NextRequest, NextResponse } from "next/server";
import {
  signSession,
  verifySession,
  getSessionCookieName,
  getCookieDomain,
} from "../../../../src/lib/server/auth";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

/**
 * Auto-login endpoint for new clients created via form submission.
 * GET /api/auth/auto-login?token=xxx&redirect=/set-password
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const redirect = req.nextUrl.searchParams.get("redirect") || "/";

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Verify the setup token (same format as session, but with type "setup")
  const payload = verifySession(token);
  if (!payload || (payload as any).type !== "setup") {
    return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
  }

  // Load account from DB
  const { client: admin } = getSupabaseAdminClient();
  const { data } = await admin
    .from("accounts")
    .select("email, roles, name")
    .ilike("email", payload.email)
    .limit(1);
  if (!data?.[0]) {
    return NextResponse.redirect(new URL("/login?error=account_not_found", req.url));
  }

  const account = data[0];
  const roles: string[] = (() => {
    try {
      const r = account.roles;
      if (Array.isArray(r)) return r;
      if (typeof r === "string") return JSON.parse(r);
      return ["traveler"];
    } catch {
      return ["traveler"];
    }
  })();

  // Issue a 30-day session
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
  const sessionToken = signSession({ email: account.email, roles, exp });

  const cookieDomain = getCookieDomain();
  const cookieOpts = {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  };

  const destination = new URL(redirect, req.url);
  const res = NextResponse.redirect(destination);
  res.cookies.set(getSessionCookieName(), sessionToken, cookieOpts);
  res.cookies.set("zeniva_email", account.email, { ...cookieOpts, httpOnly: false });
  res.cookies.set("zeniva_roles", encodeURIComponent(JSON.stringify(roles)), {
    ...cookieOpts,
    httpOnly: false,
  });
  res.cookies.set("zeniva_active_space", roles.includes("hq") || roles.includes("travel_agent") ? "agent" : "traveler", {
    ...cookieOpts,
    httpOnly: false,
  });

  return res;
}

export const runtime = "nodejs";
