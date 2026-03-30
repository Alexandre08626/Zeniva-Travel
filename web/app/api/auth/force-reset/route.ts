import { NextResponse } from "next/server";
import { getCookieDomain, getSessionCookieName } from "../../../../src/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secureCookies = (() => {
    try {
      const proto = request.headers.get("x-forwarded-proto") || "";
      if (proto) return proto.includes("https");
      return new URL(request.url).protocol === "https:";
    } catch { return true; }
  })();

  const cookieDomain = getCookieDomain();
  const cookiesToDelete = [
    getSessionCookieName(),
    "zeniva_roles",
    "zeniva_active_space",
    "zeniva_email",
    "zeniva_has_traveler_profile",
    "zeniva_agent_enabled",
    "zeniva_agent_divisions",
    "zeniva_effective_role",
  ];

  const html = `<!DOCTYPE html>
<html><head><title>Session Reset</title></head>
<body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc">
<div style="text-align:center;max-width:400px;padding:40px">
<div style="font-size:48px;margin-bottom:16px">✅</div>
<h1 style="font-size:24px;color:#0f172a;margin-bottom:8px">Session Reset Complete</h1>
<p style="color:#64748b;margin-bottom:24px">All cookies and local storage have been cleared. You can now log in fresh.</p>
<a href="/login?mode=agent" style="display:inline-block;background:#0F6CF5;color:white;padding:12px 32px;border-radius:12px;text-decoration:none;font-weight:600">Log In</a>
</div>
<script>
try{localStorage.removeItem("zeniva_impersonating");localStorage.removeItem("zeniva_auth_store_v1");localStorage.removeItem("zeniva_trips_store_v1__info@zeniva.ca");sessionStorage.clear();}catch(e){}
</script>
</body></html>`;

  const response = new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });

  for (const name of cookiesToDelete) {
    if (cookieDomain) {
      response.cookies.set(name, "", { httpOnly: name === getSessionCookieName(), sameSite: "lax", secure: secureCookies, path: "/", domain: cookieDomain, maxAge: 0, expires: new Date(0) });
    }
    response.cookies.set(name, "", { httpOnly: name === getSessionCookieName(), sameSite: "lax", secure: secureCookies, path: "/", maxAge: 0, expires: new Date(0) });
  }

  return response;
}
