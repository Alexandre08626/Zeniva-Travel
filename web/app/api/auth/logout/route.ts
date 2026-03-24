import { NextResponse } from "next/server";
import { getCookieDomain, getSessionCookieName } from "../../../../src/lib/server/auth";

function shouldUseSecureCookies(request: Request) {
  try {
    const proto = request.headers.get("x-forwarded-proto") || "";
    if (proto) return proto.includes("https");
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") return false;
    return url.protocol === "https:";
  } catch {
    return process.env.NODE_ENV === "production";
  }
}

export async function POST(request: Request) {
  try {
    const secureCookies = shouldUseSecureCookies(request);
    const cookieDomain = getCookieDomain();

    const response = NextResponse.json({ success: true, message: "Logged out successfully" });

    // Delete ALL session cookies with proper configuration
    const cookiesToDelete = [
      getSessionCookieName(),
      "zeniva_roles",
      "zeniva_active_space",
      "zeniva_email",
      "zeniva_has_traveler_profile",
      "zeniva_agent_enabled",
      "zeniva_agent_divisions",
    ];

    for (const cookieName of cookiesToDelete) {
      // Delete with domain if configured
      if (cookieDomain) {
        response.cookies.set(cookieName, "", {
          httpOnly: cookieName === getSessionCookieName(),
          sameSite: "lax",
          secure: secureCookies,
          path: "/",
          domain: cookieDomain,
          maxAge: 0,
          expires: new Date(0),
        });
      }

      // Also delete without domain (belt and suspenders approach)
      response.cookies.set(cookieName, "", {
        httpOnly: cookieName === getSessionCookieName(),
        sameSite: "lax",
        secure: secureCookies,
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
    }

    console.log("[AUTH] Logout successful - all cookies cleared");
    return response;
  } catch (error: any) {
    console.error("[AUTH] Logout error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
