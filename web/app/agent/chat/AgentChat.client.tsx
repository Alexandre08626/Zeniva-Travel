"use client";
import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { sendMessageToLina } from "../../../src/lib/linaClient";
import { useAuthStore, isHQ } from "../../../src/lib/authStore";

type MessageRole = "agent" | "hq" | "lina" | "client" | "system";

type ChatMessage = {
  id: string;
  role: MessageRole;
  author: string;
  text: string;
  ts: string;
  createdAt?: string;
  email?: string;
  phone?: string;
  sourcePath?: string;
};

type Channel = {
  id: string;
  label: string;
  scope: string;
  unread: number;
  closed?: boolean;
};

const createLocalId = () => `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const CLOSED_MSG = "__CONVERSATION_CLOSED__";
const REOPENED_MSG = "__CONVERSATION_REOPENED__";

export default function AgentChatClient() {
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const canHQ = isHQ(user);

  const [channelId, setChannelId] = useState("hq");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [sending, setSending] = useState(false);
  const [linaBusy, setLinaBusy] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([
    { id: "hq", label: "📥 All Messages", scope: "Global inbox", unread: 0, closed: false },
  ]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  // Sidebar conversation select mode
  const [sidebarSelectMode, setSidebarSelectMode] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set());
  const [bulkChannelDeleting, setBulkChannelDeleting] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const activeChannelRef = useRef(channelId);
  // Track which message IDs have been seen — fixes "stays unread after opening"
  const seenMsgIds = useRef<Set<string>>(new Set());
  // Track deleted message IDs to prevent them from coming back on reload
  const deletedMsgIds = useRef<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem("agent_deleted_messages");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  }());
  const nonDeletableChannels = useMemo(() => new Set(["hq"]), []);

  // Auto-scroll
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, channelId]);

  // Handle ?channel= param from client page
  useEffect(() => {
    const targetChannel = searchParams?.get("channel");
    const label = searchParams?.get("label") || targetChannel || "Client";
    if (!targetChannel) return;
    setChannels((prev) => {
      if (prev.find((c) => c.id === targetChannel)) return prev;
      return [...prev, { id: targetChannel, label: `💬 ${label}`, scope: "Direct", unread: 0, closed: false }];
    });
    setChannelId(targetChannel);
  }, [searchParams]);

  useEffect(() => {
    setChannels((prev) => prev.map((ch) => (ch.id === channelId ? { ...ch, unread: 0 } : ch)));
    activeChannelRef.current = channelId;
    // Mark all current messages in this channel as seen
    setMessages((prev) => {
      (prev[channelId] || []).forEach((m) => seenMsgIds.current.add(m.id));
      return prev;
    });
  }, [channelId]);

  const buildMessageFromRow = (row: any): ChatMessage => {
    const createdAt = row?.createdAt || row?.created_at || new Date().toISOString();
    return {
      id: String(row?.id || createLocalId()),
      role: (row?.senderRole || row?.sender_role || "client") as MessageRole,
      author: String(row?.author || row?.fullName || row?.full_name || row?.email || "Client"),
      text: String(row?.message || ""),
      ts: new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      createdAt,
      email: row?.email || undefined,
      phone: row?.phone || undefined,
      sourcePath: row?.sourcePath || row?.source_path || undefined,
    };
  };

  // Determine if a channel is closed based on its messages
  const isChannelClosed = (channelMessages: ChatMessage[]): boolean => {
    // Walk backwards to find the last status marker
    for (let i = channelMessages.length - 1; i >= 0; i--) {
      const m = channelMessages[i];
      if (m.role === "system") {
        if (m.text === CLOSED_MSG) return true;
        if (m.text === REOPENED_MSG) return false;
      }
    }
    return false;
  };

  // Poll every 5s
  useEffect(() => {
    if (!user?.email) return;
    let active = true;
    let retryCount = 0;

    const tryFetch = async () => {
      try {
        const headers: Record<string, string> = { "cache-control": "no-store" };
        if (user?.email) headers["x-user-email"] = user.email;

        const resp = await fetch("/api/agent/inbox", { cache: "no-store", headers });
        if (resp.status === 401 && retryCount < 5) {
          retryCount++;
          setTimeout(() => { if (active) void tryFetch(); }, 1500);
          return;
        }
        retryCount = 0;
        const payload = await resp.json().catch(() => ({}));
        if (!resp.ok) return;

        const rows: any[] = payload?.messages || payload?.data || [];
        const channelMap: Record<string, ChatMessage[]> = {};

        rows.forEach((row) => {
          // Filter out email messages - only show chat messages
          const source = String(row?.source || "").toLowerCase();
          if (source.includes("email") || source.includes("notification")) {
            return; // Skip email/notification messages
          }

          const msg = buildMessageFromRow(row);

          // Skip messages that have been deleted by the user
          if (deletedMsgIds.current.has(msg.id)) {
            return;
          }

          const ids: string[] = Array.isArray(row?.channel_ids) ? row.channel_ids : [row?.channel_id || "hq"];
          ids.forEach((cid) => {
            if (!channelMap[cid]) channelMap[cid] = [];
            if (!channelMap[cid].some((m) => m.id === msg.id)) {
              channelMap[cid].push(msg);
            }
          });
        });

        // Sort by date
        Object.keys(channelMap).forEach((cid) => {
          channelMap[cid].sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
        });

        setMessages((prev) => {
          const merged: Record<string, ChatMessage[]> = { ...prev };
          Object.entries(channelMap).forEach(([cid, newMsgs]) => {
            const existing = prev[cid] || [];
            const existingIds = new Set(existing.map((m) => m.id));
            const toAdd = newMsgs.filter((m) => !existingIds.has(m.id));
            merged[cid] = [...existing, ...toAdd].sort(
              (a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
            );
          });
          return merged;
        });

        // Update channels list & unread counts & closed status
        setChannels((prev) => {
          const updated = [...prev];
          const activeId = activeChannelRef.current;
          Object.entries(channelMap).forEach(([cid, msgs]) => {
            if (cid === "hq") return;
            const clientMsgs = msgs.filter((m) => m.role === "client");
            // Clean label: remove all channel prefixes, show real name
            const authorName = clientMsgs[0]?.author;
            const cleanCid = cid
              .replace(/^acct-/, "")
              .replace(/^contact-/, "")
              .replace(/^agent-alexandre-/, "")
              .replace(/^agent-/, "")
              .replace(/-trip-[a-z0-9]+$/, "")
              .replace(/-/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())
              .trim();
            const label = authorName || cleanCid || "Client";
            const existing = updated.find((c) => c.id === cid);
            const closed = isChannelClosed(msgs);
            // FIX: count only messages NOT yet seen (not read)
            const unreadCount = cid === activeId
              ? 0
              : clientMsgs.filter((m) => !seenMsgIds.current.has(m.id)).length;
            if (!existing) {
              updated.push({ id: cid, label: `💬 ${label}`, scope: "Client", unread: unreadCount, closed });
            } else {
              existing.label = `💬 ${label}`;
              existing.closed = closed;
              existing.unread = unreadCount;
            }
          });
          return updated;
        });
        // Also mark active channel messages as seen immediately
        if (activeChannelRef.current && channelMap[activeChannelRef.current]) {
          channelMap[activeChannelRef.current].forEach((m) => seenMsgIds.current.add(m.id));
        }
      } catch {
        // ignore network errors
      }
    };

    void tryFetch();
    const iv = setInterval(() => { if (active) void tryFetch(); }, 5000);
    return () => { active = false; clearInterval(iv); };
  }, [user?.email]);

  const totalMessages = Object.values(messages).flat().filter(
    (m, i, arr) => arr.findIndex((x) => x.id === m.id) === i
  ).length;

  const history = useMemo(() => {
    const msgs = messages[channelId] || [];
    return msgs.filter((m) => m.text !== CLOSED_MSG && m.text !== REOPENED_MSG);
  }, [messages, channelId]);

  const currentClosed = useMemo(() => {
    const msgs = messages[channelId] || [];
    return isChannelClosed(msgs);
  }, [messages, channelId]);

  const handleDeleteMessage = async (msg: ChatMessage) => {
    setDeletingId(msg.id);
    removeMessageById(msg.id);
    try {
      await fetch(`/api/agent/requests?messageId=${encodeURIComponent(msg.id)}`, { method: "DELETE" });
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkDeleting(true);
    const ids = Array.from(selectedIds);
    ids.forEach(id => removeMessageById(id));
    setSelectedIds(new Set());
    setSelectMode(false);
    await Promise.all(ids.map(id =>
      fetch(`/api/agent/requests?messageId=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {})
    ));
    setBulkDeleting(false);
  };

  const toggleChannelSelect = (cid: string) => {
    setSelectedChannels(prev => {
      const next = new Set(prev);
      next.has(cid) ? next.delete(cid) : next.add(cid);
      return next;
    });
  };

  const handleBulkChannelDelete = async () => {
    if (selectedChannels.size === 0) return;
    setBulkChannelDeleting(true);
    const cids = Array.from(selectedChannels).filter(c => !nonDeletableChannels.has(c));
    // Optimistic: remove channels & messages
    cids.forEach(cid => {
      (messages[cid] || []).forEach(msg =>
        fetch(`/api/agent/requests?messageId=${encodeURIComponent(msg.id)}`, { method: "DELETE" }).catch(() => {})
      );
    });
    setChannels(prev => prev.filter(c => !cids.includes(c.id)));
    setMessages(prev => { const n = { ...prev }; cids.forEach(c => delete n[c]); return n; });
    if (cids.includes(channelId)) setChannelId("hq");
    setSelectedChannels(new Set());
    setSidebarSelectMode(false);
    setBulkChannelDeleting(false);
  };

  const handleClearChannel = (targetChannelId: string) => {
    if (!window.confirm("Delete this conversation? This cannot be undone.")) return;
    (messages[targetChannelId] || []).forEach((msg) =>
      fetch(`/api/agent/requests?messageId=${encodeURIComponent(msg.id)}`, { method: "DELETE" }).catch(() => {})
    );
    if (!nonDeletableChannels.has(targetChannelId)) {
      setChannels((prev) => prev.filter((c) => c.id !== targetChannelId));
      setChannelId("hq");
    }
  };

  // Close / Reopen conversation
  const handleCloseConversation = async () => {
    if (!window.confirm("Mark this conversation as resolved? The client will see it as closed.")) return;
    setClosingId(channelId);
    const id = crypto.randomUUID?.() || createLocalId();
    const createdAt = new Date().toISOString();

    // Post system marker message
    await postMessage({
      id, createdAt,
      channelIds: [channelId, "hq"],
      message: CLOSED_MSG,
      author: user?.name || "Agent",
      senderRole: "system",
      source: "agent-chat",
      sourcePath: `/agent/chat`,
    }).catch(() => {});

    // Post visible resolution message to client
    const resolutionId = crypto.randomUUID?.() || createLocalId();
    const resolutionCreatedAt = new Date().toISOString();
    const resolutionText = "✅ Your request has been resolved. If you need further assistance, please don't hesitate to contact us again.";
    addMessage({ id: resolutionId, role: "hq", author: user?.name || "Agent", text: resolutionText, createdAt: resolutionCreatedAt });
    await postMessage({
      id: resolutionId, createdAt: resolutionCreatedAt,
      channelIds: [channelId, "hq"],
      message: resolutionText,
      author: user?.name || "Agent",
      senderRole: "hq",
      source: "agent-chat",
      sourcePath: `/agent/chat`,
    }).catch(() => {});

    // Mark locally
    const sysMsg: ChatMessage = { id, role: "system", author: "system", text: CLOSED_MSG, ts: new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), createdAt };
    setMessages((prev) => {
      const next = { ...prev };
      [channelId, "hq"].forEach((cid) => {
        next[cid] = [...(next[cid] || []), sysMsg];
      });
      return next;
    });
    setChannels((prev) => prev.map((c) => c.id === channelId ? { ...c, closed: true } : c));
    setClosingId(null);
  };

  const handleReopenConversation = async () => {
    setClosingId(channelId);
    const id = crypto.randomUUID?.() || createLocalId();
    const createdAt = new Date().toISOString();

    await postMessage({
      id, createdAt,
      channelIds: [channelId, "hq"],
      message: REOPENED_MSG,
      author: user?.name || "Agent",
      senderRole: "system",
      source: "agent-chat",
      sourcePath: `/agent/chat`,
    }).catch(() => {});

    const sysMsg: ChatMessage = { id, role: "system", author: "system", text: REOPENED_MSG, ts: new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), createdAt };
    setMessages((prev) => {
      const next = { ...prev };
      [channelId, "hq"].forEach((cid) => {
        next[cid] = [...(next[cid] || []), sysMsg];
      });
      return next;
    });
    setChannels((prev) => prev.map((c) => c.id === channelId ? { ...c, closed: false } : c));
    setClosingId(null);
  };

  // Send message
  const addMessage = (msg: Omit<ChatMessage, "ts">) => {
    const createdAt = msg.createdAt || new Date().toISOString();
    const message: ChatMessage = {
      ...msg,
      ts: new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      createdAt,
    };
    setMessages((prev) => {
      const ids = Array.from(new Set([channelId, "hq"]));
      const next = { ...prev };
      ids.forEach((id) => {
        const list = next[id] || [];
        if (!list.some((m) => m.id === message.id)) {
          next[id] = [...list, message];
        }
      });
      return next;
    });
  };

  const removeMessageById = (id: string) => {
    // Track this ID as deleted to prevent it from coming back on reload
    deletedMsgIds.current.add(id);

    // Persist deleted IDs in localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("agent_deleted_messages", JSON.stringify(Array.from(deletedMsgIds.current)));
      } catch {
        // ignore
      }
    }

    setMessages((prev) => {
      const next: Record<string, ChatMessage[]> = {};
      Object.entries(prev).forEach(([ch, list]) => {
        next[ch] = list.filter((m) => m.id !== id);
      });
      return next;
    });
  };

  const postMessage = async (payload: any) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (user?.email) headers["x-user-email"] = user.email;
    const resp = await fetch("/api/agent/requests", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!resp.ok) throw new Error("Failed to send");
  };

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInput("");
    const id = crypto.randomUUID?.() || createLocalId();
    const createdAt = new Date().toISOString();
    const author = user?.name || "Agent";
    const role = canHQ ? "hq" : "agent";

    addMessage({ id, role, author, text: trimmed, createdAt });
    try {
      await postMessage({
        id, createdAt,
        channelIds: Array.from(new Set([channelId, "hq"])),
        message: trimmed,
        author,
        senderRole: role,
        source: "agent-chat",
        sourcePath: `/agent/chat?channel=${encodeURIComponent(channelId)}`,
      });
    } catch {
      removeMessageById(id);
    }

    // @Lina support
    if (trimmed.toLowerCase().includes("@lina")) {
      setLinaBusy(true);
      try {
        const { reply } = await sendMessageToLina(trimmed);
        const linaId = crypto.randomUUID?.() || createLocalId();
        const linaCreatedAt = new Date().toISOString();
        addMessage({ id: linaId, role: "lina", author: "Lina", text: reply || "Done.", createdAt: linaCreatedAt });
        await postMessage({
          id: linaId, createdAt: linaCreatedAt,
          channelIds: [channelId, "hq"],
          message: reply || "Done.",
          author: "Lina",
          senderRole: "lina",
          source: "agent-chat",
          sourcePath: `/agent/chat`,
        }).catch(() => {});
      } catch {
        // ignore
      } finally {
        setLinaBusy(false);
      }
    }
  };

  const currentChannel = channels.find((c) => c.id === channelId);
  const openChannels = channels.filter((c) => !c.closed && c.id !== "hq");
  const closedChannels = channels.filter((c) => c.closed);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/agent" className="text-slate-500 hover:text-slate-900 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900">📥 Agent Inbox</h1>
            <p className="text-xs text-slate-500">{totalMessages} message{totalMessages !== 1 ? "s" : ""} total · auto-refresh 5s</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live
          </span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 73px)" }}>
        {/* Sidebar */}
        <div className="w-72 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
            {!sidebarSelectMode ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Conversations</p>
                <button onClick={() => { setSidebarSelectMode(true); setSelectedChannels(new Set()); }}
                  className="text-[11px] font-bold text-slate-400 hover:text-red-500 border border-slate-200 hover:border-red-200 px-2 py-1 rounded-lg transition">
                  ☑️ Select
                </button>
              </>
            ) : (
              <>
                <span className="text-[11px] font-bold text-slate-600">{selectedChannels.size} selected</span>
                <div className="flex gap-1">
                  <button onClick={handleBulkChannelDelete} disabled={selectedChannels.size === 0 || bulkChannelDeleting}
                    className="text-[11px] font-bold bg-red-500 text-white px-2.5 py-1 rounded-lg hover:bg-red-600 transition disabled:opacity-40">
                    {bulkChannelDeleting ? "…" : `🗑 Delete (${selectedChannels.size})`}
                  </button>
                  <button onClick={() => { setSidebarSelectMode(false); setSelectedChannels(new Set()); }}
                    className="text-[11px] font-semibold text-slate-500 border border-slate-200 px-2 py-1 rounded-lg hover:bg-slate-50 transition">
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* All Messages */}
            {[channels[0]].map((ch) => {
              const isActive = ch.id === channelId;
              const chMessages = messages[ch.id] || [];
              const lastMsg = chMessages.filter(m => m.role !== "system").slice(-1)[0];
              return (
                <div
                  key={ch.id}
                  onClick={() => setChannelId(ch.id)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-slate-100 transition ${
                    isActive ? "bg-blue-50 border-l-4 border-l-blue-500" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-slate-100 text-slate-600 flex-shrink-0">
                    📥
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-semibold truncate block ${isActive ? "text-blue-700" : "text-slate-900"}`}>
                      {ch.label}
                    </span>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{lastMsg?.text || "No messages yet"}</p>
                  </div>
                </div>
              );
            })}

            {/* Open conversations */}
            {openChannels.length > 0 && (
              <p className="px-4 pt-3 pb-1 text-xs font-bold text-slate-400 uppercase tracking-widest">
                🟢 Open ({openChannels.length})
              </p>
            )}
            {openChannels.map((ch) => {
              const isActive = ch.id === channelId;
              const isChecked = selectedChannels.has(ch.id);
              const chMessages = messages[ch.id] || [];
              const lastMsg = chMessages.filter(m => m.role !== "system").slice(-1)[0];
              return (
                <div
                  key={ch.id}
                  onClick={() => sidebarSelectMode ? toggleChannelSelect(ch.id) : setChannelId(ch.id)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-slate-100 transition group ${
                    isChecked ? "bg-red-50 border-l-4 border-l-red-400" :
                    isActive ? "bg-blue-50 border-l-4 border-l-blue-500" : "hover:bg-slate-50"
                  }`}
                >
                  {sidebarSelectMode && (
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs font-bold shrink-0 mt-2 ${isChecked ? "bg-red-500 border-red-500 text-white" : "border-slate-300 bg-white"}`}>
                      {isChecked ? "✓" : ""}
                    </div>
                  )}
                  {!sidebarSelectMode && (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-blue-100 text-blue-700 flex-shrink-0">
                      {ch.label.replace("💬 ", "").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold truncate ${isChecked ? "text-red-600" : isActive ? "text-blue-700" : "text-slate-900"}`}>
                        {ch.label}
                      </span>
                      {ch.unread > 0 && !isActive && !sidebarSelectMode && (
                        <span className="text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 ml-1 flex-shrink-0 font-bold animate-pulse">
                          {ch.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{lastMsg?.text || "No messages yet"}</p>
                  </div>
                </div>
              );
            })}

            {/* Closed conversations */}
            {closedChannels.length > 0 && (
              <p className="px-4 pt-3 pb-1 text-xs font-bold text-slate-400 uppercase tracking-widest">
                ✅ Resolved ({closedChannels.length})
              </p>
            )}
            {closedChannels.map((ch) => {
              const isActive = ch.id === channelId;
              const isChecked = selectedChannels.has(ch.id);
              const chMessages = messages[ch.id] || [];
              const lastMsg = chMessages.filter(m => m.role !== "system").slice(-1)[0];
              return (
                <div
                  key={ch.id}
                  onClick={() => sidebarSelectMode ? toggleChannelSelect(ch.id) : setChannelId(ch.id)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-slate-100 transition ${
                    isChecked ? "bg-red-50 border-l-4 border-l-red-400 opacity-100" :
                    isActive ? "bg-emerald-50 border-l-4 border-l-emerald-500 opacity-100" : "hover:bg-slate-50 opacity-60 hover:opacity-80"
                  }`}
                >
                  {sidebarSelectMode && (
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs font-bold shrink-0 mt-2 ${isChecked ? "bg-red-500 border-red-500 text-white" : "border-slate-300 bg-white"}`}>
                      {isChecked ? "✓" : ""}
                    </div>
                  )}
                  {!sidebarSelectMode && (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-emerald-100 text-emerald-700 flex-shrink-0">✓</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-medium truncate block ${isChecked ? "text-red-600" : isActive ? "text-emerald-700" : "text-slate-500"}`}>
                      {ch.label}
                    </span>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{lastMsg?.text || "Resolved"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-slate-900">{currentChannel?.label || "Messages"}</h2>
                {currentClosed && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                    ✅ Resolved
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">{currentChannel?.scope || ""}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Select mode toggle */}
              {!selectMode ? (
                <button onClick={() => { setSelectMode(true); setSelectedIds(new Set()); }}
                  className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition font-medium">
                  ☑️ Select
                </button>
              ) : (
                <>
                  <span className="text-xs text-slate-500 font-semibold">{selectedIds.size} selected</span>
                  <button onClick={handleBulkDelete} disabled={selectedIds.size === 0 || bulkDeleting}
                    className="text-xs bg-red-500 text-white hover:bg-red-600 px-3 py-1.5 rounded-lg transition font-bold disabled:opacity-40">
                    {bulkDeleting ? "Deleting…" : `🗑 Delete (${selectedIds.size})`}
                  </button>
                  <button onClick={() => { setSelectMode(false); setSelectedIds(new Set()); }}
                    className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg transition font-medium">
                    Cancel
                  </button>
                </>
              )}
              {/* Close / Reopen button — only on client channels, not on "hq" */}
              {!nonDeletableChannels.has(channelId) && (
                currentClosed ? (
                  <button
                    onClick={handleReopenConversation}
                    disabled={closingId === channelId}
                    className="text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition font-semibold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {closingId === channelId ? "..." : "🔄 Reopen"}
                  </button>
                ) : (
                  <button
                    onClick={handleCloseConversation}
                    disabled={closingId === channelId}
                    className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition font-semibold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {closingId === channelId ? "..." : "✅ Mark as Resolved"}
                  </button>
                )
              )}
              {!nonDeletableChannels.has(channelId) && (
                <button
                  onClick={() => handleClearChannel(channelId)}
                  className="text-xs text-red-400 hover:text-red-600 border border-red-100 hover:border-red-200 px-3 py-1.5 rounded-lg transition font-medium"
                >
                  🗑
                </button>
              )}
            </div>
          </div>

          {/* Closed banner */}
          {currentClosed && !nonDeletableChannels.has(channelId) && (
            <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 text-sm">
                <span className="text-lg">✅</span>
                <span className="font-semibold">This conversation is resolved.</span>
                <span className="text-emerald-600">The client has been notified.</span>
              </div>
              <button
                onClick={handleReopenConversation}
                disabled={closingId === channelId}
                className="text-xs text-emerald-700 underline hover:no-underline font-medium disabled:opacity-50"
              >
                Reopen if needed
              </button>
            </div>
          )}

          {/* Messages */}
          <div ref={listRef} className="flex-1 overflow-y-auto p-6 space-y-3">
            {history.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl mb-4">📭</div>
                <p className="text-slate-500 font-medium">No messages yet</p>
                <p className="text-slate-400 text-sm mt-1">Messages from clients will appear here automatically</p>
              </div>
            )}

            {history.map((m) => {
              const isClient = m.role === "client";
              const isMe = (m.role === "agent" || m.role === "hq") && m.author === (user?.name || "Agent");
              const isLina = m.role === "lina";

              return (
                <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"} group`}>
                  <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div className={`flex items-center gap-2 px-1 ${isMe ? "flex-row-reverse" : ""}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isClient ? "bg-blue-100 text-blue-700" :
                        isLina ? "bg-amber-100 text-amber-700" :
                        "bg-slate-800 text-white"
                      }`}>
                        {isClient ? "👤" : isLina ? "✨" : "🤝"}
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{m.author}</span>
                      {isClient && m.email && (
                        <span className="text-xs text-slate-400">{m.email}</span>
                      )}
                    </div>

                    {/* Checkbox in select mode */}
                    {selectMode && (
                      <button onClick={() => toggleSelect(m.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs font-bold shrink-0 transition ${selectedIds.has(m.id) ? "bg-red-500 border-red-500 text-white" : "border-slate-300 bg-white"}`}>
                        {selectedIds.has(m.id) ? "✓" : ""}
                      </button>
                    )}
                    <div onClick={() => selectMode && toggleSelect(m.id)}
                      className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed ${selectMode ? "cursor-pointer" : ""} ${selectedIds.has(m.id) ? "opacity-60 ring-2 ring-red-300" : ""} ${
                      isMe ? "bg-slate-900 text-white rounded-tr-sm" :
                      isClient ? "bg-white border border-slate-200 text-slate-900 rounded-tl-sm shadow-sm" :
                      isLina ? "bg-amber-50 border border-amber-200 text-amber-900 rounded-tl-sm" :
                      "bg-slate-100 text-slate-900 rounded-tl-sm"
                    }`}>
                      <p className="whitespace-pre-wrap">{m.text}</p>
                      {isClient && (m.email || m.phone || m.sourcePath) && (
                        <div className="mt-2 pt-2 border-t border-slate-100 space-y-0.5">
                          {m.email && <p className="text-xs text-slate-400">📧 {m.email}</p>}
                          {m.phone && <p className="text-xs text-slate-400">📞 {m.phone}</p>}
                          {m.sourcePath && <p className="text-xs text-slate-400">🔗 {m.sourcePath}</p>}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2 gap-4">
                        <span className="text-xs text-slate-400">{m.ts}</span>
                        <button
                          onClick={() => handleDeleteMessage(m)}
                          disabled={deletingId === m.id}
                          className={`opacity-0 group-hover:opacity-100 transition text-xs px-2 py-0.5 rounded font-medium ${
                            isMe ? "text-slate-400 hover:text-red-300" : "text-slate-400 hover:text-red-500"
                          } disabled:opacity-30`}
                          title="Delete message"
                        >
                          {deletingId === m.id ? "..." : "🗑"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {linaBusy && (
              <div className="flex justify-start">
                <div className="bg-amber-50 border border-amber-200 px-4 py-3 rounded-2xl text-sm text-amber-700">
                  ✨ Lina is typing...
                </div>
              </div>
            )}
          </div>

          {/* Input — disabled if closed */}
          <div className="bg-white border-t border-slate-200 p-4">
            {currentClosed && !nonDeletableChannels.has(channelId) ? (
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-5 py-4">
                <p className="text-sm text-slate-500">This conversation is resolved. Reopen to send more messages.</p>
                <button
                  onClick={handleReopenConversation}
                  disabled={closingId === channelId}
                  className="text-sm bg-amber-100 text-amber-800 hover:bg-amber-200 px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50 whitespace-nowrap ml-4"
                >
                  🔄 Reopen
                </button>
              </div>
            ) : (
              <>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSending(true);
                    Promise.resolve(handleSend(input)).finally(() => setSending(false));
                  }}
                  className="flex gap-3"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Reply to client${channelId !== "hq" ? " in this thread" : ""}… or type @Lina for AI help`}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                  />
                  <button
                    type="submit"
                    disabled={sending || !input.trim()}
                    className="px-5 py-3 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {sending ? "..." : "Send ↑"}
                  </button>
                </form>
                <p className="text-xs text-slate-400 mt-2 pl-1">
                  Tip: Mention <strong>@Lina</strong> for AI help · 🗑 hover any message to delete it
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
