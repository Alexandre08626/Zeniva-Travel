"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, isHQ } from "../lib/authStore";

const BLUE = "#0F6CF5";
const GREEN = "#10b981";
const RED = "#ef4444";
const GOLD = "#E6B85A";
const SEEN_KEY = "zeniva_agent_seen_v2";

function loadSeenCount(): number {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(SEEN_KEY) : null;
    if (!raw) return 0;
    return (JSON.parse(raw) as string[]).length;
  } catch { return 0; }
}

const AI_AGENTS = [
  { name: "Lina", role: "AI Concierge", color: "#6366f1", icon: "✈️", status: "live" },
  { name: "Marco", role: "Lead Hunter", color: RED, icon: "🎯", status: "live" },
  { name: "Sofia", role: "Email Marketing", color: "#ec4899", icon: "📧", status: "active" },
  { name: "Noah", role: "Follow-up", color: GOLD, icon: "🔔", status: "active" },
  { name: "Luna", role: "Voice & SMS", color: "#06b6d4", icon: "📞", status: "active" },
  { name: "Atlas", role: "Cyber Guard", color: "#64748b", icon: "🛡️", status: "live" },
  { name: "Mia", role: "Social Media", color: "#a855f7", icon: "📱", status: "active" },
  { name: "Leo", role: "Analytics", color: "#8b5cf6", icon: "📊", status: "active" },
];

