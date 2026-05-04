"use client";

import React from "react";
import { usePathname } from "next/navigation";

// Routes that must render fully standalone — no global chrome (cookie banner,
// help center, exit-intent popup, Lina chat, etc.). Investor pitch is the
// only such surface today.
const STANDALONE_ROUTES = ["/pitch"];

function isStandaloneRoute(pathname: string | null) {
  if (!pathname) return false;
  return STANDALONE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export default function StandaloneRouteGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isStandaloneRoute(pathname)) return null;
  return <>{children}</>;
}
