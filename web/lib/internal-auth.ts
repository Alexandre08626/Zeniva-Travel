import crypto from "node:crypto";
import { verifySession, getSessionCookieName, type SessionPayload } from "@/src/lib/server/auth";
import { normalizeRbacRole } from "@/src/lib/rbac";

/**
 * Server-to-server guard for routes that spend money or send mail on Zeniva's behalf
 * (supplier bookings, booking execution, confirmation emails). The token is derived from
 * NEXTAUTH_SECRET, so no extra env var is needed and browsers can never produce it.
 */
function internalToken(): string {
  const secret = process.env.NEXTAUTH_SECRET || "";
  if (!secret) return "";
  return crypto.createHmac("sha256", secret).update("zeniva-internal-v1").digest("hex");
}

export function internalHeaders(): Record<string, string> {
  return { "x-zeniva-internal": internalToken() };
}

export function isInternalRequest(req: Request): boolean {
  const expected = internalToken();
  const got = req.headers.get("x-zeniva-internal") || "";
  if (!expected || got.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}

/** Signed session from the zeniva_session cookie, or null. */
export function sessionFromRequest(req: Request): SessionPayload | null {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${getSessionCookieName()}=([^;]+)`));
  if (!m) return null;
  try {
    return verifySession(decodeURIComponent(m[1]));
  } catch {
    return null;
  }
}

const STAFF = new Set(["hq", "admin", "travel_agent", "yacht_broker"]);

export function isStaffSession(s: SessionPayload | null): boolean {
  return Boolean(s?.roles?.some((r) => STAFF.has(String(normalizeRbacRole(String(r)) || r))));
}

/** Internal call or signed-in HQ/agent. */
export function isInternalOrStaff(req: Request): boolean {
  return isInternalRequest(req) || isStaffSession(sessionFromRequest(req));
}

export function forbidden() {
  return new Response(JSON.stringify({ ok: false, error: "forbidden" }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}
