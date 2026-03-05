"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Send, ArrowLeft, Clock, Shield, CheckCircle, User, Sparkles } from "lucide-react";
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

  // Generate a PRIVATE channel per client so conversations are isolated
  // Logged-in: use their email slug. Guest: use a persistent random session ID
  const clientChannelId = useMemo(() => {
    if (user?.email) {
      // e.g. "agent-alexandre-client-louisblais26"
      const emailSlug = String(user.email).split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 20);
      return `${rawChannelId}-${emailSlug}`;
    }
    // Guest: generate/reuse a session ID from localStorage
    if (typeof window !== "undefined") {
      const key = `zeniva_guest_session_${rawChannelId}`;
      let guestId = localStorage.getItem(key);
      if (!guestId) {
        guestId = Math.random().toString(36).slice(2, 10);
        localStorage.setItem(key, guestId);
      }
      return `${rawChannelId}-guest-${guestId}`;
    }
    return rawChannelId;
  }, [user?.email, rawChannelId]);

  const brokerChannelId = useMemo(() => {
    if (!isYachtBroker || !user?.email) return null;
    const local = String(user.email).split("@")[0] || "";
    const slug = local.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return slug ? `agent-${slug}` : null;
  }, [isYachtBroker, user?.email]);

  // Yacht brokers use their own channel; others use private client channel
  const channelId = brokerChannelId || clientChannelId;
  const linaChannelId = "lina-help";

  // Load persisted messages from localStorage on first render
  const loadLocalMessages = (chId: string): ChatMessage[] => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(`zeniva_helpchat_${chId}`);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  };
  const saveLocalMessages = (chId: string, msgs: ChatMessage[]) => {
    if (typeof window === "undefined") return;
    try {
      const toSave = msgs.filter((m) => m.id !== "welcome-lina" && m.id !== "welcome-agent");
      localStorage.setItem(`zeniva_helpchat_${chId}`, JSON.stringify(toSave.slice(-100)));
    } catch {}
  };

  const [threads, setThreads] = useState<ChatThread[]>([
    {
      id: "lina-help",
      title: "Lina AI Concierge",
      listingTitle: "Instant AI assistance",
      unread: 0,
      avatar: "/branding/lina-avatar.png",
      type: "lina",
      messages: [
        {
          id: "welcome-lina",
          role: "lina",
          text: "Hi! I'm Lina, your AI travel concierge ✈️ I can help with trip planning, booking changes, and questions. For complex issues, switch to a human agent.",
          ts: new Date().toLocaleTimeString().slice(0, 5),
        },
        ...loadLocalMessages("lina-help"),
      ],
    },
    {
      id: channelId,
      title: "Zeniva Travel Agent",
      listingTitle: "Real human — here to help",
      unread: 0,
      avatar: "/branding/logo.png",
      type: "agent",
      messages: [
        {
          id: "welcome-agent",
          role: "agent",
          text: "Hello! You're now connected with a real Zeniva Travel agent 👋 We typically respond within a few minutes during business hours. How can we help you today?",
          ts: new Date().toLocaleTimeString().slice(0, 5),
        },
        ...loadLocalMessages(channelId),
      ],
    },
  ]);

  const [selectedThreadId, setSelectedThreadId] = useState(hasExplicitAgentChannel ? channelId : "lina-help");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"lina" | "agent">(hasExplicitAgentChannel ? "agent" : "lina");

  const quickHelpOptions = [
    "Change my dates",
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
      if (!previous) { map.set(msg.id, msg); return; }
      const incomingText = (msg.text || "").trim();
      map.set(msg.id, { ...previous, ...msg, text: incomingText.length ? msg.text : previous.text, role: msg.role || previous.role, createdAt: msg.createdAt || previous.createdAt });
    });
    const merged = Array.from(map.values());
    merged.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    return merged;
  };

  const upsertThreadMessages = useCallback((nextMessages: Record<string, ChatMessage[]>) => {
    setThreads((prev) => {
      const updated = prev.map((thread) => {
        if (!nextMessages[thread.id]) return thread;
        const merged = mergeMessages(thread.messages, nextMessages[thread.id]);
        saveLocalMessages(thread.id, merged);
        return { ...thread, messages: merged };
      });
      return updated;
    });
  }, [saveLocalMessages]);

  const refreshMessages = useCallback(async () => {
    const mapRowsToMessages = (rows: any[]) => {
      const next: Record<string, ChatMessage[]> = {};
      rows.forEach((row: any) => {
        const channelIds: string[] = Array.isArray(row?.channelIds) ? row.channelIds : Array.isArray(row?.channel_ids) ? row.channel_ids : [];
        const safeChannelIds = channelIds.length ? channelIds : ["hq"];
        if (!safeChannelIds.includes(channelId) && !safeChannelIds.includes(linaChannelId)) return;
        const createdAt = row?.createdAt || row?.created_at || new Date().toISOString();
        const message: ChatMessage = { id: String(row?.id || `${createdAt}-${Math.random().toString(16).slice(2)}`), role: mapRole(row?.senderRole || row?.sender_role), text: extractMessageText(String(row?.message || "")) || "New message", ts: new Date(createdAt).toLocaleTimeString().slice(0, 5), createdAt };
        safeChannelIds.forEach((id) => { if (id !== channelId && id !== linaChannelId) return; next[id] = [...(next[id] || []), message]; });
      });
      Object.keys(next).forEach((id) => { next[id].sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()); });
      return next;
    };

    try {
      const params = new URLSearchParams();
      params.set("channelId", channelId);
      const directResp = await fetch(`/api/agent/requests?${params.toString()}`, { cache: "no-store" });
      const directPayload = await directResp.json().catch(() => ({}));
      if (directResp.ok) { const directRows = Array.isArray(directPayload?.data) ? directPayload.data : []; upsertThreadMessages(mapRowsToMessages(directRows)); }
      const linaResp = await fetch(`/api/agent/requests?channelId=${encodeURIComponent(linaChannelId)}`, { cache: "no-store" });
      const linaPayload = await linaResp.json().catch(() => ({}));
      if (linaResp.ok) { const linaRows = Array.isArray(linaPayload?.data) ? linaPayload.data : []; upsertThreadMessages(mapRowsToMessages(linaRows)); }
    } catch {}

    if (isYachtBroker) return;
    try {
      const client = getSupabaseClient();
      const { data, error } = await client.from("agent_inbox_messages").select("id, created_at, channel_ids, message, author, sender_role").order("created_at", { ascending: true });
      if (error) throw error;
      upsertThreadMessages(mapRowsToMessages(Array.isArray(data) ? data : []));
    } catch {}
  }, [channelId, linaChannelId, upsertThreadMessages, isYachtBroker]);

  const postAgentMessage = async (payload: any) => {
    if (!isYachtBroker) {
      try {
        const client = getSupabaseClient();
        const { error } = await client.from("agent_inbox_messages").insert({ id: payload.id, created_at: payload.createdAt, channel_ids: payload.channelIds, message: payload.message, source_path: payload.sourcePath, property_name: payload.propertyName, author: payload.author, sender_role: payload.senderRole, source: payload.source });
        if (!error) return;
      } catch {}
    }
    try {
      await fetch("/api/agent/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } catch {}
  };

  useEffect(() => {
    let active = true;
    const load = async () => { if (!active) return; await refreshMessages(); };
    void load();
    const interval = window.setInterval(load, 30000);
    let realtimeClient: ReturnType<typeof getSupabaseClient> | null = null;
    let realtimeChannel: any = null;
    try {
      realtimeClient = getSupabaseClient();
      realtimeChannel = realtimeClient.channel(`traveler-agent-${channelId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "agent_inbox_messages" }, () => void load()).on("postgres_changes", { event: "UPDATE", schema: "public", table: "agent_inbox_messages" }, () => void load()).on("postgres_changes", { event: "DELETE", schema: "public", table: "agent_inbox_messages" }, () => void load()).subscribe();
    } catch {}
    return () => { active = false; window.clearInterval(interval); if (realtimeClient && realtimeChannel) realtimeClient.removeChannel(realtimeChannel); };
  }, [channelId, refreshMessages]);

  const handleSend = async () => {
    if (!canSend || sending) return;
    const text = input.trim();
    const now = new Date();
    const userMessage: ChatMessage = { id: `${now.getTime()}-user`, role: "user", text, ts: now.toLocaleTimeString().slice(0, 5), createdAt: now.toISOString() };
    setThreads((prev) => prev.map((t) => {
      if (t.id !== activeThread.id) return t;
      const updated = [...t.messages, userMessage];
      saveLocalMessages(t.id, updated);
      return { ...t, messages: updated, unread: 0 };
    }));
    setInput("");
    setSending(true);

    if (activeTab === "lina") {
      await postAgentMessage({ id: userMessage.id, createdAt: userMessage.createdAt || new Date().toISOString(), channelIds: [linaChannelId], sourcePath, propertyName: listing, author: user?.name || user?.email || "Traveler", senderRole: "client", source: "traveler-lina", message: text });
      try {
        const currentThread = threads.find((t) => t.id === "lina-help");
        const history = (currentThread?.messages || []).slice(-20).map((m) => ({ role: m.role === "lina" ? "assistant" : "user", content: m.text || "" }));
        const resp = await fetch("/api/lina", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: text, history }) });
        const data = await resp.json();
        const reply = data?.reply || "Lina is currently unavailable.";
        const linaMessage: ChatMessage = { id: `${now.getTime()}-lina`, role: "lina", text: reply, ts: new Date().toLocaleTimeString().slice(0, 5), createdAt: new Date().toISOString() };
        setThreads((prev) => prev.map((t) => {
          if (t.id !== "lina-help") return t;
          const updated = [...t.messages, linaMessage];
          saveLocalMessages("lina-help", updated);
          return { ...t, messages: updated, unread: 0 };
        }));
        await postAgentMessage({ id: linaMessage.id, createdAt: linaMessage.createdAt || new Date().toISOString(), channelIds: [linaChannelId], sourcePath, propertyName: listing, author: "Lina", senderRole: "lina", source: "traveler-lina", message: reply });
      } finally { setSending(false); }
      return;
    }

    if (activeThread.type !== "agent") { setSending(false); return; }
    try {
      await postAgentMessage({ id: userMessage.id, createdAt: userMessage.createdAt || new Date().toISOString(), channelIds: [channelId, ADMIN_CHANNEL_ID], sourcePath, propertyName: listing, author: user?.name || user?.email || "Traveler", senderRole: "client", source: "traveler-chat", message: text });
    } finally { setSending(false); }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={sourcePath} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="w-px h-5 bg-slate-200" />
            <img src="/branding/logo.png" alt="Zeniva Travel" className="h-7" />
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Agents available
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Hero trust section */}
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#0B1B4D] to-[#0F6CF5] px-6 py-5 flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-blue-400 border-2 border-white flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <img src="/branding/lina-avatar.png" alt="Lina" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Zeniva Travel Support</h1>
              <p className="text-blue-200 text-sm">Real humans + Lina AI — here to help you</p>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-slate-100 px-2">
            <div className="flex items-center gap-2.5 px-4 py-3">
              <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-800">~5 min</p>
                <p className="text-xs text-slate-500">Response time</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-3">
              <Shield className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-800">Verified</p>
                <p className="text-xs text-slate-500">Certified agents</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-3">
              <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-800">24/7</p>
                <p className="text-xs text-slate-500">AI always online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => { setActiveTab("lina"); setSelectedThreadId("lina-help"); }}
            className={`flex-1 flex items-center gap-3 px-5 py-4 rounded-2xl border-2 transition-all text-left ${
              activeTab === "lina"
                ? "border-[#0F6CF5] bg-blue-50 shadow-sm"
                : "border-slate-100 bg-white hover:border-blue-200"
            }`}
          >
            <img src="/branding/lina-avatar.png" alt="Lina" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-900 text-sm">Lina AI</p>
                <span className="text-[10px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI
                </span>
              </div>
              <p className="text-xs text-slate-500">Instant answers, 24/7</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab("agent"); setSelectedThreadId(channelId); }}
            className={`flex-1 flex items-center gap-3 px-5 py-4 rounded-2xl border-2 transition-all text-left ${
              activeTab === "agent"
                ? "border-[#0F6CF5] bg-blue-50 shadow-sm"
                : "border-slate-100 bg-white hover:border-blue-200"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0B1B4D] to-[#0F6CF5] flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-900 text-sm">Human Agent</p>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live
                </span>
              </div>
              <p className="text-xs text-slate-500">Real person, responds in ~5 min</p>
            </div>
          </button>
        </div>

        {/* Human agent trust badge - only when on agent tab */}
        {activeTab === "agent" && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-800">You are chatting with a real Zeniva Travel agent</p>
              <p className="text-xs text-emerald-600">No bots — a certified travel professional will read and reply to your message</p>
            </div>
            <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          </div>
        )}

        {/* Chat window */}
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden flex flex-col" style={{ minHeight: "420px" }}>
          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
            {activeTab === "lina" ? (
              <img src="/branding/lina-avatar.png" alt="Lina" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0B1B4D] to-[#0F6CF5] flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="flex-1">
              <p className="font-bold text-slate-900 text-sm">
                {activeTab === "lina" ? "Lina AI Concierge" : "Zeniva Travel Agent"}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <p className="text-xs text-emerald-600 font-medium">
                  {activeTab === "lina" ? "Online — instant replies" : "Online — human available"}
                </p>
              </div>
            </div>
            {activeTab === "agent" && (
              <span className="text-xs text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full font-medium">
                🔒 Secure & private
              </span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ maxHeight: "380px" }}>
            {(activeThread?.messages || []).map((msg) => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role !== "user" && (
                  <div className="flex-shrink-0 mt-1">
                    {msg.role === "lina" ? (
                      <img src="/branding/lina-avatar.png" alt="Lina" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0B1B4D] to-[#0F6CF5] flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>
                )}
                <div className={`max-w-[72%]`}>
                  {msg.role !== "user" && (
                    <p className="text-[10px] font-semibold text-slate-500 mb-1 ml-1">
                      {msg.role === "lina" ? "Lina AI" : "Zeniva Agent"} · {msg.ts}
                    </p>
                  )}
                  <div className={`rounded-2xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "bg-[#0F6CF5] text-white rounded-tr-sm"
                      : msg.role === "lina"
                      ? "bg-purple-50 border border-purple-100 text-slate-800 rounded-tl-sm"
                      : "bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-sm"
                  }`}>
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                    {msg.role === "user" && (
                      <p className="text-[10px] text-blue-100 mt-1.5 text-right">{msg.ts}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick options */}
          <div className="px-5 py-3 border-t border-slate-50">
            <div className="flex flex-wrap gap-2">
              {quickHelpOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setInput(option)}
                  className="text-xs font-medium text-[#0F6CF5] border border-blue-100 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Input area */}
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50">
            {activeTab === "agent" && (
              <p className="text-[11px] text-slate-400 mb-2 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Your message goes directly to a human Zeniva agent
              </p>
            )}
            <div className="flex items-center gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
                placeholder={activeTab === "lina" ? "Ask Lina anything about your trip..." : "Type your message to our team..."}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition"
              />
              <button
                onClick={handleSend}
                disabled={!canSend || sending}
                className={`flex items-center justify-center w-11 h-11 rounded-xl text-white transition flex-shrink-0 ${
                  canSend && !sending ? "bg-[#0F6CF5] hover:bg-blue-700 shadow-sm" : "bg-blue-200 cursor-not-allowed"
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom trust badges */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2.5 bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
            <Shield className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-800">100% Secure</p>
              <p className="text-xs text-slate-500">Encrypted messages</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
            <User className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-800">Real agents</p>
              <p className="text-xs text-slate-500">Certified professionals</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
            <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-800">Trusted by 400+</p>
              <p className="text-xs text-slate-500">Happy travelers</p>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 pb-4">
          Zeniva Travel · Delaware, USA · info@zeniva.ca ·{" "}
          <Link href="/privacy-policy" className="underline hover:text-slate-600">Privacy Policy</Link>
        </p>
      </div>
    </main>
  );
}
