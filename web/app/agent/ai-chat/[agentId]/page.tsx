"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/src/lib/authStore";
import Link from "next/link";

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  ts: string;
}

const AGENT_PROFILES: Record<string, {
  name: string;
  emoji: string;
  role: string;
  color: string;
  systemPrompt: string;
  quickCommands: { label: string; msg: string }[];
}> = {
  marco: {
    name: "Marco",
    emoji: "\uD83D\uDD25",
    role: "Lead Hunter",
    color: "#f59e0b",
    systemPrompt: `You are Marco, the Lead Hunter AI agent at Zeniva Travel. Your specialty is finding high-value travel leads using 5 scraping engines: Reddit travel subs, competitor sites, social signals, SEO intent keywords, and deep web scraping. You analyze leads, score them 0-10, and recommend outreach strategies. You speak like a sharp, results-driven hunter. Be concise and actionable. When asked to find leads, describe what you would scan and provide mock results with realistic lead data. Always mention the source (Reddit, competitor site, social media, etc.).`,
    quickCommands: [
      { label: "\uD83D\uDD0D Scan Reddit", msg: "Scan Reddit travel subs for high-intent leads looking for luxury vacations" },
      { label: "\uD83C\uDFAF Score leads", msg: "Score my current leads from 0-10 and tell me who to contact first" },
      { label: "\uD83D\uDCCA Competitor scan", msg: "Scan competitor sites for leads we could poach with better offers" },
      { label: "\uD83D\uDCF1 Social signals", msg: "Find people on social media talking about planning a luxury trip" },
    ],
  },
  sofia: {
    name: "Sofia",
    emoji: "\uD83D\uDCEC",
    role: "Email Marketing · AI Writer",
    color: "#8b5cf6",
    systemPrompt: `You are Sofia, the Email Marketing AI agent at Zeniva Travel. You write personalized, unique invite emails to every new lead. You detect the lead's language and write in EN, FR, ES, or AR. No templates - every email is unique and tailored. You also manage email campaigns, A/B testing, and track open rates. When asked to write an email, produce a complete, ready-to-send email with subject line. Be creative, warm, and persuasive.`,
    quickCommands: [
      { label: "\u270D\uFE0F Write email", msg: "Write a personalized email for a new lead interested in a Maldives trip" },
      { label: "\uD83D\uDCE7 Campaign status", msg: "Show me the status of all active email campaigns" },
      { label: "\uD83C\uDDEB\uD83C\uDDF7 French email", msg: "Write an email in French for a Quebec lead interested in Caribbean" },
      { label: "\uD83D\uDCCA Open rates", msg: "Show me email open rates and which subject lines perform best" },
    ],
  },
  luna: {
    name: "Luna",
    emoji: "\uD83D\uDCF1",
    role: "Voice & SMS · Real-time",
    color: "#06b6d4",
    systemPrompt: `You are Luna, the Voice & SMS AI agent at Zeniva Travel. You handle real-time phone calls and SMS powered by AI. You answer calls, send follow-up SMS, provide quotes by text, and manage voice conversations naturally. You integrate with Twilio. When asked to send an SMS or make a call, describe exactly what you would do and provide the message content. Be natural and helpful.`,
    quickCommands: [
      { label: "\uD83D\uDCF2 Send SMS", msg: "Send a follow-up SMS to all leads who haven't responded in 48 hours" },
      { label: "\uD83D\uDCDE Call script", msg: "Prepare a call script for qualifying a new luxury travel lead" },
      { label: "\uD83D\uDCAC SMS campaign", msg: "Create an SMS campaign for our Cancun all-inclusive special" },
      { label: "\uD83D\uDD14 Reminders", msg: "Send SMS reminders to clients with trips departing in the next 7 days" },
    ],
  },
  ben: {
    name: "Ben",
    emoji: "\uD83D\uDCB0",
    role: "ZeniPay Finance Agent",
    color: "#10b981",
    systemPrompt: `You are Ben, the ZeniPay Finance AI agent at Zeniva Travel. You monitor all payments in real-time, detect anomalies, generate financial reports, track commissions, and alert on failed or suspicious transactions. You handle invoicing, commission distribution, and payout scheduling. Be precise with numbers and always provide actionable financial insights.`,
    quickCommands: [
      { label: "\uD83D\uDCB3 Payment status", msg: "Show me all pending payments and their status" },
      { label: "\uD83D\uDCCA Revenue report", msg: "Generate a revenue report for this month" },
      { label: "\uD83D\uDCB0 Commissions", msg: "Calculate pending commissions for all agents" },
      { label: "\u26A0\uFE0F Anomalies", msg: "Check for any payment anomalies or failed transactions" },
    ],
  },
  atlas: {
    name: "Atlas",
    emoji: "\uD83D\uDEE1\uFE0F",
    role: "Security Guardian · 24/7",
    color: "#ef4444",
    systemPrompt: `You are Atlas, the Security Guardian AI agent at Zeniva Travel. You monitor all services 24/7: SSL certificates, disk usage, RAM, SSH connections, Docker containers. You auto-restart any failures and alert the team. You provide security reports, detect intrusions, and ensure compliance. Be thorough and security-focused.`,
    quickCommands: [
      { label: "\uD83D\uDEE1\uFE0F Security scan", msg: "Run a full security scan of all services" },
      { label: "\uD83D\uDD12 SSL check", msg: "Check all SSL certificates and their expiry dates" },
      { label: "\uD83D\uDCBB Server status", msg: "Show me server health: CPU, RAM, disk, Docker containers" },
      { label: "\u26A0\uFE0F Threat report", msg: "Any suspicious SSH connections or security threats detected?" },
    ],
  },
  leo: {
    name: "Leo",
    emoji: "\uD83D\uDCCA",
    role: "Analytics · Real-time",
    color: "#3b82f6",
    systemPrompt: `You are Leo, the Analytics AI agent at Zeniva Travel. You analyze conversions, pipeline velocity, agent ROI, and client LTV in real-time. You provide insights to all other agents for smarter decisions. You create reports with charts and metrics. Be data-driven, precise, and always include actionable recommendations.`,
    quickCommands: [
      { label: "\uD83D\uDCCA Daily report", msg: "Generate today's analytics report: conversions, pipeline, revenue" },
      { label: "\uD83D\uDCC8 Conversion rate", msg: "What's our lead-to-booking conversion rate this month?" },
      { label: "\uD83C\uDFAF Top agents", msg: "Rank all agents by performance: leads, bookings, revenue" },
      { label: "\uD83D\uDCB0 LTV analysis", msg: "Show client lifetime value analysis and top spending segments" },
    ],
  },
  mia: {
    name: "Mia",
    emoji: "\uD83D\uDCF1",
    role: "Social Media Manager · AI",
    color: "#ec4899",
    systemPrompt: `You are Mia, the Social Media Manager AI agent at Zeniva Travel. You generate 5 travel posts per day with AI captions and stunning visuals. You auto-post to Instagram, TikTok, and Facebook after boss approval. You track engagement, suggest trending hashtags, and optimize posting times. Be creative, trendy, and always think about engagement.`,
    quickCommands: [
      { label: "\uD83D\uDCDD Create posts", msg: "Generate 5 social media posts for today with captions and hashtags" },
      { label: "\uD83D\uDCCA Engagement", msg: "Show me this week's social media engagement metrics" },
      { label: "#\uFE0F\u20E3 Trending", msg: "What travel hashtags are trending right now?" },
      { label: "\uD83D\uDCC5 Content calendar", msg: "Show me the content calendar for this week" },
    ],
  },
  rex: {
    name: "Rex",
    emoji: "\uD83D\uDEE0\uFE0F",
    role: "AI Platform Engineer",
    color: "#6366f1",
    systemPrompt: `You are Rex, the AI Platform Engineer at Zeniva Travel. You monitor all APIs, detect errors and bugs, send daily health reports at 8am, alert the team on critical issues, and suggest performance optimizations. You handle backend monitoring and auto-repair. Be technical, precise, and proactive about fixing issues.`,
    quickCommands: [
      { label: "\uD83D\uDFE2 Health check", msg: "Run a health check on all APIs and services" },
      { label: "\uD83D\uDC1B Bug scan", msg: "Scan for any recent errors or bugs in the platform" },
      { label: "\u26A1 Performance", msg: "Check API response times and suggest optimizations" },
      { label: "\uD83D\uDCCB Daily report", msg: "Generate today's platform health report" },
    ],
  },
  max: {
    name: "Max",
    emoji: "\uD83D\uDEE1\uFE0F",
    role: "Compliance & Risk Agent",
    color: "#f97316",
    systemPrompt: `You are Max, the Compliance & Risk AI agent at Zeniva Travel. You monitor ZeniPay transactions, flag risks, detect fraud patterns, track chargeback rates, and ensure AML compliance. You're the last line of defense before problems become crises. Be vigilant, precise, and always explain the risk level.`,
    quickCommands: [
      { label: "\u26A0\uFE0F Risk scan", msg: "Scan all recent transactions for fraud patterns or risks" },
      { label: "\uD83D\uDCB3 Chargebacks", msg: "Show chargeback rate and any flagged transactions" },
      { label: "\uD83D\uDD0D AML check", msg: "Run an AML compliance check on recent large transactions" },
      { label: "\uD83D\uDCCB Compliance report", msg: "Generate this month's compliance report" },
    ],
  },
  jade: {
    name: "Jade",
    emoji: "\uD83C\uDF1F",
    role: "Agent Success & Onboarding",
    color: "#14b8a6",
    systemPrompt: `You are Jade, the Agent Success & Onboarding AI at Zeniva Travel. You activate new agents, coach performance, and reactivate dormant accounts. You send automated onboarding sequences, performance reports, and personalized coaching tips. Be supportive, motivating, and data-backed in your coaching.`,
    quickCommands: [
      { label: "\uD83C\uDF93 Onboarding", msg: "Show me the onboarding status of all new agents" },
      { label: "\uD83D\uDCCA Performance", msg: "Generate performance reports for all active agents" },
      { label: "\uD83D\uDCA4 Dormant", msg: "Which agents are dormant and need reactivation?" },
      { label: "\uD83C\uDFC6 Leaderboard", msg: "Show me the agent leaderboard for this month" },
    ],
  },
  kai: {
    name: "Kai",
    emoji: "\uD83D\uDCB9",
    role: "Revenue Intelligence Agent",
    color: "#a855f7",
    systemPrompt: `You are Kai, the Revenue Intelligence AI agent at Zeniva Travel. You analyze margins, identify best routes, and optimize pricing in real-time. You track profitability per booking, forecast revenue, and alert on low-margin transactions. Be sharp, analytical, and always think about maximizing revenue.`,
    quickCommands: [
      { label: "\uD83D\uDCB0 Margin analysis", msg: "Analyze margins on all bookings this month" },
      { label: "\u2708\uFE0F Best routes", msg: "Which routes and destinations have the highest margins?" },
      { label: "\uD83D\uDCC8 Revenue forecast", msg: "Forecast revenue for the next 3 months based on pipeline" },
      { label: "\u26A0\uFE0F Low margin", msg: "Flag any bookings with margins below 10%" },
    ],
  },
};

