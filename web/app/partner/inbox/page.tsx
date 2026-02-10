"use client";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Send, Search } from "lucide-react";
import PageHeader from '../../../src/components/partner/PageHeader';
import LinaAvatar from "../../../src/components/LinaAvatar";
import { useAuthStore } from "../../../src/lib/authStore";
import { buildChatChannelId, buildContactChannelId } from "../../../src/lib/chatPersistence";
import { getSupabaseClient } from "../../../src/lib/supabase/client";

type HelpMessage = {
  id: string;
  sender: "host" | "lina" | "agent";
  text: string;
  timestamp: string;
};

type HelpThread = {
  id: string;
  title: string;
  subtitle: string;
  type: "lina" | "agent";
  avatar: string;
  messages: HelpMessage[];
};

const INITIAL_THREADS: HelpThread[] = [
  {
    id: "lina-help",
    title: "Lina AI Partner Advisor",
    subtitle: "AI-first Help Center",
    type: "lina",
    avatar: "/branding/lina-avatar.png",
    messages: [
      {
        id: "welcome-lina",
        sender: "lina",
        text: "Hi! I can help with listings, pricing, availability, and guest communication. Switch to Agent for complex escalations.",
        timestamp: new Date().toISOString(),
      },
    ],
  },
  {
    id: "agent-help",
    title: "Zeniva Partner Agent",
    subtitle: "Human support for escalations",
    type: "agent",
    avatar: "/branding/lina-avatar.png",
    messages: [
      {
        id: "welcome-agent",
        sender: "agent",
        text: "Hi! I can help resolve complex issues or finalize booking changes.",
        timestamp: new Date().toISOString(),
      },
    ],
  },
];

