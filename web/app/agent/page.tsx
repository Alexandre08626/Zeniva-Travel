"use client";
import Link from "next/link";
import { useEffect, useState, useMemo, FormEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, isHQ, logout, hasPermission } from "../../src/lib/authStore";
import { normalizeRbacRole } from "../../src/lib/rbac";
import { toAgentWorkspaceId } from "../../src/lib/agent/agentWorkspace";
import LinaAvatar from "../../src/components/LinaAvatar";

const AUTH = "Bearer zeniva-secret-2025";
const PREMIUM_BLUE = "#0B1B4D";
const BRAND_BLUE = "#0F6CF5";
const ACCENT_GOLD = "#E6B85A";
const IMPERSONATE_KEY = "zeniva_impersonating";

type AgentStatus = "live" | "active" | "idle" | "error";
type AIAgent = {
  id: string; name: string; emoji: string; avatar?: string;
  status: AgentStatus; type: string; schedule: string; color: string;
  description: string; features: string[]; lastAction?: string;
};

const AI_AGENTS: AIAgent[] = [
  { id: "lina", name: "Lina", emoji: "🤖", avatar: "/agents/lina.png", status: "live", type: "AI Travel Concierge · GPT-4o", schedule: "24/7 Real-time", color: "#6366f1", description: "Polyglot AI travel concierge. Qualifies leads, quotes packages, saves to Supabase. Speaks every language your clients do.", features: ["GPT-4o", "Multi-language", "Lead extraction", "Supabase sync", "24/7"], lastAction: "Chat replied 2min ago" },
  { id: "marco", name: "Marco", emoji: "🔥", avatar: "/agents/marco.png", status: "active", type: "Lead Hunter · 5-Engine Scraper", schedule: "Every 2h", color: "#ef4444", description: "5 scraping engines running 24/7: Reddit travel subs, competitor sites, social signals, SEO intent keywords, and deep web scraping.", features: ["Reddit", "Competitors", "Social", "SEO", "Deep web"], lastAction: "3 leads qualified" },
  { id: "sofia", name: "Sofia", emoji: "📬", avatar: "/agents/sofia.png", status: "active", type: "Email Marketing · AI Writer", schedule: "Every 6h", color: "#ec4899", description: "Sends personalized AI-written invite emails to every new lead. Detects their language and writes in EN, FR, ES, or AR. Not templates — every email is unique.", features: ["AI emails", "EN/FR/ES/AR", "Smart timing", "Conversion tracking", "Unique copy"], lastAction: "39 emails sent" },
  { id: "noah", name: "Ben", emoji: "💳", avatar: "/agents/noah.png", status: "live", type: "ZeniPay AI Finance Agent", schedule: "Real-time", color: "#0F6CF5", description: "ZeniPay's internal AI finance agent. Monitors all payments in real-time, detects anomalies, generates financial reports, tracks commissions, and alerts on failed or suspicious transactions.", features: ["Payment monitoring", "Fraud detection", "Auto-accounting", "Commission calc", "Finance reports"], lastAction: "Finance dashboard active" },
  { id: "luna", name: "Luna", emoji: "📞", avatar: "/agents/luna.png", status: "live", type: "Voice & SMS · Real-time", schedule: "24/7 Real-time", color: "#06b6d4", description: "Real-time phone and SMS powered by AI. Lina answers calls and texts, sends follow-up SMS, delivers quotes by text, and handles voice conversations naturally.", features: ["Inbound SMS", "Outbound SMS", "Voice calls", "AI responses", "Twilio"], lastAction: "4 SMS Sent" },
  { id: "atlas", name: "Atlas", emoji: "🛡️", avatar: "/agents/atlas.png", status: "active", type: "Security Guardian · 24/7", schedule: "Every hour", color: "#64748b", description: "24/7 security watchdog. Monitors all services, SSL certificates, disk usage, RAM, SSH logins, and Docker containers. Auto-restarts any failures.", features: ["Services", "SSL certs", "SSH detect", "Disk/RAM", "Auto-restart"], lastAction: "Scan OK 14:00" },
  { id: "mia", name: "Mia", emoji: "📱", avatar: "/agents/mia.png", status: "idle", type: "Social Media Manager · AI", schedule: "Daily", color: "#a855f7", description: "Generates 5 travel posts per day with AI captions and stunning visuals. Auto-posts to Instagram, TikTok, and Facebook — after your approval.", features: ["AI captions", "Visual creation", "Instagram", "TikTok", "Approval flow"], lastAction: "Awaiting TikTok" },
  { id: "leo", name: "Leo", emoji: "📊", avatar: "/agents/leo.png", status: "active", type: "Analytics · Real-time", schedule: "Real-time", color: "#8b5cf6", description: "Analyzes conversions, pipeline velocity, agent ROI, and client LTV. Feeds insights back to all other agents for smarter decisions.", features: ["Conversions", "Pipeline", "Agent ROI", "Client LTV", "Real-time"], lastAction: "Report updated" },
  { id: "rex", name: "Rex", emoji: "🛠️", avatar: "/agents/rex.png", status: "active", type: "AI Platform Engineer — Daily Maintenance & Monitoring", schedule: "Daily 8am + Real-time", color: "#059669", description: "Backend monitoring and auto-fix agent. Monitors all APIs, detects errors and bugs, sends daily health reports at 8am, alerts the team on critical issues, and suggests performance optimizations.", features: ["Bug Detection", "API Monitoring", "Performance", "Auto-Fix", "Daily Reports"], lastAction: "Health check OK" },
  { id: "max", name: "Max", emoji: "📋", avatar: "/agents/max.png", status: "live", type: "Compliance & Risk Agent", schedule: "Every 30min", color: "#f59e0b", description: "Monitors ZeniPay transactions and flags risk before it becomes a problem. Detects fraud patterns, tracks chargeback ratios, and ensures AML compliance.", features: ["Risk Detection", "Chargeback Alerts", "Compliance", "AML Flags", "Auto-review"], lastAction: "Scan complete" },
  { id: "jade", name: "Jade", emoji: "💰", avatar: "/agents/jade.png", status: "live", type: "Agent Success & Onboarding", schedule: "Daily + Events", color: "#10b981", description: "Activates new agents, coaches performance and reactivates dormant accounts. Sends automated onboarding sequences, performance reports, and personalized coaching tips.", features: ["Onboarding", "Performance", "Reactivation", "Coaching", "Leaderboards"], lastAction: "Welcome email sent" },
  { id: "kai", name: "Kai", emoji: "💹", avatar: "/agents/kai.png", status: "live", type: "Revenue Intelligence Agent", schedule: "Daily 7am + Real-time", color: "#0ea5e9", description: "Analyzes margins, identifies top routes and optimizes pricing in real-time. Tracks profitability per booking, forecasts revenue, and alerts on low-margin deals.", features: ["Margin Analysis", "Route Intelligence", "Pricing", "Forecasting", "Alerts"], lastAction: "Daily report sent" },
];