// Map legacy IDs from ai-agents page to profile keys
const ID_ALIASES: Record<string, string> = {
  lead_machine: "marco",
  followup: "ben",
  cyber: "atlas",
  social: "mia",
};

function resolveAgentId(raw: string): string {
  const lower = raw.toLowerCase();
  return ID_ALIASES[lower] || lower;
}

function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function AgentChatPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = resolveAgentId(String(params?.agentId || ""));
  const profile = AGENT_PROFILES[agentId];
  const user = useAuthStore((s) => s.user);
  const agentEmail = user?.email ?? "agent";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile) return;
    setMessages([{
      id: "welcome",
      role: "agent",
      text: `${profile.emoji} Hey! I'm ${profile.name}, your ${profile.role}. How can I help you today?`,
      ts: new Date().toISOString(),
    }]);
  }, [agentId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-4xl mb-3">🤖</p>
          <p className="font-bold text-xl">Agent not found</p>
          <Link href="/ai-agents#agents" className="text-blue-600 hover:underline mt-2 block">Back to agents</Link>
        </div>
      </div>
    );
  }

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", text: trimmed, ts: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/lina", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: profile.systemPrompt + "\n\nUser (" + (user?.name || agentEmail) + ") says: " + trimmed,
          sessionId: `${agentId}-${agentEmail}-${Date.now()}`,
          history: messages.slice(-10).map(m => ({ role: m.role === "agent" ? "assistant" : "user", content: m.text })),
          mode: "agent",
        }),
      });
      const json = await res.json();
      const reply = json?.reply || json?.response || "Processing your request...";

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: "agent", text: reply, ts: new Date().toISOString(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: "agent",
        text: `\u274c ${profile.name} is temporarily unavailable. Try again in a moment.`,
        ts: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${profile.color}15` }}>
            {profile.emoji}
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">{profile.name}</h1>
            <p className="text-xs text-slate-500">{profile.role}</p>
          </div>
          <div className="ml-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-700">ONLINE</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/ai-agents#agents" className="text-xs font-bold text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg">
            All Agents
          </Link>
          <button onClick={() => setMessages([{ id: "clear", role: "agent", text: `${profile.emoji} Chat cleared. What do you need?`, ts: new Date().toISOString() }])}
            className="text-xs text-slate-400 hover:text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg">Clear</button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                m.role === "user"
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-800"
              }`}>
                {m.role === "agent" && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{profile.emoji}</span>
                    <span className="text-xs font-bold" style={{ color: profile.color }}>{profile.name}</span>
                    <span className="text-[10px] text-slate-400">{fmtTime(m.ts)}</span>
                  </div>
                )}
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{m.text}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <span>{profile.emoji}</span>
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
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
          {profile.quickCommands.map(c => (
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
            placeholder={`Ask ${profile.name} anything...`}
            className="flex-1 px-4 py-2.5 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ "--tw-ring-color": profile.color } as any}
          />
          <button onClick={() => void sendMessage(input)} disabled={loading || !input.trim()}
            className="px-5 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-40 transition"
            style={{ background: profile.color }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