export default function InboxPage() {
  const user = useAuthStore((s) => s.user);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"lina" | "agent">("lina");
  const [threads, setThreads] = useState<HelpThread[]>(INITIAL_THREADS);
  const [selectedThreadId, setSelectedThreadId] = useState("lina-help");
  const linaChannelId = useMemo(() => buildChatChannelId(user?.email, "partner-lina"), [user?.email]);
  const agentChannelId = useMemo(() => buildChatChannelId(user?.email, "partner-agent"), [user?.email]);
  const contactChannelId = useMemo(() => buildContactChannelId(user?.email), [user?.email]);

  const activeThread = useMemo(() => threads.find((t) => t.id === selectedThreadId) || threads[0], [threads, selectedThreadId]);

  const mergeMessages = (existing: HelpMessage[], incoming: HelpMessage[]) => {
    const map = new Map<string, HelpMessage>();
    existing.forEach((msg) => map.set(msg.id, msg));
    incoming.forEach((msg) => map.set(msg.id, msg));
    const merged = Array.from(map.values());
    merged.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return merged;
  };

  const refreshMessages = useCallback(async () => {
    if (!user?.email) return;
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from("agent_inbox_messages")
        .select("id, created_at, channel_ids, message, author, sender_role")
        .order("created_at", { ascending: true });
      if (error) throw error;

      const rows = Array.isArray(data) ? data : [];
      const next: Record<string, HelpMessage[]> = { "lina-help": [], "agent-help": [] };
      rows.forEach((row: any) => {
        const channelIds: string[] = Array.isArray(row?.channel_ids) ? row.channel_ids : [];
        const createdAt = row?.created_at || new Date().toISOString();
        const senderRole = row?.sender_role;
        const sender = senderRole === "lina" ? "lina" : senderRole === "agent" || senderRole === "hq" ? "agent" : "host";
        const message: HelpMessage = {
          id: String(row?.id || createdAt),
          sender,
          text: String(row?.message || "").trim() || "Message",
          timestamp: createdAt,
        };
        if (channelIds.includes(linaChannelId)) {
          next["lina-help"].push(message);
        }
        if (channelIds.includes(contactChannelId) || channelIds.includes(agentChannelId)) {
          next["agent-help"].push(message);
        }
      });

      setThreads((prev) =>
        prev.map((thread) => {
          if (thread.id === "lina-help") {
            return { ...thread, messages: mergeMessages(thread.messages, next["lina-help"]) };
          }
          if (thread.id === "agent-help") {
            return { ...thread, messages: mergeMessages(thread.messages, next["agent-help"]) };
          }
          return thread;
        })
      );
    } catch {
      // ignore
    }
  }, [user?.email, linaChannelId, contactChannelId, agentChannelId]);

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
        .channel("partner-inbox")
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
      // ignore
    }

    return () => {
      active = false;
      window.clearInterval(interval);
      if (realtimeClient && realtimeChannel) {
        realtimeClient.removeChannel(realtimeChannel);
      }
    };
  }, [refreshMessages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending) return;
    
    const newMessage: HelpMessage = {
      id: `msg-${Date.now()}`,
      sender: "host" as const,
      text: messageText,
      timestamp: new Date().toISOString(),
    };

    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === activeThread.id
          ? {
              ...thread,
              messages: [...thread.messages, newMessage],
            }
          : thread
      )
    );

    setMessageText('');

    const activeChannelId = activeTab === "lina" ? linaChannelId : contactChannelId || agentChannelId;
    if (activeChannelId) {
      try {
        const client = getSupabaseClient();
        await client.from("agent_inbox_messages").insert({
          id: newMessage.id,
          created_at: newMessage.timestamp,
          channel_ids: activeTab === "agent" ? [activeChannelId, "hq"].filter(Boolean) : [activeChannelId],
          message: newMessage.text,
          author: user?.name || user?.email || "Partner",
          sender_role: "client",
          source: "partner-inbox",
          source_path: "/partner/inbox",
          property_name: "Partner Help Center",
        });
      } catch {
        // ignore
      }
    }

    if (activeTab === "lina") {
      setSending(true);
      try {
        const resp = await fetch(`/api/chat?prompt=${encodeURIComponent(newMessage.text)}&mode=partner`);
        const data = await resp.json();
        const reply = data?.reply || "Lina is currently unavailable.";
        const linaMessage: HelpMessage = {
          id: `lina-${Date.now()}`,
          sender: "lina" as const,
          text: reply,
          timestamp: new Date().toISOString(),
        };
        setThreads((prev) =>
          prev.map((thread) =>
            thread.id === "lina-help"
              ? { ...thread, messages: [...thread.messages, linaMessage] }
              : thread
          )
        );
        if (linaChannelId) {
          try {
            const client = getSupabaseClient();
            await client.from("agent_inbox_messages").insert({
              id: linaMessage.id,
              created_at: linaMessage.timestamp,
              channel_ids: [linaChannelId],
              message: reply,
              author: "Lina",
              sender_role: "lina",
              source: "partner-inbox",
              source_path: "/partner/inbox",
              property_name: "Partner Help Center",
            });
          } catch {
            // ignore
          }
        }
      } finally {
        setSending(false);
      }
      return;
    }
  };

  return (
    <div>
      <PageHeader
        title="Partner Help Center"
        subtitle="AI-first support with agent escalation when needed"
        backHref="/partner/dashboard"
        breadcrumbs={[
          { label: "Partner", href: "/partner/dashboard" },
          { label: "Help Center" }
        ]}
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex" style={{ height: "calc(100vh - 280px)" }}>
        {/* Threads List */}
        <div className="w-96 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search help center..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
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
                className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left ${
                  activeThread?.id === thread.id ? "bg-emerald-50" : ""
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <img src={thread.avatar} alt={thread.title} className="w-10 h-10 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900 truncate">{thread.title}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{thread.subtitle}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 truncate">{thread.messages[thread.messages.length - 1]?.text}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(thread.messages[thread.messages.length - 1]?.timestamp).toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <LinaAvatar size="sm" />
              <div>
                <h3 className="font-semibold text-gray-900">{activeThread.title}</h3>
                <p className="text-sm text-gray-600">{activeThread.subtitle}</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="inline-flex rounded-full border border-gray-200 bg-white p-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("lina");
                  setSelectedThreadId("lina-help");
                }}
                className={`rounded-full px-4 py-1 text-sm font-semibold ${activeTab === "lina" ? "bg-white text-emerald-700" : "text-gray-600"}`}
              >
                Lina AI
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("agent");
                  setSelectedThreadId("agent-help");
                }}
                className={`rounded-full px-4 py-1 text-sm font-semibold ${activeTab === "agent" ? "bg-white text-emerald-700" : "text-gray-600"}`}
              >
                Human agent
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {[
                "Update pricing",
                "Fix availability",
                "Guest complaint",
                "Booking change",
                "Payout issue",
                "Listing optimization",
              ].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMessageText(option)}
                  className="rounded-full border border-emerald-100 bg-white px-3 py-1 text-emerald-700 font-semibold"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {activeThread.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "host" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-md px-4 py-3 rounded-lg ${
                  msg.sender === "host"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === "host" ? "text-emerald-100" : "text-gray-500"}`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={sending}
                className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
