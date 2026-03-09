"use client";
/**
 * AppAgentInbox — Mobile-first agent messaging
 * Airbnb Hosting style: List view → tap → conversation detail
 * No horizontal scrolling, always-visible reply bar, proper unread states
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, isHQ } from "../lib/authStore";

const GOLD = "#E6B85A";
const BLUE = "#0F6CF5";
const BG = "#030812";
const CARD = "rgba(255,255,255,0.04)";
const BORDER = "rgba(255,255,255,0.08)";

type Msg = {
  id: string;
  role: string;
  author: string;
  text: string;
  createdAt: string;
  email?: string;
  phone?: string;
};

type Conv = {
  id: string;
  label: string;
  lastMsg: string;
  lastTime: string;
  unread: number;
  closed: boolean;
  clientEmail?: string;
  clientPhone?: string;
};

const CLOSED_MSG = "__CONVERSATION_CLOSED__";
const REOPENED_MSG = "__CONVERSATION_REOPENED__";

function timeAgo(iso: string) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const colors = ["#6366f1","#0F6CF5","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#ec4899"];
  const color = colors[name.charCodeAt(0) % colors.length];
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color, display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontWeight: 700, fontSize: size * 0.4, flexShrink: 0,
    }}>{initials || "?"}</div>
  );
}

export default function AppAgentInbox() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const canHQ = isHQ(user);

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
  const seenIds = useRef<Set<string>>(new Set());

  // scroll to bottom of messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, activeId]);

  // Build conversations from raw messages
  const buildConvs = useCallback((rows: any[]) => {
    const channelMap: Record<string, Msg[]> = {};

    rows.forEach((row) => {
      const cids: string[] = Array.isArray(row.channel_ids) ? row.channel_ids : [row.channel_id || "hq"];
      const msg: Msg = {
        id: String(row.id || row.created_at),
        role: row.sender_role || row.senderRole || "client",
        author: row.author || row.full_name || "Client",
        text: row.message || "",
        createdAt: row.created_at || row.createdAt || new Date().toISOString(),
        email: row.email,
        phone: row.phone,
      };
      cids.forEach(cid => {
        if (!channelMap[cid]) channelMap[cid] = [];
        if (!channelMap[cid].some(m => m.id === msg.id)) {
          channelMap[cid].push(msg);
        }
      });
    });

    // Sort messages
    Object.keys(channelMap).forEach(cid => {
      channelMap[cid].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });

    setMsgs(prev => {
      const next = { ...prev };
      Object.entries(channelMap).forEach(([cid, newMsgs]) => {
        const existing = prev[cid] || [];
        const existingIds = new Set(existing.map(m => m.id));
        const toAdd = newMsgs.filter(m => !existingIds.has(m.id));
        if (toAdd.length > 0) {
          next[cid] = [...existing, ...toAdd].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }
      });
      return next;
    });

    // Build conversation list (exclude "hq" global channel)
    const convMap: Record<string, Conv> = {};
    Object.entries(channelMap).forEach(([cid, messages]) => {
      if (cid === "hq") return;
      const clientMsgs = messages.filter(m => m.role === "client" || m.role === "lina");
      const lastMsg = messages.filter(m => m.text !== CLOSED_MSG && m.text !== REOPENED_MSG).slice(-1)[0];
      const closed = messages.some(m => m.text === CLOSED_MSG) && !messages.slice().reverse().find(m => m.text === REOPENED_MSG || m.text === CLOSED_MSG)?.text?.includes("REOPENED");
      
      // Check closed state properly
      let isClosed = false;
      const closableTexts = messages.filter(m => m.text === CLOSED_MSG || m.text === REOPENED_MSG);
      if (closableTexts.length > 0) {
        isClosed = closableTexts[closableTexts.length - 1].text === CLOSED_MSG;
      }

      const clientMsg = messages.find(m => m.role === "client");
      const label = clientMsg?.author || cid.replace(/^acct-|^agent-|^contact-/g, "").replace(/-/g, " ").split(" ").slice(0, 2).join(" ");
      const unread = activeIdRef.current === cid ? 0 : clientMsgs.filter(m => !seenIds.current.has(m.id)).length;

      convMap[cid] = {
        id: cid,
        label: label || "Client",
        lastMsg: lastMsg?.text || "",
        lastTime: lastMsg?.createdAt || messages[0]?.createdAt || new Date().toISOString(),
        unread,
        closed: isClosed,
        clientEmail: clientMsg?.email,
        clientPhone: clientMsg?.phone,
      };
    });

    // Sort convs: unread first, then by time
    const sorted = Object.values(convMap).sort((a, b) => {
      if (a.unread !== b.unread) return b.unread - a.unread;
      return new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime();
    });

    setConvs(sorted);
    setLoading(false);
  }, []);

  // Poll inbox
  useEffect(() => {
    if (!user?.email) return;
    let active = true;

    const fetchInbox = async () => {
      try {
        const resp = await fetch("/api/agent/inbox?limit=200", {
          cache: "no-store",
          headers: { "x-user-email": user.email!, "cache-control": "no-store" },
        });
        if (!resp.ok) return;
        const data = await resp.json();
        const rows = data.messages || data.data || [];
        if (active) buildConvs(rows);
      } catch {}
    };

    fetchInbox();
    const iv = setInterval(() => { if (active) fetchInbox(); }, 5000);
    return () => { active = false; clearInterval(iv); };
  }, [user?.email, buildConvs]);

  // Mark as read when opening a conversation
  const openConv = (id: string) => {
    activeIdRef.current = id;
    setActiveId(id);
    setConvs(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    // Mark all messages in this conv as seen
    (msgs[id] || []).forEach(m => seenIds.current.add(m.id));
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const closeConv = () => {
    activeIdRef.current = null;
    setActiveId(null);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !activeId || sending) return;
    setInput("");
    setSending(true);

    const id = crypto.randomUUID?.() || `local-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const newMsg: Msg = { id, role: "hq", author: user?.name || "Agent", text, createdAt };

    setMsgs(prev => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), newMsg],
      hq: [...(prev.hq || []), newMsg],
    }));

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (user?.email) headers["x-user-email"] = user.email;
      await fetch("/api/agent/requests", {
        method: "POST",
        headers,
        body: JSON.stringify({
          id, createdAt,
          channelIds: [activeId, "hq"],
          message: text,
          author: user?.name || "Agent",
          senderRole: "hq",
          source: "agent-chat",
          sourcePath: "/agent/chat",
        }),
      });
    } catch {}
    setSending(false);
  };

  const handleClose = async () => {
    if (!activeId || closing) return;
    setClosing(true);
    const id = crypto.randomUUID?.() || `local-${Date.now()}`;
    const createdAt = new Date().toISOString();

    await fetch("/api/agent/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(user?.email ? { "x-user-email": user.email } : {}) },
      body: JSON.stringify({ id, createdAt, channelIds: [activeId, "hq"], message: CLOSED_MSG, author: user?.name || "Agent", senderRole: "system", source: "agent-chat", sourcePath: "/agent/chat" }),
    }).catch(() => {});

    setConvs(prev => prev.map(c => c.id === activeId ? { ...c, closed: true } : c));
    setClosing(false);
  };

  const handleReopen = async () => {
    if (!activeId || closing) return;
    setClosing(true);
    const id = crypto.randomUUID?.() || `local-${Date.now()}`;
    const createdAt = new Date().toISOString();

    await fetch("/api/agent/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(user?.email ? { "x-user-email": user.email } : {}) },
      body: JSON.stringify({ id, createdAt, channelIds: [activeId, "hq"], message: REOPENED_MSG, author: user?.name || "Agent", senderRole: "system", source: "agent-chat", sourcePath: "/agent/chat" }),
    }).catch(() => {});

    setConvs(prev => prev.map(c => c.id === activeId ? { ...c, closed: false } : c));
    setClosing(false);
  };

  const activeConv = convs.find(c => c.id === activeId);
  const activeMessages = (msgs[activeId || ""] || []).filter(m => m.text !== CLOSED_MSG && m.text !== REOPENED_MSG);
  const isClosed = activeConv?.closed ?? false;
  const totalUnread = convs.reduce((acc, c) => acc + c.unread, 0);

  // ─── CONVERSATION VIEW ───────────────────────────────────────────────────────
  if (activeId) {
    return (
      <div style={{ position: "fixed", inset: 0, background: BG, display: "flex", flexDirection: "column", zIndex: 100 }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
          paddingTop: "max(12px, env(safe-area-inset-top))",
          background: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${BORDER}`,
          flexShrink: 0,
        }}>
          <button onClick={closeConv} style={{ background: "none", border: "none", color: BLUE, fontSize: 24, cursor: "pointer", padding: "4px 8px 4px 0" }}>
            ←
          </button>
          {activeConv && <Avatar name={activeConv.label} size={38} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "white", fontWeight: 700, fontSize: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {activeConv?.label || "Client"}
            </div>
            {activeConv?.clientEmail && (
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {activeConv.clientEmail}
              </div>
            )}
          </div>
          {/* Close/Reopen button */}
          <button
            onClick={isClosed ? handleReopen : handleClose}
            disabled={closing}
            style={{
              background: isClosed ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.12)",
              border: `1px solid ${isClosed ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.25)"}`,
              borderRadius: 20, padding: "6px 14px", color: isClosed ? "#10b981" : "#ef4444",
              fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0,
            }}
          >
            {closing ? "..." : isClosed ? "Reopen" : "Resolve ✓"}
          </button>
        </div>

        {/* Closed banner */}
        {isClosed && (
          <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", margin: "8px 12px", borderRadius: 10, padding: "10px 14px", textAlign: "center", color: "#10b981", fontSize: 13, fontWeight: 600 }}>
            ✅ Conversation resolved
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {activeMessages.length === 0 && (
            <div style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 60, fontSize: 15 }}>
              No messages yet
            </div>
          )}
          {activeMessages.map(m => {
            const isMe = m.role === "hq" || m.role === "agent";
            const isLina = m.role === "lina";
            const isSystem = m.role === "system";
            if (isSystem) return null;

            return (
              <div key={m.id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", alignItems: "flex-end", gap: 8 }}>
                {!isMe && <Avatar name={isLina ? "Lina" : m.author} size={32} />}
                <div style={{ maxWidth: "75%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", gap: 2 }}>
                  {!isMe && (
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", paddingLeft: 4 }}>
                      {isLina ? "Lina AI" : m.author}
                    </div>
                  )}
                  <div style={{
                    padding: "10px 14px", borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: isMe ? `linear-gradient(135deg, ${BLUE}, #1a7fff)` : isLina ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.08)",
                    border: isMe ? "none" : `1px solid ${BORDER}`,
                    color: "white", fontSize: 15, lineHeight: 1.5, wordBreak: "break-word",
                  }}>
                    {m.text}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", paddingLeft: 4, paddingRight: 4 }}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Reply input */}
        <div style={{
          padding: "12px 16px",
          paddingBottom: "max(16px, env(safe-area-inset-bottom))",
          background: "rgba(255,255,255,0.03)", borderTop: `1px solid ${BORDER}`,
          flexShrink: 0,
        }}>
          {isClosed ? (
            <div style={{ textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 13, padding: "8px 0" }}>
              Conversation closed — tap Reopen to reply
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type your reply…"
                rows={1}
                style={{
                  flex: 1, background: "rgba(255,255,255,0.07)", border: `1px solid ${BORDER}`,
                  borderRadius: 20, padding: "12px 16px", color: "white", fontSize: 15,
                  resize: "none", outline: "none", maxHeight: 120, lineHeight: 1.4,
                  fontFamily: "inherit",
                }}
                onInput={e => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = "auto";
                  t.style.height = Math.min(t.scrollHeight, 120) + "px";
                }}
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                style={{
                  width: 48, height: 48, borderRadius: "50%", border: "none", flexShrink: 0,
                  background: input.trim() ? BLUE : "rgba(255,255,255,0.1)",
                  color: "white", fontSize: 20, cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", transition: "background 0.2s",
                }}
              >
                {sending ? "…" : "↑"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── CONVERSATION LIST ───────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100dvh", background: BG, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px 12px",
        paddingTop: "max(16px, env(safe-area-inset-top))",
        borderBottom: `1px solid ${BORDER}`, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "white", fontSize: 24, fontWeight: 800 }}>
              Messages
              {totalUnread > 0 && (
                <span style={{ marginLeft: 10, background: "#ef4444", color: "white", borderRadius: 12, fontSize: 13, fontWeight: 700, padding: "2px 8px" }}>
                  {totalUnread}
                </span>
              )}
            </div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 2 }}>
              {convs.length} conversation{convs.length !== 1 ? "s" : ""}
            </div>
          </div>
          <button
            onClick={() => router.push("/agent")}
            style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "8px 14px", color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            Dashboard
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {loading && (
          <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 15 }}>
            Loading messages…
          </div>
        )}
        {!loading && convs.length === 0 && (
          <div style={{ padding: 60, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 16 }}>No messages yet</div>
            <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, marginTop: 6 }}>Client messages will appear here</div>
          </div>
        )}
        {convs.map((conv, i) => (
          <button
            key={conv.id}
            onClick={() => openConv(conv.id)}
            style={{
              display: "flex", alignItems: "center", gap: 14, width: "100%",
              padding: "16px 20px", background: "transparent", border: "none",
              borderBottom: `1px solid ${BORDER}`, cursor: "pointer",
              textAlign: "left", transition: "background 0.15s",
              position: "relative",
            }}
            onTouchStart={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
            onTouchEnd={e => (e.currentTarget.style.background = "transparent")}
          >
            {/* Avatar with closed indicator */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <Avatar name={conv.label} size={52} />
              {conv.closed && (
                <div style={{
                  position: "absolute", bottom: 0, right: 0, width: 16, height: 16,
                  background: "#10b981", borderRadius: "50%", border: "2px solid #030812",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, color: "white",
                }}>✓</div>
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ color: conv.unread > 0 ? "white" : "rgba(255,255,255,0.75)", fontWeight: conv.unread > 0 ? 700 : 500, fontSize: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "70%" }}>
                  {conv.label}
                </div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, flexShrink: 0, marginLeft: 8 }}>
                  {timeAgo(conv.lastTime)}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ color: conv.unread > 0 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)", fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "85%" }}>
                  {conv.lastMsg || "No messages"}
                </div>
                {conv.unread > 0 && (
                  <div style={{ background: BLUE, color: "white", borderRadius: "50%", minWidth: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>
                    {conv.unread}
                  </div>
                )}
              </div>
              {conv.clientEmail && (
                <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, marginTop: 2 }}>
                  {conv.clientEmail}
                </div>
              )}
            </div>

            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 18, flexShrink: 0 }}>›</div>
          </button>
        ))}
        {/* Bottom padding for nav */}
        <div style={{ height: "calc(88px + env(safe-area-inset-bottom))" }} />
      </div>
    </div>
  );
}
