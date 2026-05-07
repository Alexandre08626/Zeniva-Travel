"use client";
import { useState } from "react";

export type CareersRole = "travel_agent" | "influencer";

export interface CareersSignupFormProps {
  defaultRole?: CareersRole;
  copy: {
    title: string;
    subtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    roleLabel: string;
    roleAgent: string;
    roleInfluencer: string;
    noteLabel: string;
    notePlaceholder: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successDesc: string;
    duplicatePending: string;
    duplicateApproved: string;
    error: string;
  };
}

const GRADIENT_START = "#0B1B4D";
const GRADIENT_END = "#0F6CF5";
const GOLD_GRADIENT = "linear-gradient(135deg, #E6B85A, #C9941F)";

export default function CareersSignupForm({ defaultRole = "travel_agent", copy }: CareersSignupFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CareersRole>(defaultRole);
  const [note, setNote] = useState("");
  const [state, setState] = useState<
    | { kind: "idle" }
    | { kind: "submitting" }
    | { kind: "ok"; status: string; code: string | null }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setState({ kind: "submitting" });
    try {
      const res = await fetch("/api/agent-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          role,
          note: note.trim() || undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setState({ kind: "error", message: json?.error || copy.error });
        return;
      }
      setState({ kind: "ok", status: json.status || "pending", code: json.code || null });
    } catch (err: any) {
      setState({ kind: "error", message: err?.message || copy.error });
    }
  }

  if (state.kind === "ok") {
    const dup = state.status === "approved" ? copy.duplicateApproved : state.status === "pending" && state.code ? copy.duplicatePending : null;
    return (
      <div
        id="apply"
        className="rounded-3xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-8 sm:p-12 text-center shadow-lg"
      >
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">{copy.successTitle}</h3>
        <p className="text-slate-700 max-w-xl mx-auto">{dup || copy.successDesc}</p>
        {state.code ? (
          <p className="mt-4 text-sm text-slate-500">
            Code: <span className="font-mono font-bold text-slate-900">{state.code}</span>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form
      id="apply"
      onSubmit={onSubmit}
      className="rounded-3xl border-2 border-slate-200 bg-white p-8 sm:p-10 shadow-lg"
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">{copy.title}</h3>
        <p className="text-slate-600">{copy.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <label className="block">
          <span className="text-sm font-bold text-slate-700 mb-1.5 block">{copy.nameLabel}</span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={copy.namePlaceholder}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
          />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-700 mb-1.5 block">{copy.emailLabel}</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={copy.emailPlaceholder}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
          />
        </label>
      </div>

      <div className="mb-4">
        <span className="text-sm font-bold text-slate-700 mb-1.5 block">{copy.roleLabel}</span>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: "travel_agent" as const, label: copy.roleAgent, icon: "💼" },
              { value: "influencer" as const, label: copy.roleInfluencer, icon: "✨" },
            ]
          ).map((opt) => {
            const active = role === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                className={`rounded-xl border-2 px-4 py-3 text-left transition ${
                  active ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="text-xl mb-0.5">{opt.icon}</div>
                <div className={`text-sm font-bold ${active ? "text-blue-900" : "text-slate-700"}`}>{opt.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      <label className="block mb-6">
        <span className="text-sm font-bold text-slate-700 mb-1.5 block">{copy.noteLabel}</span>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={copy.notePlaceholder}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none"
        />
      </label>

      <button
        type="submit"
        disabled={state.kind === "submitting"}
        className="w-full rounded-2xl px-6 py-4 text-lg font-black shadow-lg transition hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: GOLD_GRADIENT, color: GRADIENT_START }}
      >
        {state.kind === "submitting" ? copy.submitting : copy.submit}
      </button>

      {state.kind === "error" ? (
        <p className="mt-4 text-sm font-semibold text-red-600 text-center">{state.message}</p>
      ) : null}

      <p className="mt-4 text-center text-xs text-slate-400">
        <span aria-hidden>🔒</span> Zeniva LLC · Delaware, USA
      </p>
    </form>
  );
}
