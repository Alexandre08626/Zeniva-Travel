"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Send, Search } from "lucide-react";

const ADMIN_CHANNEL_ID = "hq";

type ChatMessage = {
  id: string;
  role: "user" | "agent" | "lina";
  text: string;
  ts: string;
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
  const channelId = searchParams?.get("channel") || "agent-alexandre";
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
      avatar: "/branding/lina-avatar.png",
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
  const [selectedThreadId, setSelectedThreadId] = useState("lina-help");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"lina" | "agent">("lina");
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

  const handleSend = async () => {
    if (!canSend || sending) return;
    const text = input.trim();
    const now = new Date();
    const userMessage: ChatMessage = {
      id: `${now.getTime()}-user`,
      role: "user",
      text,
      ts: now.toLocaleTimeString().slice(0, 5),
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id ? { ...t, messages: [...t.messages, userMessage], unread: 0 } : t
      )
    );
    setInput("");
    setSending(true);

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
        };
        setThreads((prev) =>
          prev.map((t) =>
            t.id === "lina-help" ? { ...t, messages: [...t.messages, linaMessage], unread: 0 } : t
          )
        );
      } finally {
        setSending(false);
      }
      return;
    }

    if (activeThread.type !== "agent") {
      setSending(false);
      return;
    }

    const payload = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: new Date().toISOString(),
      channelIds: [channelId, ADMIN_CHANNEL_ID],
      sourcePath,
      propertyName: listing,
      message: [
        "New traveler chat message",
        `Listing: ${listing}`,
        `Source page: ${sourcePath}`,
        `Message: ${text}`,
      ].join("\n"),
    };

    try {
      await fetch("/api/agent/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto flex h-[calc(100vh-3rem)] max-w-[1500px] flex-col gap-6">
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
          <aside className="w-80 xl:w-96 flex flex-col gap-3 overflow-y-auto">
            <div className="rounded-2xl border border-blue-100 bg-white p-4 space-y-3">
              <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Conversation details</p>
              <div className="text-sm font-semibold text-slate-900">{activeThread?.title}</div>
              <div className="text-xs text-blue-700">Listing: {activeThread?.listingTitle || listing}</div>
              <div className="text-xs text-blue-700">Status: Inquiry (no reservation linked)</div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">Direct chat</span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">Human agent</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {quickHelpOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setInput(option)}
                    className="rounded-full border border-blue-100 bg-white px-2 py-0.5 text-[11px] font-semibold text-blue-700"
                  >
                    {option}
                  </button>
                ))}
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

            <div className="rounded-xl border border-blue-100 bg-white p-3 space-y-2">
              <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Quick help</p>
              <div className="flex flex-wrap gap-2">
                {quickHelpOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setInput(option)}
                    className="rounded-full border border-blue-100 bg-white px-3 py-1 text-[11px] font-semibold text-blue-700"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0 rounded-2xl border border-blue-100 bg-white overflow-hidden flex">
            {/* Threads List */}
            <div className="w-80 border-r border-blue-100 bg-blue-50/60 flex flex-col h-full">
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
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {quickHelpOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setInput(option)}
                      className="rounded-full border border-blue-100 bg-white px-3 py-1 text-blue-700 font-semibold"
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
                      <p className={`mt-2 text-[10px] ${msg.role === "user" ? "text-blue-100" : "text-slate-500"}`}>
                        {msg.ts}
                      </p>
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
                    className="flex-1 rounded-full border border-blue-100 px-4 py-3 text-sm outline-none"
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
