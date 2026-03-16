"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, isAgent, logout } from "@/src/lib/authStore";
import { useTripsStore } from "@/lib/store/tripsStore";

const GOLD = "#E6B85A";
const BLUE = "#0F6CF5";
const GREEN = "#10B981";

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { trips } = useTripsStore((s: any) => ({ trips: s.trips }));
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const userIsAgent = mounted && user ? isAgent(user) : false;
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email ? user.email[0].toUpperCase() : "✈";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8fafc",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      paddingBottom: "calc(96px + env(safe-area-inset-bottom))",
      color: "#0B1B4D",
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .menu-row:active { background: #f1f5f9 !important; }
      `}</style>

      {/* White sticky header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid #e2e8f0",
        paddingTop: "calc(env(safe-area-inset-top) + 10px)",
        paddingBottom: 12,
        paddingLeft: 20, paddingRight: 20,
      }}>
        <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em", color: "#0B1B4D" }}>👤 Profile</div>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {/* ── Profile Card ─────────────────────────────────── */}
        <div style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 24, padding: "20px",
          display: "flex", alignItems: "center", gap: 16,
          animation: "fadeUp 0.3s ease both",
          marginBottom: 16,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
          {/* Avatar */}
          <div style={{
            width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
            background: `linear-gradient(135deg, ${BLUE}, #0B3FAA)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 900, color: "#fff",
            boxShadow: "0 4px 16px rgba(15,108,245,0.3)",
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {user ? (
              <>
                <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 3, color: "#0B1B4D" }}>
                  {user.name || "Traveler"}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.email}
                </div>
                {userIsAgent && (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    background: "rgba(230,184,90,0.1)", border: "1px solid rgba(230,184,90,0.3)",
                    borderRadius: 30, padding: "3px 10px", marginTop: 6,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: GREEN, display: "block" }} />
                    <span style={{ fontSize: 9, fontWeight: 800, color: GOLD, letterSpacing: "0.08em" }}>AGENT</span>
                  </div>
                )}
              </>
            ) : (
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4, color: "#0B1B4D" }}>Welcome to Zeniva</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>Sign in to access your trips</div>
              </div>
            )}
          </div>
          {/* Trip count pill */}
          {mounted && trips.length > 0 && (
            <div style={{
              background: "#f1f5f9", border: "1px solid #e2e8f0",
              borderRadius: 12, padding: "8px 12px", textAlign: "center", flexShrink: 0,
            }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: BLUE }}>{trips.length}</div>
              <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700 }}>TRIPS</div>
            </div>
          )}
        </div>

        {/* ── Sections ─────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* 🎁 Promo Code — traveler only, logged in */}
          {user && !userIsAgent && (
            <div style={{ background: "linear-gradient(135deg, rgba(230,184,90,0.12), rgba(230,184,90,0.05))", border: "1.5px solid rgba(230,184,90,0.4)", borderRadius: 18, padding: "18px 20px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#92400e", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>🎁 Your Welcome Discount</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#0B1B4D", letterSpacing: "0.05em", fontFamily: "monospace" }}>WELCOME15</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>15% OFF — Villa · Yacht · Hotel · Flight</div>
                </div>
                <button
                  onClick={() => { navigator.clipboard?.writeText("WELCOME15"); }}
                  style={{ background: "linear-gradient(135deg, #E6B85A, #C9941F)", color: "#0B1B4D", border: "none", borderRadius: 50, padding: "10px 18px", fontWeight: 900, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                  Copy 📋
                </button>
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>Enter at checkout · Valid on your first booking</div>
            </div>
          )}

          {/* My Travel */}
          <Section title="My Travel">
            <Row icon="✈️" label="My Trips" sub={`${mounted ? trips.length : "—"} trip${trips.length !== 1 ? "s" : ""} in progress`} onClick={() => router.push("/trips")} />
            <Row icon="📋" label="Proposals" sub="Review & book your itineraries" onClick={() => router.push("/trips")} />
            <Row icon="💬" label="Chat with Lina" sub="Continue planning" onClick={() => router.push("/chat")} />
            <Row icon="📞" label="Call Lina" sub="Live AI concierge · Video & Voice" onClick={() => router.push("/call")} last />
          </Section>

          {/* Explore */}
          <Section title="Explore">
            <Row icon="🛥️" label="Yacht Charters" sub="25+ luxury boats · Miami" onClick={() => router.push("/yachts")} />
            <Row icon="🏡" label="Villas & Rentals" sub="Premium short-term stays" onClick={() => router.push("/residences")} last />
          </Section>

          {/* Agent only */}
          {userIsAgent && (
            <Section title="⚡ Agent Workspace">
              <Row icon="📊" label="Dashboard" sub="Stats · Clients · Leads pipeline" onClick={() => router.push("/agent")} gold />
              <Row icon="💬" label="Client Inbox" sub="Conversations & messages" onClick={() => router.push("/agent/chat")} />
              <Row icon="👥" label="Clients" sub="Manage your accounts" onClick={() => router.push("/agent/clients")} />
              <Row icon="🎯" label="Leads" sub="Sales pipeline" onClick={() => router.push("/agent/leads")} last />
            </Section>
          )}

          {/* Account */}
          <Section title="Account">
            {user ? (
              <>
                <Row icon="⚙️" label="Settings" sub="Notifications & preferences" onClick={() => router.push("/agent/settings")} />
                <Row icon="🔐" label="Sign Out" sub="Log out of your account" onClick={() => logout("/")} danger last />
              </>
            ) : (
              <>
                <Row icon="🔑" label="Sign In" sub="Access your trips & proposals" onClick={() => router.push("/login")} gold />
                <Row icon="✨" label="Create Account" sub="Join Zeniva Travel" onClick={() => router.push("/register")} last />
              </>
            )}
          </Section>

          {/* Version */}
          <div style={{ textAlign: "center", padding: "4px 0 8px", fontSize: 10, color: "#cbd5e1", letterSpacing: "0.06em" }}>
            ZENIVA TRAVEL · v2.0 PWA
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>
        {title}
      </div>
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        {children}
      </div>
    </div>
  );
}

function Row({ icon, label, sub, onClick, gold, danger, last }: {
  icon: string; label: string; sub?: string; onClick: () => void;
  gold?: boolean; danger?: boolean; last?: boolean;
}) {
  return (
    <button className="menu-row" onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 14,
      width: "100%", padding: "14px 16px",
      background: "transparent",
      border: "none",
      borderBottom: last ? "none" : "1px solid #f1f5f9",
      cursor: "pointer", textAlign: "left",
      WebkitTapHighlightColor: "transparent",
      transition: "background 0.1s ease",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: danger ? "#fef2f2" : gold ? "#fffbeb" : "#f1f5f9",
        border: `1px solid ${danger ? "#fecaca" : gold ? "#fde68a" : "#e2e8f0"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: danger ? "#ef4444" : gold ? "#B45309" : "#0B1B4D", marginBottom: 1 }}>
          {label}
        </div>
        {sub && <div style={{ fontSize: 11, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</div>}
      </div>
      <div style={{ color: "#cbd5e1", fontSize: 18, flexShrink: 0, fontWeight: 300 }}>›</div>
    </button>
  );
}
