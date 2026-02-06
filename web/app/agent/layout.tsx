"use client";
import "../globals.css";
import React, { useEffect, useMemo, useState } from "react";
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    { id: string; title: string; subtitle: string; href: string; ts: string; read?: boolean }[]
  >([]);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

  const notificationsKey = useMemo(() => {
    const identifier = user?.email || user?.name || "anon";
    return `agent:notifications:read:${identifier}`;
  }, [user?.email, user?.name]);

  const persistReadIds = (ids: string[]) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(notificationsKey, JSON.stringify(ids));
    } catch {
      // ignore storage errors
    }
  };

  const loadReadIds = () => {
    if (typeof window === "undefined") return new Set<string>();
    try {
      const stored = window.localStorage.getItem(notificationsKey);
      const parsed = stored ? (JSON.parse(stored) as string[]) : [];
      return new Set(parsed);
    } catch {
      return new Set<string>();
    }
  };

  useEffect(() => {
    if (!user || isHQorAdmin) return;
    if (isInfluencer) {
      const allowed = ["/agent/influencer", "/agent/settings", "/agent/chat"].some((path) => pathname === path || pathname.startsWith(`${path}/`));
      if (!allowed) {
        router.replace("/agent/influencer");
      }
      return;
    }
    if (isYachtBroker) {
      const allowed = ["/agent", "/agent/yachts", "/agent/clients", "/agent/proposals", "/agent/trips", "/agent/chat", "/agent/settings"].some((path) => pathname === path || pathname.startsWith(`${path}/`));
      if (!allowed) {
        router.replace("/agent/yachts");
      }
    }
  }, [user, roles, isHQorAdmin, isInfluencer, isYachtBroker, pathname, router]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const readIds = loadReadIds();
        const [bookingRes, agentRes] = await Promise.all([
          fetch("/api/booking-requests"),
          fetch("/api/agent/requests"),
        ]);
        const bookingPayload = await bookingRes.json();
        const agentPayload = await agentRes.json();

        const bookingRequests = Array.isArray(bookingPayload?.data) ? bookingPayload.data : [];
        const agentRequests = Array.isArray(agentPayload?.data) ? agentPayload.data : [];

        const bookingItems = bookingRequests
          .filter((item: any) => item.status === "pending_hq" || item.status === "needs_changes")
          .slice(0, 5)
          .map((item: any) => ({
            id: `booking-${item.id}`,
            title: `Booking request: ${item.title || item.clientName || "Client"}`,
            subtitle: `${item.status === "pending_hq" ? "Pending approval" : "Needs changes"} · ${item.provider || "manual"}`,
            href: "/agent/purchase-orders",
            ts: item.updatedAt || item.createdAt || new Date().toISOString(),
            read: readIds.has(`booking-${item.id}`),
          }));

        const agentItems = agentRequests
          .slice(0, 5)
          .map((item: any) => ({
            id: `request-${item.id}`,
            title: "Help request",
            subtitle: item.message?.split("\n")[0] || item.message || "New request",
            href: "/agent/chat?channel=hq",
            ts: item.createdAt || new Date().toISOString(),
            read: readIds.has(`request-${item.id}`),
          }));

        if (active) {
          setNotifications([...bookingItems, ...agentItems].slice(0, 8));
        }
      } catch {
        if (active) setNotifications([]);
      }
    };

    load();
    const interval = window.setInterval(load, 45000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [notificationsKey]);

  useEffect(() => {
    if (!notificationsOpen) return;
    const unread = notifications.filter((item) => !item.read);
    if (!unread.length) return;
    const ids = notifications.map((item) => item.id);
    persistReadIds(ids);
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }, [notificationsOpen, notifications]);

  const showChat = isHQorAdmin || roles.length > 0;

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
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:border-slate-300"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="ml-1 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-40">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Inbox</div>
                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-[11px] font-semibold text-slate-500"
                    >
                      Close
                    </button>
                  </div>
                  <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
                    {notifications.length === 0 && (
                      <div className="text-xs text-slate-500">No new notifications.</div>
                    )}
                    {notifications.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={`block rounded-xl border p-3 hover:border-slate-200 ${item.read ? "border-slate-100 bg-slate-50" : "border-slate-200 bg-white"}`}
                        onClick={() => {
                          setNotifications((prev) => {
                            const next = prev.map((entry) => (entry.id === item.id ? { ...entry, read: true } : entry));
                            const ids = next.filter((entry) => entry.read).map((entry) => entry.id);
                            persistReadIds(ids);
                            return next;
                          });
                          setNotificationsOpen(false);
                        }}
                      >
                        <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                        <div className="text-xs text-slate-600">{item.subtitle}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
