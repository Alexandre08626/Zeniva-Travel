import { NextResponse } from "next/server";
import { getSessionCookieName, verifySession } from "../../../../src/lib/server/auth";
import { canPreviewRole, normalizeRbacRole } from "../../../../src/lib/rbac";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

function getSessionFromRequest(request: Request) {
  const cookies = request.headers.get("cookie") || "";
  const sessionToken = cookies
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${getSessionCookieName()}=`))
    ?.split("=")[1] || "";
  return verifySession(sessionToken);
}

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const requested = normalizeRbacRole(body?.role);
  if (!requested) {
    return NextResponse.json({ ok: false, error: "Invalid role" }, { status: 400 });
  }

  const { client: admin } = getSupabaseAdminClient();
  const { data } = await admin
    .from("accounts")
    .select("id, email")
    .ilike("email", session.email)
    .limit(1);
  const userId = data?.[0]?.id || null;
  if (!canPreviewRole({ email: session.email, id: userId })) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true, role: requested });
  response.cookies.set("zeniva_effective_role", requested, {
    httpOnly: false,
    sameSite: "lax",
    secure: true,
    path: "/",
  });
  return response;
}

export async function DELETE(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { client: admin } = getSupabaseAdminClient();
  const { data } = await admin
    .from("accounts")
    .select("id, email")
    .ilike("email", session.email)
    .limit(1);
  const userId = data?.[0]?.id || null;
  if (!canPreviewRole({ email: session.email, id: userId })) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("zeniva_effective_role", "", {
    httpOnly: false,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
