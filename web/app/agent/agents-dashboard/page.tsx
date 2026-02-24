"use client";
import { useEffect, useState } from "react";
import { useRequireRole } from "../../../src/lib/roleGuards";
import { Role } from "../../../src/lib/authStore";

const allowedRoles: Role[] = ["hq", "admin", "travel_agent"];

const VPS_API = "https://vmi3097009.contaboserver.net";
const LOCAL_API = `${VPS_API}`;

type AgentStatus = "live" | "scheduled" | "pending" | "error";

type Agent = {
  id: string;
  name: string;
  emoji: string;
  status: AgentStatus;
  type: string;
  schedule: string;
  description: string;
  features: string[];
  logs?: string[];
};

type ServiceStatus = {
  name: string;
  status: "ok" | "down" | "unknown";
};

export default function AgentsDashboard() {
  useRequireRole(allowedRoles, "/login");

  const [agents, setAgents] = useState<Agent[]>([]);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [lastRefresh, setLastRefresh] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const now = new Date().toLocaleTimeString();
    setLastRefresh(now);

    // Fetch API health
    let apiOk = false;
    let supabaseOk = false;
    let activeSessions = 0;
    let leadsInMemory = 0;
    try {
      const r = await fetch("/api/agents-proxy?endpoint=health");
      const d = await r.json();
      apiOk = d?.status === "healthy";
      supabaseOk = d?.supabase === "ok";
      activeSessions = d?.active_sessions || 0;
      leadsInMemory = d?.leads_in_memory || 0;
    } catch { }

    // Fetch admin stats
    try {
      const r = await fetch("/api/agents-proxy?endpoint=stats");
      const d = await r.json();
      setStats(d);
    } catch { }

    // Test webhook
    let webhookOk = false;
    try {
      const r = await fetch("/api/agents-proxy?endpoint=webhook-test");
      const d = await r.json();
      webhookOk = !!d?.response;
    } catch { }

    setServices([
      { name: "Zeniva API", status: apiOk ? "ok" : "down" },
      { name: "Supabase", status: supabaseOk ? "ok" : "down" },
      { name: "Lina Webhook", status: webhookOk ? "ok" : "down" },
    ]);

    setAgents([
      {
        id: "lina",
        name: "Lina AI Chat",
        emoji: "🤖",
        status: webhookOk ? "live" : "error",
        type: "n8n AI Agent · OpenAI GPT-4o-mini",
        schedule: "Real-time",
        description: "Polyglot AI travel concierge. Handles client conversations, qualifies leads, generates quotes.",
        features: ["All languages", "Lead extraction", "Conversation memory", "3-tier quotes", "TRIP_PATCH for app integration"],
      },
      {
        id: "cyber",
        name: "Cyber Guardian",
        emoji: "🛡️",
        status: "scheduled",
        type: "Bash agent",
        schedule: "Every hour",
        description: "Monitors VPS security: services, containers, SSL, disk, RAM, SSH attacks. Auto-restarts failed services.",
        features: ["Service monitoring", "Container health", "SSL expiry", "SSH intrusion detection", "Auto-restart", "Email alerts"],
      },
      {
        id: "bug",
        name: "Bug Hunter",
        emoji: "🐛",
        status: "scheduled",
        type: "Bash agent",
        schedule: "Every 6 hours",
        description: "Automated testing of all critical pages, API endpoints, webhooks, and database connections.",
        features: ["Page testing", "API health", "Webhook verification", "Supabase check", "Email alerts on failure"],
      },
      {
        id: "followup",
        name: "Lead Follow-up",
        emoji: "📧",
        status: "scheduled",
        type: "Python + OpenAI",
        schedule: "Every 6 hours",
        description: "Auto-generates personalized follow-up emails for leads using AI. Adapts language to client.",
        features: ["AI-written emails", "Multi-language", "6h delay for new leads", "72h reminder for quoted", "Status tracking"],
      },
      {
        id: "pipeline",
        name: "Sales Pipeline",
        emoji: "📊",
        status: "scheduled",
        type: "n8n workflow",
        schedule: "Every 6 hours",
        description: "Fetches leads from API, filters by age/status, orchestrates the sales funnel.",
        features: ["Lead filtering", "Status management", "n8n orchestration"],
      },
      {
        id: "content",
        name: "Content Creator",
        emoji: "🎬",
        status: "pending",
        type: "Planned — AI + Social APIs",
        schedule: "3-5 posts/day",
        description: "AI-generated travel images and videos. Auto-posts to Facebook, Instagram, TikTok.",
        features: ["DALL-E images", "Video generation", "Auto-posting", "Package promotion", "Hashtag optimization"],
      },
      {
        id: "leadhunter",
        name: "Lead Hunter",
        emoji: "🎯",
        status: "pending",
        type: "Planned — Ads + Scraping",
        schedule: "Continuous",
        description: "Automated lead generation via paid ads, social scraping, and cold outreach campaigns.",
        features: ["Meta Ads", "Google Ads", "TikTok Ads", "Landing pages", "200+ leads/day target"],
      },
      {
        id: "payment",
        name: "Payment Agent",
        emoji: "💳",
        status: "pending",
        type: "Planned — Global Payment API",
        schedule: "On transaction",
        description: "Automated checkout, invoice generation, payment links, multi-currency support.",
        features: ["Auto-checkout", "Invoice PDF", "Payment links", "Multi-currency", "ETA: 7 days"],
      },
    ]);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const statusBadge = (s: AgentStatus) => {
    const map: Record<AgentStatus, { bg: string; text: string; label: string }> = {
      live: { bg: "bg-emerald-500", text: "text-white", label: "LIVE" },
      scheduled: { bg: "bg-blue-500", text: "text-white", label: "ACTIVE" },
      pending: { bg: "bg-amber-500", text: "text-white", label: "PENDING" },
      error: { bg: "bg-red-500", text: "text-white", label: "ERROR" },
    };
    const m = map[s];
    return <span className={`${m.bg} ${m.text} px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide`}>{m.label}</span>;
  };

  const svcDot = (s: string) => s === "ok" ? "🟢" : s === "down" ? "🔴" : "🟡";

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">🤖 AI Agents Control Panel</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time monitoring of all Zeniva Travel automation agents
            {lastRefresh && <span> · Last refresh: {lastRefresh}</span>}
            <button onClick={fetchData} className="ml-3 text-blue-600 font-semibold hover:underline">↻ Refresh</button>
          </p>
        </div>

        {/* Services Status Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {services.map((svc) => (
            <div key={svc.name} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
              <span className="text-xl">{svcDot(svc.status)}</span>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">{svc.name}</div>
                <div className="text-sm font-bold text-slate-900">{svc.status === "ok" ? "Online" : svc.status === "down" ? "Down" : "Unknown"}</div>
              </div>
            </div>
          ))}
          {stats && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
              <span className="text-xl">📊</span>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">Total Leads</div>
                <div className="text-sm font-bold text-slate-900">{stats.total_leads || 0}</div>
              </div>
            </div>
          )}
        </div>

        {/* Agent Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{agent.emoji}</span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{agent.name}</h2>
                    <p className="text-xs text-slate-500">{agent.type}</p>
                  </div>
                </div>
                {statusBadge(agent.status)}
              </div>
              <div className="px-5 py-4 space-y-3">
                <p className="text-sm text-slate-600">{agent.description}</p>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Schedule</div>
                  <div className="text-xs text-slate-700 font-medium">{agent.schedule}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Capabilities</div>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.features.map((f) => (
                      <span key={f} className="bg-slate-100 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded-full">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-xs text-slate-400">
          Zeniva Travel AI Infrastructure · Auto-refresh every 60s
        </div>
      </div>
    </main>
  );
}
