"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, isHQ } from "../lib/authStore";

const BLUE = "#0F6CF5";
const GREEN = "#10b981";
const RED = "#ef4444";
const GOLD = "#E6B85A";
const SEEN_KEY = "zeniva_agent_seen_v2";

const AI_AGENTS = [
  { name: "Lina",  role: "AI Concierge",    color: "#6366f1", icon: "✈️", status: "live",   photo: "/agents/lina.png"  },
  { name: "Marco", role: "Lead Hunter",      color: "#ef4444", icon: "🎯", status: "live",   photo: "/agents/marco.png" },
  { name: "Sofia", role: "Email Marketing",  color: "#ec4899", icon: "📧", status: "active", photo: "/agents/sofia.png" },
  { name: "Noah",  role: "Follow-up",        color: "#f59e0b", icon: "🔔", status: "active", photo: "/agents/noah.png"  },
  { name: "Luna",  role: "Voice & SMS",      color: "#06b6d4", icon: "📞", status: "active", photo: "/agents/luna.png"  },
  { name: "Atlas", role: "Cyber Guard",      color: "#64748b", icon: "🛡️", status: "live",   photo: "/agents/atlas.png" },
  { name: "Mia",   role: "Social Media",     color: "#a855f7", icon: "📱", status: "active", photo: "/agents/mia.png"   },
  { name: "Leo",   role: "Analytics",        color: "#8b5cf6", icon: "📊", status: "active", photo: "/agents/leo.png"   },
];

function QBtn({ icon, label, badge, onClick }: { icon: string; label: string; badge?: number; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: "white", border: "1.5px solid #e2e8f0", borderRadius: 18,
      padding: "16px 6px", display: "flex", flexDirection: "column", alignItems: "center",
      gap: 6, cursor: "pointer", position: "relative", width: "100%",
      boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
    }}>
      {!!badge && badge > 0 && (
        <div style={{ position: "absolute", top: 7, right: 7, background: RED, color: "white", borderRadius: "50%", minWidth: 18, height: 18, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {badge > 99 ? "99+" : badge}
        </div>
      )}
      <div style={{ fontSize: 26 }}>{icon}</div>
      <div style={{ color: "#0f172a", fontSize: 11, fontWeight: 600, textAlign: "center" }}>{label}</div>
    </button>
  );
}

