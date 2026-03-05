"use client";
import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { sendMessageToLina } from "../../../src/lib/linaClient";
import { normalizeAgentId } from "../../../src/lib/agent/agentWorkspace";
import { useAuthStore, isHQ } from "../../../src/lib/authStore";

type MessageRole = "agent" | "hq" | "lina" | "client";

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
};

const createLocalId = () => `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function AgentChatClient() {
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const canHQ = isHQ(user);

  const [channelId, setChannelId] = useState("hq");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [sending, setSending] = useState(false);
  const [linaBusy, setLinaBusy] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([
    { id: "hq", label: "📥 All Messages", scope: "Global inbox", unread: 0 },
  ]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const activeChannelRef = useRef(channelId);
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
      return [...prev, { id: targetChannel, label: `💬 ${label}`, scope: "Direct", unread: 0 }];
    });
    setChannelId(targetChannel);
  }, [searchParams]);

  useEffect(() => {
    setChannels((prev) => prev.map((ch) => (ch.id === channelId ? { ...ch, unread: 0 } : ch)));
    activeChannelRef.current = channelId;
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

  const refreshMessages = async () => {
    try {
      const resp = await fetch("/api/agent/requests", { cache: "no-store" });
      const payload = await resp.json().catch(() => ({}));
      if (!resp.ok) return;

      const rows = Array.isArray(payload?.data) ? payload.data : [];
      const nextMessages: Record<string, ChatMessage[]> = {};
      const newChannels: Map<string, Channel> = new Map();

      rows.forEach((row: any) => {
        if (row?.deleted_at || row?.is_deleted) return;
        const msg = buildMessageFromRow(row);
        const channelIds: string[] = Array.isArray(row?.channelIds)
          ? row.channelIds
          : Array.isArray(row?.channel_ids)
            ? row.channel_ids
            : ["hq"];
        const safeIds = channelIds.length ? channelIds : ["hq"];

        safeIds.forEach((id) => {
          // Add to hq (global inbox)
          if (!nextMessages["hq"]) nextMessages["hq"] = [];
          if (!nextMessages["hq"].some((m) => m.id === msg.id)) {
            nextMessages["hq"].push(msg);
          }

          // Add to specific channel
          if (id !== "hq") {
            if (!nextMessages[id]) nextMessages[id] = [];
            if (!nextMessages[id].some((m) => m.id === msg.id)) {
              nextMessages[id].push(msg);
            }
            // Create channel if not exists
            if (!newChannels.has(id)) {
              const label = row?.author || row?.fullName || row?.full_name || row?.email || id;
              newChannels.set(id, { id, label: `💬 ${label}`, scope: "Direct", unread: 0 });
            }
          }
        });
      });

      // Sort by time
      Object.values(nextMessages).forEach((list) =>
        list.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime())
      );

      // Track unread: count new messages on channels not currently active
      setMessages((prev) => {
        const prevFlat = Object.values(prev).flat().map((m) => m.id);
        const active = activeChannelRef.current;

        setChannels((prevCh) => {
          const next = [...prevCh];
          // Add new channels from this batch
          newChannels.forEach((ch) => {
            if (!next.some((c) => c.id === ch.id)) {
              next.push(ch);
            }
          });
          // Increment unread for channels that got new messages and are not active
          return next.map((ch) => {
            if (ch.id === active) return { ...ch, unread: 0 };
            const chMsgs = nextMessages[ch.id] || [];
            const newCount = chMsgs.filter(
              (m) => m.role === "client" && !prevFlat.includes(m.id)
            ).length;
            return newCount > 0 ? { ...ch, unread: ch.unread + newCount } : ch;
          });
        });

        return nextMessages;
      });
    } catch {
      // ignore
    }
  };

  // Poll every 5 seconds
  useEffect(() => {
    let active = true;
    void refreshMessages();
    const interval = window.setInterval(() => {
      if (active) void refreshMessages();
    }, 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const history = messages[channelId] || [];
  const totalMessages = Object.values(messages).flat().filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i).length;

  // Delete single message
  const handleDeleteMessage = async (msg: ChatMessage) => {
    setDeletingId(msg.id);
    // Optimistic UI
    setMessages((prev) => {
      const next: Record<string, ChatMessage[]> = {};
      Object.entries(prev).forEach(([id, list]) => {
        next[id] = list.filter((m) => m.id !== msg.id);
      });
      return next;
    });
    try {
      await fetch(`/api/agent/requests?messageId=${encodeURIComponent(msg.id)}`, { method: "DELETE" });
    } catch {
      await refreshMessages();
    } finally {
      setDeletingId(null);
    }
  };

  // Delete all in a channel
  const handleClearChannel = async (targetChannelId: string) => {
    if (!window.confirm("Delete all messages in this conversation?")) return;
    const toDelete = (messages[targetChannelId] || []).map((m) => m.id);
    setMessages((prev) => ({ ...prev, [targetChannelId]: [] }));
    await Promise.all(
      toDelete.map((id) =>
        fetch(`/api/agent/requests?messageId=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {})
      )
    );
    if (!nonDeletableChannels.has(targetChannelId)) {
      setChannels((prev) => prev.filter((c) => c.id !== targetChannelId));
      setChannelId("hq");
    }
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
    setMessages((prev) => {
      const next: Record<string, ChatMessage[]> = {};
      Object.entries(prev).forEach(([ch, list]) => {
        next[ch] = list.filter((m) => m.id !== id);
      });
      return next;
    });
  };

  const postMessage = async (payload: any) => {
    const resp = await fetch("/api/agent/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
        {/* Sidebar - conversations */}
        <div className="w-72 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {channels.map((ch) => {
              const isActive = ch.id === channelId;
              const chMessages = messages[ch.id] || [];
              const lastMsg = chMessages[chMessages.length - 1];
              const clientMessages = chMessages.filter((m) => m.role === "client");
              return (
                <div
                  key={ch.id}
                  onClick={() => setChannelId(ch.id)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-slate-100 transition group ${
                    isActive ? "bg-blue-50 border-l-4 border-l-blue-500" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-slate-100 text-slate-600 flex-shrink-0">
                    {ch.id === "hq" ? "📥" : ch.label.replace("💬 ", "").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold truncate ${isActive ? "text-blue-700" : "text-slate-900"}`}>
                        {ch.label}
                      </span>
                      {ch.unread > 0 && !isActive && (
                        <span className="text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 ml-1 flex-shrink-0 font-bold animate-pulse">
                          {ch.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {lastMsg?.text || "No messages yet"}
                    </p>
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
              <h2 className="font-semibold text-slate-900">{currentChannel?.label || "Messages"}</h2>
              <p className="text-xs text-slate-500">{currentChannel?.scope || ""}</p>
            </div>
            {!nonDeletableChannels.has(channelId) && (
              <button
                onClick={() => handleClearChannel(channelId)}
                className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition font-medium"
              >
                🗑 Delete conversation
              </button>
            )}
          </div>

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
                    {/* Sender label */}
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

                    {/* Bubble */}
                    <div className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      isMe ? "bg-slate-900 text-white rounded-tr-sm" :
                      isClient ? "bg-white border border-slate-200 text-slate-900 rounded-tl-sm shadow-sm" :
                      isLina ? "bg-amber-50 border border-amber-200 text-amber-900 rounded-tl-sm" :
                      "bg-slate-100 text-slate-900 rounded-tl-sm"
                    }`}>
                      <p className="whitespace-pre-wrap">{m.text}</p>

                      {/* Meta info for client messages */}
                      {isClient && (m.email || m.phone || m.sourcePath) && (
                        <div className="mt-2 pt-2 border-t border-slate-100 space-y-0.5">
                          {m.email && <p className="text-xs text-slate-400">📧 {m.email}</p>}
                          {m.phone && <p className="text-xs text-slate-400">📞 {m.phone}</p>}
                          {m.sourcePath && <p className="text-xs text-slate-400">🔗 {m.sourcePath}</p>}
                        </div>
                      )}

                      {/* Time + delete */}
                      <div className="flex items-center justify-between mt-2 gap-4">
                        <span className={`text-xs ${isMe ? "text-slate-400" : "text-slate-400"}`}>{m.ts}</span>
                        <button
                          onClick={() => handleDeleteMessage(m)}
                          disabled={deletingId === m.id}
                          className={`opacity-0 group-hover:opacity-100 transition text-xs px-2 py-0.5 rounded font-medium ${
                            isMe
                              ? "text-slate-400 hover:text-red-300"
                              : "text-slate-400 hover:text-red-500"
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

          {/* Input */}
          <div className="bg-white border-t border-slate-200 p-4">
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
              Tip: Mention <strong>@Lina</strong> to get AI assistance · 🗑 hover any message to delete it
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
