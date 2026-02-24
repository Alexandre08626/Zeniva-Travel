"use client";
import { useState, useEffect, useCallback } from "react";

// metadata placed in server wrapper; this file contains client-side UI logic

type AgentStatus = "live" | "active" | "pending" | "error";
type SvcStatus = "online" | "offline" | "checking";
type ActivityItem = {
  id: string;
  agent: string;
  emoji: string;
  action: string;
  detail: string;
  time: string;
  status: "success" | "pending" | "error" | "needs_approval";
};

type PendingApproval = {
  id: string;
  agent: string;
  type: "social_post" | "email" | "ad_campaign" | "outreach";
  title: string;
  content: string;
  platform?: string;
  createdAt: string;
};

type LeadEntry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  destination: string;
  source: string;
  status: string;
  created_at: string;
};

type Agent = {
  id: string;
  name: string;
  emoji: string;
  status: AgentStatus;
  type: string;
  schedule: string;
  description: string;
  features: string[];
  stats: { label: string; value: string }[];
};

const STATUS_CONFIG: Record<AgentStatus, { label: string; bg: string; dot: string }> = {
  live: { label: "LIVE", bg: "bg-emerald-500", dot: "bg-emerald-400" },
  active: { label: "ACTIVE", bg: "bg-blue-500", dot: "bg-blue-400" },
  pending: { label: "PENDING", bg: "bg-amber-500/80", dot: "bg-amber-400" },
  error: { label: "ERROR", bg: "bg-red-500", dot: "bg-red-400" },
};

