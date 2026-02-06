"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FORM_DEFINITIONS, FormDefinition } from "../../../src/lib/forms/catalog";
import { useAuthStore, hasDivision, isHQ } from "../../../src/lib/authStore";
import { useRequireAnyPermission } from "../../../src/lib/roleGuards";
import { TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE } from "../../../src/design/tokens";

function buildFormLink(form: FormDefinition, agentEmail?: string) {
  if (form.id === "yacht-jason") return "/forms/yacht";
  if (form.id === "travel-agent") return "/forms/travel";
  return "/agent/forms";
}

export default function AgentFormsPage() {
  useRequireAnyPermission(["sales:all", "sales:yacht"], "/agent");
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);
  const isAdmin = Boolean(user?.roles?.includes("admin") || user?.role === "admin");
  const [copied, setCopied] = useState<string | null>(null);

  const allowedForms = useMemo(() => {
    if (hq || isAdmin) return FORM_DEFINITIONS;
    return FORM_DEFINITIONS.filter((form) => hasDivision(user, form.division));
  }, [hq, isAdmin, user]);

  const onCopy = async (form: FormDefinition) => {
    const url = buildFormLink(form, user?.email || "");
    try {
      await navigator.clipboard.writeText(url);
      setCopied(form.id);
      setTimeout(() => setCopied(null), 1500);
    } catch (_) {
      setCopied(null);
    }
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F3F6FB" }}>
      <div className="mx-auto max-w-5xl px-5 py-8 space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Forms</p>
            <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>Marketing forms</h1>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>Marketing forms automatically attributed to agents and divisions.</p>
          </div>
          <Link href="/agent" className="rounded-full px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: PREMIUM_BLUE }}>
            Back to dashboard
          </Link>
        </header>

        {allowedForms.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm" style={{ color: MUTED_TEXT }}>
            No forms available for your account.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {allowedForms.map((form) => {
              const url = buildFormLink(form, user?.email || "");
              return (
                <div key={form.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{form.division}</div>
                      <h2 className="text-xl font-extrabold" style={{ color: TITLE_TEXT }}>{form.title}</h2>
                    </div>
                    <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">{form.origin}</span>
                  </div>
                  <p className="mt-2 text-sm" style={{ color: MUTED_TEXT }}>{form.description}</p>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 break-all">
                    {url}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={url} className="rounded-full px-4 py-2 text-xs font-semibold text-white" style={{ backgroundColor: PREMIUM_BLUE }}>
                      Open form
                    </Link>
                    <button
                      type="button"
                      onClick={() => onCopy(form)}
                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold"
                      style={{ color: TITLE_TEXT }}
                    >
                      {copied === form.id ? "Copied" : "Copy link"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
