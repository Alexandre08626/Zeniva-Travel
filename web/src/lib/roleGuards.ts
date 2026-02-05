"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, Role, hasPermission, isHQ, hasDivision, Division } from "./authStore";

export function useRequireRole(roles: Role[], redirectTo = "/login") {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  useEffect(() => {
    if (!user) {
      router.push(redirectTo);
      return;
    }
    // HQ has access to everything including partner spaces
    const userRoles = user.roles || (user.role ? [user.role] : []);
    const hqEmails = ["info@zenivatravel.com", "info@zeniva.ca"];
    const hasHQAccess = hqEmails.includes(user.email?.toLowerCase() || "") || userRoles.includes('hq');
    const hasRequiredRole = userRoles.some((r) => roles.includes(r));
    
    if (!hasHQAccess && !hasRequiredRole) {
      router.push(redirectTo);
    }
  }, [user, roles, router, redirectTo]);
  return user;
}

export function useRequireHQ(redirectTo = "/login") {
  return useRequireRole(["hq"], redirectTo);
}

export function useDivisionGuard(allowed: Division[], redirectTo = "/agent") {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  useEffect(() => {
    if (!user) {
      router.push(redirectTo);
      return;
    }
    if (isHQ(user)) return;
    const ok = allowed.some((d) => hasDivision(user, d));
    if (!ok) router.push(redirectTo);
  }, [user, allowed, router, redirectTo]);
  return user;
}

export function usePermission(permission: string) {
  const user = useAuthStore((s) => s.user);
  return hasPermission(user, permission);
}
