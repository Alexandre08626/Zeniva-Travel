import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const rolesCookie = req.cookies.get("zeniva_roles")?.value;
  let roles: string[] = [];
  if (rolesCookie) {
    try {
      const decoded = decodeURIComponent(rolesCookie);
      const parsed = JSON.parse(decoded);
      roles = Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      roles = [];
    }
  }
  const agentRoles = new Set(["hq", "admin", "travel-agent", "yacht-partner", "finance", "support", "agent"]);
  const agentEnabled = req.cookies.get("zeniva_agent_enabled")?.value === "1";
  const email = (req.cookies.get("zeniva_email")?.value || "").toLowerCase();
  const allowlisted = email === "info@zeniva.ca" || email === "lantierj6@gmail.com";
  const isAgent = allowlisted && (agentEnabled || roles.some((role) => agentRoles.has(role)));

  // Protect agent routes and agent API
  if (pathname.startsWith("/agent") || pathname.startsWith("/api/agent")) {
    if (!isAgent) {
      if (pathname.startsWith("/api/agent")) {
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
  matcher: ["/traveler/:path*", "/app/:path*", "/agent/:path*", "/api/agent/:path*", "/switch-space"],
};
