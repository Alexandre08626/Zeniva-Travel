"use client";
export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/src/lib/authStore";

const PREMIUM_BLUE = "#0B1B4D";
const BRAND_BLUE = "#0F6CF5";

interface Message {
  id: string;
  role: "client" | "agent";
  text: string;
  ts: string;
}

interface Conversation {
  id: string;
  client_name: string;
  client_email?: string;
  last_message: string;
  last_ts: string;
  unread: number;
  messages: Message[];
}

const DEMO_CONVOS: Conversation[] = [
  {
    id: "c1", client_name: "Sarah Mitchell", client_email: "sarah@example.com",
    last_message: "Can you send me the Paris itinerary?", last_ts: "2025-03-04T18:30:00Z", unread: 2,
    messages: [
      { id: "m1", role: "client", text: "Hi! I'm interested in a Paris trip for April.", ts: "2025-03-04T14:00:00Z" },
      { id: "m2", role: "agent", text: "Hello Sarah! Paris in April is beautiful. I'll prepare a custom proposal for you.", ts: "2025-03-04T14:05:00Z" },
      { id: "m3", role: "client", text: "Can you send me the Paris itinerary?", ts: "2025-03-04T18:30:00Z" },
    ],
  },
  {
    id: "c2", client_name: "Carlos Ramirez", client_email: "carlos@example.com",
    last_message: "Great, see you then!", last_ts: "2025-03-04T16:00:00Z", unread: 0,
    messages: [
      { id: "m1", role: "agent", text: "Carlos, your Cancún booking is confirmed for May 10–17!", ts: "2025-03-03T10:00:00Z" },
      { id: "m2", role: "client", text: "Amazing, thank you so much!", ts: "2025-03-03T10:10:00Z" },
      { id: "m3", role: "client", text: "Great, see you then!", ts: "2025-03-04T16:00:00Z" },
    ],
  },
  {
    id: "c3", client_name: "Emma Thompson", client_email: "emma@example.com",
    last_message: "What's the best time to visit?", last_ts: "2025-03-04T12:00:00Z", unread: 1,
    messages: [
      { id: "m1", role: "client", text: "I'm dreaming of the Maldives!", ts: "2025-03-04T11:55:00Z" },
      { id: "m2", role: "client", text: "What's the best time to visit?", ts: "2025-03-04T12:00:00Z" },
    ],
  },
];

function avatarLetter(name: string) {
  return name?.trim().charAt(0).toUpperCase() || "?";
}

const COLORS = ["#0F6CF5", "#7C3AED", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatHubPage() {
  const user = useAuthStore((s) => s.user);
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/agents-proxy?path=admin/agent-conversations");
        if (!res.ok) throw new Error();
        const json = await res.json();
        const arr: Conversation[] = Array.isArray(json) ? json : json?.data ?? [];
        setConvos(arr.length > 0 ? arr : DEMO_CONVOS);
        if (arr.length > 0 || DEMO_CONVOS.length > 0) {
          setSelected((arr.length > 0 ? arr : DEMO_CONVOS)[0].id);
        }
      } catch {
        setConvos(DEMO_CONVOS);
        setSelected(DEMO_CONVOS[0].id);
      }
    };
    void load();
  }, [user?.email]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected, convos]);

  const activeCon = convos.find((c) => c.id === selected) ?? null;

  const sendMessage = async () => {
    if (!inputText.trim() || !activeCon) return;
    setSending(true);
    const msg: Message = { id: Date.now().toString(), role: "agent", text: inputText.trim(), ts: new Date().toISOString() };
    setConvos((prev) =>
      prev.map((c) =>
        c.id === activeCon.id
          ? { ...c, messages: [...c.messages, msg], last_message: msg.text, last_ts: msg.ts }
          : c
      )
    );
    setInputText("");
    setSending(false);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: PREMIUM_BLUE }}>
      <div className="p-6 pb-0">
        <h1 className="text-3xl font-black text-white mb-1">💬 Chat Hub</h1>
        <p className="text-slate-400 text-sm mb-4">Message your clients directly</p>
      </div>

      <div className="flex flex-1 mx-6 mb-6 gap-4 min-h-0" style={{ height: "calc(100vh - 140px)" }}>
        {/* Contact list */}
        <div className="w-72 shrink-0 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <p className="font-bold text-slate-900 text-sm">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {convos.length === 0 ? (
              <p className="text-sm text-slate-400 text-center mt-8">No conversations yet</p>
            ) : convos.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-slate-50 transition hover:bg-slate-50 ${selected === c.id ? "bg-blue-50" : ""}`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0"
                  style={{ background: avatarColor(c.client_name) }}
                >
                  {avatarLetter(c.client_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 text-sm truncate">{c.client_name}</span>
                    {c.unread > 0 && (
                      <span className="ml-1 bg-blue-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 shrink-0">{c.unread}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{c.last_message}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-w-0">
          {!activeCon ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              Select a conversation
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm"
                  style={{ background: avatarColor(activeCon.client_name) }}
                >
                  {avatarLetter(activeCon.client_name)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{activeCon.client_name}</p>
                  {activeCon.client_email && <p className="text-xs text-slate-400">{activeCon.client_email}</p>}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {activeCon.messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === "agent" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                      m.role === "agent"
                        ? "text-white rounded-br-md"
                        : "bg-slate-100 text-slate-800 rounded-bl-md"
                    }`} style={m.role === "agent" ? { background: BRAND_BLUE } : {}}>
                      <p>{m.text}</p>
                      <p className={`text-[10px] mt-1 ${m.role === "agent" ? "text-blue-200" : "text-slate-400"}`}>{fmtTime(m.ts)}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-5 py-3 border-t border-slate-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(); } }}
                    placeholder="Type a message…"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  />
                  <button
                    onClick={() => void sendMessage()}
                    disabled={sending || !inputText.trim()}
                    className="px-4 py-2.5 rounded-xl font-semibold text-white text-sm disabled:opacity-50 transition hover:opacity-90"
                    style={{ background: BRAND_BLUE }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
