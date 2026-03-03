"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FORM_DEFINITIONS } from "../../../src/lib/forms/catalog";

const BRAND_BLUE = "#0B1B4D";
const BRAND_LIGHT_BLUE = "#0F6CF5";
const BRAND_GOLD = "#E6B85A";

export default function TravelFormClient() {
  const searchParams = useSearchParams();
  const agentEmail = searchParams.get("agent") || "";

  const form = useMemo(() => FORM_DEFINITIONS.find((f) => f.id === "travel-agent"), []);
  const [fields, setFields] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [agentName, setAgentName] = useState<string>("");

  // Extract agent name from email if present
  useEffect(() => {
    if (agentEmail) {
      const name = agentEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      setAgentName(name);
    }
  }, [agentEmail]);

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
      const payload: Record<string, any> = { formId: form.id, ...fields };
      if (agentEmail) {
        payload.agentEmail = agentEmail;
        payload.referredBy = agentEmail;
      }
      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const p = await res.json().catch(() => ({}));
        throw new Error(p?.error || "Failed to submit");
      }
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Failed to submit");
    }
  };

  if (status === "success") {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, #040d1f 0%, ${BRAND_BLUE} 50%, #040d1f 100%)` }}>
        <div className="mx-auto max-w-lg px-5 py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full overflow-hidden border-4" style={{ borderColor: BRAND_LIGHT_BLUE }}>
            <img src="/branding/lina-avatar.png" alt="Lina" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Your Account is Ready! ✈️</h1>
          <p className="text-lg text-slate-300 mb-2">
            Welcome to <span style={{ color: BRAND_LIGHT_BLUE }} className="font-bold">Zeniva Travel</span>, {fields.name || "traveler"}!
          </p>
          <p className="text-sm text-slate-400 mb-8">
            Lina is already working on your dream trip{fields.destination ? ` to ${fields.destination}` : ""}! 🌍
          </p>
          <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 text-left mb-8 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">What happens next</p>
            {[
              "Lina analyzes your preferences and finds the best options",
              "You'll receive personalized travel proposals by email",
              "Chat or call Lina anytime to refine your trip",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs" style={{ backgroundColor: "rgba(15,108,245,0.2)", color: BRAND_LIGHT_BLUE }}>{i + 1}</span>
                <p className="text-sm text-slate-300">{step}</p>
              </div>
            ))}
          </div>
          <a
            href="/agent/lina"
            className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold text-white transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${BRAND_LIGHT_BLUE}, #0851c4)` }}
          >
            📞 Call Lina now
          </a>
          <p className="mt-4 text-xs text-slate-500">
            A confirmation has been sent to <strong className="text-slate-400">{fields.email}</strong>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: `linear-gradient(135deg, #040d1f 0%, ${BRAND_BLUE} 50%, #040d1f 100%)` }}>
      <div className="mx-auto max-w-xl px-5 py-10">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full overflow-hidden border-4" style={{ borderColor: BRAND_LIGHT_BLUE }}>
            <img src="/branding/lina-avatar.png" alt="Lina" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-3xl font-black text-white">{form.title}</h1>
          <p className="mt-2 text-sm text-slate-400">{form.description}</p>
          {agentEmail ? (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1" style={{ borderColor: BRAND_LIGHT_BLUE, backgroundColor: "rgba(15,108,245,0.1)" }}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: BRAND_LIGHT_BLUE }} />
              <p className="text-xs font-semibold text-white">Referred by <span style={{ color: BRAND_LIGHT_BLUE }}>{agentName || agentEmail}</span></p>
            </div>
          ) : (
            <p className="mt-1 text-xs text-slate-500">Powered by <span style={{ color: BRAND_LIGHT_BLUE }} className="font-semibold">Zeniva Travel</span></p>
          )}
        </header>

        <form onSubmit={onSubmit} className="rounded-2xl border bg-slate-800/60 backdrop-blur p-6 shadow-2xl space-y-4" style={{ borderColor: "rgba(15,108,245,0.3)" }}>
          {form.fields.map((field) => (
            <label key={field.id} className="flex flex-col gap-1 text-sm font-semibold text-white">
              {field.label}
              {field.required && <span className="text-xs font-normal text-slate-400">(required)</span>}
              {field.type === "select" ? (
                <select
                  value={fields[field.id] || ""}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  className="rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2"
                  style={{ outline: "none" }}
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
                  className="rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2"
                />
              )}
            </label>
          ))}

          {error && <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">{error}</div>}

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-full px-4 py-3.5 text-sm font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${BRAND_LIGHT_BLUE}, #0851c4)` }}
          >
            {status === "sending" ? "Creating your account..." : "🚀 Create my account & start planning"}
          </button>

          <p className="text-center text-xs text-slate-500">
            By submitting, you agree to our <a href="/terms" className="underline">terms</a>. Your data is secure.
          </p>
        </form>
      </div>
    </main>
  );
}
