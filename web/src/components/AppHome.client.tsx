"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, isAgent, logout } from "../lib/authStore";

// ─── Animated particle orb ────────────────────────────────────────────────────
function Orb({ x, y, size, color, delay }: { x: number; y: number; size: number; color: string; delay: number }) {
  return (
    <div style={{
      position: "absolute",
      left: `${x}%`,
      top: `${y}%`,
      width: size,
      height: size,
      borderRadius: "50%",
      background: color,
      filter: "blur(60px)",
      opacity: 0.25,
      animation: `orbFloat ${4 + delay}s ease-in-out ${delay}s infinite alternate`,
      pointerEvents: "none",
    }} />
  );
}

const QUICK_ACTIONS = [
  { emoji: "🏖️", label: "Beach", prompt: "I want a luxury beach vacation" },
  { emoji: "🛥️", label: "Yacht", prompt: "I want to charter a yacht in Miami" },
  { emoji: "🗼", label: "Europe", prompt: "Plan me a luxury trip to Europe" },
  { emoji: "🌴", label: "Resort", prompt: "Find me an all-inclusive luxury resort" },
  { emoji: "🎿", label: "Ski", prompt: "I want a luxury ski trip" },
  { emoji: "🌺", label: "Honeymoon", prompt: "Plan the perfect honeymoon" },
  { emoji: "🚢", label: "Cruise", prompt: "I want to go on a luxury cruise" },
  { emoji: "🏔️", label: "Adventure", prompt: "Plan an adventure trip" },
];

