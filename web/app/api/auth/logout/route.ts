import { NextResponse } from "next/server";
import { getCookieDomain, getSessionCookieName } from "../../../../src/lib/server/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  const cookieDomain = getCookieDomain();
  response.cookies.set(getSessionCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    ...(cookieDomain ? { domain: cookieDomain } : {}),
    maxAge: 0,
  });
  return response;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";