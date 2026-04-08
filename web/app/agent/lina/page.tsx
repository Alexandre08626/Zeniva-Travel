"use client";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/src/lib/authStore";

const AUTH = "Bearer zeniva-secret-2025";

interface ChatMessage {
  id: string;
  role: "user" | "lina";
  text: string;
  ts: string;
}

const COMMANDS = [
  { label: "\ud83d\udccb New leads today", msg: "Show me all new leads from today" },
  { label: "\ud83d\udcca Daily report", msg: "Give me a full daily report: new leads, pipeline, follow-ups due" },
  { label: "\ud83d\udd14 Follow-ups due", msg: "Which contacts need follow-up? Show overdue ones first" },
  { label: "\ud83d\udcb0 Commission pipeline", msg: "Show my commission pipeline and pending payouts" },
  { label: "\ud83d\udcc4 Find a document", msg: "Help me find a document" },
  { label: "\ud83d\udce7 Sofia: send campaign", msg: "Tell Sofia to prepare an email campaign for all new leads" },
  { label: "\ud83d\udd25 Marco: hunt leads", msg: "Tell Marco to scan for new travel leads on social media" },
  { label: "\ud83d\udcf1 Luna: send SMS", msg: "Tell Luna to send SMS reminders to all clients with upcoming trips" },
];

const AGENTS = [
  { name: "Marco", emoji: "\ud83d\udd25", role: "Lead Hunter", action: "Ask Marco to find new high-value travel leads" },
  { name: "Sofia", emoji: "\ud83d\udcec", role: "Email Outreach", action: "Tell Sofia to send follow-up emails to all new leads" },
  { name: "Ben", emoji: "\ud83d\udce7", role: "Follow-up", action: "Ask Ben to check which contacts need follow-up" },
  { name: "Luna", emoji: "\ud83d\udcf1", role: "SMS & Calls", action: "Tell Luna to send SMS reminders to pending clients" },
  { name: "Rex", emoji: "\ud83d\udee0\ufe0f", role: "Engineer", action: "Ask Rex to run a maintenance audit" },
  { name: "Atlas", emoji: "\ud83d\udee1\ufe0f", role: "Security", action: "Ask Atlas for a security report" },
  { name: "Leo", emoji: "\ud83d\udcca", role: "Analytics", action: "Ask Leo for today's analytics and conversion report" },
  { name: "Mia", emoji: "\ud83d\udcf1", role: "Social", action: "Tell Mia to prepare social media posts for this week" },
];

