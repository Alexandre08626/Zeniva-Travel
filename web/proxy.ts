import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for switch-space page to avoid redirect loops
  if (pathname === "/switch-space") {
    return NextResponse.next();
  }

  // Protect traveler routes (/traveler or /app which is traveler main)
  if (pathname.startsWith("/traveler") || pathname === "/app" || pathname.startsWith("/app")) {
    const activeSpace = req.cookies.get("zeniva_active_space")?.value;
    const rolesCookie = req.cookies.get("zeniva_roles")?.value;
    const roles = rolesCookie ? JSON.parse(decodeURIComponent(rolesCookie)) : [];
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
  matcher: ["/traveler/:path*", "/app/:path*"],
};
