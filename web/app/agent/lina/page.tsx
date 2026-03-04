"use client";
export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/src/lib/authStore";

const PREMIUM_BLUE = "#0B1B4D";
const BRAND_BLUE = "#0F6CF5";

interface ChatMessage {
  id: string;
  role: "user" | "lina";
  text: string;
  ts: string;
}

const QUICK_CHIPS = [
  "Show my leads",
  "Summarize today",
  "Write a proposal",
  "Follow up clients",
];

function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function LinaAgentPage() {
  const user = useAuthStore((s) => s.user);
  const agentEmail = user?.email ?? "agent";
  const sessionId = `${agentEmail}_agent`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "lina",
      text: "👋 Hi! I'm Lina, your AI travel assistant. I can help you manage leads, draft proposals, follow up with clients, and more. What do you need today?",
      ts: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", text: trimmed, ts: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/agents-proxy?path=chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, session_id: sessionId, source: "agent_portal" }),
      });
      const json = await res.json();
      const reply = json?.reply ?? json?.response ?? json?.message ?? "I received your message. Let me look into that for you.";
      const linaMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: "lina", text: reply, ts: new Date().toISOString() };
      setMessages((prev) => [...prev, linaMsg]);
    } catch {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "lina",
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        ts: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: PREMIUM_BLUE }}>
      {/* Header */}
      <div
        className="px-6 py-4 border-b flex items-center gap-4"
        style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }}
      >
        <div className="relative">
          <img
            src="/branding/lina-avatar.png"
            alt="Lina"
            className="w-12 h-12 rounded-full border-2 border-white/20 object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              (e.currentTarget.nextElementSibling as HTMLElement | null)?.removeAttribute("style");
            }}
          />
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-xl"
            style={{ background: "#6366f1", display: "none" }}
          >
            L
          </div>
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-emerald-400 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-white text-xl">Lina AI</span>
            <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-slate-400 text-sm">Your AI travel assistant</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-12 py-6 space-y-4" style={{ maxHeight: "calc(100vh - 200px)" }}>
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "lina" && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-white text-sm" style={{ background: "#6366f1" }}>
                L
              </div>
            )}
            <div
              className={`max-w-sm lg:max-w-xl px-4 py-3 rounded-2xl text-sm shadow-sm whitespace-pre-wrap ${
                m.role === "user" ? "text-white rounded-br-md" : "rounded-bl-md"
              }`}
              style={
                m.role === "user"
                  ? { background: BRAND_BLUE }
                  : { background: "#EEF2FF", color: "#3730A3" }
              }
            >
              <p>{m.text}</p>
              <p className={`text-[10px] mt-1.5 ${m.role === "user" ? "text-blue-200 text-right" : "text-indigo-300"}`}>{fmtTime(m.ts)}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-white text-sm" style={{ background: "#6366f1" }}>L</div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-md" style={{ background: "#EEF2FF" }}>
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick chips */}
      <div className="px-4 md:px-12 pb-2">
        <div className="flex gap-2 flex-wrap">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => void sendMessage(chip)}
              disabled={loading}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border border-white/20 text-white/80 hover:bg-white/10 transition disabled:opacity-40"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 md:px-12 py-4">
        <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(input); } }}
            placeholder="Ask Lina anything about your clients, trips, proposals…"
            className="flex-1 px-3 py-2 text-sm text-slate-800 bg-transparent focus:outline-none"
          />
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition"
            title="Voice input"
          >
            🎤
          </button>
          <button
            onClick={() => void sendMessage(input)}
            disabled={loading || !input.trim()}
            className="px-4 py-2 rounded-xl font-bold text-white text-sm disabled:opacity-50 transition hover:opacity-90"
            style={{ background: BRAND_BLUE }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
