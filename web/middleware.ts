import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AGENT_ROLES = new Set(["hq", "admin", "travel-agent", "yacht-partner", "finance", "support"]);

function parseRolesCookie(raw?: string | null): string[] {
  if (!raw) return [];
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function isAgentRole(roles: string[]) {
  return roles.some((role) => AGENT_ROLES.has(role));
}

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const rolesCookie = req.cookies.get("zeniva_roles")?.value || "";
  const roles = parseRolesCookie(rolesCookie);
  const agent = isAgentRole(roles);

  const isAgentRoute = pathname.startsWith("/agent");
  const isAgentApi = pathname.startsWith("/api/agent");
  const isSwitchSpace = pathname === "/switch-space";
  const target = isSwitchSpace ? (searchParams.get("target") || "") : "";

  if ((isAgentRoute || isAgentApi || (isSwitchSpace && target === "agent")) && !agent) {
    if (isAgentApi) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }

    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.search = "";

    const res = NextResponse.redirect(redirectUrl);
    res.cookies.set("zeniva_active_space", "traveler", { path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/agent/:path*", "/api/agent/:path*", "/switch-space"],
};
