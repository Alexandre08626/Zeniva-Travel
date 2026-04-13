"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const RANGES = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
];

const PIE_COLORS = ["#7c3aed", "#0F6CF5", "#10b981", "#f59e0b", "#ef4444"];

function TrendBadge({ value }: { value: number }) {
  if (value === 0) return <span className="text-xs text-slate-400">--</span>;
  const up = value > 0;
  return (
    <span className={"text-xs font-semibold " + (up ? "text-emerald-600" : "text-red-500")}>
      {up ? "\u2191" : "\u2193"} {Math.abs(value)}%
    </span>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState(30);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/outreach/analytics?range=" + range);
      if (res.ok) setData(await res.json());
    } catch { /* silent */ } finally { setLoading(false); }
  }, [range]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const stats = data?.stats || {};

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header + Date Range */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Campaign Analytics</h2>
        <div className="flex gap-1 bg-white rounded-lg border border-slate-200 p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={"px-3 py-1.5 rounded-md text-xs font-semibold transition-colors " + (range === r.value ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100")}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards with Trends */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Emails Sent", value: stats.totalSent?.toLocaleString() || "0", trend: stats.sentTrend, color: "text-violet-600" },
          { label: "Campaigns", value: stats.totalCampaigns || 0, trend: stats.campaignTrend, color: "text-blue-600" },
          { label: "Delivery Rate", value: (stats.deliveryRate || 0) + "%", color: "text-emerald-600" },
          { label: "This Period", value: (stats.currentPeriodSent || 0).toLocaleString(), subtitle: stats.currentPeriodCampaigns + " campaigns", color: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">{s.label}</p>
              {s.trend !== undefined && <TrendBadge value={s.trend} />}
            </div>
            <p className={"text-2xl font-bold " + s.color}>{loading ? "\u2014" : s.value}</p>
            {s.subtitle && <p className="text-xs text-slate-400 mt-0.5">{s.subtitle}</p>}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Volume Chart (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Email Volume Over Time</h3>
          {loading ? (
            <div className="h-64 bg-slate-50 rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data?.dailyVolume || []}>
                <defs>
                  <linearGradient id="gradSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="sent" stroke="#7c3aed" fill="url(#gradSent)" strokeWidth={2} name="Sent" />
                <Area type="monotone" dataKey="failed" stroke="#ef4444" fill="url(#gradFailed)" strokeWidth={1.5} name="Failed" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Audience Pie (1/3) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">By Audience</h3>
          {loading || !(data?.audienceBreakdown?.length) ? (
            <div className="h-48 flex items-center justify-center text-sm text-slate-400">No data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={data.audienceBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} strokeWidth={2}>
                    {data.audienceBreakdown.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {data.audienceBreakdown.map((a: any, i: number) => (
                  <div key={a.name} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-xs text-slate-600">{a.name} ({a.value})</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top Campaigns Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Top Campaigns</h3>
          <Link href="/agent/outreach" className="text-xs text-violet-600 hover:text-violet-800 font-semibold">View all</Link>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />)}</div>
        ) : (data?.topCampaigns || []).length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No sent campaigns yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Campaign</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Audience</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Sent</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Failed</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Success</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {(data?.topCampaigns || []).map((c: any) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={"/agent/outreach/" + c.id} className="font-medium text-violet-600 hover:text-violet-800 truncate block max-w-[200px]">{c.name}</Link>
                    </td>
                    <td className="px-4 py-3 text-slate-500 capitalize hidden sm:table-cell">{c.audience_type}</td>
                    <td className="px-4 py-3 text-emerald-600 font-semibold">{c.sent_count}</td>
                    <td className="px-4 py-3 text-red-500 font-semibold">{c.failed_count}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: c.success_rate + "%" }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{c.success_rate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{c.sent_at ? new Date(c.sent_at).toLocaleDateString("en-CA") : "\u2014"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
        </div>
        {(data?.recentActivity || []).length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No activity yet</div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
            {(data?.recentActivity || []).map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className={"w-2 h-2 rounded-full flex-shrink-0 " + (a.status === "sent" ? "bg-emerald-500" : "bg-red-500")} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 truncate">{a.subject || a.recipient}</p>
                </div>
                <span className="text-[10px] text-slate-400 flex-shrink-0">{a.created_at ? new Date(a.created_at).toLocaleDateString("en-CA") : ""}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
