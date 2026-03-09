"use client";
/**
 * AppAgentDashboard — Mobile agent home (PWA only)
 * Clean, fast, Airbnb Hosting style with dark premium theme
 */
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, isHQ } from "../lib/authStore";

const GOLD = "#E6B85A";
const BLUE = "#0F6CF5";
const GREEN = "#10b981";
const BG = "#030812";
const CARD = "rgba(255,255,255,0.05)";
const BORDER = "rgba(255,255,255,0.08)";

type StatCard = { label: string; value: string | number; color: string; icon: string };
type AgentStatus = { name: string; role: string; status: "live" | "active" | "idle"; color: string; icon: string };

const AI_AGENTS: AgentStatus[] = [
  { name: "Lina", role: "AI Concierge", status: "live", color: "#6366f1", icon: "✈️" },
  { name: "Email Agent", role: "Auto-replies", status: "active", color: "#0F6CF5", icon: "📧" },
  { name: "Lead Hunter", role: "Qualifies leads", status: "active", color: "#ef4444", icon: "🎯" },
  { name: "Cyber Guard", role: "Security", status: "live", color: "#64748b", icon: "🛡️" },
];

function QuickAction({ icon, label, badge, onPress, color = BLUE }: { icon: string; label: string; badge?: number; onPress: () => void; color?: string }) {
  return (
    <button
      onClick={onPress}
      style={{
        background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16,
        padding: "18px 12px", display: "flex", flexDirection: "column",
        alignItems: "center", gap: 8, cursor: "pointer", position: "relative",
        transition: "background 0.15s", width: "100%",
      }}
      onTouchStart={e => (e.currentTarget.style.background = "rgba(255,255,255,0.09)")}
      onTouchEnd={e => (e.currentTarget.style.background = CARD)}
    >
      {badge && badge > 0 ? (
        <div style={{ position: "absolute", top: 10, right: 10, background: "#ef4444", color: "white", borderRadius: "50%", minWidth: 20, height: 20, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {badge > 99 ? "99+" : badge}
        </div>
      ) : null}
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 600, textAlign: "center" }}>{label}</div>
    </button>
  );
}

