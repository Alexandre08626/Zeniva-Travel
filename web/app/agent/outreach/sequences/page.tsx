"use client";

import Link from "next/link";

export default function SequencesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900">Follow-up Sequences</h2>
        <Link href="/agent/outreach/sequences/new" className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700">
          + New Sequence
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
        <div className="text-4xl mb-3">{"\ud83d\udd04"}</div>
        <p className="text-lg font-semibold text-slate-700">Automated Follow-up Sequences</p>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          Create multi-step email sequences that automatically send follow-ups at scheduled intervals. Convert more leads into clients with consistent outreach.
        </p>
        <Link href="/agent/outreach/sequences/new" className="inline-block mt-4 px-5 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 font-semibold text-sm">
          Create Your First Sequence
        </Link>
      </div>
    </div>
  );
}
