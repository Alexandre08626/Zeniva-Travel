"use client";
import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useIsApp } from "../hooks/useIsApp";
import { useAuthStore } from "../lib/authStore";

// Tab config
const TABS = [
  {
    id: "home",
    label: "Home",
    href: "/",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "#E6B85A" : "none"} stroke={active ? "#E6B85A" : "rgba(255,255,255,0.4)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
  },
  {
    id: "chat",
    label: "Chat",
    href: "/chat",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#E6B85A" : "rgba(255,255,255,0.4)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill={active ? "rgba(230,184,90,0.15)" : "none"} />
      </svg>
    ),
  },
  {
    id: "search",
    label: "Search",
    href: "/yachts",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#E6B85A" : "rgba(255,255,255,0.4)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    id: "trips",
    label: "My Trips",
    href: "/profile",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#E6B85A" : "rgba(255,255,255,0.4)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.77 16.92z" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Account",
    href: "/profile",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#E6B85A" : "rgba(255,255,255,0.4)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
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
  const [unreadChat, setUnreadChat] = useState(0);

  // Active tab detection
  const getActiveTab = useCallback((path: string) => {
    if (path === "/" || path === "") return "home";
    if (path.startsWith("/chat")) return "chat";
    if (path.startsWith("/yachts") || path.startsWith("/residences") || path.startsWith("/airbnbs")) return "search";
    if (path.startsWith("/profile")) return "profile";
    return "";
  }, []);

  const activeTab = getActiveTab(pathname);

  const handleTabPress = (tab: typeof TABS[0]) => {
    setPressed(tab.id);
    setTimeout(() => setPressed(null), 200);
    router.push(tab.href);
  };

  if (!isApp) return null;

  return (
    <>
      {/* Global app styles - injected only in PWA mode */}
      <style>{`
        /* Hide regular site header in PWA mode */
        [data-fullbleed="true"] { display: none !important; }
        
        /* App body background */
        body { background: #050E1F !important; }
        
        /* Safe area bottom padding for all pages */
        main, #main-content { padding-bottom: calc(72px + env(safe-area-inset-bottom)) !important; }
        
        /* Tab press animation */
        @keyframes tabPop {
          0% { transform: scale(1); }
          50% { transform: scale(0.88); }
          100% { transform: scale(1); }
        }
        
        /* Glow animation for active tab */
        @keyframes goldGlow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(230,184,90,0.3)); }
          50% { filter: drop-shadow(0 0 10px rgba(230,184,90,0.7)); }
        }
      `}</style>

      {/* App Top Status Bar */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "env(safe-area-inset-top)",
        background: "#050E1F",
        zIndex: 9998,
      }} />

      {/* Bottom Navigation Bar */}
      <nav style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "rgba(5, 14, 31, 0.92)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingBottom: "env(safe-area-inset-bottom)",
        boxShadow: "0 -1px 0 rgba(255,255,255,0.04), 0 -20px 60px rgba(0,0,0,0.5)",
      }}>
        <div style={{
          display: "flex",
          alignItems: "stretch",
          height: 72,
        }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            const isPressed = pressed === tab.id;
            const isChatCenter = tab.id === "chat";

            if (isChatCenter) {
              // Center Chat button — elevated gold button
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabPress(tab)}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    position: "relative",
                    gap: 4,
                    transform: isPressed ? "scale(0.9)" : "scale(1)",
                    transition: "transform 0.15s ease",
                  }}
                >
                  {/* Elevated circle */}
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: active
                      ? "linear-gradient(135deg, #E6B85A 0%, #c89b2a 100%)"
                      : "linear-gradient(135deg, #0F6CF5 0%, #0B1B4D 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: -16,
                    boxShadow: active
                      ? "0 0 20px rgba(230,184,90,0.5), 0 4px 20px rgba(0,0,0,0.4)"
                      : "0 0 20px rgba(15,108,245,0.4), 0 4px 20px rgba(0,0,0,0.4)",
                    border: "2px solid rgba(255,255,255,0.1)",
                    transition: "all 0.3s ease",
                  }}>
                    <img
                      src="/branding/lina-avatar.png"
                      alt="Chat"
                      style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
                    />
                  </div>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: active ? "#E6B85A" : "rgba(255,255,255,0.4)",
                    letterSpacing: "0.03em",
                  }}>
                    Lina ✈️
                  </span>
                  {unreadChat > 0 && (
                    <div style={{
                      position: "absolute",
                      top: 6,
                      right: "calc(50% - 32px)",
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 800,
                      color: "white",
                      border: "2px solid #050E1F",
                    }}>
                      {unreadChat}
                    </div>
                  )}
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => handleTabPress(tab)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  gap: 5,
                  transform: isPressed ? "scale(0.85)" : "scale(1)",
                  transition: "transform 0.15s ease",
                  WebkitTapHighlightColor: "transparent",
                  position: "relative",
                }}
              >
                {/* Active indicator dot */}
                {active && (
                  <div style={{
                    position: "absolute",
                    top: 8,
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "#E6B85A",
                    boxShadow: "0 0 8px rgba(230,184,90,0.8)",
                  }} />
                )}

                {/* Icon container */}
                <div style={{
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 10,
                  background: active ? "rgba(230,184,90,0.08)" : "transparent",
                  transition: "all 0.2s ease",
                  animation: active ? "goldGlow 2s ease-in-out infinite" : "none",
                }}>
                  {tab.icon(active)}
                </div>

                <span style={{
                  fontSize: 10,
                  fontWeight: active ? 700 : 500,
                  color: active ? "#E6B85A" : "rgba(255,255,255,0.35)",
                  letterSpacing: "0.02em",
                  transition: "color 0.2s ease",
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
