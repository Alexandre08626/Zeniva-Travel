"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FORM_DEFINITIONS } from "../../../src/lib/forms/catalog";
import { TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE } from "../../../src/design/tokens";

function YachtFormClient() {
  const form = useMemo(() => FORM_DEFINITIONS.find((f) => f.id === "yacht-jason"), []);
  const searchParams = useSearchParams();
  const agentEmail = (searchParams.get("agent") || "").trim();
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
        body: JSON.stringify({ formId: form.id, agentEmail, ...fields }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to submit");
      }
      setStatus("success");
      if (agentEmail) {
        window.location.href = "/agent/clients";
      }
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Failed to submit");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-xl px-5 py-10">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Yacht lead form</p>
          <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>{form.title}</h1>
          <p className="text-sm" style={{ color: MUTED_TEXT }}>{form.description}</p>
        </header>

        <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          {form.fields.map((field) => (
            <label key={field.id} className="flex flex-col gap-1 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              {field.label}
              {field.type === "select" ? (
                <select
                  value={fields[field.id] || ""}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === "checkbox" ? (
                <input
                  type="checkbox"
                  checked={Boolean(fields[field.id])}
                  onChange={(e) => onChange(field.id, e.target.checked)}
                  className="h-4 w-4"
                />
              ) : (
                <input
                  type={field.type}
                  value={fields[field.id] || ""}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              )}
            </label>
          ))}

          {error && <div className="text-xs text-red-600">{error}</div>}
          {status === "success" && <div className="text-xs text-emerald-600">Thanks! Your request has been sent.</div>}

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-full px-4 py-3 text-sm font-bold text-white"
            style={{ backgroundColor: PREMIUM_BLUE }}
          >
            {status === "sending" ? "Sending..." : "Submit"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function YachtFormPage() {
  return <YachtFormClient />;
}
