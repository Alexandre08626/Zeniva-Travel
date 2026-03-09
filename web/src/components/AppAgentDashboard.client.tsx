"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, isHQ } from "../lib/authStore";

const BLUE = "#0F6CF5";
const GREEN = "#10b981";
const RED = "#ef4444";

type AgentStatus = { name: string; role: string; status: "live" | "active"; color: string; icon: string };

const AI_AGENTS: AgentStatus[] = [
  { name: "Lina", role: "AI Concierge", status: "live", color: "#6366f1", icon: "✈️" },
  { name: "Email Agent", role: "Auto-replies", status: "active", color: BLUE, icon: "📧" },
  { name: "Lead Hunter", role: "Qualifies leads", status: "active", color: RED, icon: "🎯" },
  { name: "Cyber Guard", role: "Security", status: "live", color: "#64748b", icon: "🛡️" },
];

function QBtn({ icon, label, badge, onClick }: { icon: string; label: string; badge?: number; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: "white", border: "1.5px solid #e2e8f0", borderRadius: 16,
      padding: "16px 8px", display: "flex", flexDirection: "column", alignItems: "center",
      gap: 6, cursor: "pointer", position: "relative", width: "100%",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      {!!badge && badge > 0 && (
        <div style={{ position: "absolute", top: 8, right: 8, background: RED, color: "white", borderRadius: "50%", minWidth: 18, height: 18, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {badge > 99 ? "99+" : badge}
        </div>
      )}
      <div style={{ fontSize: 26 }}>{icon}</div>
      <div style={{ color: "#1e293b", fontSize: 12, fontWeight: 600 }}>{label}</div>
    </button>
  );
}

export default function AppAgentDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const canHQ = isHQ(user);
  const [unread, setUnread] = useState(0);
  const [recentMsgs, setRecentMsgs] = useState<{ author: string; text: string; time: string; cid: string }[]>([]);
  const firstName = user?.name?.split(" ")[0] || "Agent";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    if (!user?.email) return;
    const load = async () => {
      try {
        const resp = await fetch("/api/agent/inbox?limit=100", {
          cache: "no-store",
          headers: { "x-user-email": user.email!, "cache-control": "no-store" },
        });
        if (!resp.ok) return;
        const data = await resp.json();
        const rows: any[] = data.messages || data.data || [];
        const lastSeen = localStorage.getItem("zeniva_inbox_last_seen")
          ? new Date(localStorage.getItem("zeniva_inbox_last_seen")!)
          : new Date(0);
        const clientRows = rows.filter(r => (r.sender_role || r.senderRole) === "client");
        setUnread(clientRows.filter(r => new Date(r.created_at || r.createdAt) > lastSeen).length);
        const recent = clientRows
          .sort((a, b) => new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime())
          .slice(0, 5)
          .map(r => {
            const cids: string[] = Array.isArray(r.channel_ids) ? r.channel_ids : [r.channel_id || "hq"];
            const cid = cids.find(c => c !== "hq") || "hq";
            const diff = (Date.now() - new Date(r.created_at || r.createdAt).getTime()) / 1000;
            const time = diff < 60 ? "now" : diff < 3600 ? `${Math.floor(diff/60)}m` : diff < 86400 ? `${Math.floor(diff/3600)}h` : new Date(r.created_at || r.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric"});
            return { author: r.author || r.full_name || "Client", text: r.message || "", time, cid };
          });
        setRecentMsgs(recent);
      } catch {}
    };
    load();
    const iv = setInterval(load, 15000);
    return () => clearInterval(iv);
  }, [user?.email]);

  return (
    <div style={{ minHeight: "100dvh", background: "#f8fafc", color: "#1e293b", fontFamily: "inherit" }}>
      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "20px 20px 16px", paddingTop: "max(20px, env(safe-area-inset-top))" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#64748b", fontSize: 13 }}>{greeting},</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginTop: 1 }}>{firstName} ✈️</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: "6px 12px" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#15803d" }}>ONLINE</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {/* Unread alert */}
        {unread > 0 && (
          <button onClick={() => router.push("/agent/chat")} style={{
            width: "100%", background: "#fef2f2", border: "1.5px solid #fecaca",
            borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center",
            gap: 12, cursor: "pointer", marginBottom: 16,
          }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: RED, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, color: "white" }}>
              💬
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ color: "#991b1b", fontWeight: 700, fontSize: 15 }}>{unread} new message{unread !== 1 ? "s" : ""}</div>
              <div style={{ color: "#b91c1c", fontSize: 13 }}>Tap to reply →</div>
            </div>
          </button>
        )}

        {/* Quick actions */}
        <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Quick Access</div>
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
          <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px 10px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Recent Messages</div>
              <button onClick={() => router.push("/agent/chat")} style={{ background: "none", border: "none", color: BLUE, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>View all →</button>
            </div>
            {recentMsgs.map((msg, i) => {
              const initials = msg.author.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
              const colors = ["#6366f1", BLUE, "#10b981", "#f59e0b", RED];
              const color = colors[msg.author.charCodeAt(0) % colors.length];
              return (
                <button key={i} onClick={() => router.push(`/agent/chat?channel=${encodeURIComponent(msg.cid)}&label=${encodeURIComponent(msg.author)}`)} style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%",
                  padding: "12px 16px", background: "transparent", border: "none",
                  borderBottom: i < recentMsgs.length - 1 ? "1px solid #f1f5f9" : "none",
                  cursor: "pointer", textAlign: "left",
                }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{initials || "?"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#0f172a", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{msg.author}</div>
                    <div style={{ color: "#64748b", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{msg.text}</div>
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: 11, flexShrink: 0 }}>{msg.time}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* AI Agents */}
        <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>AI Agents</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {AI_AGENTS.map(agent => (
            <div key={agent.name} style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${agent.color}18`, border: `1.5px solid ${agent.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{agent.icon}</div>
                <div style={{ color: "#0f172a", fontWeight: 700, fontSize: 13 }}>{agent.name}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: agent.status === "live" ? GREEN : "#f59e0b" }} />
                <div style={{ fontSize: 11, color: agent.status === "live" ? "#15803d" : "#92400e", fontWeight: 700, textTransform: "uppercase" }}>{agent.status}</div>
              </div>
              <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 3 }}>{agent.role}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: "calc(100px + env(safe-area-inset-bottom))" }} />
    </div>
  );
}