function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function LinaAgentPage() {
  const user = useAuthStore((s) => s.user);
  const agentName = (user as any)?.first_name ? ((user as any).first_name + " " + ((user as any).last_name || "")).trim() : (user?.name || user?.email || "Agent");
  const agentEmail = user?.email ?? "agent";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (!user?.email) return;
    fetch("/api/agents-proxy?path=admin/dashboard-stats&agent_email=" + encodeURIComponent(user.email))
      .then(r => r.json()).then(setStats).catch(() => {});
  }, [user?.email]);

  useEffect(() => {
    setMessages([{
      id: "welcome", role: "lina",
      text: "\ud83d\udc4b " + agentName + "! I'm Lina, your command center.\n\nI can:\n\u2022 Show your leads, clients & pipeline\n\u2022 Find documents & proposals\n\u2022 Command any agent (Marco, Sofia, Luna, Rex...)\n\u2022 Give you daily reports & insights\n\nUse the quick commands below or type anything.",
      ts: new Date().toISOString(),
    }]);
  }, [agentName]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", text: trimmed, ts: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const context = [
        "SYSTEM: You are Lina, the AI command center for Zeniva Travel AGENTS (not travelers).",
        "You help agents manage their business: leads, clients, commissions, documents, follow-ups.",
        "You do NOT help book trips or create itineraries. You are a business management assistant.",
        "When an agent mentions another AI agent (Marco, Sofia, Ben, Luna, Rex, Atlas, Leo, Mia), acknowledge the command and confirm what that agent will do.",
        "Be concise, professional, and actionable. Use bullet points for lists.",
        "Available AI agents: Marco (lead hunting on social media), Sofia (email campaigns via /agent/outreach), Ben (follow-up scheduling), Luna (SMS & calls), Rex (platform maintenance & health checks), Atlas (security monitoring), Leo (analytics & reporting), Mia (social media content).",
        stats ? "Current stats: clients=" + (stats.active_clients || 0) + ", dossiers=" + (stats.open_dossiers || 0) + ", follow-ups due=" + (stats.followups_due || 0) + ", commission pipeline=$" + (stats.commission_pipeline || 0) : "",
        "Agent: " + agentName + " (" + agentEmail + ")",
      ].filter(Boolean).join("\n");

      const res = await fetch("/api/lina", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: context + "\n\nAgent says: " + trimmed,
          sessionId: "agent-" + agentEmail + "-" + Date.now(),
          history: messages.slice(-10).map(m => ({ role: m.role === "lina" ? "assistant" : "user", content: m.text })),
          mode: "agent",
        }),
      });
      const json = await res.json();
      const reply = json?.reply || json?.response || json?.message || "Command received. Processing...";

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: "lina", text: reply, ts: new Date().toISOString(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: "lina",
        text: "\u274c Connection issue. The VPS may be down. Try again in a moment.",
        ts: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex-shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src="/branding/lina-avatar.png" alt="Lina" className="w-10 h-10 rounded-full border-2 border-indigo-200 object-cover"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Lina <span className="text-xs font-normal text-slate-400">AI Command Center</span></h1>
              <p className="text-xs text-slate-500">{agentName}</p>
            </div>
          </div>
          {stats && (
            <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500">
              <span>{"\ud83d\udc65"} <strong className="text-slate-900">{stats.active_clients || 0}</strong> clients</span>
              <span>{"\ud83c\udfaf"} <strong className="text-slate-900">{stats.open_dossiers || 0}</strong> dossiers</span>
              <span>{"\u23f0"} <strong className="text-amber-600">{stats.followups_due || 0}</strong> follow-ups</span>
            </div>
          )}
          <button onClick={() => setMessages([{ id: "clear", role: "lina", text: "\ud83d\udc4b Chat cleared. What do you need, " + agentName + "?", ts: new Date().toISOString() }])}
            className="text-xs text-slate-400 hover:text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg">Clear</button>
        </div>
      </div>

      {/* Agent command bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2 flex-shrink-0">
        <div className="max-w-5xl mx-auto flex gap-2 overflow-x-auto">
          <span className="text-xs text-slate-400 flex items-center shrink-0 mr-1">Command:</span>
          {AGENTS.map(a => (
            <button key={a.name} onClick={() => sendMessage(a.action)}
              className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition text-xs">
              <span>{a.emoji}</span>
              <span className="font-semibold text-slate-700">{a.name}</span>
              <span className="text-slate-400 hidden sm:inline">{a.role}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map(m => (
            <div key={m.id} className={"flex gap-3 " + (m.role === "user" ? "justify-end" : "justify-start")}>
              {m.role === "lina" && (
                <img src="/branding/lina-avatar.png" alt="Lina" className="w-8 h-8 rounded-full shrink-0 object-cover border border-slate-200"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              )}
              <div className={"max-w-lg lg:max-w-2xl px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap " +
                (m.role === "user" ? "bg-violet-600 text-white rounded-br-md" : "bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm")}>
                <p className="leading-relaxed">{m.text}</p>
                <p className={"text-[10px] mt-1.5 " + (m.role === "user" ? "text-violet-200 text-right" : "text-slate-400")}>{fmtTime(m.ts)}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <img src="/branding/lina-avatar.png" alt="Lina" className="w-8 h-8 rounded-full shrink-0 object-cover border border-slate-200"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-slate-200 shadow-sm">
                <div className="flex gap-1 items-center">
                  {[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: d + "ms" }} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* Quick commands */}
      <div className="px-4 sm:px-6 pb-2 flex-shrink-0">
        <div className="max-w-3xl mx-auto flex gap-2 flex-wrap">
          {COMMANDS.map(c => (
            <button key={c.label} onClick={() => sendMessage(c.msg)} disabled={loading}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition disabled:opacity-40">
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 sm:px-6 py-3 bg-white border-t border-slate-200 flex-shrink-0">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(input); } }}
            placeholder="Command an agent, find a document, or ask for a report..."
            className="flex-1 px-4 py-2.5 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          <button onClick={() => void sendMessage(input)} disabled={loading || !input.trim()}
            className="px-5 py-2.5 rounded-xl font-bold text-white text-sm bg-violet-600 hover:bg-violet-700 disabled:opacity-40 transition">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
