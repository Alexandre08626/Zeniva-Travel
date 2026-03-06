"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, isAgent } from "../../src/lib/authStore";
import { useTripsStore } from "../../lib/store/tripsStore";

export default function ProfilePage() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const { trips } = useTripsStore((s) => ({ trips: s.trips }));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const userIsAgent = mounted && authUser ? isAgent(authUser) : false;

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#030812",
      color: "white",
      paddingTop: "calc(env(safe-area-inset-top) + 16px)",
      paddingBottom: "calc(80px + env(safe-area-inset-bottom))",
    }}>
      <div style={{ padding: "0 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "linear-gradient(135deg, #0F6CF5, #0B1B4D)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, border: "2px solid rgba(15,108,245,0.4)",
          }}>
            {authUser?.name?.[0]?.toUpperCase() || "✈️"}
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0, color: "white" }}>
              {authUser?.name || "My Account"}
            </h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "2px 0 0" }}>
              {authUser?.email || "Sign in to access your trips"}
            </p>
          </div>
        </div>

        {/* Quick links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {[
            { emoji: "💬", label: "Chat with Lina", sub: "Start planning your trip", href: "/chat" },
            { emoji: "📞", label: "Call Lina", sub: "Live video + voice concierge", href: "/call" },
            { emoji: "📋", label: "My Proposals", sub: `${trips.length} trip(s) in progress`, href: "/chat" },
            { emoji: "🛥️", label: "Yacht Charters", sub: "Browse luxury yachts in Miami", href: "/yachts" },
            { emoji: "🏡", label: "Villas & Rentals", sub: "Premium short-term stays", href: "/residences" },
            ...(userIsAgent ? [{ emoji: "🏢", label: "Agent Dashboard", sub: "Switch to agent workspace", href: "/agent", isAgent: true }] : []),
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                background: (item as any).isAgent ? "rgba(230,184,90,0.06)" : "rgba(255,255,255,0.04)",
                border: (item as any).isAgent ? "1px solid rgba(230,184,90,0.2)" : "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16, padding: "14px 16px",
                cursor: "pointer", textAlign: "left",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span style={{ fontSize: 24, flexShrink: 0 }}>{item.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "white", margin: "0 0 2px" }}>{item.label}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>{item.sub}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <polyline points="9,18 15,12 9,6" />
              </svg>
            </button>
          ))}
        </div>

        {/* Account actions */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {!authUser ? (
            <>
              <button onClick={() => router.push("/login")} style={{
                background: "linear-gradient(135deg, #E6B85A, #c89b2a)",
                border: "none", borderRadius: 14, padding: "14px",
                color: "#0B1B4D", fontWeight: 800, fontSize: 15, cursor: "pointer",
              }}>Sign In</button>
              <button onClick={() => router.push("/signup")} style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 14, padding: "14px",
                color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: 14, cursor: "pointer",
              }}>Create Account</button>
            </>
          ) : (
            <button onClick={() => { useAuthStore.getState().logout?.(); router.push("/"); }} style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 14, padding: "14px",
              color: "#ef4444", fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}>Sign Out</button>
          )}
        </div>
      </div>
    </div>
  );
}
