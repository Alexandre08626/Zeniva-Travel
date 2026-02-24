"use client";
import { useEffect, useState, useCallback } from "react";

const VPS_WEBHOOK = "https://vmi3097009.contaboserver.net/webhook/zeniva-lina-chat";

type AgentStatus = "live" | "active" | "pending" | "error";
type SvcStatus = "online" | "offline" | "checking";

type Agent = {
  id: string;
  name: string;
  emoji: string;
  status: AgentStatus;
  type: string;
  schedule: string;
  description: string;
  features: string[];
  color: string;
};

const AGENTS: Agent[] = [
  {
    id: "lina",
    name: "Lina AI",
    emoji: "🤖",
    status: "live",
    type: "n8n AI Agent · OpenAI GPT-4o-mini · Polyglot",
    schedule: "Real-time — every client message",
    description: "Executive AI travel concierge. Speaks all languages. Qualifies leads, recommends destinations, generates 3-tier quotes. Connected to the website chat.",
    features: ["All languages", "Lead extraction", "Conversation memory", "3-tier quotes", "Supabase sync", "Email notifications"],
    color: "emerald",
  },
  {
    id: "cyber",
    name: "Cyber Guardian",
    emoji: "🛡️",
    status: "active",
    type: "Bash monitoring agent",
    schedule: "Every hour",
    description: "24/7 security monitoring. Checks all services, containers, SSL, disk, RAM, SSH attacks. Auto-restarts failed services and sends alerts.",
    features: ["Service monitoring", "Container health", "SSL expiry check", "SSH intrusion detection", "Auto-restart", "Email alerts"],
    color: "blue",
  },
  {
    id: "bug",
    name: "Bug Hunter",
    emoji: "🐛",
    status: "active",
    type: "Bash testing agent",
    schedule: "Every 6 hours",
    description: "Automated testing of all critical pages, API endpoints, Lina webhook, and database connections. Alerts on any failure.",
    features: ["Page testing", "API endpoints", "Webhook check", "Supabase verify", "n8n status", "Email on failure"],
    color: "amber",
  },
  {
    id: "followup",
    name: "Lead Follow-up",
    emoji: "📧",
    status: "active",
    type: "Python + OpenAI",
    schedule: "Every 6 hours",
    description: "AI-powered email follow-up. Generates personalized emails in the client's language. New leads get contacted after 6h, quoted leads after 72h.",
    features: ["AI-written emails", "Language detection", "6h new lead delay", "72h quote reminder", "Supabase tracking"],
    color: "purple",
  },
  {
    id: "pipeline",
    name: "Sales Pipeline",
    emoji: "📊",
    status: "active",
    type: "n8n workflow",
    schedule: "Every 6 hours",
    description: "Automated sales funnel management. Fetches leads, filters by age and status, orchestrates the entire conversion pipeline.",
    features: ["Lead filtering", "Status management", "Funnel orchestration", "n8n powered"],
    color: "cyan",
  },
  {
    id: "content",
    name: "Content Creator",
    emoji: "🎬",
    status: "pending",
    type: "Planned — DALL-E + Video AI + Social APIs",
    schedule: "3-5 posts/day per platform",
    description: "AI-generated travel content factory. Creates images, short videos, and travel packages. Auto-posts to Facebook, Instagram, and TikTok.",
    features: ["AI images (DALL-E)", "Video generation", "Facebook auto-post", "Instagram auto-post", "TikTok auto-post", "Package promotion"],
    color: "pink",
  },
  {
    id: "leadhunter",
    name: "Lead Hunter",
    emoji: "🎯",
    status: "pending",
    type: "Planned — Ads + Scraping + Outreach",
    schedule: "Continuous",
    description: "Automated lead generation machine. Runs paid ad campaigns, scrapes travel communities, manages cold outreach. Target: 200+ leads/day.",
    features: ["Meta Ads", "Google Ads", "TikTok Ads", "Community scraping", "Cold outreach", "Landing pages"],
    color: "orange",
  },
  {
    id: "payment",
    name: "Payment Agent",
    emoji: "💳",
    status: "pending",
    type: "Planned — Global Payment API",
    schedule: "On every transaction",
    description: "Automated checkout and payment processing. Generates invoices, payment links, handles multi-currency. Global Payment API arriving in 7 days.",
    features: ["Auto-checkout", "Invoice PDF", "Payment links", "Multi-currency", "Refund management", "ETA: 7 days"],
    color: "rose",
  },
];

const STATUS_CONFIG: Record<AgentStatus, { label: string; bg: string; dot: string }> = {
  live: { label: "LIVE", bg: "bg-emerald-500", dot: "bg-emerald-400" },
  active: { label: "ACTIVE", bg: "bg-blue-500", dot: "bg-blue-400" },
  pending: { label: "PENDING", bg: "bg-amber-500/80", dot: "bg-amber-400" },
  error: { label: "ERROR", bg: "bg-red-500", dot: "bg-red-400" },
};

