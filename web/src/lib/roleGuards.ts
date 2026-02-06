"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, Role, hasPermission, isHQ, hasDivision, Division } from "./authStore";
import { normalizeRbacRole } from "./rbac";

export function useRequireRole(roles: Role[], redirectTo = "/login") {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  useEffect(() => {
    if (!user) {
      router.push(redirectTo);
      return;
    }
    const userRoles = user.roles || (user.role ? [user.role] : []);
    const effective = user.effectiveRole ? normalizeRbacRole(user.effectiveRole) : null;
    const hasRequiredRole = effective ? roles.includes(effective as Role) : userRoles.some((r) => roles.includes(r));

    if (!hasRequiredRole) {
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

export function useRequirePermission(permission: string, redirectTo = "/agent") {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!hasPermission(user, permission)) {
      router.push(redirectTo);
    }
  }, [user, permission, router, redirectTo]);
  return user;
}

export function useRequireAnyPermission(permissions: string[], redirectTo = "/agent") {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    const ok = permissions.some((permission) => hasPermission(user, permission));
    if (!ok) {
      router.push(redirectTo);
    }
  }, [user, permissions, router, redirectTo]);
  return user;
}
