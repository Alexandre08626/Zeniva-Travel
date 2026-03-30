import { NextResponse } from "next/server";
import { getSessionCookieName } from "../../../../src/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const names = [
    getSessionCookieName(), "zeniva_session",
    "zeniva_roles", "zeniva_active_space", "zeniva_email",
    "zeniva_has_traveler_profile", "zeniva_agent_enabled",
    "zeniva_agent_divisions", "zeniva_effective_role",
  ];

  const html = `<!DOCTYPE html>
<html><head><title>Session Reset</title></head>
<body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc">
<div style="text-align:center;max-width:400px;padding:40px">
<div style="font-size:48px;margin-bottom:16px">&#x2705;</div>
<h1 style="font-size:24px;color:#0f172a;margin-bottom:8px">Session Reset Complete</h1>
<p style="color:#64748b;margin-bottom:24px">All session data cleared. Please log in.</p>
<a href="/login?mode=agent" style="display:inline-block;background:#0F6CF5;color:white;padding:12px 32px;border-radius:12px;text-decoration:none;font-weight:600">Log In</a>
</div>
<script>
try{localStorage.clear();sessionStorage.clear();}catch(e){}
var n=["zeniva_session","zeniva_roles","zeniva_active_space","zeniva_email","zeniva_has_traveler_profile","zeniva_agent_enabled","zeniva_agent_divisions","zeniva_effective_role","zeniva_impersonating"];
var d=["","zeniva.ca",".zeniva.ca","www.zeniva.ca","zenivatravel.com",".zenivatravel.com","www.zenivatravel.com"];
for(var i=0;i<n.length;i++){
  document.cookie=n[i]+"=;expires=Thu,01 Jan 1970 00:00:00 GMT;path=/";
  document.cookie=n[i]+"=;expires=Thu,01 Jan 1970 00:00:00 GMT;path=/;secure";
  for(var j=0;j<d.length;j++){
    document.cookie=n[i]+"=;expires=Thu,01 Jan 1970 00:00:00 GMT;path=/;domain="+d[j];
    document.cookie=n[i]+"=;expires=Thu,01 Jan 1970 00:00:00 GMT;path=/;domain="+d[j]+";secure";
  }
}
</script>
</body></html>`;

  const response = new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
    },
  });

  // Server-side: clear cookies WITHOUT domain (matches exact host)
  for (const name of names) {
    response.cookies.set(name, "", {
      httpOnly: name.includes("session"),
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
  }

  // Also clear WITH various domains
  for (const domain of ["zeniva.ca", "www.zeniva.ca", "zenivatravel.com", "www.zenivatravel.com"]) {
    for (const name of names) {
      response.cookies.set(name + "__" + domain.replace(/\./g,"_"), "", {
        maxAge: 0, expires: new Date(0), path: "/",
      });
      response.headers.append("Set-Cookie",
        `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; Domain=${domain}; Secure; SameSite=Lax${name.includes("session") ? "; HttpOnly" : ""}`
      );
    }
  }

  return response;
}
