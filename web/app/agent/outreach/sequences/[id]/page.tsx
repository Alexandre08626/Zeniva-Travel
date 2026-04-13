"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-700",
  paused: "bg-amber-100 text-amber-700",
  completed: "bg-blue-100 text-blue-700",
  sent: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  pending: "bg-amber-100 text-amber-700",
};

export default function SequenceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "enrollments">("overview");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/outreach/sequences/" + id);
      if (res.ok) setData(await res.json());
    } catch { /* silent */ } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleStatus = async () => {
    if (!data?.sequence) return;
    const newStatus = data.sequence.status === "active" ? "paused" : "active";
    await fetch("/api/outreach/sequences/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchData();
  };

  if (loading) {
    return <div className="p-8"><div className="h-64 bg-white rounded-xl border border-slate-200 animate-pulse" /></div>;
  }

  if (!data?.sequence) {
    return <div className="p-8 text-center text-slate-500">Sequence not found</div>;
  }

  const seq = data.sequence;
  const steps = data.steps || [];
  const enrollments = data.enrollments || [];
  const activeEnrollments = enrollments.filter((e: any) => e.status === "active").length;
  const completedEnrollments = enrollments.filter((e: any) => e.status === "completed").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/agent/outreach/sequences" className="text-slate-400 hover:text-slate-600 text-xl">{"\u2190"}</Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{seq.name}</h1>
              <span className={"px-2 py-0.5 rounded-full text-xs font-semibold " + (statusColors[seq.status] || "bg-slate-100 text-slate-600")}>{seq.status}</span>
            </div>
            {seq.description && <p className="text-sm text-slate-500 mt-1">{seq.description}</p>}
          </div>
        </div>
        <button onClick={toggleStatus} className={"px-4 py-2 rounded-lg text-sm font-semibold " + (seq.status === "active" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-green-100 text-green-700 hover:bg-green-200")}>
          {seq.status === "active" ? "Pause" : "Activate"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase font-semibold">Steps</p>
          <p className="text-2xl font-bold text-slate-900">{steps.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase font-semibold">Enrolled</p>
          <p className="text-2xl font-bold text-slate-900">{enrollments.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase font-semibold">Active</p>
          <p className="text-2xl font-bold text-emerald-600">{activeEnrollments}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase font-semibold">Completed</p>
          <p className="text-2xl font-bold text-blue-600">{completedEnrollments}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        {(["overview", "enrollments"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={"px-4 py-2 rounded-lg text-sm font-semibold " + (tab === t ? "bg-violet-600 text-white" : "bg-white border border-slate-200 text-slate-600")}>
            {t === "overview" ? "Steps" : "Enrollments (" + enrollments.length + ")"}
          </button>
        ))}
      </div>

      {/* Overview - Steps Timeline */}
      {tab === "overview" && (
        <div className="space-y-4">
          {steps.map((step: any, i: number) => (
            <div key={step.id} className="relative">
              {i > 0 && <div className="absolute -top-4 left-6 w-0.5 h-4 bg-violet-200" />}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-bold">{step.step_order}</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">{step.subject}</p>
                    <p className="text-xs text-slate-500">
                      {step.delay_days === 0 ? "Sent immediately" : "Wait " + step.delay_days + " day" + (step.delay_days !== 1 ? "s" : "")}
                      {i > 0 ? " after step " + i : " after enrollment"}
                    </p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <pre className="text-xs text-slate-600 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">{step.html_body.slice(0, 300)}{step.html_body.length > 300 ? "..." : ""}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enrollments */}
      {tab === "enrollments" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {enrollments.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="text-sm">No contacts enrolled yet.</p>
              <p className="text-xs mt-1">Activate the sequence and enroll contacts to start sending.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Contact</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Step</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Next Send</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e: any) => (
                  <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{e.contact_name || "\u2014"}</td>
                    <td className="px-4 py-3 text-slate-600">{e.contact_email}</td>
                    <td className="px-4 py-3 text-slate-600">{e.current_step} / {steps.length}</td>
                    <td className="px-4 py-3">
                      <span className={"px-2 py-0.5 rounded-full text-xs font-semibold " + (statusColors[e.status] || "bg-slate-100 text-slate-600")}>{e.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{e.next_send_at ? new Date(e.next_send_at).toLocaleString("en-CA") : "\u2014"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
