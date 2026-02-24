"use client";

import { useMemo, useState } from "react";
import { FORM_DEFINITIONS } from "../../../src/lib/forms/catalog";

const BRAND_BLUE = "#1e3a5f";
const BRAND_GOLD = "#c8a951";

export default function TravelFormClient() {
  const form = useMemo(() => FORM_DEFINITIONS.find((f) => f.id === "travel-agent"), []);
  const [fields, setFields] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  if (!form) {
    return <div className="p-6">Form not found.</div>;
  }

  const onChange = (id: string, value: any) => {
    setFields((prev) => ({ ...prev, [id]: value }));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId: form.id, ...fields }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to submit");
      }
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Failed to submit");
    }
  };

  if (status === "success") {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0a1628 0%, #1e3a5f 50%, #0a1628 100%)" }}>
        <div className="mx-auto max-w-lg px-5 py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: "rgba(200,169,81,0.15)" }}>
            <span className="text-4xl">✈️</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Your Account is Ready!</h1>
          <p className="text-lg text-slate-300 mb-2">
            Welcome to <span style={{ color: BRAND_GOLD }} className="font-bold">Zeniva Travel</span>, {fields.name || "traveler"}!
          </p>
          <p className="text-sm text-slate-400 mb-8">
            Your personal travel profile has been created. Our AI assistant <strong className="text-white">Lina</strong> is already working on your dream trip
            {fields.destination ? ` to ${fields.destination}` : ""}! 🌍
          </p>
          <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 text-left mb-8 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">What happens next</p>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs text-emerald-400">1</span>
              <p className="text-sm text-slate-300">Lina analyzes your preferences and finds the best options</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs text-emerald-400">2</span>
              <p className="text-sm text-slate-300">You'll receive personalized travel proposals by email</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs text-emerald-400">3</span>
              <p className="text-sm text-slate-300">Chat with Lina anytime to refine your trip</p>
            </div>
          </div>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold text-white transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${BRAND_GOLD}, #b8952e)` }}
          >
            💬 Chat with Lina now
          </a>
          <p className="mt-4 text-xs text-slate-500">
            A confirmation has been sent to <strong className="text-slate-400">{fields.email}</strong>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a1628 0%, #1e3a5f 50%, #0a1628 100%)" }}>
      <div className="mx-auto max-w-xl px-5 py-10">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: "rgba(200,169,81,0.15)" }}>
            <span className="text-3xl">✈️</span>
          </div>
          <h1 className="text-3xl font-black text-white">{form.title}</h1>
          <p className="mt-2 text-sm text-slate-400">{form.description}</p>
          <p className="mt-1 text-xs text-slate-500">Powered by <span style={{ color: BRAND_GOLD }} className="font-semibold">Zeniva Travel</span></p>
        </header>

        <form onSubmit={onSubmit} className="rounded-2xl border border-slate-700 bg-slate-800/60 backdrop-blur p-6 shadow-2xl space-y-4">
          {form.fields.map((field) => (
            <label key={field.id} className="flex flex-col gap-1 text-sm font-semibold text-slate-300">
              {field.label}
              {field.required && <span className="text-xs font-normal text-slate-500">(required)</span>}
              {field.type === "select" ? (
                <select
                  value={fields[field.id] || ""}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  className="rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={fields[field.id] || ""}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              )}
            </label>
          ))}

          {error && <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">{error}</div>}

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-full px-4 py-3.5 text-sm font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${BRAND_GOLD}, #b8952e)` }}
          >
            {status === "sending" ? "Creating your account..." : "🚀 Create my account & start planning"}
          </button>

          <p className="text-center text-xs text-slate-500">
            By submitting, you agree to our terms. Your data is secure with us.
          </p>
        </form>
      </div>
    </main>
  );
}
