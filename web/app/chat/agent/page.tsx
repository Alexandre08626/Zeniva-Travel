"use client";

export const dynamic = "force-dynamic";

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

export default function TravelerAgentChatPage() {
  const searchParams = useSearchParams();
  const listing = searchParams?.get("listing") || "Airbnb stay";
  const sourcePath = searchParams?.get("source") || "/airbnbs";
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
      listingTitle: `${listing} · Owner chat` ,
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

    setThreads((prev) => prev.map((t) => (
      t.id === activeThread.id
        ? { ...t, messages: [...t.messages, userMessage], unread: 0 }
        : t
    )));
    setInput("");
    setSending(true);

    if (activeThread.type !== "agent") {
      setSending(false);
      return;
    }

    const payload = {
      id: (typeof crypto !== "undefined" && "randomUUID" in crypto) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
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
            <Link href="/chat?prompt=Plan%20a%20trip" className="flex items-center gap-3 rounded-full border border-blue-200 bg-white px-3 py-2 shadow-sm hover:bg-blue-50 transition">
              <Image src="/branding/lina-avatar.png" alt="Lina" width={40} height={40} sizes="40px" quality={100} className="rounded-full ring-2 ring-blue-200" />
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900">Lina AI</p>
                <p className="text-[11px] font-semibold text-blue-700">VIP concierge option</p>
              </div>
            </Link>
            <Link href={sourcePath} className="inline-flex items-center px-4 py-2 rounded-full bg-white border text-sm font-semibold text-slate-800 shadow-sm">
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
                {(activeThread?.messages[activeThread?.messages.length - 1]?.text || "No messages yet.")}
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
                  <span className="rounded-full bg-blue-600 text-white text-xs font-semibold px-2 py-1">{threads.length}</span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    className="w-full pl-10 pr-4 py-2.5 border border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {threads.map((t) => {
                  const lastMessage = t.messages[t.messages.length - 1]?.text || "";
                  const active = t.id === activeThread.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedThreadId(t.id)}
                      className={`w-full p-4 border-b border-blue-100 text-left transition ${active ? "bg-white" : "hover:bg-blue-50"}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <img src={t.avatar} alt={t.title} className="w-10 h-10 rounded-full ring-2 ring-blue-200" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-900 truncate">{t.title}</span>
                            {t.unread > 0 && (
                              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">{t.unread}</span>
                            )}
                          </div>
                          <p className="text-sm text-blue-800/80 truncate">{t.listingTitle}</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 truncate">{lastMessage}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 font-semibold">
                        <span className="rounded-full bg-blue-100 px-2 py-0.5">Booking</span>
                        <span className="rounded-full bg-blue-50 px-2 py-0.5">Direct chat</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col h-full min-w-0">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <img src={activeThread?.avatar} alt={activeThread?.title} className="w-10 h-10 rounded-full" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{activeThread?.title}</h3>
                    <p className="text-sm text-gray-600">{activeThread?.listingTitle}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {activeThread?.messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-md px-4 py-3 rounded-lg ${
                      m.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}>
                      <p className="text-sm">{m.text}</p>
                      <p className={`text-xs mt-1 ${m.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                        {m.ts}
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
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!canSend || sending}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-60"
                  >
                    <Send className="w-5 h-5" />
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            </div>

            {/* Agent tools */}
            <aside className="w-80 border-l border-blue-100 bg-blue-50/60 hidden xl:flex flex-col overflow-y-auto">
              <div className="p-4 border-b border-blue-100">
                <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Agent tools</p>
                <h3 className="text-lg font-bold text-slate-900">Power actions</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="rounded-xl border border-blue-100 bg-white p-3 space-y-2">
                  <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Quick replies</p>
                  {[
                    "Thanks! I’ll confirm availability and reply shortly.",
                    "Early check-in is possible if the unit is ready.",
                    "Can you confirm your arrival time and guest count?",
                  ].map((t) => (
                    <button key={t} className="w-full text-left text-xs font-semibold text-blue-700 border border-blue-200 rounded-lg px-2 py-2 hover:bg-blue-50">
                      {t}
                    </button>
                  ))}
                </div>

                <div className="rounded-xl border border-blue-100 bg-white p-3 space-y-2">
                  <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Reservation actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="rounded-lg bg-blue-600 text-white text-xs font-semibold py-2">Pre‑approve</button>
                    <button className="rounded-lg border border-blue-200 text-blue-700 text-xs font-semibold py-2">Special offer</button>
                    <button className="rounded-lg border border-blue-200 text-blue-700 text-xs font-semibold py-2">Decline</button>
                    <button className="rounded-lg border border-blue-200 text-blue-700 text-xs font-semibold py-2">Block dates</button>
                  </div>
                </div>

                <div className="rounded-xl border border-blue-100 bg-white p-3 space-y-2">
                  <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Notes</p>
                  <textarea className="w-full rounded-lg border border-blue-200 px-2 py-2 text-xs" placeholder="Internal notes for this booking"></textarea>
                  <button className="w-full rounded-lg bg-blue-600 text-white text-xs font-semibold py-2">Save note</button>
                </div>

                <div className="rounded-xl border border-blue-100 bg-white p-3 space-y-2">
                  <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Calendar</p>
                  <div className="text-xs text-blue-700">Check‑in: Mar 15, 2026</div>
                  <div className="text-xs text-blue-700">Checkout: Mar 21, 2026</div>
                  <button className="text-xs font-semibold text-blue-700">Open calendar</button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
