import { NextResponse } from "next/server";
import { getSessionCookieName } from "../../../../src/lib/server/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(getSessionCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";