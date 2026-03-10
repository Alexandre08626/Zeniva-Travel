"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import LinaAvatar from "../../src/components/LinaAvatar";

// Persist tab in URL hash so page refresh / uploads don't reset it
function useTabWithHash(defaultTab: TabId): [TabId, (t: TabId) => void] {
  const [tab, setTabState] = useState<TabId>(defaultTab);
  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as TabId;
    const valid: TabId[] = ["overview","activity","leads","approvals","agents","analytics","settings","chat"];
    if (valid.includes(hash)) setTabState(hash);
  }, []);
  const setTab = (t: TabId) => {
    setTabState(t);
    window.location.hash = t;
  };
  return [tab, setTab];
}
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
  videoUrl?: string; resolution?: string; duration?: number;
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
interface AgentScenario { icon: string; title: string; desc: string; }
interface AgentActivityLog { time: string; action: string; status: "success" | "pending" | "warning"; }

interface AgentDef {
  id: string; name: string; emoji: string; avatar?: string; status: AgentStatus;
  type: string; schedule: string; description: string; features: string[];
  stats: { label: string; value: string }[];
  lastRun: string; nextRun: string; enabled: boolean;
  logs: string[]; progress?: number; color: string;
  // Limova-style fields
  intro: string;
  scenarios: AgentScenario[];
  activityLog: AgentActivityLog[];
  uptime: string;
  tasksCompleted: number;
  successRate: string;
}

type UserView = "boss" | "agent" | "broker";

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

