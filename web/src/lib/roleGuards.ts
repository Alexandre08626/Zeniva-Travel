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
    if (!roles.includes(user.role)) {
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
