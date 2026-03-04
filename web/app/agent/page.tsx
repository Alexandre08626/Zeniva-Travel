"use client";
export const dynamic = "force-dynamic";
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

type AgentStatus = "live" | "active" | "idle" | "error";
type AIAgent = {
  id: string; name: string; emoji: string; avatar?: string;
  status: AgentStatus; type: string; schedule: string; color: string;
  desc: string; lastAction?: string;
};

const AI_AGENTS: AIAgent[] = [
  { id: "lina", name: "Lina", emoji: "🤖", avatar: "/agents/lina.png", status: "live", type: "AI Travel Concierge", schedule: "24/7 Real-time", color: "#6366f1", desc: "Répond aux chats, emails et appels. Connaît chaque client.", lastAction: "Chat répondu il y a 2min" },
  { id: "marco", name: "Marco", emoji: "🔥", avatar: "/agents/marco.png", status: "active", type: "Lead Hunter", schedule: "Toutes les 2h", color: "#ef4444", desc: "Identifie et qualifie les nouveaux leads automatiquement.", lastAction: "3 leads qualifiés" },
  { id: "sofia", name: "Sofia", emoji: "📬", avatar: "/agents/sofia.png", status: "active", type: "Email Converter", schedule: "Toutes les 6h", color: "#ec4899", desc: "Envoie des emails de relance et de conversion personnalisés.", lastAction: "39 emails envoyés" },
  { id: "noah", name: "Noah", emoji: "📧", avatar: "/agents/noah.png", status: "active", type: "Follow-up Agent", schedule: "Toutes les 6h", color: "#f59e0b", desc: "Relance automatique des leads inactifs + suivi dossiers.", lastAction: "Follow-up envoyé" },
  { id: "luna", name: "Luna", emoji: "📞", avatar: "/agents/luna.png", status: "live", type: "SMS & Call Agent", schedule: "24/7 Real-time", color: "#06b6d4", desc: "Handles inbound & outbound SMS. Triggers Lina calls.", lastAction: "4 SMS Sent" },
  { id: "atlas", name: "Atlas", emoji: "🛡️", avatar: "/agents/atlas.png", status: "active", type: "Cyber Guardian", schedule: "Toutes les heures", color: "#64748b", desc: "Surveille la sécurité du VPS et les intrusions.", lastAction: "Scan OK 14:00" },
  { id: "mia", name: "Mia", emoji: "📱", avatar: "/agents/mia.png", status: "idle", type: "Social Media", schedule: "Quotidien", color: "#a855f7", desc: "Publie sur TikTok, Instagram. En attente d'accès API.", lastAction: "En attente TikTok" },
  { id: "leo", name: "Leo", emoji: "📊", avatar: "/agents/leo.png", status: "active", type: "Analytics", schedule: "Real-time", color: "#8b5cf6", desc: "Analyse les conversions, le pipeline et les performances.", lastAction: "Rapport mis à jour" },
];

const STATUS_CFG: Record<AgentStatus, { label: string; dot: string; badge: string }> = {
  live: { label: "LIVE", dot: "bg-emerald-500 animate-pulse", badge: "bg-emerald-100 text-emerald-700" },
  active: { label: "Actif", dot: "bg-blue-500", badge: "bg-blue-100 text-blue-700" },
  idle: { label: "En attente", dot: "bg-amber-400", badge: "bg-amber-100 text-amber-700" },
  error: { label: "Erreur", dot: "bg-red-500", badge: "bg-red-100 text-red-700" },
};

const NAV_LINKS = [
  { label: "Dashboard", href: "/agent", icon: "🏠" },
  { label: "Clients", href: "/agent/clients", icon: "👥" },
  { label: "Dossiers", href: "/agent/clients", icon: "📁" },
  { label: "Proposals", href: "/agent/proposals", icon: "📋" },
  { label: "Bookings", href: "/agent/bookings", icon: "✈️" },
  { label: "Commissions", href: "/agent/commissions", icon: "💰" },
  { label: "Chat Hub", href: "/agent/chat", icon: "💬" },
  { label: "Lina AI Desk", href: "/agent/lina", icon: "🤖" },
  { label: "Listings", href: "/agent/listings", icon: "🏨" },
  { label: "Forms", href: "/agent/forms", icon: "📝" },
  { label: "Partners", href: "/agent/partners", icon: "🤝" },
  { label: "Finance", href: "/agent/finance", icon: "📊" },
  { label: "Control Tower", href: "/agent/control-tower", icon: "🗼" },
  { label: "Settings", href: "/agent/settings", icon: "⚙️" },
];