export default function AppAgentDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const canHQ = isHQ(user);
  const [stats, setStats] = useState({ inbox: 0, unread: 0, leads: 0, clients: 0 });
  const [recentMsgs, setRecentMsgs] = useState<{ author: string; text: string; time: string; cid: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] || "Agent";

  useEffect(() => {
    if (!user?.email) return;
    const fetchData = async () => {
      try {
        const resp = await fetch("/api/agent/inbox?limit=100", {
          cache: "no-store",
          headers: { "x-user-email": user.email!, "cache-control": "no-store" },
        });
        if (!resp.ok) return;
        const data = await resp.json();
        const rows: any[] = data.messages || data.data || [];

        // Group by channel
        const channelMap: Record<string, any[]> = {};
        rows.forEach((row) => {
          const cids: string[] = Array.isArray(row.channel_ids) ? row.channel_ids : [row.channel_id || "hq"];
          cids.forEach(cid => {
            if (cid === "hq") return;
            if (!channelMap[cid]) channelMap[cid] = [];
            channelMap[cid].push(row);
          });
        });

        const channels = Object.keys(channelMap);
        const clientRows = rows.filter(r => r.sender_role === "client" || r.senderRole === "client");
        const seenKey = "zeniva_inbox_last_seen";
        const lastSeen = localStorage.getItem(seenKey) ? new Date(localStorage.getItem(seenKey)!) : new Date(0);
        const unread = clientRows.filter(r => new Date(r.created_at || r.createdAt) > lastSeen).length;

        // Recent messages (last 5)
        const recent = rows
          .filter(r => (r.sender_role || r.senderRole) === "client")
          .sort((a, b) => new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime())
          .slice(0, 5)
          .map(r => {
            const cids: string[] = Array.isArray(r.channel_ids) ? r.channel_ids : [r.channel_id || "hq"];
            const cid = cids.find(c => c !== "hq") || "hq";
            const d = new Date(r.created_at || r.createdAt);
            const diff = (Date.now() - d.getTime()) / 1000;
            const time = diff < 60 ? "now" : diff < 3600 ? `${Math.floor(diff / 60)}m ago` : diff < 86400 ? `${Math.floor(diff / 3600)}h ago` : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            return { author: r.author || r.full_name || "Client", text: r.message || "", time, cid };
          });

        setStats({ inbox: rows.length, unread: Math.min(unread, 99), leads: channels.length, clients: channels.length });
        setRecentMsgs(recent);
        setLoading(false);
      } catch { setLoading(false); }
    };
    fetchData();
    const iv = setInterval(fetchData, 15000);
    return () => clearInterval(iv);
  }, [user?.email]);

  return (
    <div style={{ minHeight: "100dvh", background: BG, color: "white", fontFamily: "inherit" }}>
      {/* Header */}
      <div style={{ padding: "20px 20px 0", paddingTop: "max(20px, env(safe-area-inset-top))" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>{greeting},</div>
            <div style={{ fontSize: 26, fontWeight: 800, marginTop: 2 }}>{firstName} ✈️</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 20, padding: "6px 12px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN, animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: GREEN }}>ONLINE</span>
          </div>
        </div>

        {/* Unread alert */}
        {stats.unread > 0 && (
          <button
            onClick={() => router.push("/agent/chat")}
            style={{
              marginTop: 16, width: "100%", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              💬
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>
                {stats.unread} new message{stats.unread !== 1 ? "s" : ""}
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Tap to reply</div>
            </div>
            <div style={{ color: "#ef4444", fontSize: 20 }}>›</div>
          </button>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
          Quick Access
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          <QuickAction icon="💬" label="Inbox" badge={stats.unread} onPress={() => router.push("/agent/chat")} />
          <QuickAction icon="👥" label="Clients" onPress={() => router.push("/agent/clients")} />
          <QuickAction icon="🎯" label="Leads" onPress={() => router.push("/agent/leads")} />
          <QuickAction icon="📋" label="Proposals" onPress={() => router.push("/agent/proposals")} />
        </div>
        {canHQ && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 10 }}>
            <QuickAction icon="💰" label="Finance" onPress={() => router.push("/agent/finance")} />
            <QuickAction icon="🏠" label="Website" onPress={() => router.push("/")} />
            <QuickAction icon="⚙️" label="Settings" onPress={() => router.push("/agent/settings")} />
          </div>
        )}
      </div>

      {/* Recent Messages */}
      {recentMsgs.length > 0 && (
        <div style={{ padding: "20px 20px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Recent Messages
            </div>
            <button onClick={() => router.push("/agent/chat")} style={{ background: "none", border: "none", color: BLUE, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              View all →
            </button>
          </div>
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
            {recentMsgs.map((msg, i) => {
              const initials = msg.author.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
              const colors = ["#6366f1","#0F6CF5","#10b981","#f59e0b","#ef4444"];
              const color = colors[msg.author.charCodeAt(0) % colors.length];
              return (
                <button
                  key={i}
                  onClick={() => router.push(`/agent/chat?channel=${encodeURIComponent(msg.cid)}&label=${encodeURIComponent(msg.author)}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, width: "100%",
                    padding: "14px 16px", background: "transparent", border: "none",
                    borderBottom: i < recentMsgs.length - 1 ? `1px solid ${BORDER}` : "none",
                    cursor: "pointer", textAlign: "left",
                  }}
                  onTouchStart={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  onTouchEnd={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {initials || "?"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "white", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{msg.author}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{msg.text}</div>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, flexShrink: 0 }}>{msg.time}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Agents */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
          AI Agents — Live
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {AI_AGENTS.map((agent) => (
            <div key={agent.name} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${agent.color}22`, border: `1px solid ${agent.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                  {agent.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "white", fontWeight: 700, fontSize: 13 }}>{agent.name}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: agent.status === "live" ? GREEN : GOLD }} />
                <div style={{ fontSize: 11, color: agent.status === "live" ? GREEN : GOLD, fontWeight: 700, textTransform: "uppercase" }}>{agent.status}</div>
              </div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 4 }}>{agent.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom padding for nav */}
      <div style={{ height: "calc(100px + env(safe-area-inset-bottom))" }} />

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  );
}
