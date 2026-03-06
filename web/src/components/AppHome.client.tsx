"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../lib/authStore";

const QUICK_PROMPTS = [
  { emoji: "🏖️", label: "Beach escape", prompt: "I want a beach vacation" },
  { emoji: "🛳️", label: "Yacht charter", prompt: "I want to charter a yacht in Miami" },
  { emoji: "🗼", label: "Europe trip", prompt: "Plan me a luxury trip to Europe" },
  { emoji: "🌴", label: "All-inclusive", prompt: "Find me an all-inclusive resort" },
  { emoji: "🎿", label: "Ski resort", prompt: "I want a ski trip" },
  { emoji: "🌺", label: "Honeymoon", prompt: "Plan the perfect honeymoon" },
];

const FEATURES = [
  { icon: "✈️", title: "AI Trip Planner", subtitle: "Lina builds your perfect trip", href: "/chat" },
  { icon: "🛥️", title: "Yacht Charters", subtitle: "Luxury boats in Miami & beyond", href: "/yachts" },
  { icon: "🏡", title: "Villas & Rentals", subtitle: "Premium short-term stays", href: "/residences" },
  { icon: "📋", title: "My Proposals", subtitle: "View your trip proposals", href: "/profile" },
];

export default function AppHome() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState("Good morning");
  const [linaTyping, setLinaTyping] = useState("");
  const [linaIndex, setLinaIndex] = useState(0);
  const LINA_TEXT = "Where do you want to go?";

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // Typing animation for Lina
    let i = 0;
    const timer = setInterval(() => {
      if (i < LINA_TEXT.length) {
        setLinaTyping(LINA_TEXT.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 60);
    return () => clearInterval(timer);
  }, []);

  const handlePrompt = (prompt: string) => {
    router.push(`/chat?q=${encodeURIComponent(prompt)}`);
  };

  const firstName = mounted && authUser?.name
    ? authUser.name.split(" ")[0]
    : "";

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#050E1F",
      color: "white",
      overflowX: "hidden",
      paddingTop: "env(safe-area-inset-top)",
    }}>

      {/* Stars background */}
      <div style={{
        position: "fixed",
        inset: 0,
        background: `
          radial-gradient(ellipse at 20% 20%, rgba(15,108,245,0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(11,27,77,0.3) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(5,14,31,1) 0%, transparent 100%)
        `,
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* App Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px 0",
        }}>
          <div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500, margin: 0 }}>
              {greeting}
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: "2px 0 0", color: "white", letterSpacing: "-0.03em" }}>
              {firstName ? `Hey ${firstName} 👋` : "Zeniva Travel ✈️"}
            </h1>
          </div>
          <button
            onClick={() => router.push("/profile")}
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        </div>

        {/* Lina Hero Card */}
        <div style={{ padding: "20px 20px 0" }}>
          <div
            onClick={() => router.push("/chat")}
            style={{
              borderRadius: 24,
              background: "linear-gradient(135deg, rgba(15,108,245,0.25) 0%, rgba(11,27,77,0.6) 100%)",
              border: "1px solid rgba(15,108,245,0.3)",
              backdropFilter: "blur(20px)",
              padding: "20px",
              display: "flex",
              alignItems: "flex-end",
              gap: 16,
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
              minHeight: 160,
            }}
          >
            {/* Glow behind Lina */}
            <div style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: 160,
              height: 160,
              background: "radial-gradient(circle, rgba(15,108,245,0.3) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            {/* Lina avatar */}
            <img
              src="/branding/lina-avatar.png"
              alt="Lina"
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid rgba(15,108,245,0.5)",
                boxShadow: "0 0 30px rgba(15,108,245,0.4)",
                flexShrink: 0,
              }}
            />

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: 16,
                padding: "12px 16px",
                border: "1px solid rgba(255,255,255,0.08)",
                marginBottom: 12,
              }}>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 4px", fontWeight: 600 }}>
                  Lina AI ✨
                </p>
                <p style={{ fontSize: 16, fontWeight: 700, color: "white", margin: 0, minHeight: 24 }}>
                  {linaTyping}
                  <span style={{ opacity: 0.4, animation: "blink 1s step-end infinite" }}>|</span>
                </p>
              </div>
              <button
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #E6B85A 0%, #c89b2a 100%)",
                  color: "#0B1B4D",
                  border: "none",
                  borderRadius: 12,
                  padding: "10px 16px",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  letterSpacing: "0.02em",
                }}
              >
                Plan My Trip ✈️
              </button>
            </div>

            <style>{`
              @keyframes blink { 50% { opacity: 0; } }
            `}</style>
          </div>
        </div>

        {/* Quick Prompts */}
        <div style={{ padding: "20px 0 0" }}>
          <div style={{ padding: "0 20px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.6)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Quick Start
            </h2>
          </div>
          <div style={{
            display: "flex",
            gap: 10,
            paddingLeft: 20,
            paddingRight: 20,
            overflowX: "auto",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
          }}>
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.label}
                onClick={() => handlePrompt(p.prompt)}
                style={{
                  flexShrink: 0,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16,
                  padding: "12px 16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 6,
                  cursor: "pointer",
                  minWidth: 90,
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <span style={{ fontSize: 24 }}>{p.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap" }}>
                  {p.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Feature Grid */}
        <div style={{ padding: "20px 20px 0" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.6)", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Explore
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {FEATURES.map((f) => (
              <button
                key={f.title}
                onClick={() => router.push(f.href)}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16,
                  padding: "16px",
                  textAlign: "left",
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "white", margin: "0 0 4px" }}>{f.title}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.4 }}>{f.subtitle}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Luxury Banner */}
        <div style={{ padding: "20px 20px 0" }}>
          <div
            onClick={() => router.push("/yachts")}
            style={{
              borderRadius: 20,
              background: "linear-gradient(135deg, #0B1B4D 0%, #0F2A6B 100%)",
              border: "1px solid rgba(230,184,90,0.2)",
              padding: "20px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              cursor: "pointer",
            }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "rgba(230,184,90,0.1)",
              border: "1px solid rgba(230,184,90,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              flexShrink: 0,
            }}>
              🛥️
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#E6B85A", margin: "0 0 3px" }}>
                Yacht Charter Miami
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: 0 }}>
                25+ luxury yachts · From $500/day
              </p>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(230,184,90,0.6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9,18 15,12 9,6" />
            </svg>
          </div>
        </div>

        {/* Bottom spacer for nav bar */}
        <div style={{ height: 20 }} />

      </div>
    </div>
  );
}
