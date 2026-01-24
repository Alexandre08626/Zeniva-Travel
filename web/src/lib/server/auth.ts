import crypto from "crypto";

const SESSION_COOKIE = "zeniva_session";

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET || "";
  if (!secret) throw new Error("NEXTAUTH_SECRET missing");
  return secret;
}

function base64url(input: string) {
  return Buffer.from(input, "utf-8").toString("base64url");
}

function base64urlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf-8");
}

export type SessionPayload = {
  email: string;
  roles: string[];
  exp: number;
};

export function signSession(payload: SessionPayload) {
  const data = base64url(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifySession(token: string): SessionPayload | null {
  if (!token || !token.includes(".")) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(base64urlDecode(data)) as SessionPayload;
    if (!payload?.email || !payload?.exp) return null;
    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export function hashPassword(password: string, salt?: string) {
  const usedSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, usedSalt, 64).toString("hex");
  return `${usedSalt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const attempt = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(attempt, "hex"));
}