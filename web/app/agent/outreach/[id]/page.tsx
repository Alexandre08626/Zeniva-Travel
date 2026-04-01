"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Campaign {
  id: string;
  name: string;
  status: string;
  audience_type: string;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  opened_count: number;
  clicked_count: number;
  subject: string;
  html_body: string;
  preview_text: string | null;
  from_name: string;
  from_email: string;
  template_id: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Recipient {
  id: string;
  email: string;
  name: string | null;
  company_name: string | null;
  status: string;
  sent_at: string | null;
  error_message: string | null;
  source_table: string | null;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  scheduled: "bg-blue-100 text-blue-700",
  sending: "bg-amber-100 text-amber-700",
  sent: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-500",
  pending: "bg-slate-100 text-slate-600",
  bounced: "bg-orange-100 text-orange-700",
};

const audienceLabels: Record<string, string> = {
  travelers: "Travelers",
  agents: "Agents",
  agencies: "Agencies",
};

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "recipients" | "preview">("overview");
  const [resending, setResending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/outreach/campaigns/" + id);
      if (res.ok) {
        const data = await res.json();
        setCampaign(data.campaign);
        setRecipients(data.recipients || []);
      }
    } catch { /* silent */ } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleResend = async () => {
    if (!campaign) return;
    setResending(true);
    try {
      const res = await fetch("/api/outreach/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: campaign.id }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.sent + " emails sent, " + data.failed + " failed");
        fetchData();
      } else {
        showToast(data.error || "Failed to send");
      }
    } catch { showToast("Error sending"); } finally { setResending(false); }
  };

  const handleDelete = async () => {
    if (!campaign || !confirm("Delete this campaign permanently?")) return;
    const res = await fetch("/api/outreach/campaigns/" + campaign.id, { method: "DELETE" });
    if (res.ok) router.push("/agent/outreach");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            <div className="grid grid-cols-4 gap-4">{[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-white rounded-xl border border-slate-200" />)}</div>
            <div className="h-64 bg-white rounded-xl border border-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-700">Campaign not found</p>
          <Link href="/agent/outreach" className="text-violet-600 text-sm font-semibold mt-2 inline-block">Back to Campaigns</Link>
        </div>
      </div>
    );
  }

  const successRate = campaign.sent_count + campaign.failed_count > 0
    ? ((campaign.sent_count / (campaign.sent_count + campaign.failed_count)) * 100).toFixed(1)
    : "\u2014";

  const pendingCount = recipients.filter((r) => r.status === "pending").length;
  const sentRecipients = recipients.filter((r) => r.status === "sent");
  const failedRecipients = recipients.filter((r) => r.status === "failed");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toast */}
        {toast && <div className="fixed top-4 right-4 z-50 bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg">{toast}</div>}

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/agent/outreach" className="text-slate-400 hover:text-slate-600 text-xl">{"\u2190"}</Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{campaign.name}</h1>
                <span className={"px-2.5 py-1 rounded-full text-xs font-bold " + (statusColors[campaign.status] || "bg-gray-100 text-gray-600")}>{campaign.status.toUpperCase()}</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">{campaign.subject}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {pendingCount > 0 && (
              <button onClick={handleResend} disabled={resending} className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 disabled:opacity-50">
                {resending ? "Sending..." : "Send " + pendingCount + " Pending"}
              </button>
            )}
            <button onClick={handleDelete} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100">Delete</button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Recipients</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{campaign.recipient_count}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Sent</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{campaign.sent_count}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Failed</p>
            <p className="text-2xl font-bold text-red-500 mt-1">{campaign.failed_count}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Pending</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Success Rate</p>
            <p className="text-2xl font-bold text-violet-600 mt-1">{successRate === "\u2014" ? "\u2014" : successRate + "%"}</p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl border border-slate-200 p-1 w-fit">
          {(["overview", "recipients", "preview"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={"px-4 py-2 rounded-lg text-sm font-semibold transition-colors " + (tab === t ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100")}>
              {t === "overview" ? "Overview" : t === "recipients" ? "Recipients (" + recipients.length + ")" : "Email Preview"}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campaign Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Campaign Details</h2>
              <div className="space-y-4">
                {[
                  { label: "Campaign Name", value: campaign.name },
                  { label: "Subject Line", value: campaign.subject },
                  { label: "From", value: campaign.from_name + " <" + campaign.from_email + ">" },
                  { label: "Audience", value: audienceLabels[campaign.audience_type] || campaign.audience_type },
                  { label: "Preview Text", value: campaign.preview_text || "\u2014" },
                  { label: "Created", value: new Date(campaign.created_at).toLocaleString() },
                  { label: "Sent", value: campaign.sent_at ? new Date(campaign.sent_at).toLocaleString() : "\u2014" },
                  { label: "Scheduled", value: campaign.scheduled_at ? new Date(campaign.scheduled_at).toLocaleString() : "\u2014" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-start border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{item.label}</p>
                    <p className="text-sm text-slate-900 text-right max-w-[60%]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Breakdown */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Delivery Breakdown</h2>
                <div className="space-y-3">
                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden flex">
                    {campaign.sent_count > 0 && (
                      <div className="bg-emerald-500 h-4" style={{ width: (campaign.sent_count / campaign.recipient_count * 100) + "%" }} />
                    )}
                    {campaign.failed_count > 0 && (
                      <div className="bg-red-400 h-4" style={{ width: (campaign.failed_count / campaign.recipient_count * 100) + "%" }} />
                    )}
                    {pendingCount > 0 && (
                      <div className="bg-amber-300 h-4" style={{ width: (pendingCount / campaign.recipient_count * 100) + "%" }} />
                    )}
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" />Sent: {campaign.sent_count}</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400" />Failed: {campaign.failed_count}</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-300" />Pending: {pendingCount}</span>
                  </div>
                </div>
              </div>

              {/* Failed recipients summary */}
              {failedRecipients.length > 0 && (
                <div className="bg-white rounded-xl border border-red-200 p-6">
                  <h2 className="text-sm font-bold text-red-600 uppercase tracking-wide mb-3">Failed Deliveries ({failedRecipients.length})</h2>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {failedRecipients.slice(0, 10).map((r) => (
                      <div key={r.id} className="flex items-start justify-between text-xs border-b border-red-50 pb-2 last:border-0">
                        <div>
                          <p className="font-medium text-slate-900">{r.email}</p>
                          {r.name && <p className="text-slate-500">{r.name}</p>}
                        </div>
                        <p className="text-red-500 max-w-[50%] text-right truncate">{r.error_message || "Unknown error"}</p>
                      </div>
                    ))}
                    {failedRecipients.length > 10 && <p className="text-xs text-slate-400">...and {failedRecipients.length - 10} more</p>}
                  </div>
                </div>
              )}

              {/* Sent recipients summary */}
              {sentRecipients.length > 0 && (
                <div className="bg-white rounded-xl border border-emerald-200 p-6">
                  <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-wide mb-3">Delivered ({sentRecipients.length})</h2>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {sentRecipients.slice(0, 10).map((r) => (
                      <div key={r.id} className="flex items-center justify-between text-xs border-b border-emerald-50 pb-2 last:border-0">
                        <div>
                          <p className="font-medium text-slate-900">{r.email}</p>
                          {r.name && <p className="text-slate-500">{r.name}{r.company_name ? " \u2014 " + r.company_name : ""}</p>}
                        </div>
                        <p className="text-slate-400">{r.sent_at ? new Date(r.sent_at).toLocaleTimeString() : ""}</p>
                      </div>
                    ))}
                    {sentRecipients.length > 10 && <p className="text-xs text-slate-400">...and {sentRecipients.length - 10} more</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recipients Tab */}
        {tab === "recipients" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {recipients.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No recipients.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Email</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Company</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Sent At</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipients.map((r) => (
                      <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{r.name || "\u2014"}</td>
                        <td className="px-4 py-3 text-slate-600">{r.email}</td>
                        <td className="px-4 py-3 text-slate-600">{r.company_name || "\u2014"}</td>
                        <td className="px-4 py-3">
                          <span className={"px-2 py-0.5 rounded-full text-xs font-semibold " + (statusColors[r.status] || "bg-slate-100 text-slate-600")}>{r.status}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{r.sent_at ? new Date(r.sent_at).toLocaleString() : "\u2014"}</td>
                        <td className="px-4 py-3 text-red-500 text-xs max-w-[200px] truncate">{r.error_message || ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Preview Tab */}
        {tab === "preview" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900">Email Preview</h2>
              <p className="text-xs text-slate-500">Subject: {campaign.subject}</p>
            </div>
            <div className="flex justify-center bg-slate-100 rounded-lg p-4">
              <iframe
                srcDoc={campaign.html_body.replace(/\{\{[A-Z_]+\}\}/g, "")}
                title="Email Preview"
                style={{ width: 620, height: 700, border: "1px solid #e2e8f0", borderRadius: 8, background: "white" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
