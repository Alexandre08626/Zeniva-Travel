"use client";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/src/lib/authStore";

const AUTH = "Bearer zeniva-secret-2025";

interface ChatMessage {
  id: string;
  role: "user" | "lina";
  text: string;
  ts: string;
  action?: string;
}

// Command chips — Lina can execute these
const COMMANDS = [
  { label: "📋 New leads today",      msg: "Show me all new leads from today with their destination and budget" },
  { label: "📊 Daily report",         msg: "Give me a full summary: new leads, messages, bookings, and revenue today" },
  { label: "✈️ Create proposal",      msg: "Create a travel proposal for a client. I'll give you the details: client name, destination, dates, number of travelers, and budget." },
  { label: "💰 Generate invoice",     msg: "Generate an invoice for a client booking. Tell me the client name, destination, dates, and total amount." },
  { label: "📧 Luna: send email",     msg: "Tell Luna to send a follow-up email to all new leads from this week" },
  { label: "🌟 Sofia: upsell",        msg: "Tell Sofia to contact all clients who booked in the last 30 days with upgrade offers" },
  { label: "🔔 Follow-up needed",     msg: "Which clients haven't responded in the last 7 days? Draft personalized follow-up messages for each." },
  { label: "💸 Commission pipeline",  msg: "Show me my current commission pipeline and which bookings are pending payment" },
];

function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function formatMessage(text: string) {
  // Bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  );
}

