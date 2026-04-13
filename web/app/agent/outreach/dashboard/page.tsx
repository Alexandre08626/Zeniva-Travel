"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useOutreach } from "../components/OutreachContext";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  scheduled: "bg-blue-100 text-blue-700",
  sending: "bg-amber-100 text-amber-700",
  sent: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

const commsTypeIcons: Record<string, string> = {
  email: "\u2709\ufe0f",
  sms: "\ud83d\udcf1",
  whatsapp: "\ud83d\udcac",
};

export default function DashboardPage() {
  const { setChatOpen } = useOutreach();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/outreach/dashboard");
      if (res.ok) setData(await res.json());
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const stats = data?.stats || {};
  const totalContacts = (stats.totalAgencies || 0) + (stats.totalLeads || 0) + (stats.totalClients || 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Contacts", value: loading ? "\u2014" : totalContacts.toLocaleString(), icon: "\ud83d\udc65", color: "text-violet-600" },
          { label: "Emails Sent", value: loading ? "\u2014" : (stats.totalSent || 0).toLocaleString(), icon: "\ud83d\udce7", color: "text-blue-600" },
          { label: "Delivery Rate", value: loading ? "\u2014" : (stats.deliveryRate || 0) + "%", icon: "\ud83d\udcc8", color: "text-emerald-600" },
          { label: "Active Campaigns", value: loading ? "\u2014" : stats.activeCampaigns || 0, icon: "\ud83d\ude80", color: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">{s.label}</p>
              <span className="text-xl">{s.icon}</span>
            </div>
            <p className={"text-3xl font-bold " + s.color}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "New Campaign", href: "/agent/outreach/new", icon: "\u2709\ufe0f", gradient: "from-violet-500 to-violet-600" },
          { label: "Create Template", href: "/agent/outreach/templates", icon: "\ud83c\udfa8", gradient: "from-pink-500 to-pink-600" },
          { label: "New Sequence", href: "/agent/outreach/sequences", icon: "\ud83d\udd04", gradient: "from-blue-500 to-blue-600" },
          { label: "Ask Sofia", href: "#", icon: "\ud83e\udde0", gradient: "from-amber-500 to-orange-500", onClick: true },
        ].map((a) => (
          a.onClick ? (
            <button
              key={a.label}
              onClick={() => setChatOpen(true)}
              className={"flex items-center gap-3 px-4 py-3 rounded-xl text-white font-semibold text-sm bg-gradient-to-r " + a.gradient + " hover:opacity-90 transition-opacity shadow-sm"}
            >
              <span className="text-lg">{a.icon}</span>
              {a.label}
            </button>
          ) : (
            <Link
              key={a.label}
              href={a.href}
              className={"flex items-center gap-3 px-4 py-3 rounded-xl text-white font-semibold text-sm bg-gradient-to-r " + a.gradient + " hover:opacity-90 transition-opacity shadow-sm"}
            >
              <span className="text-lg">{a.icon}</span>
              {a.label}
            </Link>
          )
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Volume Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Email Volume (8 weeks)</h2>
          {loading ? (
            <div className="h-48 bg-slate-50 rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data?.weeklyVolume || []}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip />
                <Area type="monotone" dataKey="sent" stroke="#7c3aed" fill="url(#colorSent)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pipeline Snapshot */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Pipeline Snapshot</h2>
          <div className="space-y-4">
            {[
              { label: "Agencies", count: stats.totalAgencies || 0, color: "bg-violet-500", max: totalContacts },
              { label: "Leads", count: stats.totalLeads || 0, color: "bg-blue-500", max: totalContacts },
              { label: "Clients", count: stats.totalClients || 0, color: "bg-emerald-500", max: totalContacts },
            ].map((p) => (
              <div key={p.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-700">{p.label}</span>
                  <span className="text-sm font-bold text-slate-900">{loading ? "\u2014" : p.count.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={p.color + " h-full rounded-full transition-all duration-500"} style={{ width: p.max > 0 ? Math.max(2, (p.count / p.max) * 100) + "%" : "0%" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Audience Campaign Breakdown */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">Campaigns by Audience</h3>
            <div className="grid grid-cols-3 gap-3">
              {(data?.audienceBreakdown || []).map((a: any) => (
                <div key={a.type} className="text-center">
                  <p className="text-lg font-bold text-slate-900">{a.campaigns}</p>
                  <p className="text-[11px] text-slate-500 capitalize">{a.type}</p>
                  <p className="text-[10px] text-slate-400">{a.sent} sent</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: Recent Campaigns + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Campaigns */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Recent Campaigns</h2>
            <Link href="/agent/outreach" className="text-xs text-violet-600 hover:text-violet-800 font-semibold">View all</Link>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />)}</div>
          ) : (data?.recentCampaigns || []).length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No campaigns yet</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {(data?.recentCampaigns || []).map((c: any) => (
                <Link key={c.id} href={"/agent/outreach/" + c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.recipient_count} recipients</p>
                  </div>
                  <span className={"px-2 py-0.5 rounded-full text-xs font-semibold " + (statusColors[c.status] || "bg-slate-100 text-slate-600")}>{c.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />)}</div>
          ) : (data?.recentActivity || []).length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No activity yet</div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
              {(data?.recentActivity || []).map((a: any) => (
                <div key={a.id} className="flex items-start gap-3 px-4 py-3">
                  <span className="text-base mt-0.5">{commsTypeIcons[a.type] || "\ud83d\udce8"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 truncate">{a.subject || a.recipient}</p>
                    <p className="text-xs text-slate-500 truncate">{a.recipient}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={"px-1.5 py-0.5 rounded text-[10px] font-semibold " + (a.status === "sent" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>{a.status}</span>
                    <p className="text-[10px] text-slate-400 mt-1">{a.created_at ? new Date(a.created_at).toLocaleDateString("en-CA") : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
