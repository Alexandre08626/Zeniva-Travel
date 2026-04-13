import { NextRequest } from "next/server";
import { verifySession, getSessionCookieName } from "@/src/lib/server/auth";

function getCookieValue(cookieHeader: string, name: string) {
  return cookieHeader.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${name}=`))?.split("=").slice(1).join("=") || "";
}

/**
 * Authenticate outreach API requests.
 * Primary: verify signed zeniva_session JWT.
 * Fallback: accept zeniva_session cookie (length > 10) + zeniva_email cookie
 * when JWT verification fails (e.g., expired token on desktop browser).
 */
export function getOutreachAuth(req: NextRequest): { email: string } | null {
  const ck = req.headers.get("cookie") || "";

  // Primary: verify signed JWT
  const cn = getSessionCookieName();
  const m = ck.match(new RegExp(cn + "=([^;]+)"));
  const t = m?.[1];
  if (t) {
    const s = verifySession(t);
    if (s?.email) return { email: s.email };
  }

  // Fallback: session cookie exists + email cookie set (same pattern as agents-proxy)
  const sessionCookie = getCookieValue(ck, "zeniva_session");
  const emailCookie = decodeURIComponent(getCookieValue(ck, "zeniva_email"));
  const rolesCookie = decodeURIComponent(getCookieValue(ck, "zeniva_roles"));

  if (sessionCookie.length > 10 && emailCookie) {
    const hasAgentRole = rolesCookie.includes("hq") || rolesCookie.includes("admin") ||
      rolesCookie.includes("agent") || rolesCookie.includes("broker");
    if (hasAgentRole) return { email: emailCookie };
  }

  return null;
}