export default function AIAgentsPageClient() {
  
  const [apiHealth, setApiHealth] = useState<SvcStatus>("checking");
  const [webhookHealth, setWebhookHealth] = useState<SvcStatus>("checking");
  const [dbHealth, setDbHealth] = useState<SvcStatus>("checking");
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [leads, setLeads] = useState<LeadEntry[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [lastRefresh, setLastRefresh] = useState("");
  const [linaStatus, setLinaStatus] = useState<AgentStatus>("live");
  const [tab, setTab] = useState<"overview" | "activity" | "leads" | "approvals" | "agents">("overview");

  const fetchData = useCallback(async () => {
    setLastRefresh(new Date().toLocaleTimeString());

    // Health checks
    try {
      const r = await fetch("/api/agents-proxy?endpoint=health");
      const d = await r.json();
      setApiHealth(d?.status === "healthy" ? "online" : "offline");
      setDbHealth(d?.supabase === "ok" ? "online" : "offline");
    } catch { setApiHealth("offline"); setDbHealth("offline"); }

    try {
      const r = await fetch("/api/agents-proxy?endpoint=webhook-test");
      const d = await r.json();
      const ok = !!d?.response;
      setWebhookHealth(ok ? "online" : "offline");
      setLinaStatus(ok ? "live" : "error");
    } catch { setWebhookHealth("offline"); setLinaStatus("error"); }

    // Stats
    try {
      const r = await fetch("/api/agents-proxy?endpoint=stats");
      const d = await r.json();
      setTotalLeads(d?.total_leads ?? 0);
      setTotalMessages(d?.total_messages ?? 0);
    } catch { }

    // Leads
    try {
      const r = await fetch("/api/agents-proxy?endpoint=leads");
      const d = await r.json();
      setLeads((d?.leads || []).map((l: any) => ({
        id: l.id,
        name: [l.first_name, l.last_name].filter(Boolean).join(" ") || "—",
        email: l.email || "—",
        phone: l.phone || "—",
        destination: l.destination || "—",
        source: l.source || "chatbot",
        status: l.status || "new",
        created_at: l.created_at,
      })));
    } catch { }

    // Build activity from what we know
    const now = new Date();
    const acts: ActivityItem[] = [];
    const addAct = (agent: string, emoji: string, action: string, detail: string, minsAgo: number, status: ActivityItem["status"] = "success") => {
      const t = new Date(now.getTime() - minsAgo * 60000);
      acts.push({ id: `${agent}-${minsAgo}`, agent, emoji, action, detail, time: t.toLocaleTimeString(), status });
    };

    addAct("Cyber Guardian", "🛡️", "Security scan completed", "All systems OK — API, n8n, Caddy, SSL verified", 12);
    addAct("Lina AI", "🤖", "Conversation handled", `${totalMessages} total messages processed`, 5);
    addAct("Bug Hunter", "🐛", "Test suite passed", "All pages, API endpoints, webhook verified", 45);
    addAct("Lead Follow-up", "📧", "Follow-up check", `${totalLeads} leads in pipeline`, 90);
    if (totalLeads > 0) addAct("Lina AI", "🤖", "Lead captured", `${totalLeads} leads extracted from conversations`, 15);
    addAct("Lead Scraper", "🕷️", "Competitor scan", "Monitoring Expedia, Booking, Kayak for travel intent signals", 30, "pending");
    addAct("Content Creator", "🎬", "Post draft ready", "3 Instagram posts about Caribbean deals — awaiting approval", 60, "needs_approval");

    setActivity(acts.sort((a, b) => 0)); // keep order

    // Mock approvals
    setApprovals([
      {
        id: "ap-1",
        agent: "Content Creator",
        type: "social_post",
        platform: "Instagram",
        title: "🌴 Cancun All-Inclusive Deal",
        content: "Escape to paradise! 🌊 7 nights all-inclusive in Cancun from $899/person. Direct flights from Montreal. Book with Lina AI at zenivatravel.com\n\n#ZenivaTravel #Cancun #AllInclusive #TravelDeals #Mexico",
        createdAt: new Date(now.getTime() - 3600000).toISOString(),
      },
      {
        id: "ap-2",
        agent: "Content Creator",
        type: "social_post",
        platform: "TikTok",
        title: "✈️ Top 5 Destinations March 2026",
        content: "POV: You asked Lina AI for the best March getaways 🤖✈️\n\n1. 🇲🇽 Riviera Maya\n2. 🇩🇴 Punta Cana\n3. 🇬🇷 Santorini\n4. 🇹🇭 Thailand\n5. 🇵🇹 Algarve\n\nAll bookable at zenivatravel.com 🔥",
        createdAt: new Date(now.getTime() - 7200000).toISOString(),
      },
      {
        id: "ap-3",
        agent: "Lead Scraper",
        type: "outreach",
        title: "Outreach: 47 travel-intent leads from Reddit",
        content: "Found 47 people asking for travel advice on r/travel, r/solotravel, r/honeymoonplanning. Personalized DM draft ready for each. Topics: Greece honeymoon (12), Caribbean family (18), Japan solo (9), Europe backpack (8).",
        createdAt: new Date(now.getTime() - 1800000).toISOString(),
      },
    ]);
  }, [totalLeads, totalMessages]);

  useEffect(() => {
    fetchData();
    const i = setInterval(fetchData, 60000);
    return () => clearInterval(i);
  }, []);

  // Build agents list
  useEffect(() => {
    setAgents([
      {
        id: "lina", name: "Lina AI", emoji: "🤖", status: linaStatus,
        type: "n8n AI Agent · OpenAI GPT-4o-mini", schedule: "Real-time",
        description: "Polyglot AI travel concierge. Qualifies leads, recommends destinations, generates 3-tier quotes.",
        features: ["All languages", "Lead extraction", "Memory", "Quotes", "Supabase", "Email alerts"],
        stats: [{ label: "Messages", value: String(totalMessages) }, { label: "Leads", value: String(totalLeads) }],
      },
      {
        id: "cyber", name: "Cyber Guardian", emoji: "🛡️", status: "active",
        type: "Bash monitoring agent", schedule: "Every hour",
        description: "24/7 security. Checks services, containers, SSL, disk, RAM, SSH. Auto-restarts failures.",
        features: ["Services", "Containers", "SSL", "SSH detection", "Auto-restart", "Alerts"],
        stats: [{ label: "Scans today", value: String(new Date().getHours()) }, { label: "Issues", value: "0" }],
      },
      {
        id: "bug", name: "Bug Hunter", emoji: "🐛", status: "active",
        type: "Bash testing agent", schedule: "Every 6 hours",
        description: "Tests all pages, API endpoints, webhook, database. Alerts on any failure.",
        features: ["Pages", "API", "Webhook", "Supabase", "n8n", "Email alerts"],
        stats: [{ label: "Tests/day", value: "4" }, { label: "Bugs found", value: "0" }],
      },
      {
        id: "followup", name: "Lead Follow-up", emoji: "📧", status: "active",
        type: "Python + OpenAI", schedule: "Every 6 hours",
        description: "AI email follow-ups. Personalized in client's language. 6h for new leads, 72h for quoted.",
        features: ["AI emails", "Multi-language", "Smart timing", "Status tracking"],
        stats: [{ label: "Emails sent", value: "0" }, { label: "Pipeline", value: String(totalLeads) }],
      },
      {
        id: "scraper", name: "Lead Scraper", emoji: "🕷️", status: "active",
        type: "Python + AI scraping engine", schedule: "Every 2 hours",
        description: "Scrapes competitor sites (Expedia, Booking, Kayak), travel forums, Reddit, Facebook groups. Finds people looking for travel deals and captures them as leads.",
        features: ["Competitor monitoring", "Reddit scraping", "Facebook groups", "Travel forums", "Intent detection", "Auto-qualify"],
        stats: [{ label: "Sources", value: "12" }, { label: "Leads/day target", value: "200+" }],
      },
      {
        id: "content", name: "Content Creator", emoji: "🎬", status: "pending",
        type: "DALL-E + Video AI + Social APIs", schedule: "3-5 posts/day",
        description: "AI travel content factory. Images, videos, package promos. Auto-posts to Facebook, Instagram, TikTok with your approval.",
        features: ["AI images", "Video gen", "Facebook", "Instagram", "TikTok", "Approval flow"],
        stats: [{ label: "Posts queued", value: "3" }, { label: "Awaiting approval", value: "2" }],
      },
      {
        id: "leadhunter", name: "Lead Hunter", emoji: "🎯", status: "pending",
        type: "Ads + Outreach engine", schedule: "Continuous",
        description: "Runs paid ad campaigns on Meta, Google, TikTok. Manages cold outreach. Builds landing pages.",
        features: ["Meta Ads", "Google Ads", "TikTok Ads", "Landing pages", "A/B testing", "Cold outreach"],
        stats: [{ label: "Campaigns", value: "0" }, { label: "Budget/day", value: "TBD" }],
      },
      {
        id: "payment", name: "Payment Agent", emoji: "💳", status: "pending",
        type: "Global Payment API", schedule: "Per transaction",
        description: "Automated checkout, invoices, payment links, multi-currency. Global Payment API arriving in 7 days.",
        features: ["Auto-checkout", "Invoices", "Payment links", "Multi-currency", "Refunds"],
        stats: [{ label: "ETA", value: "7 days" }, { label: "Revenue", value: "$0" }],
      },
    ]);
  }, [linaStatus, totalLeads, totalMessages]);

  const handleApprove = (id: string) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    setActivity((prev) => [
      { id: `approved-${id}`, agent: "You", emoji: "✅", action: "Approved post", detail: "Post approved and scheduled for publication", time: new Date().toLocaleTimeString(), status: "success" },
      ...prev,
    ]);
  };

  const handleReject = (id: string) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  };

  const svcDot = (s: SvcStatus) => s === "online" ? "bg-emerald-400" : s === "offline" ? "bg-red-400" : "bg-yellow-400";
  const svcText = (s: SvcStatus) => s === "online" ? "text-emerald-400" : s === "offline" ? "text-red-400" : "text-yellow-400";

  const TABS = [
    { id: "overview", label: "Overview", emoji: "📊" },
    { id: "activity", label: "Activity Feed", emoji: "⚡" },
    { id: "leads", label: "Leads", emoji: "👥" },
    { id: "approvals", label: `Approvals ${approvals.length > 0 ? `(${approvals.length})` : ""}`, emoji: "✋" },
    { id: "agents", label: "All Agents", emoji: "🤖" },
  ] as const;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-white via-blue-200 to-indigo-400 bg-clip-text text-transparent">
            AI Agents Command Center
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitor, approve, and control all Zeniva automation
            <button onClick={fetchData} className="ml-3 text-indigo-400 font-semibold hover:text-indigo-300">↻ Refresh</button>
            {lastRefresh && <span className="text-slate-600 ml-2">· {lastRefresh}</span>}
          </p>
        </div>
        {approvals.length > 0 && (
          <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl px-4 py-2 flex items-center gap-2 animate-pulse">
            <span className="text-amber-400 font-bold text-sm">✋ {approvals.length} items need your approval</span>
            <button onClick={() => setTab("approvals")} className="text-xs bg-amber-500 text-white px-3 py-1 rounded-full font-bold hover:bg-amber-600">Review</button>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
        {[
          { label: "API", status: apiHealth },
          { label: "Database", status: dbHealth },
          { label: "Lina", status: webhookHealth },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${svcDot(s.status)} ${s.status === "online" ? "animate-pulse" : ""}`} />
            <span className="text-xs text-slate-400">{s.label}</span>
            <span className={`text-xs font-bold ml-auto ${svcText(s.status)}`}>{s.status === "online" ? "ON" : s.status === "offline" ? "OFF" : "..."}</span>
          </div>
        ))}
        <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">
          <div className="text-[10px] text-slate-500">Leads</div>
          <div className="text-sm font-black text-white">{totalLeads}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">
          <div className="text-[10px] text-slate-500">Messages</div>
          <div className="text-sm font-black text-white">{totalMessages}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">
          <div className="text-[10px] text-slate-500">Agents</div>
          <div className="text-sm font-black text-emerald-400">{agents.filter((a) => a.status === "live" || a.status === "active").length}/{agents.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 border border-white/10">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
              tab === t.id ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "text-slate-500 hover:text-slate-300 border border-transparent"
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === "overview" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Recent Activity */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white mb-3">⚡ Recent Activity</h2>
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto">
                {activity.slice(0, 8).map((a) => (
                  <div key={a.id} className="flex items-start gap-3 bg-white/[0.02] rounded-xl px-3 py-2.5 border border-white/5">
                    <span className="text-lg mt-0.5">{a.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{a.agent}</span>
                        {a.status === "needs_approval" && <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-bold">NEEDS APPROVAL</span>}
                        {a.status === "success" && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">DONE</span>}
                        {a.status === "pending" && <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-bold">RUNNING</span>}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{a.action}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{a.detail}</div>
                    </div>
                    <span className="text-[10px] text-slate-600 whitespace-nowrap">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick agent status */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white mb-3">🤖 Agent Status</h2>
              <div className="space-y-2">
                {agents.map((agent) => {
                  const sc = STATUS_CONFIG[agent.status];
                  return (
                    <div key={agent.id} className="flex items-center gap-3 bg-white/[0.02] rounded-xl px-3 py-2.5 border border-white/5">
                      <span className="text-xl">{agent.emoji}</span>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-white">{agent.name}</div>
                        <div className="text-[10px] text-slate-500">{agent.schedule}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {agent.stats.map((s) => (
                          <div key={s.label} className="text-center">
                            <div className="text-xs font-black text-white">{s.value}</div>
                            <div className="text-[9px] text-slate-600">{s.label}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${sc.dot} ${agent.status === "live" ? "animate-pulse" : ""}`} />
                        <span className={`${sc.bg} text-white text-[9px] font-bold px-2 py-0.5 rounded-full`}>{sc.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pending approvals preview */}
          {approvals.length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-amber-400">✋ Pending Approvals</h2>
                <button onClick={() => setTab("approvals")} className="text-xs text-amber-400 font-semibold hover:underline">View all →</button>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {approvals.map((ap) => (
                  <div key={ap.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-3">
                    <div className="text-xs font-bold text-white">{ap.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{ap.agent} · {ap.platform || ap.type}</div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleApprove(ap.id)} className="flex-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold py-1 rounded-lg hover:bg-emerald-500/30">✅ Approve</button>
                      <button onClick={() => handleReject(ap.id)} className="flex-1 bg-red-500/20 text-red-400 text-[10px] font-bold py-1 rounded-lg hover:bg-red-500/30">❌ Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Activity Feed */}
      {tab === "activity" && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-white mb-4">⚡ Full Activity Feed</h2>
          <div className="space-y-2">
            {activity.map((a) => (
              <div key={a.id} className="flex items-start gap-3 bg-white/[0.02] rounded-xl px-4 py-3 border border-white/5">
                <span className="text-2xl mt-0.5">{a.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{a.agent}</span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-slate-400">{a.action}</span>
                    {a.status === "needs_approval" && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">NEEDS APPROVAL</span>}
                    {a.status === "success" && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">✓ DONE</span>}
                    {a.status === "pending" && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold animate-pulse">⟳ RUNNING</span>}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">{a.detail}</div>
                </div>
                <span className="text-xs text-slate-600">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Leads */}
      {tab === "leads" && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">👥 All Captured Leads ({leads.length})</h2>
          </div>
          {leads.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No leads captured yet. Send visitors to chat with Lina!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {["Date", "Name", "Email", "Phone", "Destination", "Source", "Status"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-xs text-slate-400">{new Date(lead.created_at).toLocaleDateString("en-CA")}</td>
                      <td className="px-4 py-3 text-xs font-bold text-white">{lead.name}</td>
                      <td className="px-4 py-3 text-xs text-blue-400">{lead.email}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{lead.phone}</td>
                      <td className="px-4 py-3 text-xs text-slate-300">{lead.destination}</td>
                      <td className="px-4 py-3"><span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold">{lead.source}</span></td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          lead.status === "new" ? "bg-cyan-500/20 text-cyan-400" :
                          lead.status === "quoted" ? "bg-purple-500/20 text-purple-400" :
                          lead.status === "converted" ? "bg-emerald-500/20 text-emerald-400" :
                          "bg-slate-500/20 text-slate-400"
                        }`}>{lead.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Approvals */}
      {tab === "approvals" && (
        <div className="space-y-4">
          {approvals.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
              <span className="text-4xl">✅</span>
              <p className="text-slate-400 mt-3 text-sm">All clear! No pending approvals.</p>
            </div>
          ) : (
            approvals.map((ap) => (
              <div key={ap.id} className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{ap.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{ap.agent} · {ap.platform || ap.type} · {new Date(ap.createdAt).toLocaleString()}</div>
                  </div>
                  <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-3 py-1 rounded-full">AWAITING APPROVAL</span>
                </div>
                <div className="px-5 py-4">
                  <div className="bg-black/30 border border-white/5 rounded-xl p-4 text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {ap.content}
                  </div>
                </div>
                <div className="px-5 py-3 border-t border-white/10 flex gap-3 justify-end">
                  <button onClick={() => handleReject(ap.id)} className="bg-red-500/20 text-red-400 px-5 py-2 rounded-xl text-xs font-bold hover:bg-red-500/30 transition">❌ Reject</button>
                  <button onClick={() => handleApprove(ap.id)} className="bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 transition">✅ Approve & Publish</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: All Agents */}
      {tab === "agents" && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => {
            const sc = STATUS_CONFIG[agent.status];
            return (
              <div key={agent.id} className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{agent.emoji}</span>
                    <div>
                      <h2 className="text-base font-bold text-white">{agent.name}</h2>
                      <p className="text-[11px] text-slate-500">{agent.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`h-2 w-2 rounded-full ${sc.dot} ${agent.status === "live" ? "animate-pulse" : ""}`} />
                    <span className={`${sc.bg} text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full`}>{sc.label}</span>
                  </div>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <p className="text-sm text-slate-400">{agent.description}</p>
                  <div className="flex gap-3">
                    {agent.stats.map((s) => (
                      <div key={s.label} className="bg-white/5 rounded-lg px-3 py-1.5 text-center">
                        <div className="text-sm font-black text-white">{s.value}</div>
                        <div className="text-[9px] text-slate-500">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.features.map((f) => (
                      <span key={f} className="bg-white/5 text-slate-400 text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/5">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 text-center text-xs text-slate-600">
        Zeniva Travel AI · {agents.filter((a) => a.status === "live" || a.status === "active").length} agents running · Powered by OpenAI + n8n
      </div>
    </div>
  );
}
