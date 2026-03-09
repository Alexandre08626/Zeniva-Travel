"use client";
/**
 * AppAgentInbox v3 — White mobile agent inbox (DEFINITIVE)
 * - seenIds persisted in localStorage (survives remount/navigation)
 * - Polling every 5s with smart dedup
 * - Airbnb Hosting style: List → Conversation
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../lib/authStore";

const BLUE = "#0F6CF5";
const GREEN = "#10b981";
const RED = "#ef4444";
const SEEN_KEY = "zeniva_agent_seen_v2";

// ── localStorage helpers ─────────────────────────────────────────────────────
function loadSeen(): Set<string> {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(SEEN_KEY) : null;
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch { return new Set(); }
}
function saveSeen(set: Set<string>) {
  try {
    // keep only last 2000 to avoid localStorage bloat
    const arr = Array.from(set).slice(-2000);
    localStorage.setItem(SEEN_KEY, JSON.stringify(arr));
  } catch {}
}
function markSeen(set: Set<string>, ids: string[]) {
  ids.forEach(id => set.add(id));
  saveSeen(set);
}

// ── Types ────────────────────────────────────────────────────────────────────
type Msg = { id: string; role: string; author: string; text: string; createdAt: string; email?: string };
type Conv = { id: string; label: string; lastMsg: string; lastTime: string; unread: number; closed: boolean; clientEmail?: string };
const CLOSED_MSG = "__CONVERSATION_CLOSED__";
const REOPENED_MSG = "__CONVERSATION_REOPENED__";

// ── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function cleanLabel(cid: string) {
  return cid
    .replace(/^acct-|^contact-|^agent-alexandre-|^agent-/g, "")
    .replace(/-trip-[a-z0-9]+$/i, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim() || "Client";
}
const AVATAR_COLORS = ["#6366f1", BLUE, "#10b981", "#f59e0b", RED, "#8b5cf6", "#06b6d4", "#ec4899"];
function Avatar({ name, size = 44, dot }: { name: string; size?: number; dot?: "green" | "red" }) {
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: size * 0.38 }}>
        {initials || "?"}
      </div>
      {dot && <div style={{ position: "absolute", bottom: 1, right: 1, width: 11, height: 11, borderRadius: "50%", background: dot === "green" ? GREEN : RED, border: "2px solid white" }} />}
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────
export default function AppAgentInbox() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [convs, setConvs] = useState<Conv[]>([]);
  const [msgs, setMsgs] = useState<Record<string, Msg[]>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const activeIdRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Persist seenIds across remounts via localStorage
  const seenIds = useRef<Set<string>>(new Set());

  // Initialize from localStorage once on mount
  useEffect(() => { seenIds.current = loadSeen(); }, []);

  // ── iOS keyboard handler — resize container when keyboard opens ───────────
  useEffect(() => {
    if (!activeId || typeof window === "undefined") return;
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      if (containerRef.current) {
        containerRef.current.style.height = vv.height + "px";
        containerRef.current.style.top = vv.pageTop + "px";
      }
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    };
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    update();
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [activeId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, activeId]);

  // ── Parse API rows into channelMap ─────────────────────────────────────────
  const buildConvs = useCallback((rows: any[]) => {
    const channelMap: Record<string, Msg[]> = {};
    rows.forEach(row => {
      const cids: string[] = Array.isArray(row.channel_ids) ? row.channel_ids : [row.channel_id || "hq"];
      const msgId = String(row.id || row.created_at);
      const msg: Msg = {
        id: msgId,
        role: row.sender_role || row.senderRole || "client",
        author: row.author || row.full_name || "Client",
        text: row.message || "",
        createdAt: row.created_at || row.createdAt || new Date().toISOString(),
        email: row.email,
      };
      cids.forEach(cid => {
        if (!channelMap[cid]) channelMap[cid] = [];
        if (!channelMap[cid].some(m => m.id === msgId)) channelMap[cid].push(msg);
      });
    });
    Object.values(channelMap).forEach(arr => arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));

    // Merge into msgs state (append-only, no duplicates)
    setMsgs(prev => {
      const next = { ...prev };
      Object.entries(channelMap).forEach(([cid, incoming]) => {
        const existing = prev[cid] || [];
        const existingIds = new Set(existing.map(m => m.id));
        const toAdd = incoming.filter(m => !existingIds.has(m.id));
        if (toAdd.length) next[cid] = [...existing, ...toAdd].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      });
      return next;
    });

    // Mark active channel's new messages as seen immediately
    const curActive = activeIdRef.current;
    if (curActive && channelMap[curActive]) {
      const newIds = channelMap[curActive].map(m => m.id);
      markSeen(seenIds.current, newIds);
    }

    // Build conversation list
    const convList: Conv[] = [];
    Object.entries(channelMap).forEach(([cid, messages]) => {
      if (cid === "hq") return;
      const visibleMsgs = messages.filter(m => m.text !== CLOSED_MSG && m.text !== REOPENED_MSG);
      const clientMsg = messages.find(m => m.role === "client");
      const lastMsg = visibleMsgs.slice(-1)[0];
      const systemMsgs = messages.filter(m => m.text === CLOSED_MSG || m.text === REOPENED_MSG);
      const isClosed = systemMsgs.length > 0 && systemMsgs.slice(-1)[0].text === CLOSED_MSG;
      const label = clientMsg?.author || cleanLabel(cid);
      const clientMsgs = messages.filter(m => m.role === "client");
      // KEY FIX: unread = client messages NOT in seenIds (persisted in localStorage)
      const unread = curActive === cid ? 0 : clientMsgs.filter(m => !seenIds.current.has(m.id)).length;
      convList.push({
        id: cid, label, closed: isClosed,
        lastMsg: lastMsg?.text || "",
        lastTime: lastMsg?.createdAt || messages[0]?.createdAt || new Date().toISOString(),
        unread,
        clientEmail: clientMsg?.email,
      });
    });
    convList.sort((a, b) => {
      if (a.unread !== b.unread) return b.unread - a.unread;
      return new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime();
    });
    setConvs(convList);
    setLoading(false);
  }, []);

  // ── Polling ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.email) return;
    let alive = true;
    const fetch_ = async () => {
      try {
        const r = await fetch("/api/agent/inbox?limit=200", {
          cache: "no-store",
          headers: { "x-user-email": user.email!, "cache-control": "no-store" },
        });
        if (!r.ok) return;
        const data = await r.json();
        if (alive) buildConvs(data.messages || data.data || []);
      } catch {}
    };
    fetch_();
    const iv = setInterval(() => { if (alive) fetch_(); }, 5000);
    return () => { alive = false; clearInterval(iv); };
  }, [user?.email, buildConvs]);

  // ── Open conversation — mark ALL messages as seen ─────────────────────────
  const openConv = (id: string) => {
    activeIdRef.current = id;
    setActiveId(id);
    // Mark all current msgs in this channel as seen (persisted to localStorage)
    const currentMsgs = msgs[id] || [];
    markSeen(seenIds.current, currentMsgs.map(m => m.id));
    // Update unread badge to 0 immediately
    setConvs(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    setTimeout(() => inputRef.current?.focus(), 400);
  };

  const goBack = () => {
    activeIdRef.current = null;
    setActiveId(null);
    setInput("");
  };

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text || !activeId || sending) return;
    setInput("");
    setSending(true);
    const id = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : `local-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const outMsg: Msg = { id, role: "hq", author: user?.name || "Agent", text, createdAt };
    setMsgs(prev => ({ ...prev, [activeId]: [...(prev[activeId] || []), outMsg] }));
    // Mark our own msg as seen
    markSeen(seenIds.current, [id]);
    try {
      await fetch("/api/agent/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(user?.email ? { "x-user-email": user.email } : {}) },
        body: JSON.stringify({ id, createdAt, channelIds: [activeId, "hq"], message: text, author: user?.name || "Agent", senderRole: "hq", source: "agent-chat", sourcePath: "/agent/chat" }),
      });
    } catch {}
    setSending(false);
  };

  // ── Resolve / Reopen ───────────────────────────────────────────────────────
  const sendSystem = async (text: string, isClosed: boolean) => {
    if (!activeId || closing) return;
    setClosing(true);
    const id = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : `local-${Date.now()}`;
    await fetch("/api/agent/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(user?.email ? { "x-user-email": user.email } : {}) },
      body: JSON.stringify({ id, createdAt: new Date().toISOString(), channelIds: [activeId, "hq"], message: text, author: user?.name || "Agent", senderRole: "system", source: "agent-chat", sourcePath: "/agent/chat" }),
    }).catch(() => {});
    setConvs(prev => prev.map(c => c.id === activeId ? { ...c, closed: isClosed } : c));
    setClosing(false);
  };

  const activeConv = convs.find(c => c.id === activeId);
  const activeMessages = (msgs[activeId || ""] || []).filter(m => m.text !== CLOSED_MSG && m.text !== REOPENED_MSG);
  const isClosed = activeConv?.closed ?? false;
  const totalUnread = convs.reduce((s, c) => s + c.unread, 0);

  // ══════════════════════════════════════════════════════════════════════════
  //  CONVERSATION VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (activeId) {
    return (
      <div ref={containerRef} style={{ position: "fixed", top: 0, left: 0, right: 0, height: "100dvh", background: "#f8fafc", display: "flex", flexDirection: "column", zIndex: 100 }}>
        {/* Header */}
        <div style={{ background: "white", borderBottom: "1.5px solid #e2e8f0", padding: "0 16px 12px", paddingTop: "max(12px, env(safe-area-inset-top))", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <button onClick={goBack} style={{ background: "none", border: "none", color: BLUE, fontSize: 28, cursor: "pointer", padding: "8px 8px 0 0", lineHeight: 1 }}>←</button>
          <Avatar name={activeConv?.label || "?"} size={38} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#0f172a", fontWeight: 700, fontSize: 16, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeConv?.label || "Client"}</div>
            {activeConv?.clientEmail && <div style={{ color: "#94a3b8", fontSize: 12 }}>{activeConv.clientEmail}</div>}
          </div>
          <button
            onClick={() => sendSystem(isClosed ? REOPENED_MSG : CLOSED_MSG, !isClosed)}
            disabled={closing}
            style={{ flexShrink: 0, background: isClosed ? "#f0fdf4" : "#fef2f2", border: `1.5px solid ${isClosed ? "#86efac" : "#fca5a5"}`, borderRadius: 20, padding: "7px 14px", color: isClosed ? "#15803d" : "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            {closing ? "…" : isClosed ? "Reopen" : "Resolve ✓"}
          </button>
        </div>

        {isClosed && (
          <div style={{ background: "#f0fdf4", borderBottom: "1px solid #bbf7d0", padding: "8px 16px", textAlign: "center", color: "#15803d", fontSize: 13, fontWeight: 600 }}>
            ✅ Resolved — tap "Reopen" to reply
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 10, WebkitOverflowScrolling: "touch" }}>
          {activeMessages.length === 0 && (
            <div style={{ textAlign: "center", color: "#94a3b8", marginTop: 60, fontSize: 15 }}>No messages yet</div>
          )}
          {activeMessages.map(m => {
            const isMe = m.role === "hq" || m.role === "agent";
            return (
              <div key={m.id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", alignItems: "flex-end", gap: 8 }}>
                {!isMe && <Avatar name={m.author} size={28} />}
                <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", gap: 2 }}>
                  {!isMe && <div style={{ fontSize: 11, color: "#94a3b8", paddingLeft: 4 }}>{m.author}</div>}
                  <div style={{
                    padding: "10px 14px",
                    borderRadius: isMe ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                    background: isMe ? BLUE : "white",
                    border: isMe ? "none" : "1.5px solid #e2e8f0",
                    color: isMe ? "white" : "#0f172a",
                    fontSize: 15, lineHeight: 1.5,
                    wordBreak: "break-word",
                    boxShadow: isMe ? "0 2px 8px rgba(15,108,245,0.25)" : "0 1px 3px rgba(0,0,0,0.06)",
                  }}>
                    {m.text}
                  </div>
                  <div style={{ fontSize: 10, color: "#94a3b8", paddingLeft: 4, paddingRight: 4 }}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Reply bar */}
        <div style={{ background: "white", borderTop: "1.5px solid #e2e8f0", padding: "12px 16px", paddingBottom: "max(20px, env(safe-area-inset-bottom))", flexShrink: 0, position: "relative", zIndex: 2 }}>
          {isClosed ? (
            <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: "8px 0" }}>Conversation resolved — tap Reopen to reply</div>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                onFocus={() => {
                  setTimeout(() => {
                    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
                    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                  }, 350);
                }}
                placeholder="Write a reply…"
                rows={1}
                style={{ flex: 1, background: "#f1f5f9", border: "1.5px solid #e2e8f0", borderRadius: 22, padding: "11px 16px", color: "#0f172a", fontSize: 16, resize: "none", outline: "none", maxHeight: 120, lineHeight: 1.4, fontFamily: "inherit" }}
                onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 120) + "px"; }}
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                style={{ width: 46, height: 46, borderRadius: "50%", border: "none", background: input.trim() ? BLUE : "#e2e8f0", color: input.trim() ? "white" : "#94a3b8", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}
              >
                {sending ? "…" : "↑"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  CONVERSATION LIST
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight: "100dvh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ background: "white", borderBottom: "1.5px solid #e2e8f0", padding: "16px 20px 14px", paddingTop: "max(16px, env(safe-area-inset-top))" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>Messages</span>
              {totalUnread > 0 && (
                <span style={{ background: RED, color: "white", borderRadius: 12, fontSize: 13, fontWeight: 700, padding: "2px 9px" }}>
                  {totalUnread}
                </span>
              )}
            </div>
            <div style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>
              {convs.length} conversation{convs.length !== 1 ? "s" : ""}
            </div>
          </div>
          <button
            onClick={() => router.push("/agent")}
            style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 12, padding: "8px 14px", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            ← Home
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ background: "white", margin: "12px 16px 0", borderRadius: 20, border: "1.5px solid #e2e8f0", overflow: "hidden" }}>
        {loading && (
          <div style={{ padding: 50, textAlign: "center", color: "#94a3b8", fontSize: 15 }}>Loading…</div>
        )}
        {!loading && convs.length === 0 && (
          <div style={{ padding: 60, textAlign: "center" }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>💬</div>
            <div style={{ color: "#475569", fontSize: 17, fontWeight: 700 }}>No messages yet</div>
            <div style={{ color: "#94a3b8", fontSize: 14, marginTop: 6 }}>Client messages will appear here</div>
          </div>
        )}
        {convs.map((conv, i) => (
          <button
            key={conv.id}
            onClick={() => openConv(conv.id)}
            style={{
              display: "flex", alignItems: "center", gap: 14, width: "100%",
              padding: "16px 18px",
              background: conv.unread > 0 ? "#eff6ff" : "transparent",
              border: "none",
              borderBottom: i < convs.length - 1 ? "1px solid #f1f5f9" : "none",
              cursor: "pointer", textAlign: "left",
            }}
          >
            <Avatar name={conv.label} size={52} dot={conv.closed ? "green" : undefined} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                <div style={{ color: "#0f172a", fontWeight: conv.unread > 0 ? 700 : 500, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>
                  {conv.label}
                </div>
                <div style={{ color: "#94a3b8", fontSize: 12, flexShrink: 0, marginLeft: 8 }}>{timeAgo(conv.lastTime)}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ color: conv.unread > 0 ? "#374151" : "#94a3b8", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "85%", fontWeight: conv.unread > 0 ? 500 : 400 }}>
                  {conv.lastMsg || "No messages"}
                </div>
                {conv.unread > 0 && (
                  <div style={{ background: BLUE, color: "white", borderRadius: "50%", minWidth: 21, height: 21, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>
                    {conv.unread > 9 ? "9+" : conv.unread}
                  </div>
                )}
              </div>
              {conv.clientEmail && (
                <div style={{ color: "#cbd5e1", fontSize: 11, marginTop: 2 }}>{conv.clientEmail}</div>
              )}
            </div>
            <div style={{ color: "#d1d5db", fontSize: 22, flexShrink: 0 }}>›</div>
          </button>
        ))}
      </div>

      <div style={{ height: "calc(100px + env(safe-area-inset-bottom))" }} />
    </div>
  );
}