export default function AIAgentsPage() {
  const [agents, setAgents] = useState(AGENTS);
  const [apiHealth, setApiHealth] = useState<SvcStatus>("checking");
  const [webhookHealth, setWebhookHealth] = useState<SvcStatus>("checking");
  const [dbHealth, setDbHealth] = useState<SvcStatus>("checking");
  const [totalLeads, setTotalLeads] = useState<number | null>(null);
  const [totalMessages, setTotalMessages] = useState<number | null>(null);
  const [lastRefresh, setLastRefresh] = useState("");

  const check = useCallback(async () => {
    setLastRefresh(new Date().toLocaleTimeString());

    // API health
    try {
      const r = await fetch("/api/agents-proxy?endpoint=health");
      const d = await r.json();
      setApiHealth(d?.status === "healthy" ? "online" : "offline");
      setDbHealth(d?.supabase === "ok" ? "online" : "offline");
    } catch {
      setApiHealth("offline");
      setDbHealth("offline");
    }

    // Webhook
    try {
      const r = await fetch("/api/agents-proxy?endpoint=webhook-test");
      const d = await r.json();
      setWebhookHealth(d?.response ? "online" : "offline");
      // Update Lina status
      setAgents((prev) =>
        prev.map((a) => (a.id === "lina" ? { ...a, status: d?.response ? "live" as AgentStatus : "error" as AgentStatus } : a))
      );
    } catch {
      setWebhookHealth("offline");
    }

    // Stats
    try {
      const r = await fetch("/api/agents-proxy?endpoint=stats");
      const d = await r.json();
      setTotalLeads(d?.total_leads ?? null);
      setTotalMessages(d?.total_messages ?? null);
    } catch { }
  }, []);

  useEffect(() => {
    check();
    const i = setInterval(check, 60000);
    return () => clearInterval(i);
  }, [check]);

  const svcColor = (s: SvcStatus) => s === "online" ? "text-emerald-400" : s === "offline" ? "text-red-400" : "text-yellow-400";
  const svcDot = (s: SvcStatus) => s === "online" ? "bg-emerald-400" : s === "offline" ? "bg-red-400" : "bg-yellow-400";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-4xl font-black bg-gradient-to-r from-white via-blue-200 to-indigo-400 bg-clip-text text-transparent">
          AI Agents Control Center
        </h1>
        <p className="text-slate-400 mt-2 text-sm">
          Real-time monitoring and status of all Zeniva Travel automation agents
          <span className="text-slate-500 ml-2">· Refreshes every 60s</span>
          {lastRefresh && <span className="text-slate-600 ml-1">· {lastRefresh}</span>}
          <button onClick={check} className="ml-3 text-indigo-400 font-semibold hover:text-indigo-300">↻ Refresh now</button>
        </p>
      </div>

      {/* Services + Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {[
          { label: "Zeniva API", status: apiHealth },
          { label: "Supabase DB", status: dbHealth },
          { label: "Lina Webhook", status: webhookHealth },
        ].map((svc) => (
          <div key={svc.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className={`h-2 w-2 rounded-full ${svcDot(svc.status)} ${svc.status === "online" ? "animate-pulse" : ""}`} />
              <span className="text-[11px] font-semibold text-slate-400 uppercase">{svc.label}</span>
            </div>
            <div className={`text-sm font-bold ${svcColor(svc.status)}`}>
              {svc.status === "checking" ? "Checking..." : svc.status === "online" ? "Online" : "Offline"}
            </div>
          </div>
        ))}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase mb-1">Total Leads</div>
          <div className="text-lg font-black text-white">{totalLeads ?? "—"}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase mb-1">Messages</div>
          <div className="text-lg font-black text-white">{totalMessages ?? "—"}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase mb-1">Active Agents</div>
          <div className="text-lg font-black text-emerald-400">{agents.filter((a) => a.status === "live" || a.status === "active").length} / {agents.length}</div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => {
          const sc = STATUS_CONFIG[agent.status];
          return (
            <div
              key={agent.id}
              className={`bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all hover:bg-white/[0.05]`}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{agent.emoji}</span>
                  <div>
                    <h2 className="text-base font-bold text-white">{agent.name}</h2>
                    <p className="text-[11px] text-slate-500">{agent.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${sc.dot} ${agent.status === "live" ? "animate-pulse" : ""}`} />
                  <span className={`${sc.bg} text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide`}>{sc.label}</span>
                </div>
              </div>
              <div className="px-5 py-4 space-y-3">
                <p className="text-sm text-slate-400 leading-relaxed">{agent.description}</p>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Schedule</div>
                  <div className="text-xs text-slate-300 font-medium">{agent.schedule}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Capabilities</div>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.features.map((f) => (
                      <span key={f} className="bg-white/5 text-slate-400 text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/5">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 text-center text-xs text-slate-600">
        Zeniva Travel · AI Infrastructure · VPS 217.216.88.202 · Powered by OpenAI + n8n
      </div>
    </div>
  );
}