export default function LinaAgentPage() {
  const user = useAuthStore((s) => s.user);
  const agentName = (user as any)?.first_name ? `${(user as any).first_name} ${(user as any).last_name || ""}`.trim() : (user?.name || user?.email || "Agent");
  const agentEmail = user?.email ?? "agent";
  const sessionId = `${agentEmail}_agent_v2`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "lina",
      text: `👋 Hi ${agentName}! I'm Lina, your AI command center.\n\nI can help you:\n• **Manage your leads & clients** — view, follow up, qualify\n• **Draft proposals** — personalized trip packages\n• **Command other agents** — tell Marco to hunt leads, Sofia to email, Luna to SMS\n• **Get daily insights** — summaries, pipeline status, hot destinations\n\nWhat do you need today?`,
      ts: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dashStats, setDashStats] = useState<any>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load agent context
  useEffect(() => {
    if (!user?.email) return;
    const load = async () => {
      try {
        const p = new URLSearchParams({ path: "admin/dashboard-stats", agent_email: user.email! });
        const r = await fetch(`/api/agents-proxy?${p}`);
        if (r.ok) setDashStats(await r.json());
      } catch {}
    };
    void load();
  }, [user?.email]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", text: trimmed, ts: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Build rich context for Lina
      const contextNote = dashStats
        ? `[AGENT CONTEXT: ${agentName} (${agentEmail}), Active clients: ${dashStats.active_clients || 0}, Open dossiers: ${dashStats.open_dossiers || 0}, Commission pipeline: $${dashStats.commission_pipeline || 0}, Follow-ups due: ${dashStats.followups_due || 0}]`
        : `[AGENT: ${agentName} (${agentEmail})]`;

      const enrichedMessage = `${contextNote}\n\nAgent says: ${trimmed}`;

      const res = await fetch("/api/agents-proxy?path=chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: enrichedMessage,
          session_id: sessionId,
          source: "agent_portal",
          agent_email: agentEmail,
        }),
      });
      const json = await res.json();
      const reply = json?.reply ?? json?.response ?? json?.message ?? "I received your message. Let me look into that for you.";

      // Check if this is an agent command and log it
      const lowerMsg = trimmed.toLowerCase();
      if (lowerMsg.includes("marco") || lowerMsg.includes("sofia") || lowerMsg.includes("luna") || lowerMsg.includes("noah")) {
        const targetAgent = lowerMsg.includes("marco") ? "marco" : lowerMsg.includes("sofia") ? "sofia" : lowerMsg.includes("luna") ? "luna" : "noah";
        await fetch("/api/agents-proxy?path=admin/agent-command", {
          method: "POST",
          headers: { Authorization: AUTH, "Content-Type": "application/json" },
          body: JSON.stringify({ command: trimmed, agent: targetAgent, context: { issued_by: agentEmail } }),
        }).catch(() => {});
      }

      const linaMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: "lina", text: reply, ts: new Date().toISOString() };
      setMessages((prev) => [...prev, linaMsg]);
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(), role: "lina",
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        ts: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: "welcome",
      role: "lina",
      text: `👋 Chat cleared! How can I help you, ${agentName}?`,
      ts: new Date().toISOString(),
    }]);
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: "#0B1B4D" }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src="/branding/lina-avatar.png" alt="Lina" className="w-12 h-12 rounded-full border-2 border-white/30 object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; }} />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0B1B4D] bg-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-xl">Lina AI</span>
              <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-slate-400 text-sm">Your AI Command Center · {agentName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {dashStats && (
            <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400">
              <span>👥 <strong className="text-white">{dashStats.active_clients || 0}</strong> clients</span>
              <span>🎯 <strong className="text-white">{dashStats.open_dossiers || 0}</strong> dossiers</span>
              <span>⏰ <strong className="text-amber-400">{dashStats.followups_due || 0}</strong> follow-ups</span>
            </div>
          )}
          <button onClick={clearChat} className="text-xs text-slate-400 hover:text-white border border-white/20 px-3 py-1.5 rounded-full transition-colors">
            Clear
          </button>
        </div>
      </div>

      {/* ── AI Agents team row ── */}
      <div className="flex gap-2 px-6 py-3 border-b border-white/10 overflow-x-auto bg-white/5">
        <span className="text-xs text-slate-400 flex items-center shrink-0 mr-1">Command an agent →</span>
        {[
          { name: "Marco", icon: "/agents/marco.png", emoji: "🔥", role: "Lead Hunter", action: "Ask Marco to hunt leads" },
          { name: "Sofia", icon: "/agents/sofia.png", emoji: "📬", role: "Email Agent", action: "Tell Sofia to send follow-up emails to all new leads" },
          { name: "Noah", icon: "/agents/noah.png", emoji: "📧", role: "Follow-up", action: "Ask Noah to schedule follow-ups for all contacts" },
          { name: "Luna", icon: "/agents/luna.png", emoji: "📱", role: "SMS & Calls", action: "Tell Luna to send SMS reminders to pending clients" },
          { name: "Atlas", icon: "/agents/atlas.png", emoji: "🛡️", role: "Security", action: "Ask Atlas for a security report" },
          { name: "Leo", icon: "/agents/leo.png", emoji: "📊", role: "Analytics", action: "Ask Leo for today's analytics report" },
        ].map((a) => (
          <button key={a.name} onClick={() => sendMessage(a.action)} title={`Command ${a.name} (${a.role})`}
            className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 transition-colors">
            <span className="text-sm">{a.emoji}</span>
            <span className="text-xs text-white font-semibold">{a.name}</span>
            <span className="text-[10px] text-slate-400">{a.role}</span>
          </button>
        ))}
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "lina" && (
              <img src="/branding/lina-avatar.png" alt="Lina" className="w-8 h-8 rounded-full shrink-0 object-cover border border-white/20" onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; }} />
            )}
            <div className={`max-w-sm lg:max-w-2xl px-4 py-3 rounded-2xl text-sm shadow-sm whitespace-pre-wrap ${m.role === "user" ? "text-white rounded-br-md" : "rounded-bl-md"}`}
              style={m.role === "user" ? { background: "#0F6CF5" } : { background: "#EEF2FF", color: "#3730A3" }}>
              <p className="leading-relaxed">{m.role === "lina" ? formatMessage(m.text) : m.text}</p>
              <p className={`text-[10px] mt-1.5 ${m.role === "user" ? "text-blue-200 text-right" : "text-indigo-300"}`}>{fmtTime(m.ts)}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <img src="/branding/lina-avatar.png" alt="Lina" className="w-8 h-8 rounded-full shrink-0 object-cover border border-white/20" onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; }} />
            <div className="px-4 py-3 rounded-2xl rounded-bl-md" style={{ background: "#EEF2FF" }}>
              <div className="flex gap-1 items-center">
                {[0, 150, 300].map(d => <span key={d} className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* ── Quick commands ── */}
      <div className="px-4 sm:px-8 pb-2 pt-1">
        <div className="flex gap-2 flex-wrap">
          {COMMANDS.map((c) => (
            <button key={c.label} onClick={() => sendMessage(c.msg)} disabled={loading}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border border-white/20 text-white/80 hover:bg-white/10 transition disabled:opacity-40">
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Input ── */}
      <div className="px-4 sm:px-8 py-4">
        <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(input); } }}
            placeholder="Ask Lina anything, or command another agent… (e.g. 'Ask Marco to find luxury leads')"
            className="flex-1 px-3 py-2 text-sm text-slate-800 bg-transparent focus:outline-none"
          />
          <button onClick={() => void sendMessage(input)} disabled={loading || !input.trim()}
            className="px-5 py-2 rounded-xl font-bold text-white text-sm disabled:opacity-50 transition hover:opacity-90"
            style={{ background: "#0F6CF5" }}>
            Send ↑
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2 text-center">Lina can command Marco · Sofia · Noah · Luna · Atlas · Leo — all responses are saved</p>
      </div>
    </div>
  );
}
