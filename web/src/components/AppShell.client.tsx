"use client";
import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useIsApp } from "../hooks/useIsApp";
import { useAuthStore, isAgent, isHQ } from "../lib/authStore";

// ─── CLIENT TABS ─────────────────────────────────────────────────────────────
const CLIENT_TABS = [
  {
    id: "home", label: "Home", href: "/",
    icon: (a: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={a ? "rgba(230,184,90,0.2)" : "none"} stroke={a ? "#E6B85A" : "rgba(255,255,255,0.35)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
  },
  {
    id: "chat", label: "Chat", href: "/chat",
    icon: (a: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={a ? "rgba(230,184,90,0.15)" : "none"} stroke={a ? "#E6B85A" : "rgba(255,255,255,0.35)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  { id: "call", label: "Call Lina", href: "/call", isCenter: true },
  {
    id: "trips", label: "My Trips", href: "/trips",
    icon: (a: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? "#E6B85A" : "rgba(255,255,255,0.35)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.59 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.5 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 7.91a16 16 0 0 0 6.16 6.16l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 14.92z"/>
      </svg>
    ),
  },
  {
    id: "explore", label: "Explore", href: "/yachts",
    icon: (a: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? "#E6B85A" : "rgba(255,255,255,0.35)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    id: "account", label: "Account", href: "/profile",
    icon: (a: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? "#E6B85A" : "rgba(255,255,255,0.35)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

// ─── AGENT TABS ───────────────────────────────────────────────────────────────
const AGENT_TABS = [
  {
    id: "dashboard", label: "Dashboard", href: "/agent",
    icon: (a: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? "#E6B85A" : "rgba(255,255,255,0.35)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    id: "inbox", label: "Inbox", href: "/agent/chat",
    icon: (a: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={a ? "rgba(230,184,90,0.1)" : "none"} stroke={a ? "#E6B85A" : "rgba(255,255,255,0.35)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    badge: true,
  },
  {
    id: "clients", label: "Clients", href: "/agent/clients",
    icon: (a: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? "#E6B85A" : "rgba(255,255,255,0.35)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: "leads", label: "Leads", href: "/agent/leads",
    icon: (a: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? "#E6B85A" : "rgba(255,255,255,0.35)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    id: "exit", label: "←", href: "/",
    icon: (a: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(100,116,139,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15,18 9,12 15,6"/>
      </svg>
    ),
  },
];

export default function AppShell() {
  const isApp = useIsApp();
  const pathname = usePathname();
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const [pressed, setPressed] = useState<string | null>(null);
  const [inboxBadge, setInboxBadge] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Clear app badge when app is opened/focused
    const clearBadge = () => {
      try {
        if ("clearAppBadge" in navigator) (navigator as any).clearAppBadge().catch(() => {});
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage("CLEAR_BADGE");
        }
      } catch (e) {}
    };
    clearBadge();
    window.addEventListener("focus", clearBadge);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) clearBadge(); });
    return () => { window.removeEventListener("focus", clearBadge); };
  }, []);

  const isAgentMode = pathname.startsWith("/agent");
  const userIsAgent = mounted && authUser ? isAgent(authUser) : false;
  const tabs = isAgentMode ? AGENT_TABS : CLIENT_TABS;

  const getActiveTab = useCallback((path: string) => {
    if (isAgentMode) {
      if (path === "/agent" || path === "/agent/") return "dashboard";
      if (path.startsWith("/agent/chat")) return "inbox";
      if (path.startsWith("/agent/clients")) return "clients";
      if (path.startsWith("/agent/leads")) return "leads";
      return "";
    }
    if (path === "/" || path === "") return "home";
    if (path.startsWith("/chat")) return "chat";
    if (path.startsWith("/call")) return "call";
    if (path.startsWith("/trips") || path.startsWith("/proposals")) return "trips";
    if (path.startsWith("/yachts") || path.startsWith("/residences") || path.startsWith("/airbnbs") || path.startsWith("/search")) return "explore";
    if (path.startsWith("/profile")) return "account";
    return "";
  }, [isAgentMode]);

  const activeTab = getActiveTab(pathname);

  // Fetch inbox badge
  useEffect(() => {
    if (!isApp || !mounted || !userIsAgent) return;
    const fetchBadge = async () => {
      try {
        const email = authUser?.email || "";
        const r = await fetch("/api/agent/inbox?action=unread_count", { headers: { "x-user-email": email } });
        if (r.ok) { const d = await r.json(); setInboxBadge(d.count || 0); }
      } catch { /* ignore */ }
    };
    fetchBadge();
    const iv = setInterval(fetchBadge, 30000);
    return () => clearInterval(iv);
  }, [isApp, mounted, userIsAgent, authUser?.email]);

  const handleTab = (tab: typeof tabs[0]) => {
    setPressed(tab.id);
    setTimeout(() => setPressed(null), 200);
    router.push(tab.href);
  };

  if (!isApp) return null; // null or false — both hide the shell on website

  return (
    <>
      <style>{`
        [data-fullbleed="true"] { display: none !important; }
        /* White background for all pages except home */
        body { background: #f8fafc !important; overflow-x: hidden !important; }
        html { overflow-x: hidden !important; }
        main, #main-content { padding-bottom: calc(80px + env(safe-area-inset-bottom)) !important; }
        /* Ensure ALL page content clears the bottom nav */
        .min-h-screen:not([data-no-pad]), .min-h-dvh:not([data-no-pad]) { padding-bottom: calc(80px + env(safe-area-inset-bottom)) !important; }
        /* Scroll containers */
        [class*="overflow-y-auto"], [class*="overflow-auto"] { scroll-padding-bottom: calc(80px + env(safe-area-inset-bottom)); }
        /* Agent page wrappers */
        .agent-wrap, [class*="agent-page"] { padding-bottom: calc(80px + env(safe-area-inset-bottom)) !important; }
        /* Proposal / booking pages */
        .proposal-page, .booking-page, .review-page { padding-bottom: calc(100px + env(safe-area-inset-bottom)) !important; }
        /* Prevent horizontal overflow everywhere */
        * { max-width: 100vw; box-sizing: border-box; }
        @keyframes goldGlow { 0%,100% { filter: drop-shadow(0 0 4px rgba(230,184,90,0.3)); } 50% { filter: drop-shadow(0 0 10px rgba(230,184,90,0.7)); } }
        @keyframes callRingNav { 0% { transform:scale(1);opacity:.8; } 100% { transform:scale(1.5);opacity:0; } }
      `}</style>

      {/* Safe area top — white */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "env(safe-area-inset-top)", background: "#f8fafc", zIndex: 9998 }} />

      {/* Agent mode pill indicator */}
      {isAgentMode && (
        <div style={{
          position: "fixed", top: "calc(env(safe-area-inset-top) + 8px)", left: "50%", transform: "translateX(-50%)",
          background: "rgba(230,184,90,0.15)", border: "1px solid rgba(230,184,90,0.3)",
          borderRadius: 999, padding: "3px 12px", zIndex: 9997,
          fontSize: 10, fontWeight: 800, color: "#E6B85A", letterSpacing: "0.08em",
        }}>
          ⚡ AGENT MODE
        </div>
      )}

      {/* Bottom Nav */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
        background: isAgentMode
          ? "rgba(10,15,30,0.95)"
          : "rgba(3,8,18,0.92)",
        backdropFilter: "blur(24px) saturate(200%)",
        WebkitBackdropFilter: "blur(24px) saturate(200%)",
        borderTop: `1px solid ${isAgentMode ? "rgba(230,184,90,0.1)" : "rgba(255,255,255,0.05)"}`,
        paddingBottom: "env(safe-area-inset-bottom)",
        boxShadow: "0 -1px 0 rgba(255,255,255,0.03), 0 -20px 60px rgba(0,0,0,0.6)",
      }}>
        <div style={{ display: "flex", alignItems: "stretch", height: 72 }}>
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            const isPressed = pressed === tab.id;

            // Center Call button (client mode only)
            if ((tab as any).isCenter) {
              return (
                <button key={tab.id} onClick={() => handleTab(tab)} style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  border: "none", background: "transparent", cursor: "pointer", gap: 4,
                  transform: isPressed ? "scale(0.88)" : "scale(1)", transition: "transform 0.15s ease",
                  WebkitTapHighlightColor: "transparent",
                }}>
                  <div style={{ position: "relative" }}>
                    <div style={{
                      position: "absolute", inset: -8, borderRadius: "50%",
                      border: "1.5px solid rgba(15,108,245,0.3)",
                      animation: "callRingNav 2s ease-out infinite",
                    }} />
                    <div style={{
                      width: 52, height: 52, borderRadius: "50%", marginTop: -14,
                      background: "linear-gradient(135deg, #0F6CF5 0%, #0B3FAA 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: active
                        ? "0 0 24px rgba(230,184,90,0.5), 0 4px 16px rgba(0,0,0,0.4)"
                        : "0 0 20px rgba(15,108,245,0.4), 0 4px 16px rgba(0,0,0,0.4)",
                      border: `2px solid ${active ? "rgba(230,184,90,0.5)" : "rgba(255,255,255,0.1)"}`,
                      position: "relative", zIndex: 1,
                      transition: "all 0.3s ease",
                    }}>
                      <img src="/branding/lina-avatar.png" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }} alt="Lina" />
                    </div>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: active ? "#E6B85A" : "rgba(255,255,255,0.35)", letterSpacing: "0.05em", marginTop: -2 }}>
                    CALL
                  </span>
                </button>
              );
            }

            const isExitTab = tab.id === "exit";

            return (
              <button key={tab.id} onClick={() => handleTab(tab)} style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                border: "none", background: "transparent", cursor: "pointer", gap: 4,
                transform: isPressed ? "scale(0.85)" : "scale(1)", transition: "transform 0.15s ease",
                WebkitTapHighlightColor: "transparent", position: "relative",
              }}>
                {/* Active dot */}
                {active && !isExitTab && (
                  <div style={{
                    position: "absolute", top: 8,
                    width: 4, height: 4, borderRadius: "50%",
                    background: "#E6B85A",
                    boxShadow: "0 0 8px rgba(230,184,90,0.8)",
                  }} />
                )}
                {/* Badge */}
                {(tab as any).badge && inboxBadge > 0 && (
                  <div style={{
                    position: "absolute", top: 8, right: "calc(50% - 18px)",
                    minWidth: 16, height: 16, borderRadius: 8,
                    background: "#ef4444",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 900, color: "white",
                    border: "1.5px solid rgba(10,15,30,1)",
                    padding: "0 3px",
                  }}>{inboxBadge > 9 ? "9+" : inboxBadge}</div>
                )}
                {/* Icon */}
                <div style={{
                  width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 10,
                  background: active && !isExitTab ? "rgba(230,184,90,0.08)" : "transparent",
                  transition: "all 0.2s ease",
                  animation: active && !isExitTab ? "goldGlow 2.5s ease-in-out infinite" : "none",
                }}>
                  {(tab as any).icon(active)}
                </div>
                <span style={{
                  fontSize: 9, fontWeight: active ? 800 : 500,
                  color: isExitTab ? "rgba(255,255,255,0.25)" : active ? "#E6B85A" : "rgba(255,255,255,0.3)",
                  letterSpacing: "0.02em", transition: "color 0.2s ease",
                }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