const STATUS_CFG: Record<AgentStatus, { label: string; dot: string; badge: string }> = {
  live: { label: "LIVE", dot: "bg-emerald-500 animate-pulse", badge: "bg-emerald-100 text-emerald-700" },
  active: { label: "Active", dot: "bg-blue-500", badge: "bg-blue-100 text-blue-700" },
  idle: { label: "Idle", dot: "bg-amber-400", badge: "bg-amber-100 text-amber-700" },
  error: { label: "Erreur", dot: "bg-red-500", badge: "bg-red-100 text-red-700" },
};

// Agent nav — visible to all agents
const NAV_LINKS = [
  { label: "Dashboard", href: "/agent", icon: "🏠" },
  { label: "Clients", href: "/agent/clients", icon: "👥" },
  { label: "Trip Search", href: "/agent/trip-search", icon: "🔍" },
  { label: "Proposals", href: "/agent/proposals", icon: "📋" },
  { label: "Bookings", href: "/agent/bookings", icon: "✈️" },
  { label: "Commissions", href: "/agent/commissions", icon: "💰" },
  { label: "Calendar", href: "/agent/calendar", icon: "📅" },
  { label: "Chat with Lina", href: "/agent/lina", icon: "lina" },
  { label: "Settings", href: "/agent/settings", icon: "⚙️" },
];

// HQ nav — visible to all HQ/admin users
const HQ_LINKS = [
  { label: "Agencies", href: "/agent/agencies", icon: "🏢" },
  { label: "Chat Hub", href: "/agent/chat", icon: "💬" },
  { label: "Control Tower", href: "/agent/control-tower", icon: "🗼" },
  { label: "Partners", href: "/agent/partners", icon: "🤝" },
  { label: "Agent Command", href: "/agent/agents", icon: "👤" },
  { label: "Agent Requests", href: "/agent/requests", icon: "📨" },
  { label: "Influencer", href: "/agent/influencer", icon: "⭐" },
  { label: "AI Agents Hub", href: "/ai-agents", icon: "🤖" },
  { label: "Sofia \u2014 Marketing", href: "/agent/outreach", icon: "📬" },
];

// Zeniva HQ only (info@zeniva.ca) — extra admin items
const ZENIVA_HQ_LINKS = [
  { label: "Listings", href: "/agent/listings", icon: "🏨" },
];

