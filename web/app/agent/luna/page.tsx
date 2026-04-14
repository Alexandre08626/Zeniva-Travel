"use client";
import { useEffect, useRef, useState } from "react";
import { useAuthStore, isHQ } from "../../../src/lib/authStore";

const PREMIUM_BLUE = "#0B1B4D";

interface Message {
  id: string;
  role: "user" | "luna";
  text: string;
  time: string;
}

const QUICK_ACTIONS = [
  { label: "Send SMS campaign", icon: "📤", prompt: "Launch an SMS campaign to all leads with phone numbers" },
  { label: "Check delivery stats", icon: "📊", prompt: "Show me delivery stats for recent SMS campaigns" },
  { label: "Create template", icon: "✍️", prompt: "Help me create a new SMS template" },
  { label: "View call logs", icon: "📞", prompt: "Show me recent inbound call logs" },
  { label: "Schedule follow-up", icon: "⏰", prompt: "Schedule follow-up SMS for leads contacted this week" },
  { label: "Opt-out report", icon: "🚫", prompt: "Show opt-out rates and compliance report" },
];

export default function LunaPage() {
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "luna",
      text: "Hey! I'm Luna, your Voice & SMS assistant. I handle inbound calls, send SMS campaigns via Twilio, and manage all text-based communications with your leads. What would you like to work on?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    // Simulate Luna's response
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

    const lunaMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "luna",
      text: generateResponse(text),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setTyping(false);
    setMessages((prev) => [...prev, lunaMsg]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg">
        <div className="px-6 py-4 flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/30">
              <img src="/agents/luna.png" alt="Luna" className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Luna</h1>
            <p className="text-cyan-100 text-xs">Voice & SMS Agent · Twilio · 24/7</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-1.5 text-xs font-medium border border-white/20">
              <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full mr-1.5 animate-pulse" />
              LIVE
            </div>
          </div>
        </div>
        {/* Quick stats bar */}
        <div className="px-6 pb-3 flex gap-4 text-xs">
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">SMS Sent: 247</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Calls Today: 12</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Response Rate: 34%</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Delivery: 98.2%</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] ${msg.role === "user" ? "order-1" : ""}`}>
              {msg.role === "luna" && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-cyan-600">Luna</span>
                  <span className="text-[10px] text-slate-400">{msg.time}</span>
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-br-md"
                    : "bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm"
                }`}
              >
                {msg.text}
              </div>
              {msg.role === "user" && (
                <div className="text-right mt-1">
                  <span className="text-[10px] text-slate-400">{msg.time}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick Actions */}
      <div className="flex-shrink-0 px-6 py-2 border-t border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => send(action.prompt)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-700 transition-all"
            >
              <span>{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Luna..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-slate-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/35 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

function generateResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("sms campaign") || lower.includes("launch") || lower.includes("send sms")) {
    return "I've prepared an SMS campaign for your leads with phone numbers. Currently 47 leads are eligible. I'll use a personalized template with their name and destination interest. Each SMS includes the 15% signup discount link. Want me to send now or schedule for later?";
  }
  if (lower.includes("delivery") || lower.includes("stats") || lower.includes("report")) {
    return "Here's your SMS performance summary:\n\n- Sent: 247 messages (last 7 days)\n- Delivered: 242 (98.0%)\n- Failed: 5 (2.0%)\n- Replies received: 84 (34%)\n- Opt-outs: 3 (1.2%)\n- Link clicks: 61 (25%)\n- Signups from SMS: 18 (7.3%)\n\nDelivery rates are excellent. Response rate is above industry average (21%).";
  }
  if (lower.includes("template") || lower.includes("create")) {
    return "Sure! Let's create a new SMS template. Remember, it needs to be under 160 characters for best delivery. What's the main purpose?\n\n1. Welcome new lead\n2. Follow-up reminder\n3. Special offer\n4. Urgency/last chance\n\nTell me the type and I'll draft one for you!";
  }
  if (lower.includes("call") || lower.includes("log") || lower.includes("phone")) {
    return "Today's call activity:\n\n- 12 inbound calls received\n- 8 answered by AI voice (avg 2m 34s)\n- 4 transferred to live agent\n- 3 new leads captured from calls\n- 1 booking inquiry forwarded to advisor\n\nTop caller locations: Montreal (4), Toronto (3), Laval (2), Quebec City (2), Ottawa (1)";
  }
  if (lower.includes("follow-up") || lower.includes("schedule")) {
    return "I'll schedule follow-up SMS for leads contacted this week. Here's my plan:\n\n- 23 leads contacted but no reply — follow-up in 48h\n- 12 leads who opened link but didn't sign up — gentle reminder in 24h\n- 8 leads who replied but didn't convert — personal touch in 72h\n\nI'll use different templates for each group. Should I proceed?";
  }
  if (lower.includes("opt-out") || lower.includes("compliance") || lower.includes("unsubscribe")) {
    return "Compliance report:\n\n- Total opt-outs: 3 out of 247 (1.2%)\n- Industry average: 2-5%\n- All opt-outs processed within 30 seconds\n- REPLY STOP included in all messages\n- TCPA/CASL compliant\n\nYour opt-out rate is well below industry average. No compliance issues detected.";
  }
  return "Got it! I can help with that. I manage all SMS campaigns via Twilio and handle inbound voice calls. Would you like me to draft an SMS, check campaign stats, or manage call routing? Just let me know!";
}
