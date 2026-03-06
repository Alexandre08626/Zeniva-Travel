"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, isAgent, logout } from "../../src/lib/authStore";
import { useTripsStore } from "../../src/lib/tripsStore";

const GOLD = "#E6B85A";
const BLUE = "#0F6CF5";
const GREEN = "#10B981";

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { trips, loadTrips } = useTripsStore();
  const [mounted, setMounted] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadTrips();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userIsAgent = mounted && user ? isAgent(user) : false;
  const initials = user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "✈️";

  return (
    <div style={{
      minHeight: "100vh", background: "#030812",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      paddingBottom: "calc(88px + env(safe-area-inset-bottom))",
      paddingTop: "calc(env(safe-area-inset-top) + 40px)",
      color: "#fff",
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .menu-row:active { background: rgba(255,255,255,0.06) !important; transform: scale(0.98); }
      `}</style>

      {/* Header */}
      <div style={{ padding: "0 20px 28px", textAlign: "center" }}>
        {/* Avatar */}
        <div style={{
          width: 80, height: 80, borderRadius: "50%", margin: "0 auto 14px",
          background: `linear-gradient(135deg, ${BLUE}, #0B3FAA)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, fontWeight: 900, color: "#fff",
          border: `3px solid rgba(230,184,90,0.2)`,
          boxShadow: `0 0 30px rgba(15,108,245,0.3)`,
        }}>
          {initials}
        </div>
        {user ? (
          <>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>{user.name || "Traveler"}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{user.email}</div>
            {userIsAgent && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: "rgba(230,184,90,0.1)", border: "1px solid rgba(230,184,90,0.25)",
                borderRadius: 30, padding: "4px 12px", marginTop: 8,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: GREEN, display: "block" }} />
                <span style={{ fontSize: 10, fontWeight: 800, color: GOLD, letterSpacing: "0.06em" }}>AGENT</span>
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>Not signed in</div>
        )}
      </div>

      {/* Menu sections */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* ── My Travel ── */}
        <MenuSection title="My Travel">
          <MenuRow icon="✈️" label="My Trips" sub={`${trips.length} trip${trips.length !== 1 ? "s" : ""}`} onClick={() => router.push("/trips")} />
          <MenuRow icon="📋" label="My Proposals" sub="View & review your proposals" onClick={() => router.push("/trips")} />
          <MenuRow icon="💬" label="Chat with Lina" sub="Continue planning your trip" onClick={() => router.push("/chat")} />
          <MenuRow icon="📞" label="Call Lina" sub="Live AI video concierge" onClick={() => router.push("/call")} last />
        </MenuSection>

        {/* ── Explore ── */}
        <MenuSection title="Explore">
          <MenuRow icon="🛥️" label="Yacht Charters" sub="Luxury boats in Miami" onClick={() => router.push("/yachts")} />
          <MenuRow icon="🏡" label="Villas & Rentals" sub="Premium short-term stays" onClick={() => router.push("/residences")} last />
        </MenuSection>

        {/* ── Agent Dashboard (agents only) ── */}
        {userIsAgent && (
          <MenuSection title="Agent Workspace">
            <MenuRow icon="⚡" label="Agent Dashboard" sub="Clients · Leads · Inbox" onClick={() => router.push("/agent")} gold />
            <MenuRow icon="💬" label="Client Inbox" sub="Messages from your clients" onClick={() => router.push("/agent/chat")} />
            <MenuRow icon="👥" label="Clients" sub="Manage your accounts" onClick={() => router.push("/agent/clients")} last />
          </MenuSection>
        )}

        {/* ── Account ── */}
        <MenuSection title="Account">
          {user ? (
            <>
              <MenuRow icon="⚙️" label="Settings" sub="Preferences & notifications" onClick={() => router.push("/agent/settings")} />
              <MenuRow icon="🔐" label="Sign Out" sub="Log out of your account" onClick={async () => { await logout("/"); }} danger last />
            </>
          ) : (
            <>
              <MenuRow icon="🔑" label="Sign In" sub="Access your trips & proposals" onClick={() => router.push("/login")} gold />
              <MenuRow icon="✨" label="Create Account" sub="Join Zeniva Travel" onClick={() => router.push("/register")} last />
            </>
          )}
        </MenuSection>

        {/* App version */}
        <div style={{ textAlign: "center", padding: "8px 0 4px", fontSize: 10, color: "rgba(255,255,255,0.15)", letterSpacing: "0.05em" }}>
          ZENIVA TRAVEL · v2.0 PWA
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>
        {title}
      </div>
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 18, overflow: "hidden",
      }}>
        {children}
      </div>
    </div>
  );
}

function MenuRow({ icon, label, sub, onClick, gold, danger, last }: {
  icon: string; label: string; sub?: string; onClick: () => void;
  gold?: boolean; danger?: boolean; last?: boolean;
}) {
  return (
    <button className="menu-row" onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 14,
      width: "100%", padding: "14px 16px",
      background: gold ? "rgba(230,184,90,0.04)" : "transparent",
      border: "none",
      borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.05)",
      cursor: "pointer", textAlign: "left",
      WebkitTapHighlightColor: "transparent",
      transition: "background 0.15s ease, transform 0.1s ease",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: danger ? "rgba(239,68,68,0.1)" : gold ? "rgba(230,184,90,0.1)" : "rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20,
        border: gold ? "1px solid rgba(230,184,90,0.2)" : danger ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(255,255,255,0.06)",
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: danger ? "#ef4444" : gold ? GOLD : "#fff", marginBottom: 1 }}>
          {label}
        </div>
        {sub && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</div>}
      </div>
      <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 16, flexShrink: 0 }}>›</div>
    </button>
  );
}