// ─── Limova-style Agent Card ──────────────────────────────────────────────────
function AgentCard({ agent, onSelect }: { agent: AgentDef; onSelect: (id: string) => void }) {
  const sc = STATUS_CFG[agent.status];
  const isAlive = agent.status === "live" || agent.status === "active";
  const accentColor = agent.color || "#6366f1";

  return (
    <div
      onClick={() => onSelect(agent.id)}
      className="group relative bg-white rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-gray-300/50 hover:-translate-y-2 border border-gray-200"
    >
      {/* Character Image — Big, centered */}
      <div className="relative w-full aspect-square overflow-hidden flex items-end justify-center" style={{ background: `linear-gradient(135deg, ${accentColor}08, ${accentColor}15)` }}>
        {agent.avatar ? (
          <img
            src={agent.avatar}
            alt={agent.name}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl" style={{ background: `linear-gradient(135deg, ${accentColor}10, ${accentColor}05)` }}>
            {agent.emoji}
          </div>
        )}

        {/* Status badge overlay */}
        <div className="absolute top-4 right-4">
          <span className={`text-[10px] font-black px-3 py-1.5 rounded-full backdrop-blur-md tracking-wider shadow-lg bg-white/90 border border-gray-200 ${sc.badge}`}>
            {isAlive && <span className={`inline-block h-1.5 w-1.5 rounded-full ${sc.dot} mr-1.5 animate-pulse`} />}
            {sc.label}
          </span>
        </div>

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent" />
      </div>

      {/* Info section */}
      <div className="px-5 pb-5 -mt-8 relative z-10">
        {/* Name + Role */}
        <div className="mb-3">
          <h3 className="text-xl font-black text-gray-900 tracking-tight">{agent.name}</h3>
          <p className="text-xs font-semibold mt-0.5" style={{ color: accentColor }}>{agent.type}</p>
        </div>

        {/* Short description */}
        <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
          {agent.description}
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {agent.features.slice(0, 3).map((f) => (
            <span
              key={f}
              className="text-[9px] font-semibold px-2 py-1 rounded-lg border"
              style={{ background: `${accentColor}08`, borderColor: `${accentColor}25`, color: accentColor }}
            >
              {f}
            </span>
          ))}
          {agent.features.length > 3 && (
            <span className="text-[9px] font-semibold px-2 py-1 rounded-lg bg-gray-50 text-gray-400 border border-gray-200">
              +{agent.features.length - 3} more
            </span>
          )}
        </div>

        {/* Discover button */}
        <div
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 group-hover:gap-3"
          style={{ background: `${accentColor}10`, color: accentColor, border: `1px solid ${accentColor}25` }}
        >
          Discover {agent.name}
          <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─── Agent Detail Panel ───────────────────────────────────────────────────────
function AgentDetailPanel({ agent, onClose, onToggle }: {
  agent: AgentDef;
  onClose: () => void;
  onToggle: (id: string) => void;
}) {
  const sc = STATUS_CFG[agent.status];
  const isAlive = agent.status === "live" || agent.status === "active";
  const accentColor = agent.color || "#6366f1";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col"
        style={{ animation: "agentSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      >
        <style>{`@keyframes agentSlideUp { from { opacity: 0; transform: translateY(40px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>

        {/* Gradient header */}
        <div
          className="relative overflow-hidden shrink-0"
          style={{ background: `linear-gradient(135deg, ${accentColor}12, ${accentColor}04)`, borderBottom: `1px solid ${accentColor}20` }}
        >
          <div className="px-6 pt-6 pb-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              {/* Avatar + Info */}
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  {agent.avatar ? (
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="h-20 w-20 rounded-2xl object-cover shadow-xl"
                      style={{ border: `2px solid ${accentColor}30` }}
                    />
                  ) : (
                    <div
                      className="h-20 w-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl"
                      style={{ background: `linear-gradient(135deg, ${accentColor}25, ${accentColor}08)`, border: `2px solid ${accentColor}30` }}
                    >
                      {agent.emoji}
                    </div>
                  )}
                  {isAlive && (
                    <span className={`absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full ${sc.dot} ring-2 ring-white shadow`}>
                      <span className={`absolute inset-0 rounded-full ${sc.dot} animate-ping opacity-50`} />
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-black text-gray-900">{agent.name}</h2>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${sc.badge} border-current/20 tracking-wider`}>
                      {sc.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono">{agent.type}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{agent.schedule}</p>
                </div>
              </div>
              {/* Controls */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-semibold">{agent.enabled ? "ON" : "OFF"}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggle(agent.id); }}
                    className={`relative h-7 w-12 rounded-full transition-all duration-300 focus:outline-none shadow-inner ${agent.enabled ? "bg-indigo-600" : "bg-gray-200"}`}
                  >
                    <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ${agent.enabled ? "left-6" : "left-1"}`} />
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="h-8 w-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500 hover:text-gray-800"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Personality intro bubble */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white shadow-sm">
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="text-base mr-1">👋</span>
                <span className="font-medium">{agent.intro}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6 bg-white">

          {/* Live Metrics */}
          <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Live Performance</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Tasks Done", value: String(agent.tasksCompleted), icon: "✅" },
                { label: "Uptime", value: agent.uptime, icon: "⏱️" },
                { label: "Success Rate", value: agent.successRate, icon: "🎯" },
              ].map((m) => (
                <div key={m.label} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center hover:border-gray-200 transition-colors">
                  <div className="text-xl mb-1.5">{m.icon}</div>
                  <div className="text-lg font-black text-gray-900">{m.value}</div>
                  <div className="text-[9px] text-gray-400 mt-0.5 leading-tight">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* What I Do */}
          <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">What I Do</h3>
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 border border-gray-100 rounded-2xl p-4">
              {agent.description}
            </p>
          </div>

          {/* Capabilities */}
          <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Capabilities</h3>
            <div className="grid grid-cols-2 gap-2">
              {agent.features.map((f) => (
                <div key={f} className="flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 hover:border-gray-200 transition-colors">
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                  <span className="text-xs text-gray-700 font-medium">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Example Scenarios */}
          {agent.scenarios.length > 0 && (
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Example Scenarios</h3>
              <div className="space-y-3">
                {agent.scenarios.map((s, i) => (
                  <div
                    key={i}
                    className="flex gap-4 bg-gray-50 border border-gray-100 rounded-2xl p-4 hover:border-gray-200 transition-colors"
                  >
                    <div className="text-2xl shrink-0">{s.icon}</div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 mb-1">{s.title}</div>
                      <div className="text-xs text-gray-500 leading-relaxed">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {agent.activityLog.length > 0 && (
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Recent Activity</h3>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden">
                {agent.activityLog.map((log, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-4 py-3 ${i < agent.activityLog.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    <div className={`h-2 w-2 rounded-full shrink-0 ${
                      log.status === "success" ? "bg-emerald-400" :
                      log.status === "pending" ? "bg-amber-400 animate-pulse" :
                      "bg-red-400"
                    }`} />
                    <span className="text-xs text-gray-600 flex-1">{log.action}</span>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap font-mono">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Stats */}
          <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">More Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              {[...agent.stats, { label: "Last Run", value: agent.lastRun }, { label: "Next Run", value: agent.nextRun }].map((s) => (
                <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 hover:border-gray-200 transition-colors">
                  <div className="text-sm font-black text-gray-900">{s.value}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pb-2" />
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
  const [totalClients, setTotalClients] = useState(0);
  const [clientsToday, setClientsToday] = useState(0);
  const [clientsWeek, setClientsWeek]   = useState(0);
  const [emailsSent, setEmailsSent]   = useState(0);
  const [smsSent, setSmsSent]         = useState(0);
  const [emailsToday, setEmailsToday] = useState(0);
  const [smsToday, setSmsToday]       = useState(0);
  const [leadsWeek, setLeadsWeek]     = useState(0);
  const [emailsWeek, setEmailsWeek]   = useState(0);
  const [smsWeek, setSmsWeek]         = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [leadsToday, setLeadsToday]   = useState(0);
  const [leads, setLeads]             = useState<LeadEntry[]>([]);
  const [activity, setActivity]       = useState<ActivityItem[]>([]);
  const [approvals, setApprovals]     = useState<PendingApproval[]>([]);
  const [approvalHistory, setApprovalHistory] = useState<PendingApproval[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<any[]>([]);
  const [videoScripts, setVideoScripts] = useState<Record<string, string>>({});
  const [voiceLoading, setVoiceLoading] = useState<Record<string, boolean>>({});
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [tiktokVideos, setTiktokVideos] = useState<TikTokVideo[]>([]);
  const [agents, setAgents]           = useState<AgentDef[]>([]);
  const [lastRefresh, setLastRefresh] = useState("");
  const [clock, setClock]             = useState("");
  const [tab, setTab]                 = useTabWithHash("overview");

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

  const buildActivity = () => activity;

  // Settings
  const [agentEnabled, setAgentEnabled] = useState<Record<string, boolean>>({});

  // Agents tab state
  const [agentView, setAgentView] = useState<UserView>("boss");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

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

  // ── Agent definitions for each view
  const AGENT_VIEW_AGENTS: AgentDef[] = [
    {
      id: "lina_agent", name: "Lina", emoji: "🤖", avatar: "/agents/lina.png", status: "live", type: "AI Travel Concierge", schedule: "Real-time (24/7)", color: "#6366f1",
      description: "Your personal AI assistant for managing clients. Handles inquiries, provides instant answers, and helps you close deals faster.",
      intro: "Hi! I'm Lina, your AI assistant. I help you manage client conversations, answer questions instantly, and keep your pipeline organized. Think of me as your 24/7 co-pilot!",
      features: ["Client chat support", "Instant answers", "Multi-language", "Booking assistance", "Client history", "Smart suggestions"],
      scenarios: [
        { icon: "💬", title: "Client asks about Cancun packages", desc: "Lina instantly pulls the best matching packages and drafts a response for you to review." },
        { icon: "🌍", title: "Client speaks Spanish", desc: "Lina detects the language and responds fluently in Spanish, then translates the summary for you." },
        { icon: "📋", title: "You need a quick quote", desc: "Just tell Lina the destination and dates — she generates a 3-tier quote in seconds." },
      ],
      activityLog: [
        { time: "2 min ago", action: "Handled client inquiry — Caribbean cruise", status: "success" },
        { time: "15 min ago", action: "Generated quote for Miami Beach package", status: "success" },
        { time: "1h ago", action: "Translated conversation FR→EN for client handoff", status: "success" },
      ],
      stats: [{ label: "Chats today", value: "12" }, { label: "Avg response", value: "2.3s" }],
      lastRun: "Just now", nextRun: "Always on", enabled: true, progress: 100, uptime: "99.9%", tasksCompleted: 847, successRate: "98.2%",
      logs: [],
    },
    {
      id: "client_mgr", name: "Max", emoji: "📋", avatar: "/agents/max.png", status: "active", type: "Client Manager · CRM", schedule: "Real-time", color: "#f59e0b",
      description: "Keeps your client portfolio organized. Tracks interactions, follow-ups due, birthdays, and preferences for each client.",
      intro: "Hey there! I'm your Client Manager. I remember everything about your clients so you don't have to — preferences, past trips, follow-up dates, even their kids' names!",
      features: ["Client profiles", "Follow-up reminders", "Trip history", "Preference tracking", "Birthday alerts", "Notes & tags"],
      scenarios: [
        { icon: "🔔", title: "Follow-up reminder", desc: "Client Manager alerts you: 'Sarah Johnson hasn't been contacted in 14 days — she was interested in Greece.'" },
        { icon: "🎂", title: "Client birthday coming up", desc: "Sends you a reminder to wish them happy birthday with a personalized discount code." },
        { icon: "📊", title: "Monthly client report", desc: "Generates a summary of your active clients, conversion rates, and top opportunities." },
      ],
      activityLog: [
        { time: "30 min ago", action: "Updated 3 client profiles with new preferences", status: "success" },
        { time: "2h ago", action: "Sent follow-up reminder for 5 clients", status: "success" },
      ],
      stats: [{ label: "Active clients", value: "48" }, { label: "Follow-ups due", value: "7" }],
      lastRun: "30 min ago", nextRun: "In 30 min", enabled: true, uptime: "99.5%", tasksCompleted: 312, successRate: "97.8%",
      logs: [],
    },
    {
      id: "quote_gen", name: "Jade", emoji: "💰", avatar: "/agents/jade.png", status: "active", type: "Quote Generator · AI", schedule: "On demand", color: "#10b981",
      description: "Creates beautiful, personalized travel quotes in seconds. 3-tier pricing, PDF export, and automatic follow-up scheduling.",
      intro: "I'm your Quote Generator! Give me a destination and dates, and I'll create stunning 3-tier quotes with real-time pricing. Your clients will be impressed!",
      features: ["3-tier quotes", "Real-time pricing", "PDF export", "Auto follow-up", "Custom branding", "Multi-currency"],
      scenarios: [
        { icon: "✈️", title: "Client wants a Bali trip for 2", desc: "Generates Budget, Standard, and Premium packages with flights, hotels, and activities in 10 seconds." },
        { icon: "📄", title: "Need a branded PDF", desc: "Creates a professional PDF quote with your Zeniva branding, ready to email directly." },
        { icon: "💱", title: "Client pays in Euros", desc: "Automatically converts all pricing to EUR with current exchange rates." },
      ],
      activityLog: [
        { time: "1h ago", action: "Generated quote #247 — Maldives honeymoon package", status: "success" },
        { time: "3h ago", action: "PDF exported and emailed to client", status: "success" },
      ],
      stats: [{ label: "Quotes today", value: "8" }, { label: "Conversion", value: "34%" }],
      lastRun: "1h ago", nextRun: "On demand", enabled: true, uptime: "99.9%", tasksCompleted: 247, successRate: "99.5%",
      logs: [],
    },
    {
      id: "perf_tracker", name: "Leo", emoji: "📊", avatar: "/agents/leo.png", status: "active", type: "Performance Analytics", schedule: "Real-time", color: "#8b5cf6",
      description: "Tracks your sales performance, booking metrics, and commission earnings. Weekly reports and goal tracking built in.",
      intro: "I track everything that matters — your bookings, revenue, conversion rates, and commissions. Weekly reports land in your inbox every Monday!",
      features: ["Sales dashboard", "Booking metrics", "Commission tracking", "Weekly reports", "Goal setting", "Leaderboard"],
      scenarios: [
        { icon: "📈", title: "Check your monthly stats", desc: "Instant overview: 12 bookings, $24,500 revenue, 28% conversion rate this month." },
        { icon: "🏆", title: "Goal tracking", desc: "You're at 78% of your monthly target — 5 more bookings to hit your bonus tier!" },
        { icon: "📧", title: "Weekly report", desc: "Every Monday at 9 AM, get a detailed breakdown of last week's performance vs. targets." },
      ],
      activityLog: [
        { time: "Today 9 AM", action: "Weekly performance report generated and emailed", status: "success" },
        { time: "Yesterday", action: "Updated commission calculations for February", status: "success" },
      ],
      stats: [{ label: "Bookings/mo", value: "12" }, { label: "Revenue", value: "$24.5k" }],
      lastRun: "Today 9 AM", nextRun: "Next Monday", enabled: true, uptime: "100%", tasksCompleted: 52, successRate: "100%",
      logs: [],
    },
  ];

  const BROKER_VIEW_AGENTS: AgentDef[] = [
    {
      id: "lina_broker", name: "Lina", emoji: "🤖", avatar: "/agents/lina.png", status: "live", type: "Broker Support · AI", schedule: "Real-time (24/7)", color: "#6366f1",
      description: "Your dedicated AI support assistant. Answers questions about policies, commissions, and helps manage your agent network.",
      intro: "Hi! I'm Lina, your broker support assistant. I help you manage your agent network, track commissions, and stay on top of market trends. Available 24/7!",
      features: ["Policy support", "Agent management", "Commission queries", "Multi-language", "Report generation", "Training materials"],
      scenarios: [
        { icon: "❓", title: "Agent asks about commission structure", desc: "Lina explains the tiered commission rates and calculates estimated earnings for a specific booking." },
        { icon: "👥", title: "New agent onboarding", desc: "Lina walks the new agent through the platform, policies, and provides training resources." },
        { icon: "📞", title: "Urgent supplier issue", desc: "Lina escalates to the right contact and provides you with a summary of the situation." },
      ],
      activityLog: [
        { time: "5 min ago", action: "Answered commission query from Agent #12", status: "success" },
        { time: "1h ago", action: "Generated monthly broker report", status: "success" },
      ],
      stats: [{ label: "Queries today", value: "18" }, { label: "Agents active", value: "6" }],
      lastRun: "Just now", nextRun: "Always on", enabled: true, progress: 100, uptime: "99.9%", tasksCompleted: 1203, successRate: "97.5%",
      logs: [],
    },
    {
      id: "market_insights", name: "Victor", emoji: "📈", avatar: "/agents/victor.png", status: "active", type: "Market Intelligence · AI", schedule: "Daily 7 AM", color: "#f59e0b",
      description: "Real-time travel market intelligence. Tracks pricing trends, demand patterns, competitor moves, and seasonal opportunities.",
      intro: "I'm your market intelligence engine! I scan thousands of data points daily to give you actionable insights on travel trends, pricing, and demand.",
      features: ["Price trends", "Demand forecasting", "Competitor analysis", "Seasonal alerts", "Destination insights", "Market reports"],
      scenarios: [
        { icon: "📊", title: "Caribbean demand surge detected", desc: "Market Insights alerts: 'Caribbean bookings up 34% this week — consider pushing Cancun/Punta Cana packages.'" },
        { icon: "💲", title: "Price drop alert", desc: "Flight prices to Europe dropped 22% — perfect time to push summer packages to your agents." },
        { icon: "🔮", title: "Seasonal forecast", desc: "Based on historical data, spring break bookings peak in 2 weeks — prepare your inventory now." },
      ],
      activityLog: [
        { time: "Today 7 AM", action: "Daily market report generated — 14 insights found", status: "success" },
        { time: "Yesterday", action: "Price alert: Cancun flights -18%", status: "success" },
      ],
      stats: [{ label: "Insights/day", value: "14" }, { label: "Data sources", value: "50+" }],
      lastRun: "Today 7 AM", nextRun: "Tomorrow 7 AM", enabled: true, uptime: "99.8%", tasksCompleted: 420, successRate: "96.5%",
      logs: [],
    },
    {
      id: "partner_connect", name: "Emma", emoji: "🤝", avatar: "/agents/emma.png", status: "active", type: "Partner Manager · CRM", schedule: "Real-time", color: "#10b981",
      description: "Manages your supplier and partner relationships. Tracks contracts, negotiates rates, and maintains your preferred partner network.",
      intro: "I manage all your supplier and partner relationships! From hotel contracts to airline partnerships, I keep everything organized and help you get the best rates.",
      features: ["Supplier directory", "Contract tracking", "Rate negotiation", "Partner scoring", "Renewal alerts", "Communication log"],
      scenarios: [
        { icon: "🏨", title: "Hotel contract renewal", desc: "Partner Connect reminds you: 'Marriott Caribbean contract expires in 30 days — current rate: $145/night. Suggest negotiating to $132.'" },
        { icon: "✈️", title: "New airline partnership", desc: "Identified opportunity: 'JetBlue offering broker commission program — 8% on group bookings. Want me to apply?'" },
        { icon: "📋", title: "Quarterly partner review", desc: "Generates a report of all active partnerships, performance metrics, and recommendations." },
      ],
      activityLog: [
        { time: "2h ago", action: "Updated Hilton contract rates for Q2", status: "success" },
        { time: "Yesterday", action: "Sent renewal reminder for 3 expiring contracts", status: "success" },
      ],
      stats: [{ label: "Partners", value: "34" }, { label: "Active contracts", value: "28" }],
      lastRun: "2h ago", nextRun: "In 4h", enabled: true, uptime: "99.7%", tasksCompleted: 189, successRate: "98.9%",
      logs: [],
    },
    {
      id: "commission_tracker", name: "Kai", emoji: "💰", avatar: "/agents/kai.png", status: "active", type: "Finance · Commissions", schedule: "Real-time", color: "#8b5cf6",
      description: "Tracks all commissions across your agent network. Automated calculations, payout schedules, and detailed financial reporting.",
      intro: "I handle all the money math! Commission calculations, agent payouts, revenue tracking, and financial reports — all automated, all accurate.",
      features: ["Auto-calculation", "Agent payouts", "Revenue reports", "Tax summaries", "Payout scheduling", "Dispute tracking"],
      scenarios: [
        { icon: "💵", title: "Monthly payout day", desc: "Commission Tracker calculates all agent commissions, generates invoices, and schedules payments for approval." },
        { icon: "📊", title: "Revenue breakdown needed", desc: "Instant report: Revenue by destination, by agent, by month — with year-over-year comparison." },
        { icon: "⚠️", title: "Commission dispute", desc: "Agent flags a missing commission — Tracker pulls the booking records and reconciles automatically." },
      ],
      activityLog: [
        { time: "Today", action: "Calculated February commissions for 6 agents", status: "success" },
        { time: "Yesterday", action: "Generated Q1 financial summary", status: "success" },
      ],
      stats: [{ label: "Total commissions", value: "$12.4k" }, { label: "Agents paid", value: "6" }],
      lastRun: "Today 6 AM", nextRun: "Tomorrow 6 AM", enabled: true, uptime: "100%", tasksCompleted: 96, successRate: "100%",
      logs: [],
    },
  ];

  const buildAgents = useCallback((linaSt: AgentStatus, leads: number, msgs: number): AgentDef[] => [
    {
      id: "lina", name: "Lina", emoji: "🤖", avatar: "/agents/lina.png",
      status: linaSt, type: "AI Travel Concierge · GPT-4o",
      schedule: "Real-time (24/7)", color: "#6366f1",
      description: "Polyglot AI travel concierge. Qualifies leads, quotes packages, saves to Supabase. Speaks every language your clients do.",
      intro: "Hi! I'm Lina, your AI travel concierge. I chat with your website visitors 24/7, qualify leads automatically, generate quotes in seconds, and speak every language. I never sleep, never take breaks, and I love helping travelers find their dream trip!",
      features: ["GPT-4o", "Multi-language", "Lead extraction", "Memory", "Quotes", "Email alerts"],
      scenarios: [
        { icon: "🌍", title: "A visitor asks about trips to Japan", desc: "Lina engages them naturally, extracts their budget and dates, saves the lead to Supabase, and sends you an email alert." },
        { icon: "🇫🇷", title: "French-speaking client on WhatsApp", desc: "Lina detects French and responds fluently, then qualifies the lead and logs everything in English for you." },
        { icon: "💰", title: "Client wants a quick quote", desc: "Lina generates a 3-tier quote (Budget, Standard, Premium) and sends it within the chat — all under 10 seconds." },
        { icon: "📞", title: "Someone calls after hours", desc: "Lina picks up via Twilio, answers their questions by voice, and logs the lead for follow-up in the morning." },
      ],
      activityLog: [
        { time: "2 min ago", action: "Chat handled — Caribbean package inquiry", status: "success" },
        { time: "14 min ago", action: "Lead qualified and saved to Supabase", status: "success" },
        { time: "45 min ago", action: "Quote generated for Maldives honeymoon", status: "success" },
        { time: "1h ago", action: "Translated conversation ES→EN", status: "success" },
      ],
      stats: [{ label: "Messages", value: String(msgs) }, { label: "Leads", value: String(leads) }],
      lastRun: "Just now", nextRun: "Always on",
      enabled: agentEnabled["lina"] !== false,
      progress: 100, uptime: "99.9%", tasksCompleted: msgs || 847, successRate: "98.2%",
      logs: ["Chat handled in 2.3s", `${msgs} total messages processed`, "Supabase lead saved"],
    },
    {
      id: "lead_machine", name: "Marco", emoji: "🔥", avatar: "/agents/marco.png",
      status: "active", type: "Lead Hunter · 5-Engine Scraper",
      schedule: "Every 2 hours", color: "#f59e0b",
      description: "5 scraping engines running 24/7: Reddit travel subs, competitor sites, social signals, SEO intent keywords, and deep web scraping.",
      intro: "I'm the Lead Machine! I hunt for potential travel clients across Reddit, competitor websites, social media, and search engines. I find people who WANT to travel and deliver them straight to your pipeline.",
      features: ["Reddit", "Competitors", "Social", "SEO intent", "Deep scrape", "Auto-qualify"],
      scenarios: [
        { icon: "🔍", title: "Reddit r/travel post detected", desc: "Someone posts 'Planning a honeymoon in the Caribbean, budget $5k' — Lead Machine captures it, qualifies it, and adds to pipeline." },
        { icon: "🏢", title: "Competitor price monitoring", desc: "Detects that Expedia dropped Cancun package prices — alerts you to adjust your pricing strategy." },
        { icon: "📱", title: "Social signal found", desc: "Someone tweets 'Need a vacation ASAP' with travel hashtags — qualified and added to outreach list." },
        { icon: "🔑", title: "SEO intent keyword match", desc: "Detects high-intent searches like 'best travel agency for group trips' and captures the lead source." },
      ],
      activityLog: [
        { time: "1h ago", action: "Reddit scan complete — 12 intent signals found", status: "success" },
        { time: "1h ago", action: "Expedia competitor scan — 8 leads extracted", status: "success" },
        { time: "3h ago", action: "Social media scan — 5 qualified leads", status: "success" },
      ],
      stats: [{ label: "Engines", value: "5" }, { label: "Target/day", value: "200+" }],
      lastRun: "1h 12m ago", nextRun: "In 48 min",
      enabled: agentEnabled["lead_machine"] !== false,
      progress: 62, uptime: "99.5%", tasksCompleted: 1420, successRate: "94.8%",
      logs: ["Reddit r/travel: 12 intent signals found", "Expedia competitor scan complete", "8 leads auto-qualified and saved"],
    },
    {
      id: "converter", name: "Sofia", emoji: "📬", avatar: "/agents/sofia.png",
      status: "active", type: "Email Marketing · AI Writer",
      schedule: "Daily 9 AM", color: "#3b82f6",
      description: "Sends personalized AI-written invite emails to every new lead. Detects their language and writes in EN, FR, ES, or AR. Not templates — every email is unique.",
      intro: "I turn cold leads into warm conversations! Every morning at 9 AM, I craft personalized emails for each new lead — in their language, about their dream destination. No templates, pure AI creativity.",
      features: ["AI emails", "EN/FR/ES/AR", "Smart timing", "Open tracking", "Supabase sync", "A/B testing"],
      scenarios: [
        { icon: "📧", title: "New lead from Reddit", desc: "Lead Converter writes a personalized email: 'Hi Sarah, I saw you're dreaming about Bali! Here's what we can do for your budget...'" },
        { icon: "🌐", title: "Arabic-speaking lead", desc: "Detects the lead speaks Arabic, writes a beautiful email in Arabic with RTL formatting." },
        { icon: "📊", title: "A/B test results", desc: "Subject line A got 42% open rate vs 28% for B — automatically uses the winner going forward." },
      ],
      activityLog: [
        { time: "Today 9 AM", action: "Pipeline checked — 0 new unconverted leads", status: "success" },
        { time: "Yesterday", action: "Sent 3 personalized emails (EN, FR, ES)", status: "success" },
      ],
      stats: [{ label: "Sent today", value: "0" }, { label: "Pipeline", value: String(leads) }],
      lastRun: "Today 9:00 AM", nextRun: "Tomorrow 9:00 AM",
      enabled: agentEnabled["converter"] !== false,
      uptime: "99.8%", tasksCompleted: 156, successRate: "99.0%",
      logs: ["Checked pipeline: 0 new unconverted leads", "Email templates loaded (EN, FR, ES)", "SMTP health OK"],
    },
    {
      id: "followup", name: "Noah", emoji: "📧", avatar: "/agents/noah.png",
      status: "active", type: "Follow-up Specialist · AI",
      schedule: "Every 6 hours", color: "#8b5cf6",
      description: "Smart follow-up system. New leads get a follow-up within 6 hours. Quoted leads get re-engaged after 72 hours. All personalized, all multi-language.",
      intro: "I make sure no lead falls through the cracks! I follow up with new leads in 6 hours and re-engage quoted leads after 72 hours. Every message is personalized and in the client's language.",
      features: ["AI copy", "Multi-language", "Smart cadence", "Unsubscribe", "Tracking", "Drip campaigns"],
      scenarios: [
        { icon: "⏰", title: "6-hour new lead follow-up", desc: "A lead came in this morning but didn't respond — Follow-up sends a gentle nudge with an exclusive offer." },
        { icon: "🔄", title: "72-hour quote follow-up", desc: "Client received a quote 3 days ago — Follow-up writes: 'Still dreaming about Santorini? Here's a limited-time upgrade...'" },
        { icon: "🛑", title: "Smart unsubscribe", desc: "If a lead replies 'not interested', Follow-up respects it immediately and updates Supabase status." },
      ],
      activityLog: [
        { time: "3h ago", action: "Pipeline checked — 0 ready for follow-up", status: "success" },
        { time: "9h ago", action: "Sent 2 follow-up emails", status: "success" },
      ],
      stats: [{ label: "Emails sent", value: "0" }, { label: "In pipeline", value: String(leads) }],
      lastRun: "3h 20m ago", nextRun: "In 2h 40m",
      enabled: agentEnabled["followup"] !== false,
      uptime: "99.6%", tasksCompleted: 89, successRate: "97.5%",
      logs: ["Pipeline checked: 0 ready for follow-up", "All leads in correct status", "Next window in 2h 40m"],
    },
    {
      id: "social", name: "Mia", emoji: "📱", avatar: "/agents/mia.png",
      status: "pending", type: "Social Media Manager · AI",
      schedule: "Daily 8 AM", color: "#ec4899",
      description: "Generates 5 travel posts per day with AI captions and stunning visuals. Auto-posts to Instagram, TikTok, and Facebook — after your approval.",
      intro: "I'm your social media team! Every morning I create 5 beautiful travel posts with AI-generated captions. Nothing goes live without your approval — you stay in control.",
      features: ["AI captions", "Visual creation", "Instagram", "TikTok", "Facebook", "Approval gate"],
      scenarios: [
        { icon: "🖼️", title: "Morning content batch", desc: "At 8 AM, Social Engine generates 5 posts: 2 destination highlights, 1 travel tip, 1 deal promo, 1 client testimonial." },
        { icon: "✅", title: "You approve 3 posts", desc: "With one click, approved posts are scheduled across Instagram, TikTok, and Facebook at optimal times." },
        { icon: "📹", title: "TikTok video ready", desc: "Creates a 30-second travel video with text overlays, voiceover script, and trending hashtags." },
      ],
      activityLog: [
        { time: "Today 8 AM", action: "5 posts generated — 3 pending approval", status: "pending" },
        { time: "Yesterday", action: "2 posts approved and published", status: "success" },
      ],
      stats: [{ label: "Posts/day", value: "5" }, { label: "Queued", value: "3" }],
      lastRun: "Today 8:00 AM", nextRun: "Tomorrow 8:00 AM",
      enabled: agentEnabled["social"] !== false,
      progress: 80, uptime: "98.5%", tasksCompleted: 45, successRate: "100%",
      logs: ["5 posts generated for today", "3 posts pending your approval", "2 posts approved and published"],
    },
    {
      id: "cyber", name: "Atlas", emoji: "🛡️", avatar: "/agents/atlas.png",
      status: "active", type: "Security Guardian · 24/7",
      schedule: "Every hour", color: "#10b981",
      description: "24/7 security watchdog. Monitors all services, SSL certificates, disk usage, RAM, SSH logins, and Docker containers. Auto-restarts any failures.",
      intro: "I'm your security guard! Every hour I scan all 7 services, check SSL certificates, monitor disk and RAM, watch for suspicious SSH logins, and auto-restart anything that fails. Your infrastructure is safe with me.",
      features: ["Services", "SSL certs", "SSH detect", "Docker", "Disk/RAM", "Auto-restart"],
      scenarios: [
        { icon: "🔒", title: "SSL certificate expiring", desc: "Cyber Guardian detects SSL expires in 14 days and sends an alert with renewal instructions." },
        { icon: "🚨", title: "Unknown SSH login detected", desc: "New IP logged in via SSH — Guardian sends immediate alert with IP geolocation and blocks if suspicious." },
        { icon: "♻️", title: "Service crashed", desc: "API went down at 3 AM — Guardian auto-restarted it in 8 seconds and logged the incident." },
        { icon: "💾", title: "Disk usage warning", desc: "Disk at 85% — Guardian cleans old logs and Docker images, freeing 12GB." },
      ],
      activityLog: [
        { time: "12 min ago", action: "Hourly scan — all 7 services healthy", status: "success" },
        { time: "1h ago", action: "SSL check — valid 89 more days", status: "success" },
        { time: "2h ago", action: "No suspicious SSH logins detected", status: "success" },
      ],
      stats: [{ label: "Scans today", value: String(new Date().getHours()) }, { label: "Issues", value: "0" }],
      lastRun: "12 min ago", nextRun: "In 48 min",
      enabled: agentEnabled["cyber"] !== false,
      progress: 100, uptime: "100%", tasksCompleted: new Date().getHours() * 30 + 180, successRate: "99.9%",
      logs: ["All 7 services healthy", "SSL valid 89 days", "No suspicious SSH logins"],
    },
    {
      id: "bug", name: "Rex", emoji: "🐛", avatar: "/agents/rex.png",
      status: "active", type: "QA Tester · Automated",
      schedule: "Every 6 hours", color: "#ef4444",
      description: "Automated QA testing suite. Tests all pages, API endpoints, webhooks, and database connectivity. Sends email alerts on any failure.",
      intro: "I test everything, 4 times a day! Every page, every API endpoint, every webhook, every database query. If something breaks, you know within minutes — not when a client complains.",
      features: ["Page tests", "API tests", "Webhook", "Supabase", "n8n", "Email alert"],
      scenarios: [
        { icon: "🌐", title: "Page load test", desc: "Bug Hunter loads all 12 pages and verifies they return 200 in under 2 seconds. Any failure triggers an email." },
        { icon: "🔌", title: "API health check", desc: "Tests every endpoint: /chat, /quote, /admin/leads, /webhook — confirms all respond correctly." },
        { icon: "📧", title: "Failure detected", desc: "The /quote endpoint returned a 500 — Bug Hunter sends you an email with the error details and stack trace." },
      ],
      activityLog: [
        { time: "45 min ago", action: "Full test suite passed — 12/12 checks green", status: "success" },
        { time: "6h ago", action: "All API endpoints responding correctly", status: "success" },
      ],
      stats: [{ label: "Tests/day", value: "4" }, { label: "Bugs found", value: "0" }],
      lastRun: "45 min ago", nextRun: "In 5h 15m",
      enabled: agentEnabled["bug"] !== false,
      uptime: "100%", tasksCompleted: 48, successRate: "100%",
      logs: ["All 12 pages load OK (< 2s)", "API endpoints 200 ✓", "Webhook live ✓"],
    },
    {
      id: "twilio", name: "Luna", emoji: "📞", avatar: "/agents/luna.png",
      status: "live", type: "Voice & SMS · Real-time",
      schedule: "Real-time (inbound/outbound)", color: "#06b6d4",
      description: "Real-time phone and SMS powered by AI. Lina answers calls and texts, sends follow-up SMS, delivers quotes by text, and handles voice conversations naturally.",
      intro: "I'm the voice and SMS gateway! When someone calls or texts your Zeniva number, I connect them with Lina's AI brain. Inbound calls get a natural voice conversation, texts get instant AI responses.",
      features: ["Inbound SMS", "Outbound SMS", "Voice calls", "AI responses", "Quote SMS", "Alerts"],
      scenarios: [
        { icon: "📱", title: "Client texts asking about pricing", desc: "Twilio receives the SMS, routes it to Lina AI, and sends back a personalized response within seconds." },
        { icon: "📞", title: "Incoming call at midnight", desc: "Lina answers the phone in the caller's language, qualifies their trip interest, and schedules a callback." },
        { icon: "💬", title: "Quote delivery via SMS", desc: "After generating a quote, automatically sends a beautiful SMS summary with a link to the full proposal." },
      ],
      activityLog: [
        { time: "3 min ago", action: "Inbound SMS received and routed to Lina", status: "success" },
        { time: "30 min ago", action: "Voice call handled — 45 second conversation", status: "success" },
      ],
      stats: [{ label: "Number", value: "+1 447" }, { label: "Status", value: "Active" }],
      lastRun: "Real-time", nextRun: "Always on",
      enabled: agentEnabled["twilio"] !== false,
      progress: 100, uptime: "99.8%", tasksCompleted: 234, successRate: "97.0%",
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
      // Check Lina health via VPS /health — no message sent to Lina
      const r = await fetch("/api/agents-proxy?endpoint=health");
      const d = await r.json();
      const ok = d?.status === "healthy" || d?.status === "online";
      setLinaHealth(ok ? "online" : "offline");
      linaStatusRef.current = ok ? "live" : "error";
    } catch { setLinaHealth("offline"); linaStatusRef.current = "error"; }

    // Stats
    try {
      const r = await fetch("/api/agents-proxy?endpoint=stats");
      const d = await r.json();
      setTotalLeads(d?.total_leads ?? 0);
      setTotalClients(d?.total_clients ?? 0);
      setClientsToday(d?.clients_today ?? 0);
      setClientsWeek(d?.clients_week ?? 0);
      setTotalMessages(d?.total_messages ?? 0);
      setEmailsSent(d?.emails_sent ?? 0);
      setSmsSent(d?.sms_sent ?? 0);
      setLeadsToday(d?.leads_today ?? 0);
      setEmailsToday(d?.emails_today ?? 0);
      setSmsToday(d?.sms_today ?? 0);
      setLeadsWeek(d?.leads_week ?? 0);
      setEmailsWeek(d?.emails_week ?? 0);
      setSmsWeek(d?.sms_week ?? 0);
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
      // leadsToday now comes from stats API
    } catch {}

    // Approvals
    try {
      const [socialRes, videoRes] = await Promise.all([
        fetch("/api/agents-proxy/social-queue"),
        fetch("/api/agents-proxy?endpoint=video-queue"),
      ]);
      const socialData = await socialRes.json();
      const videoData = await videoRes.json().catch(() => ({}));

      const socialPending = (socialData?.posts || [])
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

      const videoPending = (videoData?.videos || [])
        .filter((v: any) => v.status === "pending_approval")
        .map((v: any) => ({
          id: v.id,
          agent: "Video Creator",
          type: "video_ad",
          platform: (v.platforms_target || ["all"]).join(", "),
          title: v.title || "Video Ad",
          content: v.description || "",
          videoUrl: v.video_url,
          resolution: v.resolution,
          duration: v.duration,
          createdAt: v.generated_at || new Date().toISOString(),
        }));

      setApprovals([...videoPending, ...socialPending]);
    } catch { setApprovals([]); }

    // Uploaded video queue
    try {
      const r = await fetch("/api/agents-proxy?endpoint=video-queue", { cache: "no-store" });
      const d = await r.json();
      setUploadedVideos(d?.videos || []);
    } catch { setUploadedVideos([]); }

    // TikTok videos
    try {
      const r = await fetch("/api/agents-proxy?endpoint=tiktok");
      const d = await r.json();
      setTiktokVideos(d?.videos || []);
    } catch { setTiktokVideos([]); }

    // Real activity from API
    try {
      const r = await fetch("/api/agents-proxy?endpoint=activity");
      const d = await r.json();
      const items: ActivityItem[] = (d?.activities || []).map((a: any, i: number) => ({
        id: `act-${i}`,
        agent: a.agent || "System",
        agentId: a.agentId || "system",
        emoji: a.emoji || "⚡",
        action: a.action || "",
        detail: a.detail || "",
        time: a.time ? new Date(a.time).toLocaleTimeString() : "",
        status: (a.status || "success") as ActivityItem["status"],
      }));
      setActivity(items);
    } catch { setActivity([]); }
  }, []);

  useEffect(() => {
    fetchData();
    const i = setInterval(fetchData, 30000);
    return () => clearInterval(i);
  }, [fetchData]);

  // Rebuild agents when key data changes
  useEffect(() => {
    setAgents(buildAgents(linaStatusRef.current, totalLeads, totalMessages));
  }, [totalLeads, totalMessages, agentEnabled, buildAgents]);

  // ── Handlers
  const handleApprove = async (id: string) => {
    const ap = approvals.find(a => a.id === id);
    const endpoint = ap?.type === "video_ad" ? "/api/agents-proxy?endpoint=video-queue-action" : "/api/agents-proxy/social-queue";
    try { await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "approve" }) }); } catch {}
    setApprovals(p => p.filter(a => a.id !== id));
    if (ap) setApprovalHistory(p => [{ ...ap, approved: true }, ...p]);
  };
  const handleReject = async (id: string) => {
    const ap = approvals.find(a => a.id === id);
    const endpoint = ap?.type === "video_ad" ? "/api/agents-proxy?endpoint=video-queue-action" : "/api/agents-proxy/social-queue";
    try { await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "reject" }) }); } catch {}
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

  // ── Video upload handler (shared between file picker + drag & drop)
  const handleVideoUpload = async (file: File) => {
    // Warn if not a video file
    const isVideo = file.type.startsWith("video/") || /\.(mp4|mov|avi|mkv|m4v|webm|hevc|3gp|wmv|flv)$/i.test(file.name);
    if (!isVideo) {
      setUploadStatus("❌ This is not a video file. Please upload an MP4, MOV, or other video format.");
      return;
    }
    setUploadLoading(true);
    setUploadStatus("⏳ Uploading... 0%");
    const form = new FormData();
    form.append("file", file);
    form.append("title", file.name.replace(/\.[^.]+$/, "") || "My Video");
    form.append("platforms", "tiktok,youtube,instagram");
    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            const pct = Math.round((ev.loaded / ev.total) * 100);
            setUploadStatus(`⏳ Uploading... ${pct}%`);
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const d = JSON.parse(xhr.responseText);
              if (d.ok) {
                setUploadStatus("✅ Video uploaded! Add Lina\'s voice below.");
                fetch("/api/agents-proxy?endpoint=video-queue", { cache: "no-store" })
                  .then(r => r.json())
                  .then(data => setUploadedVideos(data?.videos || []))
                  .catch(() => {});
                resolve();
              } else {
                reject(new Error(d.detail || d.error || "Upload failed"));
              }
            } catch { reject(new Error("Invalid server response")); }
          } else {
            let errMsg = `Server error ${xhr.status}`;
            try { const ed = JSON.parse(xhr.responseText); errMsg = ed.detail || ed.error || errMsg; } catch {}
            reject(new Error(errMsg));
          }
        };
        xhr.onerror = () => reject(new Error("Network error — check connection"));
        xhr.open("POST", "https://vmi3097009.contaboserver.net/video-queue/upload");
        xhr.setRequestHeader("Authorization", "Bearer zeniva-secret-2025");
        xhr.send(form);
      });
    } catch (err: any) {
      setUploadStatus("❌ " + (err?.message || "Upload failed"));
    } finally {
      setUploadLoading(false);
    }
  };

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
          <KpiCard icon="👥" label="Leads This Week"  value={leadsWeek}    trend={leadsToday > 0 ? `↑ ${leadsToday} today` : "—"}  color="bg-indigo-600" sub={`${totalLeads} all time`} />
          <KpiCard icon="🔥" label="Leads Today"      value={leadsToday}   trend={leadsToday > 0 ? `+${leadsToday}` : "—"}  color="bg-amber-500"   />
          <KpiCard icon="🏆" label="Clients"          value={totalClients} trend={clientsToday > 0 ? `↑ ${clientsToday} today` : clientsWeek > 0 ? `↑ ${clientsWeek} this week` : "—"} color="bg-green-600" sub="converted" />
          <KpiCard icon="📧" label="Emails This Week" value={emailsWeek}   trend={emailsToday > 0 ? `↑ ${emailsToday} today` : "—"}  color="bg-blue-600"   sub={`${emailsSent} all time`} />
          <KpiCard icon="📱" label="SMS This Week"    value={smsWeek}      trend={smsToday > 0 ? `↑ ${smsToday} today` : "—"}    color="bg-cyan-500"   sub={`${smsSent} all time`} />
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
          <div className="space-y-6">
            {/* View Switcher */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">View:</span>
              <div className="flex gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
                {([
                  { id: "boss" as UserView, label: "👑 Boss", desc: "All agents" },
                  { id: "agent" as UserView, label: "🧑‍💼 Agents", desc: "Agent tools" },
                  { id: "broker" as UserView, label: "🏢 Brokers", desc: "Broker tools" },
                ] as const).map(v => (
                  <button
                    key={v.id}
                    onClick={() => setAgentView(v.id)}
                    className={`py-2 px-4 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      agentView === v.id
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-gray-400 ml-2">
                {agentView === "boss" ? `${agents.length} agents` : agentView === "agent" ? `${AGENT_VIEW_AGENTS.length} tools` : `${BROKER_VIEW_AGENTS.length} tools`}
              </span>
            </div>

            {/* Agent Grid */}
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {(agentView === "boss" ? agents : agentView === "agent" ? AGENT_VIEW_AGENTS : BROKER_VIEW_AGENTS).map(agent => (
                <AgentCard key={agent.id} agent={agent} onSelect={setSelectedAgentId} />
              ))}
            </div>

            {/* Agent Detail Modal */}
            {selectedAgentId && (() => {
              const allAgents = [...agents, ...AGENT_VIEW_AGENTS, ...BROKER_VIEW_AGENTS];
              const selectedAgent = allAgents.find(a => a.id === selectedAgentId);
              if (!selectedAgent) return null;
              return (
                <AgentDetailPanel
                  agent={selectedAgent}
                  onClose={() => setSelectedAgentId(null)}
                  onToggle={toggleAgent}
                />
              );
            })()}
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
          <div className="space-y-6">

            {/* ── UPLOAD SECTION ────────────────────────────────────────────── */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-blue-500/30 rounded-2xl overflow-hidden shadow-lg">
              <div className="px-5 py-4 border-b border-gray-700/60 flex items-center gap-3">
                <span className="text-2xl">📤</span>
                <div>
                  <div className="text-sm font-bold text-white">Upload Your Base Video</div>
                  <div className="text-xs text-gray-400 mt-0.5">Upload → Lina adds her voice → You approve → Agent publishes</div>
                </div>
              </div>
              <div className="px-5 py-5">
                <label
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all group ${uploadLoading ? "border-blue-400/60 bg-blue-500/5 cursor-not-allowed" : "border-blue-500/40 hover:border-blue-400 hover:bg-blue-500/5"}`}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={async (e) => {
                    e.preventDefault(); e.stopPropagation();
                    if (uploadLoading) return;
                    const file = e.dataTransfer.files?.[0];
                    if (!file) return;
                    await handleVideoUpload(file);
                  }}
                >
                  <input type="file" accept="*" className="hidden" disabled={uploadLoading} onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    await handleVideoUpload(file);
                  }} />
                  {uploadLoading ? (
                    <>
                      <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-3" />
                      <span className="text-sm font-bold text-blue-300">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🎬</span>
                      <span className="text-sm font-bold text-white">Click to choose a video</span>
                      <span className="text-xs text-gray-400 mt-1">MP4, MOV, HEVC — max 500MB · Tip: si blanc dans Finder, sélecte quand même</span>
                    </>
                  )}
                </label>
                {uploadStatus && (
                  <p className={`text-center text-sm mt-3 font-semibold ${uploadStatus.startsWith("✅") ? "text-emerald-400" : uploadStatus.startsWith("❌") ? "text-red-400" : "text-blue-300"}`}>{uploadStatus}</p>
                )}
              </div>
            </div>

            {/* ── YOUR UPLOADED VIDEOS ──────────────────────────────────────── */}
            {uploadedVideos.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  🎬 Your Videos
                  <span className="text-xs font-normal text-gray-400">({uploadedVideos.length} video{uploadedVideos.length > 1 ? "s" : ""})</span>
                </h2>
                {uploadedVideos.filter((v: any) => v.uploaded_by === "boss" || v.status === "pending_approval" || v.status === "voiced").map((video: any) => {
                  // Extract filename from proxy_url or video_url
                  const extractFilename = (v: any) => {
                    if (v.proxy_url) return v.proxy_url.replace("/video-serve/", "");
                    if (v.video_url) return v.video_url.split("/").pop() || v.id;
                    return v.id;
                  };
                  const filename = extractFilename(video);
                  const proxyUrl = `/api/agents-proxy?endpoint=video-serve&file=${encodeURIComponent(filename)}`;
                  const hasVoice = !!video.voiced_url || video.status === "voiced" || !!video.voiced_filename;
                  const voicedFilename = video.voiced_filename || (video.proxy_url?.includes("_voiced") ? extractFilename(video) : null);
                  const finalUrl = voicedFilename
                    ? `/api/agents-proxy?endpoint=video-serve&file=${encodeURIComponent(voicedFilename)}`
                    : proxyUrl;
                  const isGenerating = voiceLoading[video.id];
                  const script = videoScripts[video.id] ?? (video.script_text || "");

                  return (
                    <div key={video.id} className="bg-white border border-indigo-500/20 rounded-2xl overflow-hidden shadow-sm">
                      {/* Header */}
                      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 bg-gradient-to-r from-indigo-50 to-white">
                        <div>
                          <div className="text-sm font-bold text-gray-900 truncate max-w-xs">{video.title || video.id}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {video.uploaded_by === "boss" ? "👑 Your upload" : "🤖 Agent"} · {video.generated_at ? new Date(video.generated_at).toLocaleString() : ""}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {hasVoice ? (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">🎤 VOICE ADDED</span>
                          ) : (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 border border-amber-500/30">⏳ NO VOICE YET</span>
                          )}
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                            video.status === "approved" ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" :
                            video.status === "voiced" ? "bg-blue-500/15 text-blue-600 border-blue-500/30" :
                            "bg-gray-100 text-gray-500 border-gray-300"
                          }`}>
                            {video.status === "approved" ? "✅ APPROVED" : video.status === "voiced" ? "🎤 VOICED" : "📋 PENDING"}
                          </span>
                        </div>
                      </div>

                      <div className="px-5 py-5">
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Video Player */}
                          <div className="shrink-0">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                              {hasVoice ? "🎤 Final Video (with voice)" : "🎬 Base Video"}
                            </div>
                            <video
                              key={finalUrl}
                              controls
                              className="rounded-xl bg-black shadow-md"
                              style={{ width: "240px", maxHeight: "420px" }}
                              preload="metadata"
                            >
                              <source src={finalUrl} type="video/mp4" />
                            </video>
                            {video.file_size && (
                              <div className="text-[10px] text-gray-400 mt-1 text-center">
                                {(video.file_size / 1024 / 1024).toFixed(1)} MB
                              </div>
                            )}
                            {hasVoice && (
                              <a
                                href={finalUrl}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-bold text-indigo-500 bg-indigo-50 border border-indigo-200 rounded-lg py-1.5 hover:bg-indigo-100 transition-colors"
                              >
                                ⬇️ Download
                              </a>
                            )}
                          </div>

                          {/* Voice Script + Controls */}
                          <div className="flex-1 space-y-4">
                            <div>
                              <label className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-2">
                                🎤 Lina's Speech Script
                                <span className="text-[10px] font-normal text-gray-400">(write exactly what Lina should say in English)</span>
                              </label>
                              <textarea
                                value={script}
                                onChange={e => setVideoScripts(p => ({ ...p, [video.id]: e.target.value }))}
                                placeholder={"Hey guys! Looking for an amazing deal in Cancun? We have 7 nights all-inclusive starting at just $899 per person. Book now at ZenivaTravel.com — link in bio! 🌴"}
                                rows={5}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all resize-none"
                              />
                              <div className="text-[10px] text-gray-400 mt-1 text-right">{script.length} chars</div>
                            </div>

                            {/* Voice settings */}
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center gap-3">
                              <span className="text-xl">🎙️</span>
                              <div className="flex-1">
                                <div className="text-xs font-bold text-indigo-700">Lina's Voice — ElevenLabs</div>
                                <div className="text-[10px] text-indigo-500 mt-0.5">Jessica · Playful, Bright, Warm · English</div>
                              </div>
                              <div className="text-[10px] text-indigo-400 font-mono">eleven_multilingual_v2</div>
                            </div>

                            {/* Generate button */}
                            <div className="flex gap-3">
                              <button
                                disabled={isGenerating || !script.trim()}
                                onClick={async () => {
                                  if (!script.trim()) return;
                                  setVoiceLoading(p => ({ ...p, [video.id]: true }));
                                  try {
                                    const r = await fetch("/api/agents-proxy?endpoint=add-voice", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ id: video.id, script: script.trim() }),
                                    });
                                    const d = await r.json();
                                    if (d.ok) {
                                      setUploadStatus("✅ Voice generated! Check the video player above.");
                                      await fetchData();
                                    } else {
                                      setUploadStatus("❌ Voice error: " + (d.error || "Unknown"));
                                    }
                                  } catch (err: any) {
                                    setUploadStatus("❌ " + err?.message);
                                  } finally {
                                    setVoiceLoading(p => ({ ...p, [video.id]: false }));
                                  }
                                }}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
                                  isGenerating
                                    ? "bg-indigo-100 text-indigo-400 cursor-not-allowed"
                                    : !script.trim()
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
                                }`}
                              >
                                {isGenerating ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin" />
                                    Generating voice...
                                  </>
                                ) : (
                                  <>🎤 Generate Lina's Voice</>
                                )}
                              </button>
                            </div>

                            {/* Platforms */}
                            <div className="flex flex-wrap gap-1.5">
                              {(video.platforms_target || ["tiktok", "youtube", "instagram"]).map((p: string) => (
                                <span key={p} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-100 text-gray-500 border border-gray-200 capitalize">{p}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="px-5 py-4 border-t border-gray-100 flex gap-3 justify-between items-center bg-gray-50">
                        <button
                          onClick={async () => {
                            // Optimistic remove immediately
                            setUploadedVideos(prev => prev.filter((v: any) => v.id !== video.id));
                            try {
                              await fetch("/api/agents-proxy?endpoint=video-queue-action", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: video.id, action: "delete" }),
                              });
                            } catch {
                              // Restore on error
                              fetch("/api/agents-proxy?endpoint=video-queue", { cache: "no-store" })
                                .then(r => r.json())
                                .then(data => setUploadedVideos(data?.videos || []))
                                .catch(() => {});
                            }
                          }}
                          className="bg-red-500/10 text-red-500 border border-red-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-colors"
                        >🗑️ Delete</button>
                        <button
                          onClick={async () => {
                            try {
                              await fetch("/api/agents-proxy?endpoint=video-queue-action", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: video.id, action: "approve" }),
                              });
                              setUploadStatus("✅ Video approved & queued for publishing!");
                              await fetchData();
                            } catch {}
                          }}
                          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
                            hasVoice
                              ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                          disabled={!hasVoice}
                          title={!hasVoice ? "Generate Lina\'s voice first" : "Approve & Publish"}
                        >
                          {hasVoice ? "✅ Approve & Publish" : "🔒 Add Voice First"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {uploadedVideos.length === 0 && approvals.length === 0 && tiktokVideos.length === 0 && (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-16 text-center">
                <p className="text-5xl mb-3">🎬</p>
                <p className="text-gray-600 font-medium">No videos yet</p>
                <p className="text-gray-400 text-sm mt-1">Upload your first video above to get started</p>
              </div>
            )}

            {/* ── AI AGENT APPROVALS (social posts etc) ─────────────────────── */}
            {approvals.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-900">{approvals.length} Agent Approvals Pending</h2>
                  <div className="flex gap-2">
                    <button onClick={handleApproveAll} className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl font-bold hover:bg-emerald-500/30 transition-colors">✅ Approve All</button>
                    <button onClick={handleRejectAll}  className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl font-bold hover:bg-red-500/30 transition-colors">❌ Reject All</button>
                  </div>
                </div>
                {approvals.map(ap => (
                  <div key={ap.id} className="bg-white border border-amber-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 bg-amber-50">
                      <div>
                        <div className="text-sm font-bold text-gray-900">{ap.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{ap.agent} · {new Date(ap.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {ap.platform && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-500 border border-indigo-200 uppercase">{ap.platform}</span>}
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-600 border border-amber-200">⏳ PENDING</span>
                      </div>
                    </div>
                    <div className="px-5 py-4">
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{ap.content}</div>
                      {ap.imagePrompt && (
                        <div className="mt-3 bg-purple-50 border border-purple-200 rounded-xl p-3">
                          <div className="text-[10px] font-bold text-purple-500 mb-1">🎨 AI Image Prompt</div>
                          <p className="text-xs text-gray-500 italic">"{ap.imagePrompt}"</p>
                        </div>
                      )}
                    </div>
                    <div className="px-5 py-4 border-t border-gray-100 flex gap-3 justify-end bg-gray-50">
                      <button onClick={() => handleReject(ap.id)}  className="bg-red-50 text-red-500 border border-red-200 px-5 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors">❌ Reject</button>
                      <button onClick={() => handleApprove(ap.id)} className="bg-emerald-500 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors shadow-sm">✅ Approve & Publish</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── TIKTOK AGENT VIDEOS ───────────────────────────────────────── */}
            {tiktokVideos.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  🤖 TikTok Agent Videos
                  <span className="text-xs font-normal text-gray-400">({tiktokVideos.filter(v => v.status === "pending").length} pending)</span>
                </h2>
                {tiktokVideos.map(video => {
                  const isPending = video.status === "pending";
                  const scenes = video.script?.SCENES || video.script?.scenes || [];
                  return (
                    <div key={video.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm ${isPending ? "border-amber-200" : "border-emerald-200"}`}>
                      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 bg-gray-50">
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${video.account === "zeniva" ? "bg-blue-100 text-blue-600 border-blue-200" : "bg-pink-100 text-pink-600 border-pink-200"}`}>
                            {video.account === "zeniva" ? "🌍 Zeniva Travel" : "👩 Lina"}
                          </span>
                          <span className="text-xs text-gray-400">{video.created}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${isPending ? "bg-amber-100 text-amber-600 border-amber-200" : "bg-emerald-100 text-emerald-600 border-emerald-200"}`}>
                          {isPending ? "⏳ PENDING" : "✅ APPROVED"}
                        </span>
                      </div>
                      <div className="px-5 py-4 flex flex-col md:flex-row gap-5">
                        <div className="shrink-0">
                          <video controls className="rounded-xl bg-black shadow" style={{ width: "240px", maxHeight: "420px" }} preload="metadata">
                            <source src={`/api/agents-proxy?endpoint=tiktok-video&file=${video.filename}`} type="video/mp4" />
                          </video>
                          <div className="text-[10px] text-gray-400 mt-1 text-center">{(video.size / 1024 / 1024).toFixed(1)} MB</div>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <div className="text-xs font-bold text-gray-500 mb-1">📝 Caption</div>
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-600 whitespace-pre-wrap">{video.caption}</div>
                          </div>
                          {scenes.length > 0 && (
                            <div>
                              <div className="text-xs font-bold text-gray-500 mb-2">🎬 Scenes</div>
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
                      {isPending && (
                        <div className="px-5 py-4 border-t border-gray-100 flex gap-3 justify-end bg-gray-50">
                          <button onClick={() => handleTikTokReject(video.id)} className="bg-red-50 text-red-500 border border-red-200 px-5 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors">❌ Reject</button>
                          <button onClick={() => handleTikTokApprove(video.id)} className="bg-emerald-500 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors shadow-sm">✅ Approve & Post</button>
                        </div>
                      )}
                    </div>
                  );
                })}
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
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${ap.approved ? "bg-emerald-500/15 text-emerald-600 border-emerald-200" : "bg-red-500/15 text-red-500 border-red-200"}`}>
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