export function AgentDashboardPage({ agentId }: { agentId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);

  // Impersonation — HQ can view portal as any agent
  const [impersonation, setImpersonation] = useState<{agentEmail: string; agentName: string; originalEmail: string} | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(IMPERSONATE_KEY);
    if (raw) { try { setImpersonation(JSON.parse(raw)); } catch {} }
  }, []);
  const effectiveEmail = impersonation?.agentEmail || user?.email || "";
  const roles = user?.roles?.length ? user.roles : user?.role ? [user.role] : [];
  const effectiveRole = normalizeRbacRole(user?.effectiveRole) || normalizeRbacRole(roles[0]);
  const isHQorAdmin = effectiveRole === "hq" || effectiveRole === "admin" || hq;
  const canTripSearch = !!user && hasPermission(user, "sales:all");
  const resolvedAgentId = agentId || toAgentWorkspaceId(user);


  // Notification badges for sidebar
  const [navBadges, setNavBadges] = useState<Record<string, number>>({});

  const fetchNavBadges = async () => {
    if (!effectiveEmail) return;
    try {
      // Fetch dashboard stats to compute badges
      const agentParam = isHQorAdmin ? "" : `&agent_email=${encodeURIComponent(effectiveEmail)}`;
      const r = await fetch(`/api/agents-proxy?path=admin/dashboard-stats${agentParam}`, {
        headers: { Authorization: "Bearer zeniva-secret-2025" },
      });
      const badges: Record<string, number> = {};
      if (r.ok) {
        const d = await r.json();
        if (d.clients_today > 0) badges["/agent/clients"] = d.clients_today;
        if (d.open_dossiers > 0) badges["/agent/dossiers"] = d.open_dossiers;
        if (d.followups_due > 0) badges["/agent/commissions"] = d.followups_due;
        if (d.leads_today > 0) badges["/agent"] = d.leads_today;
      }

      // Fetch unread inbox count — all agents get badge for new client messages
      {
        const lastSeenKey = "zeniva_inbox_last_seen";
        const lastSeen = typeof window !== "undefined" ? (localStorage.getItem(lastSeenKey) || "1970-01-01") : "1970-01-01";
        const inboxResp = await fetch("/api/agent/inbox", {
          cache: "no-store",
          headers: effectiveEmail ? { "x-user-email": effectiveEmail } : {},
        });
        if (inboxResp.ok) {
          const inboxData = await inboxResp.json();
          const rows: any[] = Array.isArray(inboxData?.data) ? inboxData.data : [];
          const unread = rows.filter((row) => {
            const role = row?.sender_role;
            if (role === "hq" || role === "agent" || role === "lina" || role === "system") return false;
            const ts = row?.created_at || row?.createdAt || "1970-01-01";
            return ts > lastSeen;
          }).length;
          if (unread > 0) badges["/agent/chat"] = unread;
        }
      }

      setNavBadges(badges);
    } catch {}
  };

  // Real-time stats
  const [dashStats, setDashStats] = useState<any>(null);
  const [vpsStats, setVpsStats] = useState<any>(null);
  const [recentTravelers, setRecentTravelers] = useState<any[]>([]);
  const [recentPartners, setRecentPartners] = useState<any[]>([]);
  const [agentRequests, setAgentRequests] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const AGENT_ROUTES: Record<string, string> = {
    lina: "/agent/trip-search",
    marco: "/agent/outreach",
    sofia: "/agent/outreach",
    noah: "https://zenipay.ca/app/overview",
    luna: "/agent/luna",
    atlas: "/agent/atlas",
    mia: "/agent/mia",
    leo: "/agent/leo",
    rex: "/agent/rex",
    max: "/agent/max",
    jade: "/agent/jade",
    kai: "/agent/kai",
  };
  const [navOpen, setNavOpen] = useState(true); // open by default — labels visible
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    if (loggingOut) return;
    setLoggingOut(true);
    void logout("/").finally(() => {
      // Belt-and-suspenders: if logout() somehow returns without redirecting,
      // force the navigation here so the user is never stuck on /agent.
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/agent")) {
        window.location.replace("/");
      }
    });
  };

  // Trip search — now uses /agent/trip-search page

  const fetchAll = async () => {
      fetchNavBadges();
    try {
      // Rex provides real-time dashboard stats directly from Supabase
      const actEmailParam = effectiveEmail ? `?agent_email=${encodeURIComponent(effectiveEmail)}` : "";
      const [dashRes, accountsRes, actRes] = await Promise.all([
        fetch("/api/rex/dashboard-stats", { headers: { Authorization: AUTH } }),
        hq ? fetch("/api/accounts") : Promise.resolve(null),
        fetch(`/api/agents-proxy?path=admin/activity-log${actEmailParam}`, { headers: { Authorization: AUTH } }),
      ]);
      if (dashRes.ok) {
        const stats = await dashRes.json();
        setDashStats(stats);
        setVpsStats(stats); // Use same stats for both to ensure consistency
        try { localStorage.setItem("rex_last_known_stats", JSON.stringify(stats)); } catch {}
      }
      if (actRes.ok) { const d = await actRes.json(); setActivity(d?.activities || d?.activity || []); }
      if (accountsRes?.ok) {
        const d = await accountsRes.json();
        const accounts = Array.isArray(d?.data) ? d.data : [];
        setRecentTravelers(accounts.filter((a: any) => (a.roles || [a.role]).includes("traveler")).slice(0, 5));
        setRecentPartners(accounts.filter((a: any) => (a.roles || [a.role]).some((r: string) => r?.includes("partner"))).slice(0, 4));
      }
    } catch (err) {
      console.error("[Rex] Dashboard stats fetch failed:", err);
      // Try to use last known values from localStorage
      try {
        const lastKnown = localStorage.getItem("rex_last_known_stats");
        if (lastKnown) {
          const stats = JSON.parse(lastKnown);
          setDashStats(stats);
          setVpsStats(stats);
        }
      } catch {}
    }
    if (hq) {
      try {
        const reqRes = await fetch("/api/agent-requests");
        if (reqRes.ok) { const d = await reqRes.json(); setAgentRequests((d?.data || []).filter((r: any) => r.status === "pending").slice(0, 5)); }
      } catch {}
    }
  };

  useEffect(() => {
    if (!effectiveEmail) return; // Wait for user to load before fetching
    fetchAll();
    const iv = setInterval(fetchAll, 30000);
    return () => clearInterval(iv);
  }, [hq, effectiveEmail, user?.email]);

  useEffect(() => {
    if (resolvedAgentId) {
      try { window.localStorage.setItem("zeniva_agent_workspace", resolvedAgentId); } catch {}
    }
  }, [resolvedAgentId]);

  const [kpiDrawer, setKpiDrawer] = useState<string | null>(null);
  const [kpiData, setKpiData] = useState<any>(null);
  const [kpiLoading, setKpiLoading] = useState(false);

  const openKpiDrawer = async (kpiKey: string) => {
    setKpiDrawer(kpiKey);
    setKpiLoading(true);
    setKpiData(null);
    try {
      const res = await fetch(`/api/rex/kpi-details?kpi=${kpiKey}`, { headers: { Authorization: AUTH } });
      if (res.ok) setKpiData(await res.json());
    } catch { /* silent */ }
    setKpiLoading(false);
  };

  const kpis = [
    { label: "Active Clients", value: dashStats?.active_clients ?? vpsStats?.total_clients ?? "—", icon: "👥", color: "bg-blue-50 border-blue-200", sub: `${dashStats?.open_dossiers ?? 0} dossiers`, key: "clients" },
    { label: "Total Leads", value: isHQorAdmin ? (vpsStats?.total_leads ?? "—") : (dashStats?.active_clients ?? 0), icon: "🎯", color: "bg-purple-50 border-purple-200", sub: isHQorAdmin ? `+${vpsStats?.leads_today ?? 0} today` : "Your pipeline", key: "leads" },
    { label: "Emails Sent", value: isHQorAdmin ? (vpsStats?.emails_sent ?? "—") : "—", icon: "📧", color: "bg-emerald-50 border-emerald-200", sub: isHQorAdmin ? `+${vpsStats?.emails_today ?? 0} today` : "Coming soon", key: "emails" },
    { label: "SMS Sent", value: isHQorAdmin ? (vpsStats?.sms_sent ?? "—") : "—", icon: "📱", color: "bg-amber-50 border-amber-200", sub: isHQorAdmin ? `+${vpsStats?.sms_today ?? 0} today` : "Coming soon", key: "sms" },
    { label: "Comm. Pipeline", value: dashStats ? `$${dashStats.commission_pipeline.toLocaleString()}` : "—", icon: "💰", color: "bg-rose-50 border-rose-200", sub: `${dashStats?.followups_due ?? 0} follow-ups`, key: "commissions" },
    { label: "Lina Chats", value: isHQorAdmin ? (vpsStats?.total_messages ?? "—") : "—", icon: "💬", color: "bg-indigo-50 border-indigo-200", sub: "Total conversations", key: "chats" },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "#0B1B4D" }}>
      {/* Impersonation banner */}
      {impersonation && (
        <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 py-2.5 text-sm font-bold text-white" style={{ background: "linear-gradient(90deg, #7c3aed, #ec4899)" }}>
          <span>👁️ Viewing as: <span className="underline">{impersonation.agentName}</span> ({impersonation.agentEmail})</span>
          <button
            onClick={() => {
              localStorage.removeItem(IMPERSONATE_KEY);
              setImpersonation(null);
              window.location.href = "/agent/agents";
            }}
            className="bg-white/20 hover:bg-white/30 rounded-full px-4 py-1 font-black transition-all text-xs"
          >
            ← Return to HQ
          </button>
        </div>
      )}
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 bg-white border-r border-slate-200 shadow-lg ${navOpen ? "w-64" : "w-16"}`}>
        {/* Logo + Toggle button at top */}
        <div className="flex items-center gap-2 px-2 py-3 border-b border-slate-200">
          <button
            onClick={() => setNavOpen(!navOpen)}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-600 hover:bg-blue-500 transition-colors text-white text-xl font-bold"
            title={navOpen ? "Hide labels" : "Show labels"}
          >
            {navOpen ? "◀" : "☰"}
          </button>
          {navOpen && (
            <div>
              <p className="text-slate-900 font-black text-sm">Zeniva</p>
              <p className="text-slate-500 text-xs">Agent Portal</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== "/agent" && pathname?.startsWith(link.href));
            return (
              <div key={link.href} className="relative group">
                <Link href={link.href}
                  onClick={() => {
                    // Clear inbox unread count when clicking Chat Hub
                    if (link.href === "/agent/chat" && typeof window !== "undefined") {
                      localStorage.setItem("zeniva_inbox_last_seen", new Date().toISOString());
                      setNavBadges((prev) => { const n = { ...prev }; delete n["/agent/chat"]; return n; });
                    }
                  }}
                  className={`flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-semibold transition-all ${active ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"}`}>
                  {link.icon === "lina" ? (
                    <img src="/branding/lina-avatar.png" alt="Lina" className="shrink-0 w-6 h-6 rounded-full object-cover border border-indigo-300" />
                  ) : (
                    <span className="text-base shrink-0 w-6 text-center">{link.icon}</span>
                  )}
                  {navOpen && <span className="flex-1">{link.label}</span>}
                  {navBadges[link.href] ? (
                    <span className="ml-auto rounded-full bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center px-1 shrink-0">
                      {navBadges[link.href]}
                    </span>
                  ) : null}
                </Link>
                {/* Tooltip when collapsed */}
                {!navOpen && (
                  <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <div className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl border border-slate-700">
                      {link.label}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {isHQorAdmin && (
            <>
              <div className="pt-2 pb-1">
                {navOpen
                  ? <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">HQ</p>
                  : <div className="border-t border-slate-200 mx-2 my-1" />
                }
              </div>
              {HQ_LINKS.map((link) => (
                <div key={link.href} className="relative group">
                  <Link href={link.href}
                    className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
                    <span className="text-base shrink-0 w-6 text-center">{link.icon}</span>
                    {navOpen && <span>{link.label}</span>}
                  </Link>
                  {!navOpen && (
                    <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <div className="bg-amber-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl border border-amber-600">
                        HQ · {link.label}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-amber-800" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {user?.email === "info@zeniva.ca" && ZENIVA_HQ_LINKS.map((link) => (
                <div key={link.href} className="relative group">
                  <Link href={link.href}
                    className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
                    <span className="text-base shrink-0 w-6 text-center">{link.icon}</span>
                    {navOpen && <span>{link.label}</span>}
                  </Link>
                  {!navOpen && (
                    <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <div className="bg-amber-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl border border-amber-600">
                        HQ · {link.label}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-amber-800" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </nav>

        {/* Toggle + user */}
        <div className="border-t border-slate-700/50 p-2 space-y-2">

          {navOpen && user && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-2">
              <p className="text-slate-800 text-xs font-semibold truncate">{user.name || user.email}</p>
              <p className="text-slate-500 text-xs truncate">{effectiveRole}</p>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-rose-500 text-xs mt-1 font-semibold hover:text-rose-700 disabled:opacity-60 disabled:cursor-wait"
              >
                {loggingOut ? "Déconnexion…" : "Déconnexion"}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 transition-all duration-300 min-h-screen ${navOpen ? "ml-64" : "ml-16"}`} style={{ background: "#F3F6FB" }}>
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

          {/* TOP HEADER */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Zeniva · Agent Portal</p>
              <h1 className="text-4xl font-black mt-1" style={{ color: PREMIUM_BLUE }}>
                Good morning{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
              </h1>
              <p className="text-slate-500 text-sm mt-1">Your command cockpit — fully real-time</p>
            </div>
            <div className="flex gap-3">
              {canTripSearch && (
                <Link href="/agent/trip-search"
                  className="rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-lg flex items-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${BRAND_BLUE}, ${PREMIUM_BLUE})` }}>
                  ✈️ Trip Search
                </Link>
              )}
              <Link href="/agent/clients"
                className="rounded-full px-5 py-2.5 text-sm font-bold border-2 flex items-center gap-2"
                style={{ borderColor: PREMIUM_BLUE, color: PREMIUM_BLUE }}>
                👥 Clients
              </Link>
            </div>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {kpis.map((k) => (
              <div key={k.label} onClick={() => openKpiDrawer(k.key)} className={`rounded-2xl border p-4 bg-white ${k.color} shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all`}>
                <p className="text-2xl">{k.icon}</p>
                <p className="text-2xl font-black mt-1" style={{ color: PREMIUM_BLUE }}>{k.value}</p>
                <p className="text-xs font-semibold text-slate-600 mt-0.5">{k.label}</p>
                <p className="text-xs text-slate-400">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT: AI AGENTS */}
            <div className="lg:col-span-2 space-y-6">

              {/* AI AGENTS SECTION */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100" style={{ background: `linear-gradient(135deg, ${PREMIUM_BLUE} 0%, ${BRAND_BLUE} 100%)` }}>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-200">Artificial Intelligence</p>
                    <h2 className="text-xl font-black text-white">Your AI Agent Team</h2>
                  </div>
                  <button onClick={() => window.location.href = "/ai-agents"} className="rounded-full px-4 py-1.5 text-xs font-bold bg-white/20 text-white hover:bg-white/30 transition border border-white/30">
                    Full view →
                  </button>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(isHQorAdmin ? AI_AGENTS : AI_AGENTS.filter(a => ["lina","marco","sofia","luna"].includes(a.id))).map((agent) => {
                    const cfg = STATUS_CFG[agent.status];
                    const isAlive = agent.status === "live" || agent.status === "active";
                    const accentColor = agent.color;
                    return (
                      <div key={agent.id} onClick={() => { const r = AGENT_ROUTES[agent.id]; if (r?.startsWith("http")) window.open(r, "_blank"); else if (r) router.push(r); }}
                        className="group relative bg-white rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-gray-300/50 hover:-translate-y-2 border border-gray-200">
                        {/* Character image area */}
                        <div className="relative w-full aspect-square overflow-hidden flex items-end justify-center"
                          style={{ background: `linear-gradient(135deg, ${accentColor}08, ${accentColor}15)` }}>
                          {agent.avatar ? (
                            <img src={agent.avatar} alt={agent.name}
                              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-8xl"
                              style={{ background: `linear-gradient(135deg, ${accentColor}10, ${accentColor}05)` }}>
                              {agent.emoji}
                            </div>
                          )}
                          {/* Status dot only */}
                          <div className="absolute top-4 right-4">
                            <span className={`flex items-center justify-center w-6 h-6 rounded-full bg-white/90 shadow-md border border-gray-200`}>
                              <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot} ${isAlive ? 'animate-pulse' : ''}`} />
                            </span>
                          </div>
                          {/* Gradient fade */}
                          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent" />
                        </div>
                        {/* Info */}
                        <div className="px-4 pb-4 -mt-8 relative z-10">
                          <h3 className="text-lg font-black text-gray-900 tracking-tight">{agent.name}</h3>
                          <p className="text-xs font-semibold mt-0.5 mb-2 line-clamp-1" style={{ color: accentColor }}>{agent.type}</p>
                          <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{agent.description}</p>
                          {/* Feature pills */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {agent.features.slice(0, 3).map(f => (
                              <span key={f} className="text-[9px] font-semibold px-2 py-0.5 rounded-lg border"
                                style={{ background: `${accentColor}08`, borderColor: `${accentColor}25`, color: accentColor }}>{f}</span>
                            ))}
                            {agent.features.length > 3 && (
                              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-lg bg-gray-50 text-gray-400 border border-gray-200">+{agent.features.length - 3} more</span>
                            )}
                          </div>
                          {/* Discover button */}
                          <div className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all duration-300 group-hover:gap-3"
                            style={{ background: `${accentColor}10`, color: accentColor, border: `1px solid ${accentColor}25` }}>
                            Discover {agent.name}
                            <svg className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CLIENTS 360 */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <h2 className="font-black text-lg" style={{ color: PREMIUM_BLUE }}>Client 360°</h2>
                  <Link href="/agent/clients" className="text-sm font-bold" style={{ color: BRAND_BLUE }}>View all →</Link>
                </div>
                <div className="p-4">
                  {dashStats?.recent_clients?.length > 0 ? (
                    <div className="space-y-2">
                      {dashStats.recent_clients.slice(0, 5).map((c: any) => (
                        <div key={c.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 hover:border-blue-200 hover:bg-blue-50 transition cursor-pointer" onClick={() => window.location.href = "/agent/clients"}>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white"
                              style={{ background: `linear-gradient(135deg, ${BRAND_BLUE}, ${PREMIUM_BLUE})` }}>
                              {(c.name || "?")[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold" style={{ color: PREMIUM_BLUE }}>{c.name}</p>
                              <p className="text-xs text-slate-500">{c.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {c.destination && <p className="text-xs font-semibold text-blue-600">✈️ {c.destination}</p>}
                            <p className="text-xs text-slate-400">{c.last_contact}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-4">No clients yet — <Link href="/agent/clients" className="text-blue-600 font-semibold">Add a client</Link></p>
                  )}
                </div>
              </div>

              {/* ACTIVITY FEED */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <h2 className="font-black text-lg" style={{ color: PREMIUM_BLUE }}>Live Activity</h2>
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live · 30s
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {activity.length === 0 ? (
                    <p className="px-6 py-4 text-sm text-slate-400">No recent activity.</p>
                  ) : (
                    activity.slice(0, 15).map((a: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 px-6 py-3">
                        <span className="text-base mt-0.5">
                          {a.type === "email" ? "📧" : a.type === "sms" ? "📱" : a.type === "chat" ? "💬" : a.type === "lead_new" ? "🎯" : a.type === "client_converted" ? "🏆" : "⚡"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{a.client_name || a.description || a.action}</p>
                          <p className="text-xs text-slate-400 truncate">{a.message || a.destination || a.details || ""}</p>
                        </div>
                        <p className="text-xs text-slate-400 shrink-0">{a.time_ago || a.time || ""}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="space-y-6">

              {/* QUICK ACTIONS */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
                <h2 className="font-black text-lg mb-4" style={{ color: PREMIUM_BLUE }}>Quick Actions</h2>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "New Client", href: "/agent/clients", icon: "👥", color: "bg-blue-600" },
                    { label: "New Dossier", href: "/agent/clients", icon: "📁", color: "bg-indigo-600" },
                    { label: "Proposal", href: "/agent/proposals", icon: "📋", color: "bg-purple-600" },
                    { label: "Chat Lina", href: "/agent/lina", icon: "lina", color: "bg-emerald-600" },
                    { label: "Booking", href: "/agent/bookings", icon: "✈️", color: "bg-amber-600" },
                    { label: "Commissions", href: "/agent/commissions", icon: "💰", color: "bg-rose-600" },
                  ].map((a) => (
                    <Link key={a.label} href={a.href}
                      className={`${a.color} rounded-xl px-3 py-3 text-white text-xs font-bold flex items-center gap-2 hover:opacity-90 transition`}>
                      {a.icon === "lina" ? (
                        <img src="/branding/lina-avatar.png" alt="Lina" className="w-5 h-5 rounded-full object-cover border border-white/40" />
                      ) : (
                        <span className="text-base">{a.icon}</span>
                      )}
                      {a.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* HQ: NEW TRAVELERS */}
              {isHQorAdmin && (
                <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-black text-base" style={{ color: PREMIUM_BLUE }}>New Travelers</h2>
                    <Link href="/agent/clients" className="text-xs font-bold" style={{ color: BRAND_BLUE }}>View all</Link>
                  </div>
                  {recentTravelers.length === 0 ? (
                    <p className="text-xs text-slate-400">Aucun nouveau voyageur.</p>
                  ) : (
                    <div className="space-y-2">
                      {recentTravelers.map((t: any) => (
                        <div key={t.id} className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                            style={{ background: BRAND_BLUE }}>
                            {(t.name || t.email || "?")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate" style={{ color: PREMIUM_BLUE }}>{t.name || "—"}</p>
                            <p className="text-xs text-slate-400 truncate">{t.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* HQ: AGENT REQUESTS */}
              {isHQorAdmin && (
                <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-black text-base" style={{ color: PREMIUM_BLUE }}>Agent Requests</h2>
                    <Link href="/agent/requests" className="text-xs font-bold" style={{ color: BRAND_BLUE }}>View all</Link>
                  </div>
                  {agentRequests.length === 0 ? (
                    <p className="text-xs text-slate-400">No pending requests.</p>
                  ) : (
                    <div className="space-y-2">
                      {agentRequests.map((r: any) => (
                        <div key={r.id} className="rounded-lg border border-amber-200 bg-amber-50 p-2">
                          <p className="text-xs font-semibold" style={{ color: PREMIUM_BLUE }}>{r.name}</p>
                          <p className="text-xs text-slate-500">{r.email} · {r.role || "agent"}</p>
                          <Link href="/agent/requests" className="text-xs font-bold text-amber-700 mt-1 block">Approve →</Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* DOSSIERS EN COURS */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black text-base" style={{ color: PREMIUM_BLUE }}>Dossier Pipeline</h2>
                  <Link href="/agent/clients" className="text-xs font-bold" style={{ color: BRAND_BLUE }}>Create →</Link>
                </div>
                {dashStats?.recent_dossiers?.length > 0 ? (
                  <div className="space-y-2">
                    {dashStats.recent_dossiers.map((d: any) => (
                      <div key={d.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                        <p className="text-xs font-bold" style={{ color: PREMIUM_BLUE }}>{d.title}</p>
                        <p className="text-xs text-slate-500">{d.client_name} · {d.destination || "—"}</p>
                        <span className="text-xs font-semibold text-blue-600 mt-1 inline-block">{d.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border-2 border-dashed border-slate-200 p-4 text-center">
                    <p className="text-xs text-slate-400">No open dossiers.</p>
                    <Link href="/agent/clients" className="text-xs font-bold text-blue-600 mt-1 block">Create a dossier →</Link>
                  </div>
                )}
              </div>

              {/* OUTILS */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
                <h2 className="font-black text-base mb-3" style={{ color: PREMIUM_BLUE }}>Agent Tools</h2>
                <div className="space-y-1.5">
                  {[
                    { label: "📊 AI Agents Dashboard", href: "/ai-agents" },
                    { label: "🗂️ Client Profiles", href: "/agent/clients" },
                    { label: "📋 Bookings Center", href: "/agent/bookings" },
                    { label: "💰 Commissions", href: "/agent/commissions" },
                    { label: "📄 Documents", href: "/agent/documents" },
                  ].map((t) => (
                    <Link key={t.href} href={t.href} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
                      {t.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Agent modal removed — avatars now navigate directly to agent pages */}

      {/* Trip Search modal removed — now uses /agent/trip-search page */}

      {/* KPI 360° Drawer */}
      {kpiDrawer && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[60]" onClick={() => setKpiDrawer(null)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-[70] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-slate-900">
                {kpiDrawer === "clients" && "Active Clients"}
                {kpiDrawer === "leads" && "All Leads"}
                {kpiDrawer === "emails" && "Emails Sent"}
                {kpiDrawer === "sms" && "SMS Sent"}
                {kpiDrawer === "commissions" && "Commission Pipeline"}
                {kpiDrawer === "chats" && "Lina Chats"}
              </h2>
              <button onClick={() => setKpiDrawer(null)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>

            <div className="p-6">
              {kpiLoading && (
                <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
              )}

              {!kpiLoading && kpiData && kpiDrawer === "clients" && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-500 mb-3">{kpiData.items?.length || 0} clients</p>
                  {(kpiData.items || []).map((c: any) => (
                    <div key={c.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900 text-sm">{c.name}</p>
                        {c.primary_division && <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold">{c.primary_division}</span>}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{c.email || "—"}</p>
                      {c.phone && <p className="text-xs text-slate-400">{c.phone}</p>}
                      <div className="flex gap-3 mt-2 text-[10px] text-slate-400">
                        {c.origin && <span>Origin: {c.origin}</span>}
                        {c.lead_source && <span>Source: {c.lead_source}</span>}
                        <span>{new Date(c.created_at).toLocaleDateString("en-CA")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!kpiLoading && kpiData && kpiDrawer === "leads" && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-500 mb-3">{kpiData.items?.length || 0} leads (100 derniers)</p>
                  {(kpiData.items || []).map((l: any) => (
                    <div key={l.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900 text-sm">{l.first_name} {l.last_name || ""}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${l.status === "new" ? "bg-blue-100 text-blue-700" : l.status === "contacted" ? "bg-yellow-100 text-yellow-700" : "bg-emerald-100 text-emerald-700"}`}>{l.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{l.email}</p>
                      <div className="flex gap-3 mt-2 text-[10px] text-slate-400">
                        {l.destination && <span>Dest: {l.destination}</span>}
                        {l.source && <span>Source: {l.source}</span>}
                        {l.language && <span>Lang: {l.language.toUpperCase()}</span>}
                        <span>{new Date(l.created_at).toLocaleDateString("en-CA")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!kpiLoading && kpiData && kpiDrawer === "emails" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Campaigns ({kpiData.campaigns?.length || 0})</h3>
                    <div className="space-y-2">
                      {(kpiData.campaigns || []).map((c: any) => (
                        <div key={c.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-slate-900 text-sm truncate flex-1">{c.name}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ml-2 ${c.status === "sent" ? "bg-emerald-100 text-emerald-700" : c.status === "draft" ? "bg-gray-100 text-gray-700" : "bg-amber-100 text-amber-700"}`}>{c.status}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 truncate">{c.subject}</p>
                          <div className="flex gap-4 mt-2 text-xs">
                            <span className="text-emerald-600 font-semibold">{c.sent_count} sent</span>
                            <span className="text-red-500 font-semibold">{c.failed_count} failed</span>
                            <span className="text-slate-400">{c.recipient_count} recipients</span>
                            <span className="text-slate-400">{c.audience_type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Recent Emails ({kpiData.recent?.length || 0})</h3>
                    <div className="space-y-1">
                      {(kpiData.recent || []).slice(0, 30).map((e: any) => (
                        <div key={e.id} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg text-xs">
                          <div className="flex-1 min-w-0">
                            <span className="text-slate-700 font-medium truncate block">{e.recipient}</span>
                            <span className="text-slate-400 truncate block">{e.subject}</span>
                          </div>
                          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${e.status === "sent" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{e.status}</span>
                            <span className="text-slate-400 text-[10px]">{new Date(e.created_at).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!kpiLoading && kpiData && kpiDrawer === "sms" && (
                <div>
                  {(kpiData.items || []).length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-4xl mb-3">📱</p>
                      <p className="text-sm font-semibold text-slate-700">Aucun SMS envoy&eacute;</p>
                      <p className="text-xs text-slate-400 mt-1">Les SMS apparaitront ici quand Luna sera active.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(kpiData.items || []).map((s: any, i: number) => (
                        <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm">
                          <p className="font-medium text-slate-900">{s.recipient || s.to}</p>
                          <p className="text-xs text-slate-500 mt-1">{s.message || s.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!kpiLoading && kpiData && kpiDrawer === "commissions" && (
                <div>
                  {(kpiData.bookings || []).length === 0 && (kpiData.commissions || []).length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-4xl mb-3">💰</p>
                      <p className="text-sm font-semibold text-slate-700">Aucune commission en cours</p>
                      <p className="text-xs text-slate-400 mt-1">Les commissions apparaitront apr&egrave;s les premi&egrave;res r&eacute;servations.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(kpiData.bookings || []).map((b: any) => (
                        <div key={b.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                          <div className="flex justify-between">
                            <span className="text-sm font-semibold text-slate-900">Booking</span>
                            <span className="text-sm font-bold text-emerald-600">${b.commission_amount}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">Status: {b.status} | {new Date(b.created_at).toLocaleDateString("en-CA")}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!kpiLoading && kpiData && kpiDrawer === "chats" && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-500 mb-3">{kpiData.items?.length || 0} messages r&eacute;cents</p>
                  {(kpiData.items || []).map((m: any) => (
                    <div key={m.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900 text-sm">{m.sender || "—"}</p>
                        <span className="text-[10px] text-slate-400">{new Date(m.created_at).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{m.content}</p>
                      {m.channel_id && <p className="text-[10px] text-slate-400 mt-1">Channel: {m.channel_id}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Trip Search modal removed — now uses /agent/trip-search page */}
    </div>
  );
}

import AppAgentGate from "../../src/components/AppAgentGate.client";

export default function AgentPage() {
  return (
    <AppAgentGate>
      <AgentDashboardPage />
    </AppAgentGate>
  );
}
export const dynamic = "force-dynamic";
