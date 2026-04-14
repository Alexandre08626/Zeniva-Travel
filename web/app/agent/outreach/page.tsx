"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useOutreach } from "./components/OutreachContext";

interface Campaign {
  id: string;
  name: string;
  status: string;
  audience_type: string;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  subject: string;
  sent_at: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  scheduled: "bg-blue-100 text-blue-700",
  sending: "bg-amber-100 text-amber-700",
  sent: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-500",
};

const audienceLabels: Record<string, string> = {
  travelers: "Travelers",
  agents: "Agents",
  agencies: "Agencies",
};

export default function OutreachPage() {
  const { setChatContext, setChatOpen } = useOutreach();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);


  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/outreach/campaigns");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const handleDuplicate = async (c: Campaign) => {
    await fetch("/api/outreach/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Copy of " + c.name, subject: c.subject, html_body: "", audience_type: c.audience_type, status: "draft" }),
    });
    fetchCampaigns();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/outreach/campaigns/" + deleteId, { method: "DELETE" });
      if (res.ok) {
        setCampaigns((prev) => prev.filter((c) => c.id !== deleteId));
      }
    } catch { /* silent */ } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const askSofiaAbout = (c: Campaign) => {
    setChatContext({ campaignId: c.id, campaignName: c.name });
    setChatOpen(true);
  };

  const totalSent = campaigns.reduce((s, c) => s + (c.sent_count || 0), 0);
  const totalFailed = campaigns.reduce((s, c) => s + (c.failed_count || 0), 0);
  const deliveryRate = totalSent + totalFailed > 0 ? ((totalSent / (totalSent + totalFailed)) * 100).toFixed(1) + "%" : "\u2014";
  const activeCampaigns = campaigns.filter((c) => c.status === "sending" || c.status === "scheduled").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Campaigns", value: loading ? "\u2014" : campaigns.length, icon: "\ud83d\udcec" },
          { label: "Emails Sent", value: loading ? "\u2014" : totalSent.toLocaleString(), icon: "\ud83d\udce7" },
          { label: "Delivery Rate", value: loading ? "\u2014" : deliveryRate, icon: "\ud83d\udcc8" },
          { label: "Active", value: loading ? "\u2014" : activeCampaigns, icon: "\ud83d\udfe2" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">{s.label}</p>
              <span className="text-lg">{s.icon}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>


      {/* Campaign Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">All Campaigns</h2>
          <span className="text-xs text-slate-400">{campaigns.length} campaigns</span>
        </div>
        {loading ? (
          <div className="p-6 space-y-4">{[1, 2, 3].map((i) => (<div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />))}</div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">{"\ud83d\udcec"}</div>
            <p className="text-lg font-semibold text-slate-700">No campaigns yet</p>
            <p className="text-sm text-slate-500 mb-4">Create your first campaign to get started.</p>
            <Link href="/agent/outreach/new" className="inline-block px-5 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 font-semibold text-sm">
              Create Campaign
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Audience</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Recipients</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Sent / Failed</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={"/agent/outreach/" + c.id} className="font-medium text-violet-600 hover:text-violet-800">{c.name}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={"px-2 py-0.5 rounded-full text-xs font-semibold " + (statusColors[c.status] || "bg-gray-100 text-gray-600")}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{audienceLabels[c.audience_type] || c.audience_type}</td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{c.recipient_count}</td>
                    <td className="px-4 py-3">
                      <span className="text-emerald-600 font-semibold">{c.sent_count}</span>
                      <span className="text-slate-400"> / </span>
                      <span className="text-red-500 font-semibold">{c.failed_count}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{c.sent_at ? new Date(c.sent_at).toLocaleDateString("en-CA") : new Date(c.created_at).toLocaleDateString("en-CA")}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={"/agent/outreach/" + c.id} className="text-xs text-violet-600 hover:text-violet-800 font-semibold">View</Link>
                        <button onClick={() => askSofiaAbout(c)} className="text-xs text-pink-500 hover:text-pink-700 font-semibold" title="Ask Sofia about this campaign">Sofia</button>
                        <button onClick={() => handleDuplicate(c)} className="text-xs text-slate-500 hover:text-slate-700 font-semibold">Dup</button>
                        <button onClick={() => setDeleteId(c.id)} className="text-xs text-red-500 hover:text-red-700 font-semibold">Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Campaign?</h3>
            <p className="text-sm text-slate-600 mb-4">This will permanently delete the campaign and all its recipients. This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} disabled={deleting} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-50">{deleting ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