function QBtn({ icon, label, badge, onClick }: { icon: string; label: string; badge?: number; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: "white", border: "1.5px solid #e2e8f0", borderRadius: 18,
      padding: "18px 8px", display: "flex", flexDirection: "column", alignItems: "center",
      gap: 7, cursor: "pointer", position: "relative", width: "100%",
      boxShadow: "0 1px 6px rgba(0,0,0,0.07)", WebkitTapHighlightColor: "transparent",
    }}>
      {!!badge && badge > 0 && (
        <div style={{ position: "absolute", top: 8, right: 8, background: RED, color: "white", borderRadius: "50%", minWidth: 19, height: 19, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {badge > 99 ? "99+" : badge}
        </div>
      )}
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div style={{ color: "#0f172a", fontSize: 11, fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>{label}</div>
    </button>
  );
}

export default function AppAgentDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const canHQ = isHQ(user);
  const [unread, setUnread] = useState(0);
  const [recentMsgs, setRecentMsgs] = useState<{ author: string; text: string; time: string; cid: string }[]>([]);
  const [stats, setStats] = useState({ convs: 0, leads: 0, clients: 0 });
  const firstName = user?.name?.split(" ")[0] || "Agent";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    if (!user?.email) return;
    const load = async () => {
      try {
        const r = await fetch("/api/agent/inbox?limit=100", {
          cache: "no-store",
          headers: { "x-user-email": user.email!, "cache-control": "no-store" },
        });
        if (!r.ok) return;
        const data = await r.json();
        const rows: any[] = data.messages || data.data || [];

        // Channels
        const chanSet = new Set<string>();
        rows.forEach(row => {
          const cids: string[] = Array.isArray(row.channel_ids) ? row.channel_ids : [];
          cids.forEach(c => { if (c !== "hq") chanSet.add(c); });
        });

        // Unread: client messages not in localStorage seen set
        let seenSet: Set<string> = new Set();
        try {
          const raw = localStorage.getItem(SEEN_KEY);
          if (raw) seenSet = new Set(JSON.parse(raw) as string[]);
        } catch {}
        const clientRows = rows.filter(r => (r.sender_role || r.senderRole) === "client");
        const u = clientRows.filter(r => {
          const id = String(r.id || r.created_at);
          return !seenSet.has(id);
        }).length;
        setUnread(Math.min(u, 99));

        // Recent (latest 5 client messages)
        const recent = clientRows
          .sort((a, b) => new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime())
          .slice(0, 5)
          .map(r => {
            const cids: string[] = Array.isArray(r.channel_ids) ? r.channel_ids : [];
            const cid = cids.find(c => c !== "hq") || "hq";
            const diff = (Date.now() - new Date(r.created_at || r.createdAt).getTime()) / 1000;
            const time = diff < 60 ? "now" : diff < 3600 ? `${Math.floor(diff/60)}m` : diff < 86400 ? `${Math.floor(diff/3600)}h` : new Date(r.created_at||r.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric"});
            return { author: r.author || r.full_name || "Client", text: r.message || "", time, cid };
          });
        setRecentMsgs(recent);
        setStats({ convs: chanSet.size, leads: chanSet.size, clients: chanSet.size });
      } catch {}
    };
    load();
    const iv = setInterval(load, 20000);
    return () => clearInterval(iv);
  }, [user?.email]);

  const AVATAR_COLORS = ["#6366f1", BLUE, "#10b981", GOLD, RED, "#8b5cf6", "#06b6d4", "#ec4899"];

  return (
    <div style={{ minHeight: "100dvh", background: "#f8fafc", fontFamily: "inherit" }}>
      {/* Header */}
      <div style={{ background: "white", borderBottom: "1.5px solid #e2e8f0", padding: "18px 20px 16px", paddingTop: "max(18px, env(safe-area-inset-top))" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#64748b", fontSize: 13 }}>{greeting},</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginTop: 1 }}>{firstName} ✈️</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 20, padding: "7px 13px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN, boxShadow: "0 0 0 2px #bbf7d0" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#15803d" }}>ONLINE</span>
          </div>
        </div>

        {/* Stats pills */}
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          {[
            { label: "Conversations", val: stats.convs, color: BLUE },
            { label: "Unread", val: unread, color: unread > 0 ? RED : "#64748b" },
            { label: "Active agents", val: 8, color: "#8b5cf6" },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "8px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {/* Unread alert */}
        {unread > 0 && (
          <button
            onClick={() => router.push("/agent/chat")}
            style={{ width: "100%", background: "#fff7ed", border: "1.5px solid #fed7aa", borderRadius: 18, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", marginBottom: 16 }}
          >
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: RED, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "white", flexShrink: 0 }}>
              💬
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ color: "#9a3412", fontWeight: 800, fontSize: 16 }}>{unread} new message{unread !== 1 ? "s" : ""}</div>
              <div style={{ color: "#c2410c", fontSize: 13, marginTop: 2 }}>Tap to reply now →</div>
            </div>
          </button>
        )}

        {/* Quick access */}
        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Quick Access</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 10 }}>
          <QBtn icon="💬" label="Inbox" badge={unread} onClick={() => router.push("/agent/chat")} />
          <QBtn icon="👥" label="Clients" onClick={() => router.push("/agent/clients")} />
          <QBtn icon="🎯" label="Leads" onClick={() => router.push("/agent/leads")} />
          <QBtn icon="📋" label="Proposals" onClick={() => router.push("/agent/proposals")} />
        </div>
        {canHQ && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
            <QBtn icon="💰" label="Finance" onClick={() => router.push("/agent/finance")} />
            <QBtn icon="🌐" label="Website" onClick={() => router.push("/")} />
            <QBtn icon="⚙️" label="Settings" onClick={() => router.push("/agent/settings")} />
          </div>
        )}

        {/* Recent messages */}
        {recentMsgs.length > 0 && (
          <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 18, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px 10px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Recent Messages</div>
              <button onClick={() => router.push("/agent/chat")} style={{ background: "none", border: "none", color: BLUE, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>View all →</button>
            </div>
            {recentMsgs.map((msg, i) => {
              const color = AVATAR_COLORS[msg.author.charCodeAt(0) % AVATAR_COLORS.length];
              const initials = msg.author.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
              return (
                <button key={i} onClick={() => router.push(`/agent/chat?channel=${encodeURIComponent(msg.cid)}&label=${encodeURIComponent(msg.author)}`)} style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "13px 16px",
                  background: "transparent", border: "none", borderBottom: i < recentMsgs.length - 1 ? "1px solid #f8fafc" : "none",
                  cursor: "pointer", textAlign: "left",
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{initials || "?"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#0f172a", fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.author}</div>
                    <div style={{ color: "#94a3b8", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.text}</div>
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: 11, flexShrink: 0 }}>{msg.time}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* 8 AI Agents */}
        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>AI Agents — Live</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {AI_AGENTS.map(agent => (
            <div key={agent.name} style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 16, padding: "14px 14px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: `${agent.color}18`, border: `1.5px solid ${agent.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                  {agent.icon}
                </div>
                <div style={{ color: "#0f172a", fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>{agent.name}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: agent.status === "live" ? GREEN : GOLD }} />
                <div style={{ fontSize: 10, color: agent.status === "live" ? "#15803d" : "#92400e", fontWeight: 700, textTransform: "uppercase" }}>{agent.status}</div>
              </div>
              <div style={{ color: "#94a3b8", fontSize: 11 }}>{agent.role}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: "calc(100px + env(safe-area-inset-bottom))" }} />
    </div>
  );
}
