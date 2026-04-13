"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Step {
  delay_days: number;
  subject: string;
  html_body: string;
}

export default function NewSequencePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("agencies");
  const [steps, setSteps] = useState<Step[]>([{ delay_days: 1, subject: "", html_body: "" }]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  function updateStep(i: number, field: keyof Step, value: string | number) {
    setSteps((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  }

  function addStep() {
    const lastDelay = steps[steps.length - 1]?.delay_days || 1;
    setSteps([...steps, { delay_days: lastDelay + 2, subject: "", html_body: "" }]);
  }

  function removeStep(i: number) {
    if (steps.length <= 1) return;
    setSteps(steps.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    if (!name || steps.some((s) => !s.subject || !s.html_body)) {
      showToast("Name and all steps need subject + body");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/outreach/sequences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, audience_type: audience, steps }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push("/agent/outreach/sequences/" + data.sequence.id);
      } else {
        const err = await res.json();
        showToast(err.error || "Failed");
      }
    } catch { showToast("Error"); } finally { setSaving(false); }
  }

  const totalDays = steps.reduce((s, step) => s + step.delay_days, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      {toast && <div className="fixed top-4 right-4 z-50 bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg">{toast}</div>}

      <div className="flex items-center gap-4 mb-6">
        <Link href="/agent/outreach/sequences" className="text-slate-400 hover:text-slate-600 text-xl">{"\u2190"}</Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Create Sequence</h1>
          <p className="text-sm text-slate-500">Build an automated follow-up email sequence</p>
        </div>
      </div>

      {/* Sequence Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase">Sequence Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none" placeholder="e.g., Agency Follow-up 4-Step" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase">Audience</label>
            <select value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none">
              <option value="agencies">Agencies</option>
              <option value="travelers">Travelers</option>
              <option value="agents">Agents</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 uppercase">Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="Optional description..." />
        </div>
      </div>

      {/* Timeline indicator */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-semibold text-slate-500 uppercase">Sequence Timeline</span>
        <span className="text-xs text-slate-400">{steps.length} step{steps.length !== 1 ? "s" : ""} over {totalDays} days</span>
      </div>

      {/* Steps */}
      <div className="space-y-4 mb-6">
        {steps.map((step, i) => (
          <div key={i} className="relative">
            {/* Timeline connector */}
            {i > 0 && (
              <div className="absolute -top-4 left-6 w-0.5 h-4 bg-violet-200" />
            )}

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-bold">{i + 1}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Step {i + 1}</p>
                    <p className="text-xs text-slate-500">
                      {i === 0 ? "Sent after enrollment" : "Sent after previous step"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-500">Delay:</label>
                    <input
                      type="number"
                      min={0}
                      value={step.delay_days}
                      onChange={(e) => updateStep(i, "delay_days", parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-slate-200 rounded text-sm text-center focus:ring-2 focus:ring-violet-500 focus:outline-none"
                    />
                    <span className="text-xs text-slate-500">days</span>
                  </div>
                  {steps.length > 1 && (
                    <button onClick={() => removeStep(i)} className="text-red-400 hover:text-red-600 text-sm" title="Remove step">{"\u2715"}</button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase">Subject *</label>
                  <input
                    value={step.subject}
                    onChange={(e) => updateStep(i, "subject", e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                    placeholder="Email subject for this step"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase">HTML Body *</label>
                  <textarea
                    value={step.html_body}
                    onChange={(e) => updateStep(i, "html_body", e.target.value)}
                    rows={8}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-violet-500 focus:outline-none"
                    placeholder="HTML email content..."
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Step */}
      <button
        onClick={addStep}
        className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-sm font-semibold text-slate-500 hover:text-violet-600 hover:border-violet-300 transition-colors mb-6"
      >
        + Add Step
      </button>

      {/* Actions */}
      <div className="flex justify-between">
        <Link href="/agent/outreach/sequences" className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm">Cancel</Link>
        <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-violet-600 text-white rounded-xl font-semibold text-sm hover:bg-violet-700 disabled:opacity-50">
          {saving ? "Creating..." : "Create Sequence"}
        </button>
      </div>
    </div>
  );
}
