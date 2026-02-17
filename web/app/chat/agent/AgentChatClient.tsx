"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Send, Search } from "lucide-react";
import { getSupabaseClient } from "../../../src/lib/supabase/client";
import { useAuthStore } from "../../../src/lib/authStore";
import { normalizeRbacRole } from "../../../src/lib/rbac";

const ADMIN_CHANNEL_ID = "hq";

type ChatMessage = {
  id: string;
  role: "user" | "agent" | "lina";
  text: string;
  ts: string;
  createdAt?: string;
};

type ChatThread = {
  id: string;
  title: string;
  listingTitle: string;
  unread: number;
  avatar: string;
  type: "agent" | "lina";
  messages: ChatMessage[];
};

export default function TravelerAgentChatClient() {
  const searchParams = useSearchParams();
  const listing = searchParams?.get("listing") || "Help Center";
  const sourcePath = searchParams?.get("source") || "/";
  const rawChannelId = searchParams?.get("channel") || "agent-alexandre";
  const hasExplicitAgentChannel = Boolean(searchParams?.get("channel"));
  const user = useAuthStore((s) => s.user);
  const roles = useMemo(() => (user?.roles && user.roles.length ? user.roles : user?.role ? [user.role] : []), [user]);
  const effectiveRole = useMemo(() => normalizeRbacRole(user?.effectiveRole) || normalizeRbacRole(roles[0]), [user?.effectiveRole, roles]);
  const isYachtBroker = effectiveRole === "yacht_broker";
  const brokerChannelId = useMemo(() => {
    if (!isYachtBroker || !user?.email) return null;
    const local = String(user.email).split("@")[0] || "";
    const slug = local.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return slug ? `agent-${slug}` : null;
  }, [isYachtBroker, user?.email]);
  const channelId = brokerChannelId || rawChannelId;
  const linaChannelId = "lina-help";
  const [threads, setThreads] = useState<ChatThread[]>([
    {
      id: "lina-help",
      title: "Lina AI Concierge",
      listingTitle: "AI-first Help Center",
      unread: 0,
      avatar: "/branding/lina-avatar.png",
      type: "lina",
      messages: [
        {
          id: "welcome-lina",
          role: "lina",
          text: "Hi! I can help with trip planning, changes, and booking questions. If you need a human agent, switch to the Agent tab.",
          ts: new Date().toLocaleTimeString().slice(0, 5),
        },
      ],
    },
    {
      id: channelId,
      title: "Zeniva Agent",
      listingTitle: "Human support for escalations",
      unread: 0,
      avatar: "/branding/logo.png",
      type: "agent",
      messages: [
        {
          id: "welcome-agent",
          role: "agent",
          text: "Hi! I’m here to help with complex issues or to finalize a reservation. How can we assist?",
          ts: new Date().toLocaleTimeString().slice(0, 5),
        },
      ],
    },
  ]);
  const [selectedThreadId, setSelectedThreadId] = useState(hasExplicitAgentChannel ? channelId : "lina-help");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"lina" | "agent">(hasExplicitAgentChannel ? "agent" : "lina");
  const quickHelpOptions = [
    "Change dates",
    "Cancel or refund",
    "Payment issue",
    "Modify passengers",
    "Upgrade request",
    "Special assistance",
  ];

  const activeThread = threads.find((t) => t.id === selectedThreadId) || threads[0];

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  const mapRole = (raw: string | undefined) => {
    if (raw === "lina") return "lina" as const;
    if (raw === "agent" || raw === "hq") return "agent" as const;
    return "user" as const;
  };

  const extractMessageText = (raw: string) => {
    const lines = raw.split("\n").map((line) => line.trim()).filter(Boolean);
    const msgLine = lines.find((line) => line.toLowerCase().startsWith("message:"));
    if (msgLine) return msgLine.replace(/^message:\s*/i, "");
    return raw;
  };

  const mergeMessages = (existing: ChatMessage[], incoming: ChatMessage[]) => {
    const map = new Map<string, ChatMessage>();
    existing.forEach((msg) => map.set(msg.id, msg));
    incoming.forEach((msg) => {
      const previous = map.get(msg.id);
      if (!previous) {
        map.set(msg.id, msg);
        return;
      }
      const incomingText = (msg.text || "").trim();
      map.set(msg.id, {
        ...previous,
        ...msg,
        text: incomingText.length ? msg.text : previous.text,
        role: msg.role || previous.role,
        createdAt: msg.createdAt || previous.createdAt,
      });
    });
    const merged = Array.from(map.values());
    merged.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    return merged;
  };

  const upsertThreadMessages = useCallback((nextMessages: Record<string, ChatMessage[]>) => {
    setThreads((prev) =>
      prev.map((thread) => ({
        ...thread,
        messages: nextMessages[thread.id] ? mergeMessages(thread.messages, nextMessages[thread.id]) : thread.messages,
      }))
    );
  }, []);

  const refreshMessages = useCallback(async () => {
    const mapRowsToMessages = (rows: any[]) => {
      const next: Record<string, ChatMessage[]> = {};
      rows.forEach((row: any) => {
        const channelIds: string[] = Array.isArray(row?.channelIds)
          ? row.channelIds
          : Array.isArray(row?.channel_ids)
            ? row.channel_ids
            : [];
        const safeChannelIds = channelIds.length ? channelIds : ["hq"];
        if (!safeChannelIds.includes(channelId) && !safeChannelIds.includes(linaChannelId)) return;
        const createdAt = row?.createdAt || row?.created_at || new Date().toISOString();
        const message: ChatMessage = {
          id: String(row?.id || `${createdAt}-${Math.random().toString(16).slice(2)}`),
          role: mapRole(row?.senderRole || row?.sender_role),
          text: extractMessageText(String(row?.message || "")) || "New message",
          ts: new Date(createdAt).toLocaleTimeString().slice(0, 5),
          createdAt,
        };
        safeChannelIds.forEach((id) => {
          if (id !== channelId && id !== linaChannelId) return;
          next[id] = [...(next[id] || []), message];
        });
      });

      Object.keys(next).forEach((id) => {
        next[id].sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
      });
      return next;
    };

    try {
      const params = new URLSearchParams();
      params.set("channelId", channelId);
      const directResp = await fetch(`/api/agent/requests?${params.toString()}`, { cache: "no-store" });
      const directPayload = await directResp.json().catch(() => ({}));
      if (directResp.ok) {
        const directRows = Array.isArray(directPayload?.data) ? directPayload.data : [];
        const next = mapRowsToMessages(directRows);
        upsertThreadMessages(next);
      }

      const linaResp = await fetch(`/api/agent/requests?channelId=${encodeURIComponent(linaChannelId)}`, { cache: "no-store" });
      const linaPayload = await linaResp.json().catch(() => ({}));
      if (linaResp.ok) {
        const linaRows = Array.isArray(linaPayload?.data) ? linaPayload.data : [];
        const next = mapRowsToMessages(linaRows);
        upsertThreadMessages(next);
      }
    } catch {
      // Continue with direct Supabase read below
    }

    // If an authenticated yacht broker is using this page, never fall back to a
    // broad Supabase read (RLS for this table is intentionally permissive for public chat).
    if (isYachtBroker) return;

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from("agent_inbox_messages")
        .select("id, created_at, channel_ids, message, author, sender_role")
        .order("created_at", { ascending: true });
      if (error) throw error;

      const rows = Array.isArray(data) ? data : [];
      const next = mapRowsToMessages(rows);
      upsertThreadMessages(next);
    } catch {
      // ignore
    }
  }, [channelId, linaChannelId, upsertThreadMessages, isYachtBroker]);

  const deleteMessagesByIds = useCallback(async (ids: string[]) => {
    if (!ids.length) return;
    if (isYachtBroker) return;
    try {
      const client = getSupabaseClient();
      const chunkSize = 100;
      for (let i = 0; i < ids.length; i += chunkSize) {
        const chunk = ids.slice(i, i + chunkSize);
        const { error } = await client.from("agent_inbox_messages").delete().in("id", chunk);
        if (error) throw error;
      }
    } catch {
      await refreshMessages();
    }
  }, [refreshMessages]);

  const postAgentMessage = async (payload: {
    id: string;
    createdAt: string;
    channelIds: string[];
    sourcePath: string;
    propertyName: string;
    author: string;
    senderRole: "client" | "agent" | "hq" | "lina";
    source: string;
    message: string;
  }) => {
    if (!isYachtBroker) {
      try {
        const client = getSupabaseClient();
        const { error } = await client.from("agent_inbox_messages").insert({
          id: payload.id,
          created_at: payload.createdAt,
          channel_ids: payload.channelIds,
          message: payload.message,
          source_path: payload.sourcePath,
          property_name: payload.propertyName,
          author: payload.author,
          sender_role: payload.senderRole,
          source: payload.source,
        });
        if (!error) return;
      } catch {
        // fall through to API fallback
      }
    }

    try {
      const resp = await fetch("/api/agent/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (resp.ok) return;
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!active) return;
      await refreshMessages();
    };

    void load();
    const interval = window.setInterval(load, 30000);

    let realtimeClient: ReturnType<typeof getSupabaseClient> | null = null;
    let realtimeChannel: any = null;
    try {
      realtimeClient = getSupabaseClient();
      realtimeChannel = realtimeClient
        .channel(`traveler-agent-${channelId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "agent_inbox_messages" },
          () => void load()
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "agent_inbox_messages" },
          () => void load()
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "agent_inbox_messages" },
          () => void load()
        )
        .subscribe();
    } catch {
      // Supabase env missing; polling keeps the thread updated.
    }

    return () => {
      active = false;
      window.clearInterval(interval);
      if (realtimeClient && realtimeChannel) {
        realtimeClient.removeChannel(realtimeChannel);
      }
    };
  }, [channelId, refreshMessages]);

  const handleSend = async () => {
    if (!canSend || sending) return;
    const text = input.trim();
    const now = new Date();
    const userMessage: ChatMessage = {
      id: `${now.getTime()}-user`,
      role: "user",
      text,
      ts: now.toLocaleTimeString().slice(0, 5),
      createdAt: now.toISOString(),
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id ? { ...t, messages: [...t.messages, userMessage], unread: 0 } : t
      )
    );
    setInput("");
    setSending(true);

    if (activeTab === "lina") {
      await postAgentMessage({
        id: userMessage.id,
        createdAt: userMessage.createdAt || new Date().toISOString(),
        channelIds: [linaChannelId],
        sourcePath,
        propertyName: listing,
        author: user?.name || user?.email || "Traveler",
        senderRole: "client",
        source: "traveler-lina",
        message: text,
      });
    }

    if (activeTab === "lina") {
      try {
        const resp = await fetch(`/api/chat?prompt=${encodeURIComponent(text)}&mode=traveler`);
        const data = await resp.json();
        const reply = data?.reply || "Lina is currently unavailable.";
        const linaMessage: ChatMessage = {
          id: `${now.getTime()}-lina`,
          role: "lina",
          text: reply,
          ts: new Date().toLocaleTimeString().slice(0, 5),
          createdAt: new Date().toISOString(),
        };
        setThreads((prev) =>
          prev.map((t) =>
            t.id === "lina-help" ? { ...t, messages: [...t.messages, linaMessage], unread: 0 } : t
          )
        );
        await postAgentMessage({
          id: linaMessage.id,
          createdAt: linaMessage.createdAt || new Date().toISOString(),
          channelIds: [linaChannelId],
          sourcePath,
          propertyName: listing,
          author: "Lina",
          senderRole: "lina",
          source: "traveler-lina",
          message: reply,
        });
      } finally {
        setSending(false);
      }
      return;
    }

    if (activeThread.type !== "agent") {
      setSending(false);
      return;
    }

    try {
      await postAgentMessage({
        id: userMessage.id,
        createdAt: userMessage.createdAt || new Date().toISOString(),
        channelIds: [channelId, ADMIN_CHANNEL_ID],
        sourcePath,
        propertyName: listing,
        author: user?.name || user?.email || "Traveler",
        senderRole: "client",
        source: "traveler-chat",
        message: text,
      });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (threadId: string, messageId: string) => {
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId
          ? { ...thread, messages: thread.messages.filter((msg) => msg.id !== messageId) }
          : thread
      )
    );
    await deleteMessagesByIds([messageId]);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto flex h-[calc(100vh-3rem)] max-w-[1700px] flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">Help Center</p>
            <h1 className="text-2xl font-black text-slate-900">Lina AI + Human Support</h1>
            <p className="text-sm text-slate-600">Lina helps first for everything; agents step in for complex issues or final confirmation.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={sourcePath}
              className="inline-flex items-center px-4 py-2 rounded-full bg-white border text-sm font-semibold text-slate-800 shadow-sm"
            >
              Back to listing
            </Link>
          </div>
        </div>

        <div className="flex flex-1 gap-4 overflow-hidden">
          <aside className="w-72 xl:w-80 flex flex-col gap-3 overflow-y-auto">
            <div className="rounded-2xl border border-blue-100 bg-white p-4 space-y-3">
              <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Conversation details</p>
              <div className="text-sm font-semibold text-slate-900">{activeThread?.title}</div>
              <div className="text-xs text-blue-700">Listing: {activeThread?.listingTitle || listing}</div>
              <div className="text-xs text-blue-700">Status: Inquiry (no reservation linked)</div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">Direct chat</span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">Human agent</span>
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 bg-white p-3 space-y-2">
              <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Conversation summary</p>
              <div className="text-xs text-blue-700">Messages: {activeThread?.messages.length || 0}</div>
              <div className="text-xs text-blue-700">Last message:</div>
              <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-2 text-xs text-slate-700">
                {activeThread?.messages[activeThread?.messages.length - 1]?.text || "No messages yet."}
              </div>
            </div>

          </aside>

          <div className="flex-1 min-w-0 rounded-2xl border border-blue-100 bg-white overflow-hidden flex">
            {/* Threads List */}
            <div className="w-72 border-r border-blue-100 bg-blue-50/60 flex flex-col h-full">
              <div className="p-4 border-b border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Help Center</p>
                    <h2 className="text-lg font-bold text-slate-900">Lina + Agent</h2>
                  </div>
                  <span className="rounded-full bg-blue-600 text-white text-xs font-semibold px-2 py-1">
                    {threads.length}
                  </span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                  <input
                    type="text"
                    placeholder="Search conversations"
                    className="w-full rounded-full border border-blue-100 bg-white px-10 py-2 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {threads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => {
                      setSelectedThreadId(thread.id);
                      setActiveTab(thread.type === "agent" ? "agent" : "lina");
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-blue-100 hover:bg-white transition ${
                      selectedThreadId === thread.id ? "bg-white" : "bg-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img src={thread.avatar} alt={thread.title} className="w-10 h-10 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900 truncate">{thread.title}</p>
                          {thread.unread > 0 && (
                            <span className="text-[10px] font-semibold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                              {thread.unread}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-blue-700 truncate">{thread.listingTitle}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {thread.messages[thread.messages.length - 1]?.text || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Panel */}
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-center justify-between border-b border-blue-100 px-6 py-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Chatting with</p>
                  <h3 className="text-lg font-bold text-slate-900">{activeThread?.title || "Agent"}</h3>
                </div>
                <span className="text-xs text-blue-700 font-semibold">{activeThread?.listingTitle || listing}</span>
              </div>

              <div className="px-6 py-3 border-b border-blue-100 bg-white">
                <div className="inline-flex rounded-full border border-blue-100 bg-blue-50/70 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("lina");
                      setSelectedThreadId("lina-help");
                    }}
                    className={`rounded-full px-4 py-1 text-sm font-semibold ${activeTab === "lina" ? "bg-white text-blue-700" : "text-blue-600"}`}
                  >
                    Lina AI
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("agent");
                      setSelectedThreadId(channelId);
                    }}
                    className={`rounded-full px-4 py-1 text-sm font-semibold ${activeTab === "agent" ? "bg-white text-blue-700" : "text-blue-600"}`}
                  >
                    Human agent
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  {quickHelpOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setInput(option)}
                      className="rounded-full border-2 border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:border-blue-300"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {(activeThread?.messages || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[65%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        msg.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-900"
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className={`text-[10px] ${msg.role === "user" ? "text-blue-100" : "text-slate-500"}`}>
                          {msg.ts}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(activeThread.id, msg.id)}
                          className={`inline-flex items-center justify-center rounded-full p-1 ${
                            msg.role === "user" ? "text-blue-100 hover:text-white" : "text-slate-400 hover:text-slate-600"
                          }`}
                          aria-label="Delete message"
                        >
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true" focusable="false">
                            <path
                              fill="currentColor"
                              d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-blue-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Type your message"
                    className="flex-1 min-w-0 w-full rounded-full border border-blue-100 px-4 py-3 text-sm outline-none"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!canSend || sending}
                    className={`flex items-center justify-center rounded-full px-4 py-3 text-sm font-semibold text-white transition ${
                      canSend && !sending ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-200 cursor-not-allowed"
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
