"use client";
import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useIsApp } from "../src/hooks/useIsApp";

const HIDDEN_PATHS = /^\/(chat|call|agent|payment|forms|set-password|login|signup|booking)/;

const BRAND_BLUE = "#0F3A8A";

type Tab = {
  id: string;
  label: string;
  href: string;
  isCenter?: boolean;
  icon: (active: boolean) => React.ReactNode;
};

const TABS: Tab[] = [
  {
    id: "explore",
    label: "Explore",
    href: "/",
    icon: (a) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={a ? BRAND_BLUE : "none"} stroke={a ? BRAND_BLUE : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" fill={a ? "rgba(15,58,138,0.1)" : "none"} />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    id: "trips",
    label: "My Trips",
    href: "/trips",
    icon: (a) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={a ? "rgba(15,58,138,0.1)" : "none"} stroke={a ? BRAND_BLUE : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a4 4 0 0 0-8 0v2" />
        <line x1="12" y1="12" x2="12" y2="12.01" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "lina",
    label: "Lina",
    href: "/chat",
    isCenter: true,
    icon: () => null, // uses avatar image
  },
  {
    id: "messages",
    label: "Messages",
    href: "/chat/agent?channel=agent-alexandre&source=/documents",
    icon: (a) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={a ? "rgba(15,58,138,0.1)" : "none"} stroke={a ? BRAND_BLUE : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Profile",
    href: "/profile",
    icon: (a) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={a ? "rgba(15,58,138,0.1)" : "none"} stroke={a ? BRAND_BLUE : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const isApp = useIsApp();
  const pathname = usePathname();
  const router = useRouter();
  const [pressed, setPressed] = useState<string | null>(null);

  // Don't show in PWA/app mode (AppShell handles that) or on hidden paths
  if (isApp === null) return null; // loading
  if (isApp) return null; // PWA mode — AppShell is active
  if (HIDDEN_PATHS.test(pathname)) return null;

  const getActiveTab = (path: string): string => {
    if (path === "/" || path === "") return "explore";
    if (path.startsWith("/trips") || path.startsWith("/proposals")) return "trips";
    if (path.startsWith("/chat")) return "lina";
    if (path.startsWith("/profile")) return "profile";
    return "explore";
  };

  const activeTab = getActiveTab(pathname);

  const handleTab = (tab: Tab) => {
    setPressed(tab.id);
    setTimeout(() => setPressed(null), 200);
    if (tab.id === "explore" && pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.push(tab.href);
  };

  return (
    <>
      {/* Padding spacer so content isn't hidden behind nav */}
      <style>{`
        @media (max-width: 767px) {
          body { padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px)) !important; }
          .help-float { display: none !important; }
          .lina-floating-wrap { display: none !important; }
        }
        @media (min-width: 768px) {
          .bottom-nav-mobile { display: none !important; }
        }
      `}</style>

      <nav
        className="bottom-nav-mobile"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9950,
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderTop: "1px solid #e5e7eb",
          boxShadow: "0 -1px 10px rgba(0,0,0,0.04)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "stretch", height: 64 }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            const isPressed = pressed === tab.id;

            // Center Lina button
            if (tab.isCenter) {
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTab(tab)}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    gap: 2,
                    transform: isPressed ? "scale(0.9)" : "scale(1)",
                    transition: "transform 0.15s ease",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      marginTop: -10,
                      background: active
                        ? `linear-gradient(135deg, ${BRAND_BLUE}, #1a4fad)`
                        : "linear-gradient(135deg, #0F6CF5, #1a4fad)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: active
                        ? `0 4px 16px rgba(15,58,138,0.5)`
                        : "0 2px 10px rgba(15,58,138,0.25)",
                      border: active ? "2.5px solid #E6B85A" : "2.5px solid rgba(255,255,255,0.8)",
                      transition: "all 0.3s ease",
                      position: "relative",
                    }}
                  >
                    <img
                      src="/branding/lina-avatar.png"
                      alt="Lina"
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                    {/* Online dot */}
                    <span
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#22c55e",
                        border: "2px solid white",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: active ? 800 : 500,
                      color: active ? BRAND_BLUE : "#9ca3af",
                      marginTop: -1,
                      transition: "color 0.2s ease",
                    }}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => handleTab(tab)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  gap: 2,
                  transform: isPressed ? "scale(0.9)" : "scale(1)",
                  transition: "transform 0.15s ease",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {tab.icon(active)}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: active ? 700 : 500,
                    color: active ? BRAND_BLUE : "#9ca3af",
                    transition: "color 0.2s ease",
                  }}
                >
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
