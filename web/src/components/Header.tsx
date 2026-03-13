"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { PREMIUM_BLUE, TITLE_TEXT, MUTED_TEXT } from "../design/tokens";
import { logout, useAuthStore, isAgent, isPartner } from "../lib/authStore";
import LocaleSwitcher from "./LocaleSwitcher";
import Pill from "./Pill";
import LinaAvatar from "./LinaAvatar";
import AccountMenu from "./AccountMenu.client";
import { Bell, Search } from 'lucide-react';
import AutoTranslate from "./AutoTranslate";
import { buildContactChannelId, fetchChatMessages } from "../lib/chatPersistence";

export default function Header({
  isLoggedIn,
  userEmail,
  hideAgentWorkspaceSwitch = false,
}: {
  isLoggedIn?: boolean;
  userEmail?: string;
  hideAgentWorkspaceSwitch?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const authUser = useAuthStore((s) => s.user);
  const loggedIn = mounted ? (authUser ? true : isLoggedIn) : Boolean(isLoggedIn);
  const email = mounted ? (authUser?.email || userEmail) : userEmail;
  const agent = mounted && authUser ? isAgent(authUser) : false;
  const previewRole = mounted ? authUser?.effectiveRole : null;
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    { id: string; title: string; subtitle: string; href: string; ts: string }[]
  >([]);

  const unreadCount = notifications.length;
  const notificationsKey = useMemo(() => {
    const identifier = email || "anon";
    return `travel:notifications:read:${identifier}`;
  }, [email]);

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

  const contactChannelId = useMemo(() => buildContactChannelId(email), [email]);

  const loadNotifications = useCallback(async () => {
    if (!contactChannelId) return;
    try {
      const readIds = loadReadIds();
      const rows = await fetchChatMessages(contactChannelId);
      const mapped = rows.map((row: any) => {
        const createdAt = row?.createdAt || row?.created_at || new Date().toISOString();
        const sender = String(row?.senderRole || row?.sender_role || "").toLowerCase();
        const message = String(row?.message || "").trim() || "New message";
        const sourcePath = String(row?.sourcePath || row?.source_path || "").trim();
        const title = sender === "lina"
          ? "Message from Lina"
          : sender === "agent" || sender === "hq"
            ? "Message from agent"
            : "Message received";
        return {
          id: String(row?.id || createdAt),
          title,
          subtitle: message,
          href: sourcePath || "/documents",
          ts: createdAt,
          read: readIds.has(String(row?.id || createdAt)),
        };
      });
      // Only notify client when a HUMAN agent writes (not Lina AI, not their own messages)
      const agentOnly = mapped.filter((item: any) => !item.read && (item.title === "Message from agent"));
      setNotifications(agentOnly.slice(0, 8));
    } catch {
      setNotifications([]);
    }
  }, [contactChannelId, loadReadIds]);

  const handleNotificationOpen = useCallback(async (item: { id: string }) => {
    const nextIds = new Set(loadReadIds());
    nextIds.add(item.id);
    persistReadIds(Array.from(nextIds));
    setNotifications((prev) => prev.filter((entry) => entry.id !== item.id));
  }, [loadReadIds, persistReadIds]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loggedIn || !contactChannelId) return;
    let active = true;
    const load = async () => {
      if (!active) return;
      await loadNotifications();
    };
    void load();
    const interval = window.setInterval(load, 45000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [loggedIn, contactChannelId, loadNotifications]);

  return (
    <>
      <div className="mb-6 flex items-center justify-between header-main" style={{ paddingTop: '6px' }}>
        <div className="flex items-center gap-4 header-left">
          {/* Mobile: Lina avatar et titre centrés */}
          <div className="w-full flex flex-col items-center justify-center sm:hidden">
            <Image src="/branding/lina-hero.png" alt="Lina AI" width={56} height={56} className="mx-auto mb-1 rounded-full" />
            <span className="text-lg font-extrabold text-center" style={{ color: TITLE_TEXT }}>{process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Zeniva Travel'}</span>
          </div>
          {/* Desktop: Lina avatar et titre */}
          <Link href="/" className="items-center gap-3 hidden sm:flex">
            <Image src="/branding/lina-hero.png" alt="Lina AI" width={56} height={56} className="rounded-full" />
            <div>
              <div className="text-lg font-extrabold" style={{ color: TITLE_TEXT }}>{process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Zeniva Travel'}</div>
              <div className="text-xs" style={{ color: MUTED_TEXT }}>
                <AutoTranslate text="Powered by Lina AI" className="inline" />
              </div>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-3 ml-4">
            <Link href="/yachts" className="text-sm text-slate-700 hover:underline"><AutoTranslate text="ZeniYacht" className="inline" /></Link>
            <Link href="/partners/resorts" className="text-sm text-slate-700 hover:underline"><AutoTranslate text="ZeniHotel" className="inline" /></Link>
            <Link href="/collections/group" className="text-sm text-slate-700 hover:underline"><AutoTranslate text="ZeniGroup" className="inline" /></Link>
            <Link href="/residences" className="text-sm text-slate-700 hover:underline"><AutoTranslate text="ZeniStays" className="inline" /></Link>
            {loggedIn && (
              <>
                <Link href="/documents" className="text-sm text-slate-900 font-semibold hover:underline"><AutoTranslate text="Dashboard" className="inline" /></Link>
                {mounted && authUser && isPartner(authUser) && (
                  <Link href="/partner/dashboard" className="text-sm text-slate-900 font-semibold hover:underline"><AutoTranslate text="Partner" className="inline" /></Link>
                )}
              </>
            )}
          </nav>
        </div>

        <button onClick={() => setMenuOpen(true)} className="mobile-menu-btn sm:hidden p-1 sm:p-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="hidden sm:flex items-center gap-3 ml-auto">
          {loggedIn ? (
            <>
              {previewRole && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                  Preview: {previewRole.replace('_', ' ')}
                </span>
              )}
              {agent && !hideAgentWorkspaceSwitch && (
                <Link
                  href="/agent"
                  className="rounded-full border px-4 py-2 text-sm font-semibold"
                  style={{ borderColor: PREMIUM_BLUE, color: PREMIUM_BLUE, opacity: 0.92 }}
                >
                  <AutoTranslate text="Switch to agent workspace" className="inline" />
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/signup" className="rounded-full px-2 py-1 text-xs font-semibold text-white sm:px-4 sm:py-2 sm:text-sm" style={{ backgroundColor: PREMIUM_BLUE, opacity: 0.96 }}>
                <AutoTranslate text="Sign up" className="inline" />
              </Link>
              <Link href="/login" className="rounded-full border px-2 py-1 text-xs font-semibold sm:px-4 sm:py-2 sm:text-sm" style={{ borderColor: PREMIUM_BLUE, color: PREMIUM_BLUE, opacity: 0.92 }}>
                <AutoTranslate text="Log in" className="inline" />
              </Link>
            </>
          )}

          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <button aria-label="Search" className="p-2 rounded-lg hover:bg-gray-100"><Search size={18} /></button>
            </div>
            <div className="relative">
              <button
                aria-label="Notifications"
                className="p-2 rounded-lg hover:bg-gray-100 relative"
                onClick={() => setNotificationsOpen((prev) => !prev)}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
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
                        className="block rounded-xl border border-slate-200 bg-white p-3 hover:border-slate-300"
                        onClick={() => {
                          void handleNotificationOpen(item);
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
            {loggedIn ? (
              <AccountMenu />
            ) : (
              <Image src="/branding/lina-avatar.png" alt="Lina avatar" width={40} height={40} className="rounded-full" />
            )}
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.55)" }} onClick={() => setMenuOpen(false)}>
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl" style={{ maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            {/* Handle */}
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
              <div style={{ width: 36, height: 4, borderRadius: 99, background: "#e2e8f0" }} />
            </div>

            <div style={{ padding: "12px 20px 32px" }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #f1f5f9" }}>
                <img src="/branding/lina-avatar.png" alt="Lina" style={{ width: 44, height: 44, borderRadius: "50%", border: "2px solid #E6B85A", objectFit: "cover" }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: "#0B1B4D" }}>
                    {loggedIn ? (authUser?.name?.split(" ")[0] || "Mon compte") : "Zeniva Travel"}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    {loggedIn ? email : "AI Travel Concierge"}
                  </div>
                </div>
                <button onClick={() => setMenuOpen(false)} style={{ marginLeft: "auto", background: "#f1f5f9", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              </div>

              {/* Nav links */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 20 }}>
                {[
                  { href: "/", icon: "🏠", label: "Home" },
                  { href: "/destinations", icon: "🌍", label: "Destinations" },
                  { href: "/yachts", icon: "⛵", label: "ZeniYacht" },
                  { href: "/partners/resorts", icon: "🏨", label: "ZeniHotel" },
                  { href: "/residences", icon: "🏠", label: "Villas & Rentals" },
                  { href: "/chat", icon: "💬", label: "Chat with Lina" },
                  { href: "/call", icon: "📞", label: "Call Lina" },
                ].map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 12px", borderRadius: 14, textDecoration: "none", color: "#0B1B4D", fontSize: 15, fontWeight: 600 }}>
                    <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{item.icon}</span>
                    {item.label}
                    <span style={{ marginLeft: "auto", color: "#cbd5e1", fontSize: 16 }}>›</span>
                  </Link>
                ))}

                {/* Agent links — only if agent */}
                {agent && (
                  <Link href="/agent" onClick={() => setMenuOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 12px", borderRadius: 14, textDecoration: "none", color: "#0F6CF5", fontSize: 15, fontWeight: 700, background: "rgba(15,108,245,0.06)" }}>
                    <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>🏢</span>
                    Agent Dashboard
                    <span style={{ marginLeft: "auto", color: "#0F6CF5", fontSize: 16 }}>›</span>
                  </Link>
                )}
              </div>

              {/* CTA Buttons */}
              {!loggedIn ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Link href="/forms/travel?agent=info%40zeniva.ca" onClick={() => setMenuOpen(false)}
                    style={{ display: "block", textAlign: "center", background: "linear-gradient(135deg, #E6B85A, #C9941F)", color: "#0B1B4D", borderRadius: 50, padding: "14px", fontWeight: 900, fontSize: 15, textDecoration: "none" }}>
                    🎁 Get 15% OFF — Start Planning
                  </Link>
                  <Link href="/login" onClick={() => setMenuOpen(false)}
                    style={{ display: "block", textAlign: "center", background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#0B1B4D", borderRadius: 50, padding: "13px", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
                    Log in
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Link href="/trips" onClick={() => setMenuOpen(false)}
                    style={{ display: "block", textAlign: "center", background: "linear-gradient(135deg, #0F6CF5, #0851c4)", color: "white", borderRadius: 50, padding: "14px", fontWeight: 800, fontSize: 15, textDecoration: "none" }}>
                    ✈️ My Trips
                  </Link>
                  <button onClick={() => { logout(); setMenuOpen(false); }}
                    style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#64748b", borderRadius: 50, padding: "13px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
