"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, isHQ } from "../lib/authStore";

const AUTH = "Bearer zeniva-secret-2025";
const GOLD = "#E6B85A";
const BLUE = "#0F6CF5";
const GREEN = "#10B981";
const RED = "#EF4444";

type StatCard = { label: string; value: string | number; sub: string; icon: string; color: string; glow: string; href: string };

export default function AppAgentHome() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const userIsHQ = user ? isHQ(user) : false;
  const firstName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "Agent";

  const [stats, setStats] = useState<any>(null);
  const [inbox, setInbox] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hour] = useState(new Date().getHours());
  const [pulse, setPulse] = useState(false);
  const mounted = useRef(false);

  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    mounted.current = true;
    loadData();
    const iv = setInterval(loadData, 30000);
    const piv = setInterval(() => setPulse((p) => !p), 1800);
    return () => { clearInterval(iv); clearInterval(piv); mounted.current = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const email = user?.email || "";
      const [dashRes, inboxRes] = await Promise.all([
        fetch(`/api/agents-proxy?path=admin/dashboard-stats${userIsHQ ? "" : `&agent_email=${encodeURIComponent(email)}`}`, { headers: { Authorization: AUTH } }),
        fetch("/api/agent/inbox", { headers: { "x-user-email": email } }),
      ]);
      if (dashRes.ok) { const d = await dashRes.json(); if (mounted.current) setStats(d); }
      if (inboxRes.ok) {
        const d = await inboxRes.json();
        const msgs: any[] = d.data || [];
        if (mounted.current) {
          setInbox(msgs.slice(-5).reverse());
          const lastSeen = localStorage.getItem("zeniva_inbox_last_seen");
          const lastSeenDate = lastSeen ? new Date(lastSeen) : new Date(0);
          const unreadCount = msgs.filter((m: any) => new Date(m.created_at) > lastSeenDate && m.sender_role !== "agent").length;
          setUnread(unreadCount);
        }
      }
    } catch { /* ignore */ } finally {
      if (mounted.current) setLoading(false);
    }
  };

  const statCards: StatCard[] = [
    {
      label: "Inbox", value: unread > 0 ? `${unread} new` : stats?.total_messages ?? "—",
      sub: unread > 0 ? "Unread messages" : "Total messages",
      icon: "💬", color: unread > 0 ? `rgba(239,68,68,0.12)` : "rgba(15,108,245,0.1)",
      glow: unread > 0 ? "rgba(239,68,68,0.3)" : "rgba(15,108,245,0.2)", href: "/agent/chat",
    },
    {
      label: "Active Clients", value: stats?.active_clients ?? stats?.total_clients ?? "—",
      sub: `${stats?.open_dossiers ?? 0} dossiers open`,
      icon: "👥", color: "rgba(99,102,241,0.1)", glow: "rgba(99,102,241,0.2)", href: "/agent/clients",
    },
    {
      label: "Leads", value: stats?.total_leads ?? "—",
      sub: `+${stats?.leads_today ?? 0} today`,
      icon: "🎯", color: "rgba(230,184,90,0.1)", glow: "rgba(230,184,90,0.3)", href: "/agent/leads",
    },
    {
      label: "Revenue", value: userIsHQ ? `$${((stats?.total_revenue_cad ?? 0) / 100).toLocaleString("en", { maximumFractionDigits: 0 })}` : `${stats?.commission_pct ?? 70}%`,
      sub: userIsHQ ? "CAD pipeline" : "Your commission rate",
      icon: "💰", color: "rgba(16,185,129,0.1)", glow: "rgba(16,185,129,0.2)", href: "/agent/commissions",
    },
  ];

  const quickActions = [
    { label: "Inbox", icon: "💬", href: "/agent/chat", color: BLUE, badge: unread },
    { label: "Clients", icon: "👥", href: "/agent/clients", color: "#6366f1" },
    { label: "Leads", icon: "🎯", href: "/agent/leads", color: GOLD },
    { label: "Proposals", icon: "📋", href: "/agent/proposals", color: GREEN },
    { label: "Listings", icon: "🛥️", href: "/agent/listings", color: "#8B5CF6" },
    ...(userIsHQ ? [{ label: "Finance", icon: "📊", href: "/agent/finance", color: GREEN }] : []),
    { label: "Settings", icon: "⚙️", href: "/agent/settings", color: "rgba(255,255,255,0.4)" },
    { label: "Exit App", icon: "←", href: "/", color: RED },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#040810",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      paddingBottom: "calc(88px + env(safe-area-inset-bottom))",
      paddingTop: "calc(env(safe-area-inset-top) + 28px)",
      overflowX: "hidden",
    }}>
      <style>{`
        @keyframes agentGlow { 0%,100% { opacity:0.4; } 50% { opacity:0.8; } }
        @keyframes agentPulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.04); } }
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes onlineBlink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        .stat-tap:active { transform: scale(0.95); opacity:0.85; }
        .action-tap:active { transform: scale(0.88); }
      `}</style>

      {/* Background orbs */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(15,108,245,0.12) 0%, transparent 70%)", animation: "agentGlow 4s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: 100, left: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(230,184,90,0.08) 0%, transparent 70%)", animation: "agentGlow 6s ease-in-out infinite 2s" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* ─── Header ────────────────────────────────────────────── */}
        <div style={{ padding: "0 20px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>
              {greeting}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>
              {firstName} <span style={{ color: GOLD }}>✈️</span>
            </div>
          </div>
          {/* Agent badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(230,184,90,0.1)", border: "1px solid rgba(230,184,90,0.25)",
            borderRadius: 30, padding: "6px 12px",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN, animation: "onlineBlink 2s ease-in-out infinite", display: "block" }} />
            <span style={{ fontSize: 10, fontWeight: 800, color: GOLD, letterSpacing: "0.06em" }}>
              {userIsHQ ? "HQ" : "AGENT"}
            </span>
          </div>
        </div>

        {/* ─── Stats Grid ─────────────────────────────────────────── */}
        <div style={{ padding: "0 16px", marginBottom: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {statCards.map((card, i) => (
              <button key={card.label} className="stat-tap" onClick={() => router.push(card.href)} style={{
                background: card.color,
                border: `1px solid ${card.glow}`,
                borderRadius: 18, padding: "16px",
                cursor: "pointer", textAlign: "left",
                WebkitTapHighlightColor: "transparent",
                animation: `fadeSlideUp 0.4s ease ${i * 0.07}s both`,
                transition: "transform 0.15s ease, opacity 0.15s ease",
                boxShadow: `0 4px 20px ${card.glow}`,
                position: "relative", overflow: "hidden",
              }}>
                {/* Badge for inbox */}
                {card.label === "Inbox" && unread > 0 && (
                  <div style={{
                    position: "absolute", top: 10, right: 10,
                    background: RED, borderRadius: 30,
                    minWidth: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 900, color: "#fff", padding: "0 4px",
                    animation: "agentPulse 1.5s ease-in-out infinite",
                  }}>{unread > 9 ? "9+" : unread}</div>
                )}
                <div style={{ fontSize: 24, marginBottom: 8 }}>{card.icon}</div>
                <div style={{ fontSize: loading ? 16 : 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", marginBottom: 2 }}>
                  {loading ? "···" : card.value}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>{card.label}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{card.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ─── Quick Actions ───────────────────────────────────────── */}
        <div style={{ padding: "0 16px", marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
            Quick Access
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {quickActions.map((action, i) => (
              <button key={action.label} className="action-tap" onClick={() => router.push(action.href)} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14, padding: "12px 6px",
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
                transition: "transform 0.15s ease",
                animation: `fadeSlideUp 0.4s ease ${0.3 + i * 0.05}s both`,
                position: "relative",
              }}>
                {(action as any).badge > 0 && (
                  <div style={{
                    position: "absolute", top: 6, right: 6,
                    width: 14, height: 14, borderRadius: "50%",
                    background: RED, fontSize: 8, fontWeight: 900, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{(action as any).badge > 9 ? "9+" : (action as any).badge}</div>
                )}
                <span style={{ fontSize: 22 }}>{action.icon}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.02em", textAlign: "center" }}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── Recent Inbox ────────────────────────────────────────── */}
        <div style={{ padding: "0 16px", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Recent Messages
            </div>
            <button onClick={() => router.push("/agent/chat")} style={{
              background: "none", border: "none", fontSize: 11, fontWeight: 700, color: GOLD, cursor: "pointer",
            }}>View all →</button>
          </div>
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>Loading…</div>
          ) : inbox.length === 0 ? (
            <div style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14, padding: "20px", textAlign: "center",
              color: "rgba(255,255,255,0.25)", fontSize: 13,
            }}>No messages yet</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {inbox.map((msg: any, i) => {
                const isNew = (() => {
                  const lastSeen = localStorage.getItem("zeniva_inbox_last_seen");
                  const lastSeenDate = lastSeen ? new Date(lastSeen) : new Date(0);
                  return new Date(msg.created_at) > lastSeenDate && msg.sender_role !== "agent";
                })();
                return (
                  <button key={msg.id || i} onClick={() => router.push("/agent/chat")} style={{
                    background: isNew ? "rgba(15,108,245,0.08)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isNew ? "rgba(15,108,245,0.2)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 14, padding: "12px 14px",
                    display: "flex", alignItems: "center", gap: 12,
                    cursor: "pointer", textAlign: "left",
                    WebkitTapHighlightColor: "transparent",
                    animation: `fadeSlideUp 0.3s ease ${0.5 + i * 0.06}s both`,
                    width: "100%",
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                      background: isNew ? `linear-gradient(135deg, ${BLUE}, #0B3FAA)` : "rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, fontWeight: 900, color: "#fff",
                      border: isNew ? `1px solid ${BLUE}` : "1px solid rgba(255,255,255,0.06)",
                    }}>
                      {(msg.full_name || msg.author || "?")[0]?.toUpperCase()}
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: isNew ? "#fff" : "rgba(255,255,255,0.7)" }}>
                          {msg.full_name || msg.author || "Unknown"}
                        </span>
                        {isNew && (
                          <span style={{ background: BLUE, borderRadius: 30, fontSize: 8, fontWeight: 900, color: "#fff", padding: "2px 6px", flexShrink: 0 }}>NEW</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {msg.message?.slice(0, 60) || "No message"}{(msg.message?.length || 0) > 60 ? "…" : ""}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── AI Agents Status ────────────────────────────────────── */}
        <div style={{ padding: "0 16px", marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
            AI Agents Status
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { name: "Lina", role: "AI Concierge", status: "live", color: "#6366f1", emoji: "🤖" },
              { name: "Noah", role: "Follow-ups", status: "active", color: "#f59e0b", emoji: "📧" },
              { name: "Marco", role: "Lead Hunter", status: "active", color: RED, emoji: "🔥" },
              { name: "Cyber Guard", role: "Security", status: "live", color: GREEN, emoji: "🛡️" },
            ].map((agent, i) => (
              <div key={agent.name} style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14, padding: "12px",
                animation: `fadeSlideUp 0.3s ease ${0.7 + i * 0.05}s both`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{agent.emoji}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{agent.name}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{agent.role}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: agent.status === "live" ? GREEN : GOLD, display: "block", animation: "onlineBlink 2s ease-in-out infinite" }} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: agent.status === "live" ? GREEN : GOLD, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {agent.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
