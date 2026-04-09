import { getSessionCookieName, verifySession } from "./auth";
import { canPreviewRole, hasRbacPermission, normalizeRbacRole } from "../rbac";

function getCookieValue(cookieHeader: string, name: string) {
  return cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`))
    ?.split("=")[1] || "";
}

export async function requireRbacPermission(request: Request, permission: string) {
  const cookies = request.headers.get("cookie") || "";
  const token = getCookieValue(cookies, getSessionCookieName());
  const session = verifySession(token);
  if (!session) return { ok: false, status: 401, error: "Unauthorized" } as const;

  const previewCookie = getCookieValue(cookies, "zeniva_effective_role");
  const previewRole = previewCookie ? normalizeRbacRole(decodeURIComponent(previewCookie)) : null;
  let effectiveRole = previewRole;
  if (previewRole) {
    try {
      const { getSupabaseAdminClient } = await import("../../lib/supabase/server");
      const { client } = getSupabaseAdminClient();
      const { data } = await client.from("accounts").select("id, email").ilike("email", session.email).limit(1).maybeSingle();
      const userId = data?.id || null;
      if (!canPreviewRole({ email: session.email, id: userId })) {
        effectiveRole = null;
      }
    } catch {
      effectiveRole = null;
    }
  }

  const allowed = hasRbacPermission(permission, {
    roles: session.roles,
    override: effectiveRole,
  });

  if (!allowed) return { ok: false, status: 403, error: "Forbidden" } as const;
  return { ok: true, session, effectiveRole } as const;
}