const HQ_LINKS = [
  { label: "Agent Command", href: "/agent/agents", icon: "🎯" },
  { label: "Agent Requests", href: "/agent/requests", icon: "📨" },
  { label: "Influencer", href: "/agent/influencer", icon: "⭐" },
  { label: "AI Agents Hub", href: "/ai-agents", icon: "🤖" },
];

export function AgentDashboardPage({ agentId }: { agentId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);
  const roles = user?.roles?.length ? user.roles : user?.role ? [user.role] : [];
  const effectiveRole = normalizeRbacRole(user?.effectiveRole) || normalizeRbacRole(roles[0]);
  const isHQorAdmin = effectiveRole === "hq" || effectiveRole === "admin" || hq;
  const canTripSearch = !!user && hasPermission(user, "sales:all");
  const resolvedAgentId = agentId || toAgentWorkspaceId(user);

  // Real-time stats
  const [dashStats, setDashStats] = useState<any>(null);
  const [vpsStats, setVpsStats] = useState<any>(null);
  const [recentTravelers, setRecentTravelers] = useState<any[]>([]);
  const [recentPartners, setRecentPartners] = useState<any[]>([]);
  const [agentRequests, setAgentRequests] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  // Trip search
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeSearchTab, setActiveSearchTab] = useState<"flights"|"hotels"|"transfers">("flights");

  const fetchAll = async () => {
    try {
      const [dashRes, statsRes, accountsRes, actRes] = await Promise.all([
        fetch("/api/agents-proxy?path=admin/dashboard-stats", { headers: { Authorization: AUTH } }),
        fetch("/api/agents-proxy?endpoint=stats", { headers: { Authorization: AUTH } }),
        hq ? fetch("/api/accounts") : Promise.resolve(null),
        fetch("/api/agents-proxy?endpoint=activity", { headers: { Authorization: AUTH } }),
      ]);
      if (dashRes.ok) setDashStats(await dashRes.json());
      if (statsRes.ok) setVpsStats(await statsRes.json());
      if (actRes.ok) { const d = await actRes.json(); setActivity(d?.activities || d?.activity || []); }
      if (accountsRes?.ok) {
        const d = await accountsRes.json();
        const accounts = Array.isArray(d?.data) ? d.data : [];
        setRecentTravelers(accounts.filter((a: any) => (a.roles || [a.role]).includes("traveler")).slice(0, 5));
        setRecentPartners(accounts.filter((a: any) => (a.roles || [a.role]).some((r: string) => r?.includes("partner"))).slice(0, 4));
      }
    } catch {}
    if (hq) {
      try {
        const reqRes = await fetch("/api/agent-requests");
        if (reqRes.ok) { const d = await reqRes.json(); setAgentRequests((d?.data || []).filter((r: any) => r.status === "pending").slice(0, 5)); }
      } catch {}
    }
  };

  useEffect(() => {
    fetchAll();
    const iv = setInterval(fetchAll, 30000);
    return () => clearInterval(iv);
  }, [hq]);

  useEffect(() => {
    if (resolvedAgentId) {
      try { window.localStorage.setItem("zeniva_agent_workspace", resolvedAgentId); } catch {}
    }
  }, [resolvedAgentId]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/agent/proposals?q=${encodeURIComponent(query.trim())}`);
  };

  const kpis = [
    { label: "Active Clients", value: dashStats?.active_clients ?? vpsStats?.total_clients ?? "—", icon: "👥", color: "bg-blue-50 border-blue-200", sub: `${dashStats?.open_dossiers ?? 0} dossiers` },
    { label: "Total Leads", value: vpsStats?.total_leads ?? "—", icon: "🎯", color: "bg-purple-50 border-purple-200", sub: `+${vpsStats?.leads_today ?? 0} today` },
    { label: "Emails Sent", value: vpsStats?.emails_sent ?? "—", icon: "📧", color: "bg-emerald-50 border-emerald-200", sub: `+${vpsStats?.emails_today ?? 0} today` },
    { label: "SMS Sent", value: vpsStats?.sms_sent ?? "—", icon: "📱", color: "bg-amber-50 border-amber-200", sub: `+${vpsStats?.sms_today ?? 0} today` },
    { label: "Comm. Pipeline", value: dashStats ? `$${dashStats.commission_pipeline.toLocaleString()}` : "—", icon: "💰", color: "bg-rose-50 border-rose-200", sub: `${dashStats?.followups_due ?? 0} follow-ups` },
    { label: "Lina Chats", value: vpsStats?.total_messages ?? "—", icon: "💬", color: "bg-indigo-50 border-indigo-200", sub: "Total conversations" },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "#0B1B4D" }}>
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ${navOpen ? "w-64" : "w-16"} bg-slate-900 border-r border-slate-700/50`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-700/50">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden" style={{ background: "linear-gradient(135deg,#0F6CF5,#0B1B4D)" }}>
            <LinaAvatar size="md" />
          </div>
          {navOpen && <div><p className="text-white font-black text-sm">Zeniva</p><p className="text-slate-400 text-xs">Agent Portal</p></div>}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== "/agent" && pathname?.startsWith(link.href));
            return (
              <div key={link.href} className="relative group">
                <Link href={link.href}
                  className={`flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-semibold transition-all ${active ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
                  <span className="text-base shrink-0 w-6 text-center">{link.icon}</span>
                  {navOpen && <span>{link.label}</span>}
                </Link>
                {/* Tooltip when collapsed */}
                {!navOpen && (
                  <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <div className="bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl border border-slate-600">
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
                  ? <p className="text-xs font-bold text-slate-600 uppercase tracking-widest px-2">HQ</p>
                  : <div className="border-t border-slate-700 mx-2 my-1" />
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
            </>
          )}
        </nav>

        {/* Toggle + user */}
        <div className="border-t border-slate-700/50 p-2 space-y-2">
          <button onClick={() => setNavOpen(!navOpen)} className="w-full flex items-center gap-2 rounded-xl px-2 py-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-sm">
            <span className="w-6 text-center text-base">{navOpen ? "◀" : "▶"}</span>
            {navOpen && <span>Collapse</span>}
          </button>
          {navOpen && user && (
            <div className="rounded-xl bg-slate-800 p-2">
              <p className="text-white text-xs font-semibold truncate">{user.name || user.email}</p>
              <p className="text-slate-400 text-xs truncate">{effectiveRole}</p>
              <button onClick={() => logout()} className="text-rose-400 text-xs mt-1 hover:text-rose-300">Déconnexion</button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 transition-all duration-300 ${navOpen ? "ml-64" : "ml-16"} min-h-screen`} style={{ background: "#F3F6FB" }}>
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

          {/* TOP HEADER */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Zeniva Travel · Agent Portal</p>
              <h1 className="text-4xl font-black mt-1" style={{ color: PREMIUM_BLUE }}>
                Good morning{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
              </h1>
              <p className="text-slate-500 text-sm mt-1">Your command cockpit — fully real-time</p>
            </div>
            <div className="flex gap-3">
              {canTripSearch && (
                <button onClick={() => setSearchOpen(true)}
                  className="rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-lg flex items-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${BRAND_BLUE}, ${PREMIUM_BLUE})` }}>
                  ✈️ Trip Search
                </button>
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
              <div key={k.label} className={`rounded-2xl border p-4 bg-white ${k.color} shadow-sm`}>
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
                  <Link href="/ai-agents" className="rounded-full px-4 py-1.5 text-xs font-bold bg-white/20 text-white hover:bg-white/30 transition">
                    Full view →
                  </Link>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {AI_AGENTS.map((agent) => {
                    const cfg = STATUS_CFG[agent.status];
                    return (
                      <button key={agent.id} onClick={() => setSelectedAgent(agent)}
                        className="rounded-xl border border-slate-200 p-3 text-left hover:border-blue-300 hover:shadow-md transition-all group bg-white">
                        <div className="flex items-start justify-between mb-2">
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow"
                            style={{ background: agent.color + "22" }}>
                            {agent.avatar
                              ? <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                              : <div className="w-full h-full flex items-center justify-center text-lg">{agent.emoji}</div>
                            }
                          </div>
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                        </div>
                        <p className="text-sm font-black" style={{ color: PREMIUM_BLUE }}>{agent.name}</p>
                        <p className="text-xs text-slate-500 leading-tight">{agent.type}</p>
                        {agent.lastAction && <p className="text-xs text-slate-400 mt-1 truncate">{agent.lastAction}</p>}
                        <div className="flex items-center gap-1 mt-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          <span className="text-xs text-slate-400">{agent.schedule}</span>
                        </div>
                      </button>
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
                        <div key={c.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 hover:border-blue-200 transition">
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
                    { label: "Chat Lina", href: "/agent/lina", icon: "🤖", color: "bg-emerald-600" },
                    { label: "Booking", href: "/agent/bookings", icon: "✈️", color: "bg-amber-600" },
                    { label: "Commissions", href: "/agent/commissions", icon: "💰", color: "bg-rose-600" },
                  ].map((a) => (
                    <Link key={a.label} href={a.href}
                      className={`${a.color} rounded-xl px-3 py-3 text-white text-xs font-bold flex items-center gap-2 hover:opacity-90 transition`}>
                      <span className="text-base">{a.icon}</span>
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

      {/* AGENT DETAIL PANEL */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 text-white" style={{ background: `linear-gradient(135deg, ${selectedAgent.color}, ${PREMIUM_BLUE})` }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/30 bg-white/10">
                    {selectedAgent.avatar
                      ? <img src={selectedAgent.avatar} alt={selectedAgent.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-3xl">{selectedAgent.emoji}</div>
                    }
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">{selectedAgent.name}</h2>
                    <p className="text-sm opacity-80">{selectedAgent.type}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${STATUS_CFG[selectedAgent.status].badge}`}>
                      {STATUS_CFG[selectedAgent.status].label}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedAgent(null)} className="rounded-full p-1.5 bg-white/20 hover:bg-white/30 text-white text-sm">✕</button>
              </div>
            </div>
            <div className="p-6 bg-white space-y-4">
              <p className="text-sm text-slate-700">{selectedAgent.desc}</p>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Statut</span>
                  <span className="font-bold" style={{ color: PREMIUM_BLUE }}>{STATUS_CFG[selectedAgent.status].label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Planification</span>
                  <span className="font-bold" style={{ color: PREMIUM_BLUE }}>{selectedAgent.schedule}</span>
                </div>
                {selectedAgent.lastAction && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Dernière action</span>
                    <span className="font-semibold text-emerald-600">{selectedAgent.lastAction}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Link href="/ai-agents" onClick={() => setSelectedAgent(null)}
                  className="flex-1 rounded-full py-2.5 text-sm font-bold text-white text-center"
                  style={{ background: selectedAgent.color }}>
                  Voir détails →
                </Link>
                <button onClick={() => setSelectedAgent(null)} className="rounded-full px-4 py-2.5 text-sm font-semibold border border-slate-200 text-slate-700">
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRIP SEARCH MODAL */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="p-6 text-white" style={{ background: `linear-gradient(135deg, ${BRAND_BLUE}, ${PREMIUM_BLUE})` }}>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black">✈️ Trip Search</h2>
                <button onClick={() => setSearchOpen(false)} className="rounded-full p-1.5 bg-white/20 hover:bg-white/30 text-white">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2 border-b border-slate-200 pb-4">
                {(["flights", "hotels", "transfers"] as const).map((t) => (
                  <button key={t} onClick={() => setActiveSearchTab(t)}
                    className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition ${activeSearchTab === t ? "text-white" : "bg-slate-100 text-slate-600"}`}
                    style={activeSearchTab === t ? { background: BRAND_BLUE } : {}}>
                    {t === "flights" ? "✈️ Vols" : t === "hotels" ? "🏨 Hôtels" : "🚗 Transfers"}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSearch} className="space-y-4">
                <textarea
                  value={query} onChange={(e) => setQuery(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm resize-none focus:outline-none focus:border-blue-400"
                  placeholder={activeSearchTab === "flights" ? "Ex: Vol Montréal → Cancún, 15 juillet, 2 personnes, économique..." : activeSearchTab === "hotels" ? "Ex: Hôtel 5 étoiles Cancún, 15-22 juillet, 2 adultes..." : "Ex: Transfer aéroport → hôtel Cancún, 15 juillet 14h..."}
                />
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 rounded-full py-3 text-sm font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${BRAND_BLUE}, ${PREMIUM_BLUE})` }}>
                    🔍 Rechercher avec Lina
                  </button>
                  <button type="button" onClick={() => setSearchOpen(false)} className="rounded-full px-5 py-3 text-sm font-semibold border border-slate-200 text-slate-700">
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AgentPage() {
  return <AgentDashboardPage />;
}
