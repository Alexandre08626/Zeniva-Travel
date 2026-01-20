"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "../../../src/lib/authStore";
import { TITLE_TEXT, MUTED_TEXT } from "../../../src/design/tokens";

const allowedEmails = new Set(["info@zeniva.ca"]);

type PartnerAccount = {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  divisions?: string[];
  status?: "active" | "disabled" | "suspended";
  createdAt: string;
};

export default function PartnerAccountsPage() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<PartnerAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const canView = !!user && allowedEmails.has(user.email?.toLowerCase() || "");

  useEffect(() => {
    if (!canView) return;
    let active = true;
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((payload) => {
        if (!active) return;
        const records = Array.isArray(payload?.data) ? payload.data : [];
        const partners = records.filter((r: PartnerAccount) => {
          const roles = Array.isArray(r.roles) && r.roles.length ? r.roles : r.role ? [r.role] : [];
          return roles.includes("partner_owner") || roles.includes("partner_staff");
        });
        setData(partners);
      })
      .catch(() => setData([]))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [canView]);

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  if (!canView) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-5 py-16 space-y-3">
          <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>Restricted</h1>
          <p className="text-sm" style={{ color: MUTED_TEXT }}>Partner accounts are visible only to the primary HQ account.</p>
          <Link href="/agent" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-8 space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Partner Accounts</p>
            <h1 className="text-3xl md:text-4xl font-black" style={{ color: TITLE_TEXT }}>Partner directory</h1>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>Detailed list of partner accounts created in the system.</p>
          </div>
          <Link href="/agent" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            Back to Agent
          </Link>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 text-sm">
          {loading && <p className="text-slate-500">Loading partner accounts…</p>}
          {!loading && sorted.length === 0 && (
            <p className="text-slate-500">No partner accounts found.</p>
          )}
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          {sorted.map((p) => (
            <div key={p.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>{p.name}</h3>
                  <p className="text-xs" style={{ color: MUTED_TEXT }}>{p.email}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${p.status === "suspended" ? "bg-rose-100 text-rose-700" : p.status === "disabled" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {p.status || "active"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-500">Role</p>
                  <p className="text-sm font-bold" style={{ color: TITLE_TEXT }}>{(p.roles && p.roles.length ? p.roles.join(", ") : p.role) || "partner"}</p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-500">Created</p>
                  <p className="text-sm font-bold" style={{ color: TITLE_TEXT }}>{new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500">Divisions</p>
                <p className="text-sm font-bold" style={{ color: TITLE_TEXT }}>{(p.divisions && p.divisions.length ? p.divisions.join(", ") : "—")}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full border border-slate-200 px-3 py-1">Partner profile</span>
                <span className="rounded-full border border-slate-200 px-3 py-1">KYC pending</span>
                <span className="rounded-full border border-slate-200 px-3 py-1">Listings access</span>
              </div>
            </div>
          ))}
        </section>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 text-xs text-slate-500">
          Manage partner accounts and onboarding from this directory. Future actions (suspend, view listings) can be added here.
        </div>
      </div>
    </main>
  );
}
