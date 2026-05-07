"use client";
import { useState } from "react";
import { getHandoffDict, type HandoffLocale } from "./handoffDict";

export interface NoAgentFallbackProps {
  locale: HandoffLocale;
  cartSnapshot: Record<string, unknown>;
  defaultName?: string;
  defaultEmail?: string;
  sourcePage?: string;
  onClose: () => void;
}

export default function NoAgentFallback({
  locale,
  cartSnapshot,
  defaultName,
  defaultEmail,
  sourcePage,
  onClose,
}: NoAgentFallbackProps) {
  const dict = getHandoffDict(locale);
  const [name, setName] = useState(defaultName || "");
  const [email, setEmail] = useState(defaultEmail || "");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setState("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/handoff/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
          cart_snapshot: cartSnapshot,
          source_page: sourcePage,
          locale,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed");
      setState("ok");
    } catch (err: any) {
      setState("error");
      setErrorMsg(err?.message || "Failed to send");
    }
  }

  if (state === "ok") {
    return (
      <div className="text-center py-4">
        <div className="text-5xl mb-3">✅</div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">{dict.leadSuccessTitle}</h3>
        <p className="text-slate-600 mb-6">{dict.leadSuccessDesc}</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl bg-slate-900 text-white px-6 py-3 font-bold hover:bg-slate-800 transition"
        >
          {dict.cancel}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-2xl font-black text-slate-900">{dict.noAgentTitle}</h3>
          <p className="text-slate-600 mt-1.5">{dict.noAgentDesc}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-full bg-slate-100 hover:bg-slate-200 w-9 h-9 flex items-center justify-center text-slate-600 transition"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <Field
          label={dict.nameLabel}
          required
          value={name}
          onChange={setName}
          placeholder="Jordan Rivera"
        />
        <Field
          label={dict.emailLabel}
          required
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@email.com"
        />
      </div>
      <Field label={dict.phoneLabel} type="tel" value={phone} onChange={setPhone} placeholder="+1 555 123 4567" />
      <label className="block mt-3 mb-5">
        <span className="text-sm font-bold text-slate-700 mb-1.5 block">{dict.messageLabel}</span>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none"
        />
      </label>

      <button
        type="submit"
        disabled={state === "submitting" || !name.trim() || !email.trim()}
        className="w-full rounded-2xl bg-slate-900 text-white px-6 py-3.5 font-black shadow-lg transition hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state === "submitting" ? dict.submitting : dict.submit}
      </button>

      {errorMsg ? <p className="mt-3 text-sm font-semibold text-red-600 text-center">{errorMsg}</p> : null}
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700 mb-1.5 block">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
      />
    </label>
  );
}
