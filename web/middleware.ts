import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Pages restricted to specific emails
const RESTRICTED_PAGES: Record<string, string[]> = {
  "/ai-agents": ["info@zeniva.ca"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this path is restricted
  const allowedEmails = RESTRICTED_PAGES[pathname];
  if (!allowedEmails) return NextResponse.next();

  // Get email from session cookie
  const sessionToken = request.cookies.get("zeniva_session")?.value;
  if (!sessionToken) {
    // Not logged in → redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Decode session (base64url payload . sig)
  try {
    const [data] = sessionToken.split(".");
    if (!data) throw new Error("Invalid token");
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    const email = (payload?.email || "").trim().toLowerCase();

    // Check expiry
    if (payload?.exp && payload.exp * 1000 < Date.now()) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if email is allowed
    if (allowedEmails.map((e) => e.toLowerCase()).includes(email)) {
      return NextResponse.next();
    }

    // Not authorized → redirect to home
    return NextResponse.redirect(new URL("/", request.url));
  } catch {
    // Invalid session → redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/ai-agents"],
};
