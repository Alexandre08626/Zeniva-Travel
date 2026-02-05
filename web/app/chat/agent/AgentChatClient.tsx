"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Send, Search } from "lucide-react";

const ADMIN_CHANNEL_ID = "hq";

type ChatMessage = {
  id: string;
  role: "user" | "agent";
  text: string;
  ts: string;
};

type ChatThread = {
  id: string;
  title: string;
  listingTitle: string;
  unread: number;
  avatar: string;
  type: "agent" | "owner";
  messages: ChatMessage[];
};

export default function TravelerAgentChatClient() {
  const searchParams = useSearchParams();
  const listing = searchParams?.get("listing") || "short‑term stay";
  const sourcePath = searchParams?.get("source") || "/residences";
  const channelId = searchParams?.get("channel") || "agent-alexandre";
  const [threads, setThreads] = useState<ChatThread[]>([
    {
      id: channelId,
      title: "Zeniva Agent",
      listingTitle: listing,
      unread: 0,
      avatar: "/branding/lina-avatar.png",
      type: "agent",
      messages: [
        {
          id: "welcome",
          role: "agent",
          text: `Hi! An agent will be with you shortly. How can we help with ${listing}?`,
          ts: new Date().toLocaleTimeString().slice(0, 5),
        },
      ],
    },
    {
      id: "owner-demo",
      title: "Property Owner",
      listingTitle: `${listing} · Owner chat`,
      unread: 1,
      avatar: "/branding/logo.png",
      type: "owner",
      messages: [
        {
          id: "owner-1",
          role: "agent",
          text: "Hello! I’m the property owner. Happy to answer any questions about check-in or amenities.",
          ts: "09:10",
        },
        {
          id: "owner-2",
          role: "user",
          text: "Thanks! Is early check-in possible around noon?",
          ts: "09:12",
        },
        {
          id: "owner-3",
          role: "agent",
          text: "Yes, we can offer early check-in if the unit is ready. I’ll confirm the day before.",
          ts: "09:13",
        },
      ],
    },
  ]);
  const [selectedThreadId, setSelectedThreadId] = useState(channelId);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

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
            <p className="text-sm uppercase tracking-wide text-slate-500">Chat with an agent</p>
            <h1 className="text-2xl font-black text-slate-900">{listing}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/chat?prompt=Plan%20a%20trip"
              className="flex items-center gap-3 rounded-full border border-blue-200 bg-white px-3 py-2 shadow-sm hover:bg-blue-50 transition"
            >
              <Image
                src="/branding/lina-avatar.png"
                alt="Lina"
                width={40}
                height={40}
                sizes="40px"
                quality={100}
                className="rounded-full ring-2 ring-blue-200"
              />
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900">Lina AI</p>
                <p className="text-[11px] font-semibold text-blue-700">Concierge option</p>
              </div>
            </Link>
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
              <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Actions</p>
              <button className="text-xs font-semibold text-blue-700">Mark as resolved</button>
              <button className="text-xs font-semibold text-blue-700">Add internal note</button>
            </div>
          </aside>

          <div className="flex-1 min-w-0 rounded-2xl border border-blue-100 bg-white overflow-hidden flex">
            {/* Threads List */}
            <div className="w-80 border-r border-blue-100 bg-blue-50/60 flex flex-col h-full">
              <div className="p-4 border-b border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Bookings</p>
                    <h2 className="text-lg font-bold text-slate-900">Your conversations</h2>
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
                    onClick={() => setSelectedThreadId(thread.id)}
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
