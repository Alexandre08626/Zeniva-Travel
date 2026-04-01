"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Campaign { id: string; name: string; status: string; recipient_count: number; sent_count: number; failed_count: number; sent_at: string | null; created_at: string; }

const tabs = [
  { label: "Campaigns", href: "/agent/outreach" },
  { label: "Templates", href: "/agent/outreach/templates" },
  { label: "Contacts", href: "/agent/outreach/contacts" },
  { label: "Analytics", href: "/agent/outreach/analytics" },
];

const statusColors: Record<string, string> = { draft: "bg-gray-100 text-gray-700", scheduled: "bg-blue-100 text-blue-700", sending: "bg-amber-100 text-amber-700", sent: "bg-green-100 text-green-700", failed: "bg-red-100 text-red-700" };

export default function AnalyticsPage() {
  const pathname = usePathname();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try { const res = await fetch("/api/outreach/campaigns"); if (res.ok) { const data = await res.json(); setCampaigns(data.campaigns || []); } } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const sentCampaigns = campaigns.filter((c) => c.status === "sent");
  const totalSent = campaigns.reduce((s, c) => s + (c.sent_count || 0), 0);
  const totalFailed = campaigns.reduce((s, c) => s + (c.failed_count || 0), 0);
  const deliveryRate = totalSent + totalFailed > 0 ? ((totalSent / (totalSent + totalFailed)) * 100).toFixed(1) + "%" : "\u2014";
  const avgRecipients = sentCampaigns.length > 0 ? Math.round(sentCampaigns.reduce((s, c) => s + c.recipient_count, 0) / sentCampaigns.length) : 0;

  const chartData = sentCampaigns.slice(0, 10).map((c) => ({ name: c.name.length > 20 ? c.name.slice(0, 20) + "..." : c.name, sent: c.sent_count || 0, failed: c.failed_count || 0 }));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-lg">S</div>
          <div><h1 className="text-2xl font-bold text-slate-900">Campaign Analytics</h1><p className="text-sm text-slate-500">Performance metrics &amp; insights</p></div>
        </div>

        <div className="flex gap-1 mb-6 bg-white rounded-xl border border-slate-200 p-1 w-fit">
          {tabs.map((tab) => (<Link key={tab.href} href={tab.href} className={"px-4 py-2 rounded-lg text-sm font-semibold transition-colors " + (pathname === tab.href ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100")}>{tab.label}</Link>))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Emails Sent", value: loading ? "\u2014" : totalSent.toLocaleString() },
            { label: "Campaigns Sent", value: loading ? "\u2014" : sentCampaigns.length },
            { label: "Delivery Rate", value: loading ? "\u2014" : deliveryRate },
            { label: "Avg Recipients", value: loading ? "\u2014" : avgRecipients },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">{s.label}</p><p className="text-2xl font-bold text-slate-900 mt-1">{s.value}</p></div>
          ))}
        </div>

        {chartData.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Emails per Campaign</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="sent" fill="#7c3aed" name="Sent" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-slate-200"><h2 className="text-sm font-bold text-slate-900">Campaign Performance</h2></div>
          {sentCampaigns.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No sent campaigns yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50"><tr><th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th><th className="text-left px-4 py-3 font-semibold text-slate-600">Sent Date</th><th className="text-left px-4 py-3 font-semibold text-slate-600">Recipients</th><th className="text-left px-4 py-3 font-semibold text-slate-600">Sent</th><th className="text-left px-4 py-3 font-semibold text-slate-600">Failed</th><th className="text-left px-4 py-3 font-semibold text-slate-600">Success</th></tr></thead>
              <tbody>
                {sentCampaigns.map((c) => {
                  const rate = c.sent_count + c.failed_count > 0 ? ((c.sent_count / (c.sent_count + c.failed_count)) * 100).toFixed(1) : "\u2014";
                  return (<tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50"><td className="px-4 py-3 font-medium text-slate-900">{c.name}</td><td className="px-4 py-3 text-slate-500">{c.sent_at ? new Date(c.sent_at).toLocaleDateString("en-CA") : "\u2014"}</td><td className="px-4 py-3 text-slate-600">{c.recipient_count}</td><td className="px-4 py-3 text-emerald-600 font-semibold">{c.sent_count}</td><td className="px-4 py-3 text-red-500 font-semibold">{c.failed_count}</td><td className="px-4 py-3 text-slate-700 font-semibold">{rate}%</td></tr>);
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h2>
          {campaigns.length === 0 ? (<p className="text-sm text-slate-500">No activity yet.</p>) : (
            <div className="space-y-3">
              {campaigns.slice(0, 10).map((c) => (
                <div key={c.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-900 truncate">{c.name}</p><p className="text-xs text-slate-500">{c.recipient_count} recipients</p></div>
                  <span className={"px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 " + (statusColors[c.status] || "bg-slate-100 text-slate-600")}>{c.status}</span>
                  <span className="text-xs text-slate-400 flex-shrink-0">{c.created_at ? new Date(c.created_at).toLocaleDateString("en-CA") : ""}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
