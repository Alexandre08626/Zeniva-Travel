"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Sequence {
  id: string;
  name: string;
  description: string | null;
  audience_type: string;
  status: string;
  step_count: number;
  enrolled_count: number;
  active_count: number;
  created_at: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-700",
  paused: "bg-amber-100 text-amber-700",
  completed: "bg-blue-100 text-blue-700",
};

export default function SequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchSequences = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/outreach/sequences");
      if (res.ok) setSequences((await res.json()).sequences || []);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSequences(); }, [fetchSequences]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch("/api/outreach/sequences/" + deleteId, { method: "DELETE" });
    setSequences((prev) => prev.filter((s) => s.id !== deleteId));
    setDeleteId(null);
  };

  const toggleStatus = async (seq: Sequence) => {
    const newStatus = seq.status === "active" ? "paused" : "active";
    await fetch("/api/outreach/sequences/" + seq.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchSequences();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Follow-up Sequences</h2>
          <p className="text-sm text-slate-500">Automated multi-step email sequences</p>
        </div>
        <Link href="/agent/outreach/sequences/new" className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700">
          + New Sequence
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Sequences", value: sequences.length, icon: "\ud83d\udd04" },
          { label: "Active", value: sequences.filter((s) => s.status === "active").length, icon: "\u25b6\ufe0f" },
          { label: "Contacts Enrolled", value: sequences.reduce((s, seq) => s + seq.enrolled_count, 0), icon: "\ud83d\udc65" },
          { label: "Currently Active", value: sequences.reduce((s, seq) => s + seq.active_count, 0), icon: "\ud83d\udce8" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">{s.label}</p>
              <span className="text-lg">{s.icon}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{loading ? "\u2014" : s.value}</p>
          </div>
        ))}
      </div>

      {/* Sequence List */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />)}</div>
      ) : sequences.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <div className="text-4xl mb-3">{"\ud83d\udd04"}</div>
          <p className="text-lg font-semibold text-slate-700">No sequences yet</p>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Create automated follow-up sequences to nurture leads with timed email steps.
          </p>
          <Link href="/agent/outreach/sequences/new" className="inline-block mt-4 px-5 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 font-semibold text-sm">
            Create Your First Sequence
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sequences.map((seq) => (
            <div key={seq.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <Link href={"/agent/outreach/sequences/" + seq.id} className="text-sm font-bold text-slate-900 hover:text-violet-600 truncate">{seq.name}</Link>
                    <span className={"px-2 py-0.5 rounded-full text-xs font-semibold " + (statusColors[seq.status] || "bg-slate-100 text-slate-600")}>{seq.status}</span>
                  </div>
                  {seq.description && <p className="text-xs text-slate-500 mb-2 truncate">{seq.description}</p>}
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span>{seq.step_count} step{seq.step_count !== 1 ? "s" : ""}</span>
                    <span>{seq.enrolled_count} enrolled</span>
                    <span>{seq.active_count} active</span>
                    <span className="capitalize">{seq.audience_type}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <button onClick={() => toggleStatus(seq)} className={"px-3 py-1.5 rounded-lg text-xs font-semibold " + (seq.status === "active" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-green-100 text-green-700 hover:bg-green-200")}>
                    {seq.status === "active" ? "Pause" : "Activate"}
                  </button>
                  <Link href={"/agent/outreach/sequences/" + seq.id} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-100 text-violet-700 hover:bg-violet-200">
                    View
                  </Link>
                  <button onClick={() => setDeleteId(seq.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Sequence?</h3>
            <p className="text-sm text-slate-600 mb-4">This will stop all active enrollments and permanently delete the sequence.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
