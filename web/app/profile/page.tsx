"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, isAgent, logout } from "../../src/lib/authStore";
import { useTripsStore } from "../../lib/store/tripsStore";

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
      background: "linear-gradient(180deg, #040D1A 0%, #030812 100%)",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      paddingBottom: "calc(96px + env(safe-area-inset-bottom))",
      paddingTop: "calc(env(safe-area-inset-top) + 16px)",
      color: "#fff",
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .menu-row:active { background: rgba(255,255,255,0.07) !important; }
      `}</style>

      {/* ── Profile Card ─────────────────────────────────── */}
      <div style={{
        margin: "16px 16px 20px",
        background: "linear-gradient(135deg, rgba(15,108,245,0.12) 0%, rgba(11,27,77,0.3) 100%)",
        border: "1px solid rgba(15,108,245,0.2)",
        borderRadius: 24, padding: "24px 20px",
        display: "flex", alignItems: "center", gap: 16,
        animation: "fadeUp 0.3s ease both",
      }}>
        {/* Avatar */}
        <div style={{
          width: 68, height: 68, borderRadius: "50%", flexShrink: 0,
          background: `linear-gradient(135deg, ${BLUE}, #0B3FAA)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, fontWeight: 900, color: "#fff",
          border: "2px solid rgba(230,184,90,0.25)",
          boxShadow: "0 0 24px rgba(15,108,245,0.3)",
        }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {user ? (
            <>
              <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 3 }}>
                {user.name || "Traveler"}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.email}
              </div>
              {userIsAgent && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  background: "rgba(230,184,90,0.12)", border: "1px solid rgba(230,184,90,0.25)",
                  borderRadius: 30, padding: "3px 10px", marginTop: 6,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: GREEN, display: "block" }} />
                  <span style={{ fontSize: 9, fontWeight: 800, color: GOLD, letterSpacing: "0.08em" }}>AGENT</span>
                </div>
              )}
            </>
          ) : (
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Welcome to Zeniva</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Sign in to access your trips</div>
            </div>
          )}
        </div>
        {/* Trip count pill */}
        {mounted && trips.length > 0 && (
          <div style={{
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12, padding: "8px 12px", textAlign: "center", flexShrink: 0,
          }}>
            <div style={{ fontSize: 18, fontWeight: 900 }}>{trips.length}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>TRIPS</div>
          </div>
        )}
      </div>

      {/* ── Sections ─────────────────────────────────────── */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 16 }}>

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
        <div style={{ textAlign: "center", padding: "4px 0 8px", fontSize: 10, color: "rgba(255,255,255,0.12)", letterSpacing: "0.06em" }}>
          ZENIVA TRAVEL · v2.0 PWA
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.28)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>
        {title}
      </div>
      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, overflow: "hidden" }}>
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
      borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.05)",
      cursor: "pointer", textAlign: "left",
      WebkitTapHighlightColor: "transparent",
      transition: "background 0.1s ease",
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 13, flexShrink: 0,
        background: danger ? "rgba(239,68,68,0.1)" : gold ? "rgba(230,184,90,0.08)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${danger ? "rgba(239,68,68,0.2)" : gold ? "rgba(230,184,90,0.2)" : "rgba(255,255,255,0.07)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: danger ? "#ef4444" : gold ? GOLD : "#fff", marginBottom: 1 }}>
          {label}
        </div>
        {sub && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</div>}
      </div>
      <div style={{ color: "rgba(255,255,255,0.18)", fontSize: 18, flexShrink: 0, fontWeight: 300 }}>›</div>
    </button>
  );
}
