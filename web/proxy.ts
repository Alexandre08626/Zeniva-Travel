import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RBAC_ROLES, normalizeRbacRole } from "./src/lib/rbac";
import { verifySession } from "./src/lib/server/auth";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function normalizeOrigin(origin: string) {
  return origin.replace(/\/$/, "").toLowerCase();
}

function isSameSiteOrigin(origin: string, requestOrigin: string) {
  try {
    const o = new URL(origin);
    const r = new URL(requestOrigin);
    const oHost = o.hostname.toLowerCase();
    const rHost = r.hostname.toLowerCase();
    if (oHost === rHost) return true;
    if (oHost === `www.${rHost}`) return true;
    if (rHost === `www.${oHost}`) return true;
    return false;
  } catch {
    return false;
  }
}

function expandOriginVariants(origin: string) {
  const normalized = normalizeOrigin(origin);
  try {
    const url = new URL(normalized);
    const host = url.hostname;
    if (host.startsWith("www.")) {
      const bareHost = host.replace(/^www\./, "");
      return [normalized, `${url.protocol}//${bareHost}`];
    }
    return [normalized, `${url.protocol}//www.${host}`];
  } catch {
    return [normalized];
  }
}

function getAllowedOrigins(req: NextRequest) {
  const candidates = [process.env.CORS_ORIGIN, process.env.NEXT_PUBLIC_SITE_URL, req.nextUrl.origin].filter(Boolean) as string[];
  const expanded = candidates.flatMap(expandOriginVariants);
  return Array.from(new Set(expanded.map(normalizeOrigin)));
}

function hasPrefixSegment(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublicAgentRequestsApi =
    hasPrefixSegment(pathname, "/api/agent/requests") ||
    hasPrefixSegment(pathname, "/api/agent/inbox");

  if (!SAFE_METHODS.has(req.method)) {
    const origin = req.headers.get("origin");
    if (origin) {
      if (isSameSiteOrigin(origin, req.nextUrl.origin)) {
        return NextResponse.next();
      }
      const normalizedOrigin = normalizeOrigin(origin);
      const allowedOrigins = getAllowedOrigins(req);
      if (allowedOrigins.length > 0 && !allowedOrigins.includes(normalizedOrigin)) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
        }
        return new NextResponse("Forbidden", { status: 403 });
      }
    }
  }

  // Roles come from the signed session (zeniva_session, HMAC) — never from the
  // client-writable zeniva_roles cookie, which anyone can forge.
  let roles: string[] = [];
  const sessionToken = req.cookies.get("zeniva_session")?.value;
  if (sessionToken) {
    try {
      roles = (verifySession(decodeURIComponent(sessionToken))?.roles || []).map(String);
    } catch {
      roles = [];
    }
  }
  const agentRoles = new Set(RBAC_ROLES);
  const isAgent = roles.some((role) => {
    const normalized = normalizeRbacRole(role);
    return normalized ? agentRoles.has(normalized) : false;
  });
  const isPartner = roles.includes("partner_owner") || roles.includes("partner_staff") || roles.includes("hq");

  // Restrict /ai-agents to info@zeniva.ca only
  if (pathname === "/ai-agents" || pathname.startsWith("/ai-agents/")) {
    if (!sessionToken) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    try {
      // Signature checked: a hand-made token with email info@zeniva.ca must not pass.
      const payload = verifySession(decodeURIComponent(sessionToken));
      if (!payload) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
      const email = (payload.email || "").trim().toLowerCase();
      if (email !== "info@zeniva.ca") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect agent routes and agent API
  if ((hasPrefixSegment(pathname, "/agent") || hasPrefixSegment(pathname, "/api/agent")) && !isPublicAgentRequestsApi) {
    if (!isAgent) {
      if (hasPrefixSegment(pathname, "/api/agent")) {
        return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
      }
      const redirectUrl = new URL("/login", req.url);
      redirectUrl.searchParams.set("redirect", pathname);
      redirectUrl.searchParams.set("space", "agent");
      const res = NextResponse.redirect(redirectUrl);
      res.cookies.set("zeniva_active_space", "traveler", { path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" });
      return res;
    }
  }

  // Protect partner routes and partner API
  if (hasPrefixSegment(pathname, "/partner") || hasPrefixSegment(pathname, "/api/partner")) {
    if (!isPartner) {
      if (hasPrefixSegment(pathname, "/api/partner")) {
        return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
      }
      const redirectUrl = new URL("/", req.url);
      const res = NextResponse.redirect(redirectUrl);
      res.cookies.set("zeniva_active_space", "traveler", { path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" });
      return res;
    }
  }

  // Prevent switching into agent space if not agent
  if (pathname === "/switch-space") {
    const target = req.nextUrl.searchParams.get("target") || "";
    if (target === "agent" && !isAgent) {
      const redirectUrl = new URL("/", req.url);
      const res = NextResponse.redirect(redirectUrl);
      res.cookies.set("zeniva_active_space", "traveler", { path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" });
      return res;
    }
    if (target === "partner" && !isPartner) {
      const redirectUrl = new URL("/", req.url);
      const res = NextResponse.redirect(redirectUrl);
      res.cookies.set("zeniva_active_space", "traveler", { path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" });
      return res;
    }
  }

  // Skip middleware for switch-space page to avoid redirect loops
  if (pathname === "/switch-space") {
    return NextResponse.next();
  }

  // Protect traveler routes (/traveler or /app which is traveler main)
  if (pathname.startsWith("/traveler") || pathname === "/app" || pathname.startsWith("/app")) {
    const activeSpace = req.cookies.get("zeniva_active_space")?.value;
    const hasTravelerProfile = req.cookies.get("zeniva_has_traveler_profile")?.value === "1";

    // If user doesn't have traveler profile yet, redirect to quick create
    if (!hasTravelerProfile && (!roles || !roles.includes("traveler"))) {
      const redirectUrl = new URL("/create-traveler-profile", req.url);
      redirectUrl.searchParams.set("returnTo", pathname + req.nextUrl.search);
      return NextResponse.redirect(redirectUrl);
    }

    // If user is in a different active space but could be traveler, show switch prompt
    if (activeSpace !== "traveler" && (roles && (roles.includes("traveler") || hasTravelerProfile))) {
      const redirectUrl = new URL("/switch-space", req.url);
      redirectUrl.searchParams.set("target", "traveler");
      redirectUrl.searchParams.set("returnTo", pathname + req.nextUrl.search);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/ai-agents", "/ai-agents/:path*", "/traveler/:path*", "/app/:path*", "/agent/:path*", "/partner/:path*", "/api/:path*", "/switch-space"],
};