export default function AppAgentDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const canHQ = isHQ(user);
  const [unread, setUnread] = useState(0);
  const [convCount, setConvCount] = useState(0);
  const [recentMsgs, setRecentMsgs] = useState<{ author: string; text: string; time: string; cid: string }[]>([]);
  const [showAllMenu, setShowAllMenu] = useState(false);
  const firstName = user?.name?.split(" ")[0] || "Agent";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    if (!user?.email) return;
    const load = async () => {
      try {
        const r = await fetch("/api/agent/inbox?limit=100", { cache: "no-store", headers: { "x-user-email": user.email!, "cache-control": "no-store" } });
        if (!r.ok) return;
        const data = await r.json();
        const rows: any[] = data.messages || data.data || [];
        const chanSet = new Set<string>();
        rows.forEach(row => { (Array.isArray(row.channel_ids) ? row.channel_ids : []).forEach((c: string) => { if (c !== "hq") chanSet.add(c); }); });
        let seenSet: Set<string> = new Set();
        try { const raw = localStorage.getItem(SEEN_KEY); if (raw) seenSet = new Set(JSON.parse(raw) as string[]); } catch {}
        const clientRows = rows.filter(r => (r.sender_role || r.senderRole) === "client");
        setUnread(Math.min(clientRows.filter(r => !seenSet.has(String(r.id || r.created_at))).length, 99));
        setConvCount(chanSet.size);
        const recent = clientRows
          .sort((a, b) => new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime())
          .slice(0, 4)
          .map(r => {
            const cid = (Array.isArray(r.channel_ids) ? r.channel_ids : []).find((c: string) => c !== "hq") || "hq";
            const diff = (Date.now() - new Date(r.created_at || r.createdAt).getTime()) / 1000;
            const time = diff < 60 ? "now" : diff < 3600 ? `${Math.floor(diff / 60)}m` : diff < 86400 ? `${Math.floor(diff / 3600)}h` : new Date(r.created_at || r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
            return { author: r.author || r.full_name || "Client", text: r.message || "", time, cid };
          });
        setRecentMsgs(recent);
      } catch {}
    };
    load();
    const iv = setInterval(load, 20000);
    return () => clearInterval(iv);
  }, [user?.email]);

  const ACOLORS = ["#6366f1", BLUE, GREEN, GOLD, RED, "#8b5cf6", "#06b6d4", "#ec4899"];

  return (
    <div style={{ minHeight: "100dvh", background: "#f8fafc", fontFamily: "inherit", overflowX: "hidden" }}>
      {/* ── HEADER ── */}
      <div style={{ background: "white", borderBottom: "1.5px solid #e2e8f0", padding: "18px 20px 16px", paddingTop: "max(18px, env(safe-area-inset-top))" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#64748b", fontSize: 13 }}>{greeting},</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginTop: 1 }}>{firstName} ✈️</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={async () => {
              try {
                await fetch("/api/push/send", {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "Authorization": "Bearer zeniva-secret-2025" },
                  body: JSON.stringify({ title: "🔔 Notifications actives!", body: "Tu vas recevoir toutes les alertes messages.", url: "/agent/chat", tag: "test" }),
                });
              } catch {}
            }} style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 20, padding: "6px 12px", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#15803d" }}>
              🔔 Test
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 20, padding: "6px 12px" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#15803d" }}>ONLINE</span>
            </div>
          </div>
        </div>
        {/* Stats */}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {[
            { label: "Conversations", val: convCount, color: BLUE },
            { label: "Unread", val: unread, color: unread > 0 ? RED : "#64748b" },
            { label: "Clients", val: convCount, color: GREEN },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "8px 6px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 14px 0", overflowX: "hidden" }}>

        {/* ── PROMO CODE ── */}
        <div style={{ background: "linear-gradient(135deg, rgba(230,184,90,0.12), rgba(230,184,90,0.05))", border: "1.5px solid rgba(230,184,90,0.35)", borderRadius: 18, padding: "14px 18px", marginBottom: 14, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 28, flexShrink: 0 }}>🎁</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#0B1B4D", fontWeight: 800, fontSize: 13, marginBottom: 2 }}>15% OFF — Promo Code</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ background: "#0B1B4D", borderRadius: 8, padding: "4px 12px", color: "#E6B85A", fontWeight: 900, fontSize: 16, letterSpacing: "0.08em", fontFamily: "monospace" }}>WELCOME15</div>
              <button onClick={() => { if (typeof navigator !== "undefined") navigator.clipboard.writeText("WELCOME15"); }}
                style={{ background: "rgba(230,184,90,0.2)", border: "1px solid rgba(230,184,90,0.4)", borderRadius: 8, padding: "4px 10px", color: "#92400e", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                Copy
              </button>
            </div>
            <div style={{ color: "#92400e", fontSize: 11, marginTop: 4 }}>Villa · Yacht · Hotel · Flight · All-inclusive</div>
          </div>
        </div>

        {/* ── UNREAD ALERT ── */}
        {unread > 0 && (
          <button onClick={() => router.push("/agent/chat")} style={{ width: "100%", background: "#fff7ed", border: "1.5px solid #fed7aa", borderRadius: 18, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: RED, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "white", flexShrink: 0 }}>💬</div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ color: "#9a3412", fontWeight: 800, fontSize: 16 }}>{unread} new message{unread !== 1 ? "s" : ""}</div>
              <div style={{ color: "#c2410c", fontSize: 13 }}>Tap to reply →</div>
            </div>
          </button>
        )}

        {/* ── AI AGENTS — PHOTOS WOW ── */}
        <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 20, overflow: "hidden", marginBottom: 14 }}>
          <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>🤖 AI Agents</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: "5px 12px" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#15803d" }}>8 ACTIVE</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "#f1f5f9" }}>
            {AI_AGENTS.map((agent) => (
              <div key={agent.name} style={{ background: "white", padding: "14px 14px", display: "flex", alignItems: "center", gap: 11 }}>
                {/* Real photo with colored border + live pulse */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 16,
                    border: `2.5px solid ${agent.color}`,
                    overflow: "hidden",
                    boxShadow: `0 2px 12px ${agent.color}44`,
                  }}>
                    <img
                      src={agent.photo}
                      alt={agent.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                  {/* Status dot */}
                  <div style={{
                    position: "absolute", bottom: -2, right: -2,
                    width: 14, height: 14, borderRadius: "50%",
                    background: agent.status === "live" ? GREEN : GOLD,
                    border: "2px solid white",
                  }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ color: "#0f172a", fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{agent.name}</div>
                  <div style={{ color: "#94a3b8", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{agent.role}</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 5, background: agent.status === "live" ? "#f0fdf4" : "#fffbeb", borderRadius: 10, padding: "2px 8px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: agent.status === "live" ? "#15803d" : "#92400e", textTransform: "uppercase" }}>
                      {agent.status === "live" ? "● LIVE" : "● ACTIVE"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── QUICK ACCESS ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>Quick Access</div>
          <button onClick={() => setShowAllMenu(true)} style={{ background: BLUE, border: "none", borderRadius: 20, padding: "5px 14px", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>View All ▾</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 10 }}>
          <QBtn icon="💬" label="Inbox" badge={unread} onClick={() => router.push("/agent/chat")} />
          <QBtn icon="👥" label="Clients" onClick={() => router.push("/agent/clients")} />
          <QBtn icon="🎯" label="Leads" onClick={() => router.push("/agent/leads")} />
          <QBtn icon="📋" label="Proposals" onClick={() => router.push("/agent/proposals")} />
        </div>
        {canHQ && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
            <QBtn icon="💰" label="Finance" onClick={() => router.push("/agent/finance")} />
            <QBtn icon="🌐" label="Website" onClick={() => router.push("/")} />
            <QBtn icon="⚙️" label="Settings" onClick={() => router.push("/agent/settings")} />
          </div>
        )}

        {/* ── FULL MENU BOTTOM SHEET ── */}
        {showAllMenu && (
          <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} onClick={() => setShowAllMenu(false)} />
            <div style={{ position: "relative", background: "white", borderRadius: "24px 24px 0 0", padding: "8px 0 40px", maxHeight: "85vh", overflowY: "auto" }}>
              <div style={{ width: 40, height: 4, background: "#e2e8f0", borderRadius: 2, margin: "10px auto 20px" }} />
              <div style={{ padding: "0 20px 12px", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>All Sections</div>
              {[
                { section: "📨 Messages", items: [
                  { icon: "💬", label: "Inbox", sub: "Client conversations", href: "/agent/chat" },
                ]},
                { section: "👥 Clients & Leads", items: [
                  { icon: "👥", label: "Clients", sub: "All client accounts", href: "/agent/clients" },
                  { icon: "🎯", label: "Leads", sub: "Sales pipeline", href: "/agent/leads" },
                  { icon: "📋", label: "Proposals", sub: "Trip proposals", href: "/agent/proposals" },
                ]},
                { section: "🛫 Operations", items: [
                  { icon: "📅", label: "Bookings", sub: "Active reservations", href: "/agent/bookings" },
                  { icon: "🤖", label: "AI Agents", sub: "Automation status", href: "/ai-agents" },
                  { icon: "📝", label: "Forms", sub: "Lead capture forms", href: "/forms/travel" },
                ]},
                ...(canHQ ? [{ section: "💼 HQ Only", items: [
                  { icon: "💰", label: "Finance", sub: "Revenue & invoices", href: "/agent/finance" },
                  { icon: "👔", label: "Agent Team", sub: "Manage agents", href: "/agent/team" },
                  { icon: "⚙️", label: "Settings", sub: "Account & config", href: "/agent/settings" },
                  { icon: "🌐", label: "Website", sub: "View live site", href: "/" },
                ]}] : []),
                { section: "👤 Account", items: [
                  { icon: "🙍", label: "Profile", sub: "Your account", href: "/profile" },
                ]},
              ].map(group => (
                <div key={group.section}>
                  <div style={{ padding: "10px 20px 6px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>{group.section}</div>
                  {group.items.map(item => (
                    <button key={item.href} onClick={() => { setShowAllMenu(false); router.push(item.href); }}
                      style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", padding: "14px 20px", background: "transparent", border: "none", borderBottom: "1px solid #f8fafc", cursor: "pointer", textAlign: "left" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{item.icon}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{item.label}</div>
                        <div style={{ fontSize: 13, color: "#94a3b8" }}>{item.sub}</div>
                      </div>
                      <div style={{ marginLeft: "auto", color: "#cbd5e1", fontSize: 18 }}>›</div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RECENT MESSAGES ── */}
        {recentMsgs.length > 0 && (
          <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 18, overflow: "hidden", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px 10px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Recent Messages</div>
              <button onClick={() => router.push("/agent/chat")} style={{ background: "none", border: "none", color: BLUE, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>View all →</button>
            </div>
            {recentMsgs.map((msg, i) => {
              const color = ACOLORS[msg.author.charCodeAt(0) % ACOLORS.length];
              const initials = msg.author.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
              return (
                <button key={i} onClick={() => router.push(`/agent/chat?channel=${encodeURIComponent(msg.cid)}&label=${encodeURIComponent(msg.author)}`)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 16px", background: "transparent", border: "none", borderBottom: i < recentMsgs.length - 1 ? "1px solid #f8fafc" : "none", cursor: "pointer", textAlign: "left" }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{initials || "?"}</div>
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
      </div>

      <div style={{ height: "calc(100px + env(safe-area-inset-bottom))" }} />
    </div>
  );
}