export default function AppHome() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState("Good morning");
  const [linaPulse, setLinaPulse] = useState(false);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    setMounted(true);
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
    // Pulse Lina every 3s to indicate she's alive
    const iv = setInterval(() => setLinaPulse(p => !p), 3000);
    return () => clearInterval(iv);
  }, []);

  const firstName = mounted && authUser?.name ? authUser.name.split(" ")[0] : "";
  const userIsAgent = mounted && authUser ? isAgent(authUser) : false;
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const sendChat = (text: string) => {
    if (!text.trim()) return;
    router.push(`/chat?q=${encodeURIComponent(text.trim())}`);
  };

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#030812",
      color: "white",
      overflowX: "hidden",
      overflowY: "auto",
      position: "relative",
      paddingTop: "env(safe-area-inset-top)",
    }}>
      <style>{`
        @keyframes orbFloat {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-30px) scale(1.1); }
        }
        @keyframes linaFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes linaPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(15,108,245,0), 0 0 60px rgba(15,108,245,0.4), 0 0 120px rgba(15,108,245,0.2); }
          50% { box-shadow: 0 0 0 20px rgba(15,108,245,0.05), 0 0 80px rgba(15,108,245,0.6), 0 0 160px rgba(15,108,245,0.3); }
        }
        @keyframes goldPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(230,184,90,0.4), 0 8px 32px rgba(0,0,0,0.4); }
          50% { box-shadow: 0 0 40px rgba(230,184,90,0.7), 0 8px 40px rgba(0,0,0,0.5); }
        }
        @keyframes callRing {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes statusBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .action-card:active { transform: scale(0.95) !important; }
        .quick-btn:active { transform: scale(0.9) !important; }
      `}</style>

      {/* ── Ambient background orbs ─────────────────────────── */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <Orb x={-10} y={5} size={300} color="rgba(15,108,245,1)" delay={0} />
        <Orb x={70} y={60} size={250} color="rgba(11,27,77,1)" delay={1.5} />
        <Orb x={40} y={30} size={200} color="rgba(230,184,90,0.6)" delay={2.5} />
        <Orb x={80} y={10} size={180} color="rgba(15,108,245,0.8)" delay={0.8} />
      </div>

      <div style={{ position: "relative", zIndex: 1, animation: "fadeIn 0.6s ease-out" }}>

        {/* ── Top bar ───────────────────────────────────────── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
        }}>
          {/* Logo + greeting */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <img src="/branding/logo.png" alt="Zeniva" style={{ height: 18, filter: "brightness(0) invert(1)" }} />
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0, fontWeight: 500 }}>
              {greeting}{firstName ? `, ${firstName}` : ""} 👋
            </p>
          </div>

          {/* Profile + Agent Mode */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowAccountMenu(v => !v)}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {authUser?.name ? (
                <span style={{ fontSize: 16, fontWeight: 800, color: "white" }}>{authUser.name[0].toUpperCase()}</span>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </button>
            {showAccountMenu && (
              <div
                style={{
                  position: "absolute", top: 48, right: 0,
                  background: "rgba(11,27,77,0.97)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 16,
                  padding: 8,
                  minWidth: 200,
                  zIndex: 999,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                }}
              >
                {[
                  { icon: "👤", label: "My Account", href: "/profile" },
                  { icon: "💬", label: "Chat History", href: "/chat" },
                  ...(userIsAgent ? [
                    { icon: "🏢", label: "Agent Dashboard", href: "/agent", isAgent: true },
                  ] : []),
                  { icon: "🔑", label: authUser ? "Sign Out" : "Sign In", href: authUser ? null : "/login", action: authUser ? "logout" : null },
                ].map((item: any) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setShowAccountMenu(false);
                      if (item.action === "logout") {
                        logout("/");
                        router.push("/");
                      } else if (item.href) {
                        router.push(item.href);
                      }
                    }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      width: "100%",
                      background: item.isAgent ? "rgba(230,184,90,0.08)" : "transparent",
                      border: item.isAgent ? "1px solid rgba(230,184,90,0.2)" : "none",
                      borderRadius: 10,
                      padding: "10px 12px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    <span style={{
                      fontSize: 13, fontWeight: item.isAgent ? 800 : 600,
                      color: item.isAgent ? "#E6B85A" : "rgba(255,255,255,0.75)",
                    }}>{item.label}</span>
                    {item.isAgent && <span style={{ marginLeft: "auto", fontSize: 10, color: "#E6B85A", fontWeight: 800, letterSpacing: "0.05em" }}>AGENT</span>}
                  </button>
                ))}
              </div>
            )}
            {/* Click outside to close */}
            {showAccountMenu && (
              <div
                style={{ position: "fixed", inset: 0, zIndex: 998 }}
                onClick={() => setShowAccountMenu(false)}
              />
            )}
          </div>
        </div>

        {/* ── LINA HERO ─────────────────────────────────────── */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "8px 20px 0",
          animation: "slideUp 0.5s ease-out",
        }}>
          {/* Status pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 999,
            padding: "5px 14px",
            marginBottom: 20,
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#22c55e",
              animation: "statusBlink 2s ease-in-out infinite",
              boxShadow: "0 0 6px rgba(34,197,94,0.8)",
            }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.05em" }}>
              LINA IS ONLINE
            </span>
          </div>

          {/* Lina avatar with rings */}
          <div style={{ position: "relative", marginBottom: 24 }}>
            {/* Outer ring 1 */}
            <div style={{
              position: "absolute", inset: -20,
              borderRadius: "50%",
              border: "1px solid rgba(15,108,245,0.2)",
              animation: "callRing 3s ease-out infinite",
            }} />
            {/* Outer ring 2 */}
            <div style={{
              position: "absolute", inset: -10,
              borderRadius: "50%",
              border: "1px solid rgba(15,108,245,0.15)",
              animation: "callRing 3s ease-out 1s infinite",
            }} />
            {/* Glow circle */}
            <div style={{
              position: "absolute", inset: -4,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(15,108,245,0.3) 0%, transparent 70%)",
            }} />
            {/* Avatar */}
            <img
              src="/branding/lina-avatar.png"
              alt="Lina AI"
              style={{
                width: 140, height: 140,
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid rgba(15,108,245,0.6)",
                animation: "linaFloat 4s ease-in-out infinite, linaPulse 3s ease-in-out infinite",
                display: "block",
                position: "relative",
                zIndex: 1,
              }}
            />
          </div>

          {/* Lina name + tagline */}
          <h1 style={{
            fontSize: 32, fontWeight: 900, margin: "0 0 6px",
            background: "linear-gradient(135deg, #ffffff 0%, #E6B85A 60%, #0F6CF5 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer 4s linear infinite",
            letterSpacing: "-0.04em",
          }}>
            Lina AI ✈️
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "0 0 28px", textAlign: "center", lineHeight: 1.5, maxWidth: 260 }}>
            Your 24/7 AI travel concierge.<br />Where do you want to go?
          </p>

          {/* ── TWO MAIN CTAs ─────────────────────────────── */}
          <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 340, marginBottom: 8 }}>
            {/* CALL LINA — Primary */}
            <button
              onClick={() => router.push("/call")}
              style={{
                flex: 1.2,
                background: "linear-gradient(135deg, #0F6CF5 0%, #0B3FAA 100%)",
                border: "none", borderRadius: 18,
                padding: "18px 16px",
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: 8,
                cursor: "pointer",
                animation: "goldPulse 2.5s ease-in-out infinite",
                boxShadow: "0 0 30px rgba(15,108,245,0.5), 0 8px 32px rgba(0,0,0,0.4)",
                position: "relative", overflow: "hidden",
              }}
            >
              {/* Shimmer overlay */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
                backgroundSize: "200% 100%",
                animation: "shimmer 2s linear infinite",
                borderRadius: 18,
              }} />
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22,
                position: "relative",
              }}>📞</div>
              <div style={{ textAlign: "center", position: "relative" }}>
                <p style={{ fontSize: 15, fontWeight: 900, color: "white", margin: "0 0 2px", letterSpacing: "-0.02em" }}>Call Lina</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", margin: 0, fontWeight: 600 }}>LIVE VIDEO + VOICE</p>
              </div>
            </button>

            {/* CHAT — Secondary */}
            <button
              onClick={() => router.push("/chat")}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 18,
                padding: "18px 16px",
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: 8,
                cursor: "pointer",
                backdropFilter: "blur(10px)",
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "rgba(230,184,90,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22,
              }}>💬</div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: "#E6B85A", margin: "0 0 2px" }}>Chat</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: 0, fontWeight: 500 }}>AI MESSAGES</p>
              </div>
            </button>
          </div>
        </div>

        {/* ── Quick chat input ───────────────────────────────── */}
        <div style={{ padding: "20px 20px 0", animation: "slideUp 0.6s ease-out 0.1s both" }}>
          <div style={{
            display: "flex",
            gap: 10,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 18,
            padding: "12px 14px",
            alignItems: "center",
          }}>
            <img src="/branding/lina-avatar.png" style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0 }} alt="" />
            <input
              placeholder="Ask Lina anything..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendChat(chatInput)}
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: "white", fontSize: 14, fontWeight: 500,
              }}
            />
            <button
              onClick={() => sendChat(chatInput)}
              style={{
                width: 34, height: 34, borderRadius: "50%",
                background: chatInput.trim()
                  ? "linear-gradient(135deg, #E6B85A, #c89b2a)"
                  : "rgba(255,255,255,0.08)",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={chatInput.trim() ? "#0B1B4D" : "rgba(255,255,255,0.3)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22,2 15,22 11,13 2,9" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Quick topic chips ──────────────────────────────── */}
        <div style={{ padding: "14px 0 0", animation: "slideUp 0.6s ease-out 0.15s both" }}>
          <div style={{
            display: "flex", gap: 8,
            paddingLeft: 20, paddingRight: 20,
            overflowX: "auto", scrollbarWidth: "none",
          }}>
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.label}
                className="quick-btn"
                onClick={() => router.push(`/chat?q=${encodeURIComponent(a.prompt)}`)}
                style={{
                  flexShrink: 0,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: "8px 14px",
                  display: "flex", alignItems: "center", gap: 6,
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                  transition: "transform 0.15s ease",
                }}
              >
                <span style={{ fontSize: 16 }}>{a.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.65)", whiteSpace: "nowrap" }}>
                  {a.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Feature Cards ──────────────────────────────────── */}
        <div style={{ padding: "20px 20px 0", animation: "slideUp 0.6s ease-out 0.2s both" }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>
            EXPLORE
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              {
                emoji: "🛥️", title: "Yacht Charters",
                sub: "25+ luxury yachts · Miami", href: "/yachts",
                gradient: "linear-gradient(135deg, rgba(15,108,245,0.15), rgba(11,27,77,0.4))",
                border: "rgba(15,108,245,0.2)",
              },
              {
                emoji: "🏡", title: "Luxury Villas",
                sub: "Premium rentals worldwide", href: "/residences",
                gradient: "linear-gradient(135deg, rgba(230,184,90,0.1), rgba(11,27,77,0.4))",
                border: "rgba(230,184,90,0.15)",
              },
              {
                emoji: "📋", title: "My Trips",
                sub: "View your proposals", href: "/profile",
                gradient: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(11,27,77,0.4))",
                border: "rgba(34,197,94,0.15)",
              },
              {
                emoji: "🌍", title: "Destinations",
                sub: "Explore the world", href: "/search",
                gradient: "linear-gradient(135deg, rgba(168,85,247,0.1), rgba(11,27,77,0.4))",
                border: "rgba(168,85,247,0.15)",
              },
            ].map((card) => (
              <button
                key={card.title}
                className="action-card"
                onClick={() => router.push(card.href)}
                style={{
                  background: card.gradient,
                  border: `1px solid ${card.border}`,
                  borderRadius: 18,
                  padding: "16px",
                  textAlign: "left",
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                  transition: "transform 0.2s ease",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>{card.emoji}</div>
                <p style={{ fontSize: 13, fontWeight: 800, color: "white", margin: "0 0 4px", letterSpacing: "-0.01em" }}>{card.title}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.4 }}>{card.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Call Lina Banner ───────────────────────────────── */}
        <div style={{ padding: "16px 20px 0", animation: "slideUp 0.6s ease-out 0.25s both" }}>
          <button
            onClick={() => router.push("/call")}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #0B1B4D 0%, #0F2A6B 50%, #0B1B4D 100%)",
              border: "1px solid rgba(15,108,245,0.4)",
              borderRadius: 20,
              padding: "20px",
              display: "flex", alignItems: "center", gap: 16,
              cursor: "pointer",
              position: "relative", overflow: "hidden",
              textAlign: "left",
            }}
          >
            {/* Shimmer */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(90deg, transparent, rgba(15,108,245,0.08), transparent)",
              backgroundSize: "200% 100%",
              animation: "shimmer 3s linear infinite",
              borderRadius: 20,
            }} />
            {/* Lina ring */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                position: "absolute", inset: -6, borderRadius: "50%",
                border: "2px solid rgba(15,108,245,0.4)",
                animation: "callRing 2s ease-out infinite",
              }} />
              <img src="/branding/lina-avatar.png" style={{
                width: 56, height: 56, borderRadius: "50%",
                border: "2px solid rgba(15,108,245,0.6)",
                position: "relative", zIndex: 1,
              }} alt="Lina" />
              {/* Green dot */}
              <div style={{
                position: "absolute", bottom: 2, right: 2,
                width: 12, height: 12, borderRadius: "50%",
                background: "#22c55e",
                border: "2px solid #030812",
                animation: "statusBlink 2s infinite",
                zIndex: 2,
              }} />
            </div>
            <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
              <p style={{ fontSize: 16, fontWeight: 900, color: "white", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                📞 Call Lina Now
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.4 }}>
                Live video + voice — plan your dream trip in real time
              </p>
            </div>
            <div style={{
              background: "linear-gradient(135deg, #0F6CF5, #0B3FAA)",
              borderRadius: 12, padding: "8px 14px",
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "white" }}>Start →</span>
            </div>
          </button>
        </div>

        {/* Bottom spacer */}
        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}
