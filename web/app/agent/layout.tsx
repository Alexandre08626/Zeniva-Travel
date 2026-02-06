"use client";
import "../globals.css";
import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "../../src/lib/authStore";
import { normalizeRbacRole } from "../../src/lib/rbac";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  const router = useRouter();

  const roles = useMemo(() => (user?.roles && user.roles.length ? user.roles : user?.role ? [user.role] : []), [user]);
  const effectiveRole = useMemo(() => normalizeRbacRole(user?.effectiveRole) || normalizeRbacRole(roles[0]), [user?.effectiveRole, roles]);
  const isHQorAdmin = effectiveRole === "hq" || effectiveRole === "admin";
  const isInfluencer = effectiveRole === "influencer";
  const isYachtBroker = effectiveRole === "yacht_broker";

  useEffect(() => {
    if (!user || isHQorAdmin) return;
    if (isInfluencer) {
      if (!pathname.startsWith("/agent/influencer") && !pathname.startsWith("/agent/settings")) {
        router.replace("/agent/influencer");
      }
      return;
    }
    if (isYachtBroker) {
      const allowed = ["/agent", "/agent/yachts", "/agent/chat", "/agent/settings"].some((path) => pathname === path || pathname.startsWith(`${path}/`));
      if (!allowed) {
        router.replace("/agent/yachts");
      }
    }
  }, [user, roles, isHQorAdmin, isInfluencer, isYachtBroker, pathname, router]);

  const showChat = isHQorAdmin || (!isInfluencer && roles.length > 0);

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-sm font-semibold text-slate-800">
          <a href="/" className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm hover:border-slate-300">
            <span className="text-lg">←</span>
            <span>Back to main site</span>
          </a>
          <div className="flex items-center gap-4">
            {showChat && (
              <Link href="/agent/chat" className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm hover:border-slate-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Agent Chat</span>
              </Link>
            )}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Agent mode</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
