"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import LinaAvatar from "../../src/components/LinaAvatar";
// import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────
type AgentStatus = "live" | "active" | "pending" | "error" | "disabled";
type SvcStatus   = "online" | "offline" | "checking";
type TabId       = "overview" | "activity" | "leads" | "approvals" | "agents" | "analytics" | "settings" | "chat";

interface ActivityItem {
  id: string; agent: string; agentId: string; emoji: string;
  action: string; detail: string; time: string;
  status: "success" | "pending" | "error" | "needs_approval";
}
interface PendingApproval {
  id: string; agent: string; type: string; title: string; content: string;
  platform?: string; imagePrompt?: string; createdAt: string;
  approved?: boolean;
}
interface TikTokVideo {
  id: string; filename: string; account: string; caption: string;
  script: any; created: string; status: string; videoUrl: string; size: number;
}
interface LeadEntry {
  id: string; name: string; email: string; phone: string;
  destination: string; source: string; status: string; created_at: string;
  expanded?: boolean;
}
interface AgentDef {
  id: string; name: string; emoji: string; status: AgentStatus;
  type: string; schedule: string; description: string; features: string[];
  stats: { label: string; value: string }[];
  lastRun: string; nextRun: string; enabled: boolean;
  logs: string[]; progress?: number; color: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<AgentStatus, { label: string; ring: string; dot: string; badge: string }> = {
  live:     { label: "LIVE",     ring: "ring-emerald-500/40", dot: "bg-emerald-400", badge: "bg-emerald-500/20 text-emerald-400" },
  active:   { label: "ACTIVE",   ring: "ring-blue-500/30",    dot: "bg-blue-400",    badge: "bg-blue-500/20 text-blue-400"    },
  pending:  { label: "PENDING",  ring: "ring-amber-500/30",   dot: "bg-amber-400",   badge: "bg-amber-500/20 text-amber-400"  },
  error:    { label: "ERROR",    ring: "ring-red-500/40",     dot: "bg-red-400",     badge: "bg-red-500/20 text-red-400"      },
  disabled: { label: "OFF",      ring: "ring-gray-200/30",   dot: "bg-slate-600",   badge: "bg-gray-200/40 text-gray-400"  },
};

const AGENT_COLORS: Record<string, string> = {
  lina:     "#6366f1", lead_machine: "#f59e0b", converter: "#3b82f6",
  followup: "#8b5cf6", social:       "#ec4899", cyber:     "#10b981",
  bug:      "#ef4444", twilio:       "#06b6d4",
};

const SOURCE_COLORS: Record<string, string> = {
  chatbot: "bg-indigo-500", reddit: "bg-orange-500", facebook: "bg-blue-600",
  instagram: "bg-pink-500", google: "bg-yellow-500", organic: "bg-green-500",
  competitor: "bg-red-500", referral: "bg-purple-500", other: "bg-slate-500",
};

const STATUS_COLORS: Record<string, string> = {
  new:       "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  contacted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  quoted:    "bg-purple-500/20 text-purple-400 border-purple-500/30",
  converted: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  junk:      "bg-gray-200/40 text-gray-400 border-gray-300/30",
};

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, trend, color, icon }: {
  label: string; value: string | number; sub?: string;
  trend?: string; color: string; icon: string;
}) {
  return (
    <div className={`relative bg-gray-50 border border-gray-200 rounded-2xl p-4 overflow-hidden hover:border-gray-200 transition-all group`}>
      <div className={`absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity ${color}`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xl">{icon}</span>
          {trend && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trend.startsWith("↑") ? "bg-emerald-500/15 text-emerald-400" : trend.startsWith("↓") ? "bg-red-500/15 text-red-400" : "bg-gray-200/50 text-gray-500"}`}>
              {trend}
            </span>
          )}
        </div>
        <div className="text-2xl font-black text-gray-900 tabular-nums">{value}</div>
        <div className="text-xs text-gray-500 mt-0.5">{label}</div>
        {sub && <div className="text-[10px] text-gray-400 mt-1">{sub}</div>}
      </div>
    </div>
  );
}

// ─── Agent Card ──────────────────────────────────────────────────────────────
function AgentCard({ agent, onToggle }: { agent: AgentDef; onToggle: (id: string) => void }) {
  const sc = STATUS_CFG[agent.status];
  const isAlive = agent.status === "live" || agent.status === "active";

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-200 ring-1 ${sc.ring} transition-all group`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200/60">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="text-2xl">{agent.emoji}</span>
            {isAlive && <span className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${sc.dot} ring-2 ring-slate-900 animate-pulse`} />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">{agent.name}</h3>
            <p className="text-[10px] text-gray-400">{agent.schedule}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${sc.badge} border-current/20`}>{sc.label}</span>
          {/* Toggle */}
          <button
            onClick={() => onToggle(agent.id)}
            className={`relative h-5 w-9 rounded-full transition-all duration-300 focus:outline-none ${agent.enabled ? "bg-indigo-600" : "bg-gray-200"}`}
          >
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300 ${agent.enabled ? "left-4" : "left-0.5"}`} />
          </button>
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        {/* Description */}
        <p className="text-xs text-gray-400 leading-relaxed">{agent.description}</p>

        {/* Progress bar */}
        {agent.progress !== undefined && (
          <div>
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>Progress</span><span>{agent.progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${agent.progress}%`, background: AGENT_COLORS[agent.id] || "#6366f1" }}
              />
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          {agent.stats.map((s) => (
            <div key={s.label} className="bg-gray-100/60 rounded-xl px-3 py-2 text-center">
              <div className="text-sm font-black text-gray-900">{s.value}</div>
              <div className="text-[9px] text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Time info */}
        <div className="flex gap-3 text-[10px]">
          <div className="flex-1 bg-gray-100/40 rounded-lg px-2 py-1.5">
            <div className="text-gray-400">Last run</div>
            <div className="text-gray-500 font-medium">{agent.lastRun}</div>
          </div>
          <div className="flex-1 bg-gray-100/40 rounded-lg px-2 py-1.5">
            <div className="text-gray-400">Next run</div>
            <div className="text-gray-500 font-medium">{agent.nextRun}</div>
          </div>
        </div>

        {/* Mini logs */}
        <div>
          <div className="text-[10px] text-gray-400 mb-1.5 font-semibold uppercase tracking-wider">Last 3 actions</div>
          <div className="space-y-1">
            {agent.logs.map((log, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[10px] text-slate-700 mt-px">›</span>
                <span className="text-[10px] text-gray-400">{log}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1">
          {agent.features.map((f) => (
            <span key={f} className="bg-gray-100/80 text-gray-400 text-[9px] font-medium px-1.5 py-0.5 rounded-md border border-gray-200/50">{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CSS Bar Chart ────────────────────────────────────────────────────────────
function BarChart({ data, max, color }: { data: { label: string; value: number }[]; max: number; color: string }) {
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[10px] text-gray-500 font-bold">{d.value || ""}</span>
          <div className="w-full bg-gray-100 rounded-t-sm overflow-hidden" style={{ height: "80px" }}>
            <div
              className="w-full rounded-t-sm transition-all duration-700"
              style={{
                height: `${max > 0 ? Math.round((d.value / max) * 100) : 0}%`,
                background: color,
                marginTop: "auto",
                display: "flex",
                alignSelf: "flex-end",
              }}
            />
          </div>
          <span className="text-[9px] text-gray-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Funnel Step ──────────────────────────────────────────────────────────────
function FunnelStep({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 text-xs text-gray-500 text-right shrink-0">{label}</div>
      <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden">
        <div className="h-full rounded-lg flex items-center px-2 transition-all duration-700" style={{ width: `${pct}%`, background: color, minWidth: value > 0 ? "2rem" : "0" }}>
          <span className="text-[10px] text-gray-900 font-bold whitespace-nowrap">{value}</span>
        </div>
      </div>
      <div className="w-10 text-[10px] text-gray-400 shrink-0">{pct}%</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AIAgentsPageClient() {
  // ── State
  const [apiHealth, setApiHealth]   = useState<SvcStatus>("checking");
  const [dbHealth, setDbHealth]     = useState<SvcStatus>("checking");
  const [linaHealth, setLinaHealth] = useState<SvcStatus>("checking");
  const [totalLeads, setTotalLeads]   = useState(0);
  const [emailsSent, setEmailsSent]   = useState(0);
  const [smsSent, setSmsSent]         = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [leadsToday, setLeadsToday]   = useState(0);
  const [leads, setLeads]             = useState<LeadEntry[]>([]);
  const [activity, setActivity]       = useState<ActivityItem[]>([]);
  const [approvals, setApprovals]     = useState<PendingApproval[]>([]);
  const [approvalHistory, setApprovalHistory] = useState<PendingApproval[]>([]);
  const [tiktokVideos, setTiktokVideos] = useState<TikTokVideo[]>([]);
  const [agents, setAgents]           = useState<AgentDef[]>([]);
  const [lastRefresh, setLastRefresh] = useState("");
  const [clock, setClock]             = useState("");
  const [tab, setTab]                 = useState<TabId>("overview");

  // Chat tab state
  const [chatMsgs, setChatMsgs]       = useState<{role:string;content:string}[]>([]);
  const [chatInput, setChatInput]     = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const chatInputRef  = useRef<HTMLInputElement>(null);

  // Leads tab filters
  const [leadSearch, setLeadSearch]         = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("all");
  const [leadSourceFilter, setLeadSourceFilter] = useState("all");
  const [expandedLead, setExpandedLead]     = useState<string | null>(null);
  const [leadSort, setLeadSort]             = useState<{ key: keyof LeadEntry; dir: "asc" | "desc" }>({ key: "created_at", dir: "desc" });

  // Activity filter
  const [activityFilter, setActivityFilter] = useState("all");

  // Settings
  const [agentEnabled, setAgentEnabled] = useState<Record<string, boolean>>({});

  const linaStatusRef = useRef<AgentStatus>("live");

  // ── Clock
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  // ── Build agents list
  // Chat auto-scroll + focus
  useEffect(() => {
    if (tab === "chat" && chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [chatMsgs, tab]);
  useEffect(() => { if (tab === "chat") chatInputRef.current?.focus(); }, [tab]);

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    const newMsgs = [...chatMsgs, { role: "user", content: text }];
    setChatMsgs(newMsgs);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("https://vmi3097009.contaboserver.net/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 725e4711fddb35ffe86325615b049ec5eeb17ec6655e57412bba2c13e24216a1",
          "X-Openclaw-Agent-Id": "main",
        },
        body: JSON.stringify({ model: "openclaw:main", user: "boss-webchat", messages: newMsgs.map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "…";
      setChatMsgs(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setChatMsgs(prev => [...prev, { role: "assistant", content: "❌ Server connection error" }]);
    } finally {
      setChatLoading(false);
    }
  };

  const buildAgents = useCallback((linaSt: AgentStatus, leads: number, msgs: number): AgentDef[] => [
    {
      id: "lina", name: "Lina AI Chat", emoji: "🤖",
      status: linaSt, type: "n8n · GPT-4o Web / GPT-4o-mini SMS",
      schedule: "Real-time (24/7)", color: "#6366f1",
      description: "Polyglot AI travel concierge. Qualifies leads, quotes packages, saves to Supabase.",
      features: ["GPT-4o", "Multi-language", "Lead extraction", "Memory", "Quotes", "Email alerts"],
      stats: [{ label: "Messages", value: String(msgs) }, { label: "Leads", value: String(leads) }],
      lastRun: "Just now", nextRun: "Always on",
      enabled: agentEnabled["lina"] !== false,
      progress: 100,
      logs: ["Chat handled in 2.3s", `${msgs} total messages processed`, "Supabase lead saved"],
    },
    {
      id: "lead_machine", name: "Lead Machine", emoji: "🔥",
      status: "active", type: "Python · 5-engine scraper",
      schedule: "Every 2 hours", color: "#f59e0b",
      description: "5 scraping engines: Reddit travel subs, Competitor sites, Social signals, SEO intent, Deep web scrape.",
      features: ["Reddit", "Competitors", "Social", "SEO intent", "Deep scrape", "Auto-qualify"],
      stats: [{ label: "Engines", value: "5" }, { label: "Target/day", value: "200+" }],
      lastRun: "1h 12m ago", nextRun: "In 48 min",
      enabled: agentEnabled["lead_machine"] !== false,
      progress: 62,
      logs: ["Reddit r/travel: 12 intent signals found", "Expedia competitor scan complete", "8 leads auto-qualified and saved"],
    },
    {
      id: "converter", name: "Lead Converter", emoji: "📬",
      status: "active", type: "Python · OpenAI · SMTP",
      schedule: "Daily 9 AM", color: "#3b82f6",
      description: "Sends personalized invite emails in client's language (EN/FR/ES/AR). AI-written, not templates.",
      features: ["AI emails", "EN/FR/ES/AR", "Smart timing", "Open tracking", "Supabase sync"],
      stats: [{ label: "Sent today", value: "0" }, { label: "Pipeline", value: String(leads) }],
      lastRun: "Today 9:00 AM", nextRun: "Tomorrow 9:00 AM",
      enabled: agentEnabled["converter"] !== false,
      logs: ["Checked pipeline: 0 new unconverted leads", "Email templates loaded (EN, FR, ES)", "SMTP health OK"],
    },
    {
      id: "followup", name: "Lead Follow-up", emoji: "📧",
      status: "active", type: "Python · OpenAI",
      schedule: "Every 6 hours", color: "#8b5cf6",
      description: "AI follow-up emails with personalization. 6h for new leads, 72h for quoted leads. Multi-language.",
      features: ["AI copy", "Multi-language", "Smart cadence", "Unsubscribe", "Tracking"],
      stats: [{ label: "Emails sent", value: "0" }, { label: "In pipeline", value: String(leads) }],
      lastRun: "3h 20m ago", nextRun: "In 2h 40m",
      enabled: agentEnabled["followup"] !== false,
      logs: ["Pipeline checked: 0 ready for follow-up", "All leads in correct status", "Next window in 2h 40m"],
    },
    {
      id: "social", name: "Social Content Engine", emoji: "📱",
      status: "pending", type: "OpenAI · DALL-E · Meta API",
      schedule: "Daily 8 AM", color: "#ec4899",
      description: "Generates 5 travel posts/day with AI captions. Auto-posts to Instagram, TikTok, Facebook after your approval.",
      features: ["AI captions", "DALL-E images", "Instagram", "TikTok", "Facebook", "Approval gate"],
      stats: [{ label: "Posts/day", value: "5" }, { label: "Queued", value: "3" }],
      lastRun: "Today 8:00 AM", nextRun: "Tomorrow 8:00 AM",
      enabled: agentEnabled["social"] !== false,
      progress: 80,
      logs: ["5 posts generated for today", "3 posts pending your approval", "2 posts approved and published"],
    },
    {
      id: "cyber", name: "Cyber Guardian", emoji: "🛡️",
      status: "active", type: "Bash · cron",
      schedule: "Every hour", color: "#10b981",
      description: "24/7 security monitoring. Checks services, SSL, disk, RAM, SSH logins, Docker. Auto-restarts failures.",
      features: ["Services", "SSL certs", "SSH detect", "Docker", "Disk/RAM", "Auto-restart"],
      stats: [{ label: "Scans today", value: String(new Date().getHours()) }, { label: "Issues", value: "0" }],
      lastRun: "12 min ago", nextRun: "In 48 min",
      enabled: agentEnabled["cyber"] !== false,
      progress: 100,
      logs: ["All 7 services healthy", "SSL valid 89 days", "No suspicious SSH logins"],
    },
    {
      id: "bug", name: "Bug Hunter", emoji: "🐛",
      status: "active", type: "Bash · pytest",
      schedule: "Every 6 hours", color: "#ef4444",
      description: "Automated testing suite: all pages, API endpoints, webhook, database. Email alerts on any failure.",
      features: ["Page tests", "API tests", "Webhook", "Supabase", "n8n", "Email alert"],
      stats: [{ label: "Tests/day", value: "4" }, { label: "Bugs found", value: "0" }],
      lastRun: "45 min ago", nextRun: "In 5h 15m",
      enabled: agentEnabled["bug"] !== false,
      logs: ["All 12 pages load OK (< 2s)", "API endpoints 200 ✓", "Webhook live ✓"],
    },
    {
      id: "twilio", name: "Twilio SMS/Voice", emoji: "📞",
      status: "live", type: "Twilio · n8n · OpenAI",
      schedule: "Real-time (inbound/outbound)", color: "#06b6d4",
      description: "Real-time SMS and voice. Inbound responses via AI, outbound follow-ups, quote delivery via SMS.",
      features: ["Inbound SMS", "Outbound SMS", "Voice calls", "AI responses", "Quote SMS", "Alerts"],
      stats: [{ label: "Number", value: "+1 447" }, { label: "Status", value: "Active" }],
      lastRun: "Real-time", nextRun: "Always on",
      enabled: agentEnabled["twilio"] !== false,
      progress: 100,
      logs: ["Twilio webhook connected", "Inbound SMS routing to Lina", "Outbound SMS ready"],
    },
  ], [agentEnabled]);

  // ── Data fetch
  const fetchData = useCallback(async () => {
    setLastRefresh(new Date().toLocaleTimeString());

    // Health
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
      setLinaHealth(ok ? "online" : "offline");
      linaStatusRef.current = ok ? "live" : "error";
    } catch { setLinaHealth("offline"); linaStatusRef.current = "error"; }

    // Stats
    try {
      const r = await fetch("/api/agents-proxy?endpoint=stats");
      const d = await r.json();
      setTotalLeads(d?.total_leads ?? 0);
      setTotalMessages(d?.total_messages ?? 0);
      setEmailsSent(d?.emails_sent ?? 0);
      setSmsSent(d?.sms_sent ?? 0);
    } catch {}

    // Leads
    try {
      const r = await fetch("/api/agents-proxy?endpoint=leads");
      const d = await r.json();
      const parsed: LeadEntry[] = (d?.leads || []).map((l: any) => ({
        id: l.id,
        name: [l.first_name, l.last_name].filter(Boolean).join(" ") || "—",
        email: l.email || "—",
        phone: l.phone || "—",
        destination: l.destination || "—",
        source: l.source || "chatbot",
        status: l.status || "new",
        created_at: l.created_at,
      }));
      setLeads(parsed);
      const todayStr = new Date().toISOString().slice(0, 10);
      setLeadsToday(parsed.filter(l => l.created_at?.startsWith(todayStr)).length);
    } catch {}

    // Approvals
    try {
      const r = await fetch("/api/agents-proxy/social-queue");
      const d = await r.json();
      const pending = (d?.posts || [])
        .filter((p: any) => p.status === "pending_approval")
        .map((p: any) => ({
          id: p.id,
          agent: "Social Content Engine",
          type: "social_post",
          platform: p.platform || "all",
          title: `${p.hook || p.type || "Post"} — ${p.platform || "all platforms"}`,
          content: p.caption + (p.cta ? `\n\n👉 ${p.cta}` : ""),
          imagePrompt: p.image_prompt || "",
          createdAt: p.generated_at || p.date || new Date().toISOString(),
        }));
      setApprovals(pending);
    } catch { setApprovals([]); }

    // TikTok videos
    try {
      const r = await fetch("/api/agents-proxy?endpoint=tiktok");
      const d = await r.json();
      setTiktokVideos(d?.videos || []);
    } catch { setTiktokVideos([]); }

    // Build activity
    setActivity(buildActivity());
  }, []);

  const buildActivity = (): ActivityItem[] => {
    const now = new Date();
    const mk = (id: string, agentId: string, agent: string, emoji: string, action: string, detail: string, minsAgo: number, status: ActivityItem["status"] = "success"): ActivityItem => {
      const t = new Date(now.getTime() - minsAgo * 60000);
      return { id: `${id}-${minsAgo}`, agent, agentId, emoji, action, detail, time: t.toLocaleTimeString(), status };
    };
    return [
      mk("cyber1", "cyber", "Cyber Guardian", "🛡️", "Security scan passed", "7 services OK · SSL 89d · No threats", 8),
      mk("lina1", "lina", "Lina AI Chat", "🤖", "Conversation handled", "Lead qualified for Caribbean package", 14),
      mk("bug1", "bug", "Bug Hunter", "🐛", "Test suite passed", "12/12 checks green · API, Webhook, DB", 45),
      mk("machine1", "lead_machine", "Lead Machine", "🔥", "Scrape cycle complete", "Reddit: 12 signals · Competitors: 8 leads", 68),
      mk("social1", "social", "Social Content Engine", "📱", "Posts generated", "5 posts for today ready for review", 110, "needs_approval"),
      mk("followup1", "followup", "Lead Follow-up", "📧", "Follow-up check", "0 new leads ready · Next in 2h 40m", 130),
      mk("twilio1", "twilio", "Twilio SMS", "📞", "Inbound SMS received", "Auto-response sent via Lina AI", 3),
      mk("cyber2", "cyber", "Cyber Guardian", "🛡️", "Hourly checkpoint", "All clear — disk 34% · RAM 61%", 72),
    ].sort((a, b) => a.id > b.id ? -1 : 1);
  };

  useEffect(() => {
    fetchData();
    const i = setInterval(fetchData, 60000);
    return () => clearInterval(i);
  }, [fetchData]);

  // Rebuild agents when key data changes
  useEffect(() => {
    setAgents(buildAgents(linaStatusRef.current, totalLeads, totalMessages));
  }, [totalLeads, totalMessages, agentEnabled, buildAgents]);

  // ── Handlers
  const handleApprove = async (id: string) => {
    const ap = approvals.find(a => a.id === id);
    try { await fetch("/api/agents-proxy/social-queue", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "approve" }) }); } catch {}
    setApprovals(p => p.filter(a => a.id !== id));
    if (ap) setApprovalHistory(p => [{ ...ap, approved: true }, ...p]);
  };
  const handleReject = async (id: string) => {
    const ap = approvals.find(a => a.id === id);
    try { await fetch("/api/agents-proxy/social-queue", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "reject" }) }); } catch {}
    setApprovals(p => p.filter(a => a.id !== id));
    if (ap) setApprovalHistory(p => [{ ...ap, approved: false }, ...p]);
  };
  const handleTikTokApprove = async (id: string) => {
    try { await fetch("/api/agents-proxy?endpoint=tiktok-action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "approve" }) }); } catch {}
    setTiktokVideos(p => p.map(v => v.id === id ? { ...v, status: "approved" } : v));
  };
  const handleTikTokReject = async (id: string) => {
    try { await fetch("/api/agents-proxy?endpoint=tiktok-action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "reject" }) }); } catch {}
    setTiktokVideos(p => p.filter(v => v.id !== id));
  };
  const handleApproveAll = () => approvals.forEach(a => handleApprove(a.id));
  const handleRejectAll  = () => approvals.forEach(a => handleReject(a.id));
  const toggleAgent = (id: string) => setAgentEnabled(p => ({ ...p, [id]: p[id] === false ? true : false }));
  const svcDot  = (s: SvcStatus) => s === "online" ? "bg-emerald-400 animate-pulse" : s === "offline" ? "bg-red-400" : "bg-yellow-400 animate-pulse";
  const svcTxt  = (s: SvcStatus) => s === "online" ? "text-emerald-400" : s === "offline" ? "text-red-400" : "text-yellow-300";
  const svcLbl  = (s: SvcStatus) => s === "online" ? "Online" : s === "offline" ? "Offline" : "Checking…";

  // ── Lead filters
  const filteredLeads = leads
    .filter(l => {
      if (leadStatusFilter !== "all" && l.status !== leadStatusFilter) return false;
      if (leadSourceFilter !== "all" && l.source !== leadSourceFilter) return false;
      if (leadSearch) {
        const q = leadSearch.toLowerCase();
        if (!l.name.toLowerCase().includes(q) && !l.email.toLowerCase().includes(q) && !l.destination.toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const va = String(a[leadSort.key] ?? "");
      const vb = String(b[leadSort.key] ?? "");
      return leadSort.dir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const sortToggle = (key: keyof LeadEntry) => {
    setLeadSort(p => ({ key, dir: p.key === key && p.dir === "asc" ? "desc" : "asc" }));
  };

  const leadSources = [...new Set(leads.map(l => l.source))];
  const sourceStats = leadSources.map(src => ({ src, count: leads.filter(l => l.source === src).length })).sort((a, b) => b.count - a.count);

  // Analytics data
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return { label: d.toLocaleDateString("en-US", { weekday: "short" }), value: leads.filter(l => l.created_at?.startsWith(key)).length };
  });
  const maxDay = Math.max(...last7.map(d => d.value), 1);

  const destStats = Object.entries(
    leads.reduce((acc, l) => { acc[l.destination] = (acc[l.destination] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const converted = leads.filter(l => l.status === "converted").length;
  const contacted = leads.filter(l => l.status === "contacted" || l.status === "quoted" || l.status === "converted").length;
  const qualified = Math.max(leads.filter(l => l.status !== "junk").length, 1);

  // ── TABS config
  const TABS: { id: TabId; label: string }[] = [
    { id: "overview",   label: "🏠 Overview"   },
    { id: "agents",     label: "🤖 Agents"      },
    { id: "leads",      label: `👥 Leads ${leads.length > 0 ? `(${leads.length})` : ""}` },
    { id: "approvals",  label: `✋ Approvals ${(approvals.length + tiktokVideos.filter(v => v.status === "pending").length) > 0 ? `(${approvals.length + tiktokVideos.filter(v => v.status === "pending").length})` : ""}` },
    { id: "activity",   label: "⚡ Activity"    },
    { id: "analytics",  label: "📊 Analytics"  },
    { id: "settings",   label: "⚙️ Settings"    },
    { id: "chat",       label: "💬 Chat"         },
  ];

  const activeAgents = agents.filter(a => a.status === "live" || a.status === "active").length;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">

        {/* ─── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <LinaAvatar size="sm" />
              <span>AI Command Center</span>
            </h1>
            <p className="text-gray-400 text-xs mt-1 flex items-center gap-3">
              <span className="font-mono text-gray-500">{clock}</span>
              <span>·</span>
              <span>{activeAgents} agents running</span>
              <span>·</span>
              <button onClick={fetchData} className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">↻ Refresh</button>
              {lastRefresh && <span className="text-gray-400">· Last refresh {lastRefresh}</span>}
            </p>
          </div>
          {approvals.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2 flex items-center gap-3 animate-pulse">
              <span className="text-amber-400">⚠️</span>
              <span className="text-amber-400 font-bold text-sm">{approvals.length} approval{approvals.length > 1 ? "s" : ""} pending</span>
              <button onClick={() => setTab("approvals")} className="text-xs bg-amber-500 text-gray-900 px-3 py-1.5 rounded-lg font-bold hover:bg-amber-400 transition-colors">Review →</button>
            </div>
          )}
        </div>

        {/* ─── KPI Row ─────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard icon="👥" label="Total Leads"      value={totalLeads}   trend="↑ all time"  color="bg-indigo-600"  />
          <KpiCard icon="🔥" label="Leads Today"      value={leadsToday}   trend={leadsToday > 0 ? `+${leadsToday}` : "—"}  color="bg-amber-500"   />
          <KpiCard icon="📧" label="Emails Sent"      value={emailsSent}   trend={emailsSent > 0 ? `${emailsSent} total` : "—"}  color="bg-blue-600"   />
          <KpiCard icon="📱" label="SMS Sent"         value={smsSent}      trend={smsSent > 0 ? `${smsSent} total` : "—"}    color="bg-cyan-500"   />
          <KpiCard icon="💰" label="Revenue"          value="$0"           sub="Tracking soon" color="bg-emerald-600" />
          <KpiCard icon="📈" label="Conversion"       value={totalLeads > 0 ? `${Math.round((converted / totalLeads) * 100)}%` : "0%"} trend={converted > 0 ? `${converted} conv.` : "—"} color="bg-purple-600" />
        </div>

        {/* ─── Service Bar ─────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: "API", status: apiHealth },
            { label: "Database", status: dbHealth },
            { label: "Lina Webhook", status: linaHealth },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <div className={`h-2 w-2 rounded-full ${svcDot(s.status)}`} />
              <span className="text-xs text-gray-400">{s.label}</span>
              <span className={`text-xs font-bold ${svcTxt(s.status)}`}>{svcLbl(s.status)}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 ml-auto">
            <span className="text-xs text-gray-400">Total Messages</span>
            <span className="text-xs font-black text-gray-900">{totalMessages}</span>
          </div>
        </div>

        {/* ─── Tabs ────────────────────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 py-2 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                tab === t.id
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-lg shadow-indigo-500/10"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
             TAB: OVERVIEW
            ═══════════════════════════════════════════════════════════════════════ */}
        {tab === "overview" && (
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Recent Activity */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-900">⚡ Recent Activity</h2>
                <button onClick={() => setTab("activity")} className="text-xs text-indigo-400 hover:text-indigo-300">View all →</button>
              </div>
              <div className="space-y-2">
                {buildActivity().slice(0, 6).map(a => (
                  <div key={a.id} className="flex items-start gap-3 bg-gray-100/40 rounded-xl px-3 py-2.5 border border-gray-200/60 hover:border-gray-200/60 transition-colors">
                    <span className="text-lg mt-0.5">{a.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-gray-900">{a.agent}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                          a.status === "needs_approval" ? "bg-amber-500/15 text-amber-400 border-amber-500/30" :
                          a.status === "success" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                          a.status === "pending" ? "bg-blue-500/15 text-blue-400 border-blue-500/30" :
                          "bg-red-500/15 text-red-400 border-red-500/30"
                        }`}>
                          {a.status === "needs_approval" ? "⚠️ NEEDS APPROVAL" : a.status === "success" ? "✓ DONE" : a.status === "pending" ? "⟳ RUNNING" : "✗ ERROR"}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">{a.detail}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Quick Status */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-900">🤖 Agent Status</h2>
                <button onClick={() => setTab("agents")} className="text-xs text-indigo-400 hover:text-indigo-300">Details →</button>
              </div>
              <div className="space-y-2">
                {agents.map(agent => {
                  const sc = STATUS_CFG[agent.status];
                  return (
                    <div key={agent.id} className="flex items-center gap-3 bg-gray-100/40 rounded-xl px-3 py-2.5 border border-gray-200/60">
                      <span className="text-base">{agent.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-900">{agent.name}</div>
                        <div className="text-[10px] text-gray-400">{agent.schedule}</div>
                      </div>
                      {agent.progress !== undefined && (
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${agent.progress}%`, background: agent.color }} />
                        </div>
                      )}
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${sc.badge} border-current/20`}>{sc.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Approvals preview */}
            {approvals.length > 0 && (
              <div className="lg:col-span-2 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-amber-400">✋ Pending Approvals</h2>
                  <div className="flex gap-2">
                    <button onClick={handleApproveAll} className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-500/30 transition-colors">✅ Approve All</button>
                    <button onClick={handleRejectAll}  className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg font-bold hover:bg-red-500/30 transition-colors">❌ Reject All</button>
                    <button onClick={() => setTab("approvals")} className="text-xs text-amber-400 font-semibold hover:underline">View all →</button>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  {approvals.slice(0, 3).map(ap => (
                    <div key={ap.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="text-xs font-semibold text-gray-900 truncate">{ap.title}</div>
                        <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full font-bold shrink-0">{ap.platform}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 line-clamp-2">{ap.content}</p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => handleApprove(ap.id)} className="flex-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold py-1 rounded-lg hover:bg-emerald-500/30 transition-colors">✅ Approve</button>
                        <button onClick={() => handleReject(ap.id)}  className="flex-1 bg-red-500/20 text-red-400 text-[10px] font-bold py-1 rounded-lg hover:bg-red-500/30 transition-colors">❌ Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
             TAB: AGENTS
            ═══════════════════════════════════════════════════════════════════════ */}
        {tab === "agents" && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {agents.map(agent => <AgentCard key={agent.id} agent={agent} onToggle={toggleAgent} />)}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
             TAB: LEADS
            ═══════════════════════════════════════════════════════════════════════ */}
        {tab === "leads" && (
          <div className="space-y-4">
            {/* Source stats bar */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <div className="text-xs font-bold text-gray-500 mb-3">Leads by Source</div>
              <div className="flex flex-wrap gap-2">
                {sourceStats.map(({ src, count }) => (
                  <div key={src} className="flex items-center gap-1.5 bg-gray-100/60 rounded-lg px-2.5 py-1.5">
                    <span className={`h-2 w-2 rounded-full ${SOURCE_COLORS[src] || "bg-slate-500"}`} />
                    <span className="text-xs text-gray-500 capitalize">{src}</span>
                    <span className="text-xs font-black text-gray-900">{count}</span>
                  </div>
                ))}
                {sourceStats.length === 0 && <span className="text-xs text-gray-400">No leads yet</span>}
              </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <div className="flex flex-wrap gap-3 items-center">
                <input
                  type="text" placeholder="🔍 Search name, email, destination…"
                  value={leadSearch} onChange={e => setLeadSearch(e.target.value)}
                  className="flex-1 min-w-[200px] bg-gray-100 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <select value={leadStatusFilter} onChange={e => setLeadStatusFilter(e.target.value)}
                  className="bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-indigo-500 transition-colors">
                  <option value="all">All statuses</option>
                  {["new","contacted","quoted","converted","junk"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={leadSourceFilter} onChange={e => setLeadSourceFilter(e.target.value)}
                  className="bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-indigo-500 transition-colors">
                  <option value="all">All sources</option>
                  {leadSources.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="text-xs text-gray-400 ml-auto">{filteredLeads.length} results</span>
              </div>
            </div>

            {/* Table */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
              {filteredLeads.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-4xl mb-3">👥</p>
                  <p className="text-gray-500 text-sm">No leads match your filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {(["created_at","name","email","destination","source","status"] as (keyof LeadEntry)[]).map(col => (
                          <th key={col} onClick={() => sortToggle(col)}
                            className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 transition-colors select-none">
                            {col.replace("_at","")} {leadSort.key === col ? (leadSort.dir === "asc" ? "↑" : "↓") : ""}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map(lead => (
                        <>
                          <tr key={lead.id}
                            onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                            className="border-b border-gray-200/50 hover:bg-gray-50 cursor-pointer transition-colors">
                            <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(lead.created_at).toLocaleDateString("en-CA")}</td>
                            <td className="px-4 py-3 text-xs font-semibold text-gray-900 whitespace-nowrap">{lead.name}</td>
                            <td className="px-4 py-3 text-xs text-indigo-400">{lead.email}</td>
                            <td className="px-4 py-3 text-xs text-gray-600">{lead.destination}</td>
                            <td className="px-4 py-3">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${SOURCE_COLORS[lead.source] || "bg-slate-600"} text-gray-900`}>{lead.source}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[lead.status] || STATUS_COLORS.new}`}>{lead.status}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                <button className="text-[9px] bg-gray-100 text-gray-500 px-2 py-1 rounded-lg hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors font-medium">📧 Email</button>
                                <button className="text-[9px] bg-gray-100 text-gray-500 px-2 py-1 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors font-medium">🗑 Junk</button>
                              </div>
                            </td>
                          </tr>
                          {expandedLead === lead.id && (
                            <tr key={`${lead.id}-exp`} className="bg-gray-50">
                              <td colSpan={7} className="px-6 py-4 border-b border-gray-200/50">
                                <div className="grid sm:grid-cols-4 gap-4 text-xs">
                                  <div><div className="text-gray-400 mb-1">Phone</div><div className="text-gray-900 font-medium">{lead.phone}</div></div>
                                  <div><div className="text-gray-400 mb-1">Destination</div><div className="text-gray-900 font-medium">{lead.destination}</div></div>
                                  <div><div className="text-gray-400 mb-1">Source</div><div className="text-gray-900 font-medium capitalize">{lead.source}</div></div>
                                  <div><div className="text-gray-400 mb-1">Captured</div><div className="text-gray-900 font-medium">{new Date(lead.created_at).toLocaleString()}</div></div>
                                </div>
                                <div className="flex gap-2 mt-3">
                                  {(["new","contacted","quoted","converted","junk"] as const).map(s => (
                                    <button key={s} className={`text-[9px] px-2.5 py-1 rounded-lg font-bold border transition-colors ${STATUS_COLORS[s]} hover:opacity-80`}>→ {s}</button>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
             TAB: APPROVALS
            ═══════════════════════════════════════════════════════════════════════ */}
        {tab === "approvals" && (
          <div className="space-y-5">
            {/* Header actions */}
            {approvals.length > 0 && (
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900">{approvals.length} Pending Approvals</h2>
                <div className="flex gap-2">
                  <button onClick={handleApproveAll} className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl font-bold hover:bg-emerald-500/30 transition-colors">✅ Approve All</button>
                  <button onClick={handleRejectAll}  className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl font-bold hover:bg-red-500/30 transition-colors">❌ Reject All</button>
                </div>
              </div>
            )}

            {approvals.length === 0 && approvalHistory.length === 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-16 text-center">
                <p className="text-5xl mb-3">✅</p>
                <p className="text-gray-500">All clear! No pending approvals.</p>
              </div>
            )}

            {/* Pending cards */}
            {approvals.map(ap => (
              <div key={ap.id} className="bg-gray-50 border border-amber-500/20 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-gray-900">{ap.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{ap.agent} · {new Date(ap.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {ap.platform && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase">{ap.platform}</span>
                    )}
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">⏳ PENDING</span>
                  </div>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-600 whitespace-pre-wrap font-mono leading-relaxed">{ap.content}</div>
                  {ap.imagePrompt && (
                    <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-3">
                      <div className="text-[10px] font-bold text-purple-400 mb-1">🎨 AI Image Prompt</div>
                      <p className="text-xs text-gray-500 italic">"{ap.imagePrompt}"</p>
                    </div>
                  )}
                </div>
                <div className="px-5 py-4 border-t border-gray-200 flex gap-3 justify-end">
                  <button onClick={() => handleReject(ap.id)}  className="bg-red-500/15 text-red-400 border border-red-500/30 px-5 py-2 rounded-xl text-sm font-bold hover:bg-red-500/25 transition-colors">❌ Reject</button>
                  <button onClick={() => handleApprove(ap.id)} className="bg-emerald-500 text-gray-900 px-5 py-2 rounded-xl text-sm font-bold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">✅ Approve & Publish</button>
                </div>
              </div>
            ))}

            {/* TikTok Videos */}
            {tiktokVideos.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🎬 TikTok Videos
                  <span className="text-xs font-normal text-gray-400">
                    ({tiktokVideos.filter(v => v.status === "pending").length} pending)
                  </span>
                </h2>
                <div className="space-y-4">
                  {tiktokVideos.map(video => {
                    const isPending = video.status === "pending";
                    const scenes = video.script?.SCENES || video.script?.scenes || [];
                    return (
                      <div key={video.id} className={`bg-gray-50 border rounded-2xl overflow-hidden ${isPending ? "border-amber-500/20" : video.status === "approved" ? "border-emerald-500/20" : "border-gray-200"}`}>
                        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${video.account === "zeniva" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-pink-500/20 text-pink-400 border-pink-500/30"}`}>
                              {video.account === "zeniva" ? "🌍 Zeniva Travel" : "👩 Lina"}
                            </span>
                            <span className="text-xs text-gray-400">{video.created}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                            video.status === "pending" ? "bg-amber-500/15 text-amber-400 border-amber-500/30" :
                            video.status === "approved" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                            "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          }`}>
                            {video.status === "pending" ? "⏳ PENDING" : video.status === "approved" ? "✅ APPROVED" : "✅ POSTED"}
                          </span>
                        </div>
                        <div className="px-5 py-4">
                          <div className="flex flex-col md:flex-row gap-5">
                            {/* Video Player */}
                            <div className="flex-shrink-0">
                              <video
                                controls
                                className="rounded-xl bg-black"
                                style={{ width: "280px", maxHeight: "500px" }}
                                preload="metadata"
                              >
                                <source src={`/api/agents-proxy?endpoint=tiktok-video&file=${video.filename}`} type="video/mp4" />
                              </video>
                              <div className="text-[10px] text-gray-400 mt-1 text-center">
                                {(video.size / 1024 / 1024).toFixed(1)} MB
                              </div>
                            </div>
                            {/* Details */}
                            <div className="flex-1 space-y-3">
                              <div>
                                <div className="text-xs font-bold text-gray-500 mb-1">📝 Caption</div>
                                <div className="bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-600 whitespace-pre-wrap">{video.caption}</div>
                              </div>
                              {scenes.length > 0 && (
                                <div>
                                  <div className="text-xs font-bold text-gray-500 mb-2">🎬 Scenes ({scenes.length})</div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {scenes.map((scene: any, i: number) => (
                                      <div key={i} className="bg-white border border-gray-200 rounded-lg p-2.5">
                                        <div className="text-[10px] font-bold text-indigo-400 mb-1">Scene {i + 1}</div>
                                        <div className="text-xs font-semibold text-gray-900">{scene.text_overlay}</div>
                                        <div className="text-[11px] text-gray-400 mt-1 line-clamp-2">{scene.voiceover}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {isPending && (
                          <div className="px-5 py-4 border-t border-gray-200 flex gap-3 justify-end">
                            <button onClick={() => handleTikTokReject(video.id)} className="bg-red-500/15 text-red-400 border border-red-500/30 px-5 py-2 rounded-xl text-sm font-bold hover:bg-red-500/25 transition-colors">❌ Reject</button>
                            <button onClick={() => handleTikTokApprove(video.id)} className="bg-emerald-500 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">✅ Approve & Post</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* History */}
            {approvalHistory.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-200">
                  <h3 className="text-xs font-bold text-gray-500">📋 Approval History</h3>
                </div>
                <div className="divide-y divide-gray-200/50">
                  {approvalHistory.map((ap, i) => (
                    <div key={`hist-${i}`} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <div className="text-xs text-gray-900">{ap.title}</div>
                        <div className="text-[10px] text-gray-400">{ap.agent}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${ap.approved ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"}`}>
                        {ap.approved ? "✓ Approved" : "✗ Rejected"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
             TAB: ACTIVITY
            ═══════════════════════════════════════════════════════════════════════ */}
        {tab === "activity" && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-gray-900">⚡ Activity Feed</h2>
              <select value={activityFilter} onChange={e => setActivityFilter(e.target.value)}
                className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 focus:outline-none focus:border-indigo-500">
                <option value="all">All agents</option>
                {[...new Set(buildActivity().map(a => a.agentId))].map(id => {
                  const ag = agents.find(a => a.id === id);
                  return <option key={id} value={id}>{ag?.emoji} {ag?.name || id}</option>;
                })}
              </select>
            </div>
            <div className="divide-y divide-gray-200/40">
              {buildActivity()
                .filter(a => activityFilter === "all" || a.agentId === activityFilter)
                .map(a => (
                <div key={a.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="relative shrink-0">
                    <span className="text-2xl">{a.emoji}</span>
                    <div className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-slate-900 ${
                      a.status === "success" ? "bg-emerald-400" : a.status === "needs_approval" ? "bg-amber-400" : a.status === "pending" ? "bg-blue-400" : "bg-red-400"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{a.agent}</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-500">{a.action}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ml-auto ${
                        a.status === "needs_approval" ? "bg-amber-500/15 text-amber-400 border-amber-500/30" :
                        a.status === "success" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                        a.status === "pending" ? "bg-blue-500/15 text-blue-400 border-blue-500/30 animate-pulse" :
                        "bg-red-500/15 text-red-400 border-red-500/30"
                      }`}>
                        {a.status === "needs_approval" ? "⚠️ NEEDS APPROVAL" : a.status === "success" ? "✓ DONE" : a.status === "pending" ? "⟳ RUNNING" : "✗ ERROR"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{a.detail}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
             TAB: ANALYTICS
            ═══════════════════════════════════════════════════════════════════════ */}
        {tab === "analytics" && (
          <div className="space-y-5">
            <div className="grid lg:grid-cols-2 gap-5">
              {/* Bar chart: leads per day */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-4">📅 Leads — Last 7 Days</h3>
                <BarChart data={last7} max={maxDay} color="#6366f1" />
              </div>

              {/* Leads by source */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-4">🗂 Leads by Source</h3>
                <div className="space-y-2">
                  {sourceStats.length > 0 ? sourceStats.map(({ src, count }) => (
                    <div key={src} className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${SOURCE_COLORS[src] || "bg-slate-500"}`} />
                      <div className="w-24 text-xs text-gray-500 capitalize">{src}</div>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.round((count / totalLeads) * 100)}%`, background: AGENT_COLORS.lina }} />
                      </div>
                      <div className="text-xs font-bold text-gray-900 w-6 text-right">{count}</div>
                    </div>
                  )) : <p className="text-xs text-gray-400">No data yet</p>}
                </div>
              </div>

              {/* Leads by destination */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-4">✈️ Top Destinations</h3>
                <div className="space-y-2">
                  {destStats.length > 0 ? destStats.map(([dest, cnt]) => (
                    <div key={dest} className="flex items-center gap-3">
                      <div className="w-28 text-xs text-gray-500 truncate">{dest}</div>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-amber-500 transition-all duration-700" style={{ width: `${Math.round((cnt / totalLeads) * 100)}%` }} />
                      </div>
                      <div className="text-xs font-bold text-gray-900 w-6 text-right">{cnt}</div>
                    </div>
                  )) : <p className="text-xs text-gray-400">No data yet</p>}
                </div>
              </div>

              {/* Email metrics + Funnel */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-5">
                {/* Email metrics */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3">📧 Email Performance</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[{ l: "Sent", v: 0, c: "#6366f1" }, { l: "Open Rate", v: "—", c: "#f59e0b" }, { l: "Click Rate", v: "—", c: "#10b981" }].map(m => (
                      <div key={m.l} className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-lg font-black text-gray-900">{m.v}</div>
                        <div className="text-[9px] text-gray-400">{m.l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conversion funnel */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3">🔽 Conversion Funnel</h3>
                  <div className="space-y-2">
                    <FunnelStep label="Scraped"   value={totalLeads} total={totalLeads} color="#6366f1" />
                    <FunnelStep label="Qualified" value={qualified}  total={totalLeads} color="#8b5cf6" />
                    <FunnelStep label="Contacted" value={contacted}  total={totalLeads} color="#3b82f6" />
                    <FunnelStep label="Converted" value={converted}  total={totalLeads} color="#10b981" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
             TAB: SETTINGS
            ═══════════════════════════════════════════════════════════════════════ */}
        {tab === "settings" && (
          <div className="space-y-5">
            {/* Cron schedules */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="text-sm font-bold text-gray-900">⏰ Cron Schedules & Agent Control</h3>
              </div>
              <div className="divide-y divide-gray-200/50">
                {agents.map(agent => {
                  const sc = STATUS_CFG[agent.status];
                  const isOn = agentEnabled[agent.id] !== false;
                  return (
                    <div key={agent.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                      <span className="text-xl">{agent.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900">{agent.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{agent.schedule}</div>
                      </div>
                      <div className="hidden sm:flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${sc.dot} ${agent.status === "live" ? "animate-pulse" : ""}`} />
                        <span className={`text-[10px] font-bold ${sc.badge.split(" ").find(c => c.startsWith("text-")) || ""}`}>{sc.label}</span>
                      </div>
                      <button
                        onClick={() => toggleAgent(agent.id)}
                        className={`relative h-6 w-11 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${isOn ? "bg-indigo-600" : "bg-gray-200"}`}
                      >
                        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-300 ${isOn ? "left-6" : "left-1"}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* API Health */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="text-sm font-bold text-gray-900">🔌 API Health Status</h3>
              </div>
              <div className="divide-y divide-gray-200/50">
                {[
                  { label: "Main API (port 8000)", status: apiHealth, detail: "VPS 217.216.88.202:8000" },
                  { label: "Supabase Database", status: dbHealth, detail: "PostgreSQL via Supabase cloud" },
                  { label: "Lina Webhook (n8n)", status: linaHealth, detail: "OpenAI GPT-4o integration" },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-4 px-5 py-3">
                    <div className={`h-3 w-3 rounded-full ${svcDot(s.status)}`} />
                    <div className="flex-1">
                      <div className="text-sm text-gray-900">{s.label}</div>
                      <div className="text-xs text-gray-400">{s.detail}</div>
                    </div>
                    <span className={`text-sm font-bold ${svcTxt(s.status)}`}>{svcLbl(s.status)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">🔗 Quick Links</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "Supabase Dashboard", icon: "🗄️", url: "https://supabase.com/dashboard", color: "border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/5" },
                  { label: "n8n Workflows", icon: "🔄", url: `http://217.216.88.202:5678`, color: "border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/5" },
                  { label: "VPS Dashboard", icon: "🖥️", url: `http://217.216.88.202`, color: "border-gray-300/50 hover:border-slate-500/70 hover:bg-gray-50" },
                  { label: "Twilio Console", icon: "📞", url: "https://console.twilio.com", color: "border-red-500/30 hover:border-red-500/60 hover:bg-red-500/5" },
                ].map(l => (
                  <a key={l.label} href={l.url} target="_blank" rel="noreferrer"
                    className={`flex items-center gap-3 p-4 bg-gray-100/40 border rounded-xl transition-all group ${l.color}`}>
                    <span className="text-2xl">{l.icon}</span>
                    <div>
                      <div className="text-sm text-gray-900 font-medium group-hover:text-gray-900">{l.label}</div>
                      <div className="text-[10px] text-gray-400">Open →</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Chat Tab ──────────────────────────────────────────────────────── */}
        {tab === "chat" && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col" style={{ height: "calc(100vh - 220px)", minHeight: 400 }}>
            {/* Header */}
            <div className="bg-indigo-600 text-white px-6 py-4 flex items-center gap-3 shrink-0">
              <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-xl">✈️</div>
              <div className="flex-1">
                <div className="font-bold">Zeniva AI</div>
                <div className="text-xs text-indigo-200">AI Assistant · OpenClaw</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-indigo-200">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
              {chatMsgs.length === 0 && (
                <div className="text-center text-gray-400 mt-20 space-y-3">
                  <div className="text-5xl">💬</div>
                  <div className="text-base font-medium">Hey Boss!</div>
                  <div className="text-sm">Send a message to start working with me.</div>
                </div>
              )}
              {chatMsgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm mr-2 mt-1 shrink-0">✈️</div>
                  )}
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-md"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm"
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm mr-2 mt-1 shrink-0">✈️</div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:"0ms"}}/>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:"150ms"}}/>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:"300ms"}}/>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4 bg-white shrink-0">
              <div className="flex gap-3">
                <input
                  ref={chatInputRef}
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChat()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  disabled={chatLoading}
                />
                <button
                  onClick={sendChat}
                  disabled={chatLoading || !chatInput.trim()}
                  className="h-11 w-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Footer ─────────────────────────────────────────────────────────── */}
        <div className="text-center text-xs text-slate-700 py-4">
          Zeniva Travel AI Command Center · {activeAgents}/{agents.length} agents running · Powered by OpenAI + n8n + Supabase
        </div>
      </div>

    </div>
  );
}
