"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useAuthStore } from "../../../src/lib/authStore";
import { normalizeRbacRole } from "../../../src/lib/rbac";

type ListingRecord = {
  id: string;
  type: "yacht" | "hotel" | "home";
  title: string;
  status?: string;
  workflowStatus?: string;
  source?: string;
  editable?: boolean;
  data?: Record<string, any>;
  updatedAt?: string | null;
};

function typeLabel(value: string) {
  if (value === "home") return "Short-term rental";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function workflowLabel(value?: string) {
  if (value === "completed") return "Terminée";
  if (value === "paused") return "En pause";
  return "En cours";
}

export default function AgentListingsHubPage() {
  const user = useAuthStore((state) => state.user);
  const [items, setItems] = useState<ListingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "yacht" | "hotel" | "home">("all");

  const roles = user?.roles && user.roles.length ? user.roles : user?.role ? [user.role] : [];
  const effectiveRole = normalizeRbacRole(user?.effectiveRole) || normalizeRbacRole(roles[0]);
  const allowed = Boolean(effectiveRole);

  useEffect(() => {
    if (!allowed) return;
    let active = true;
    fetch("/api/agent/listings", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { data: [] }))
      .then((payload) => {
        if (!active) return;
        setItems(Array.isArray(payload?.data) ? payload.data : []);
      })
      .catch(() => {
        if (!active) return;
        setItems([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [allowed]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((item) => (typeFilter === "all" ? true : item.type === typeFilter))
      .filter((item) => {
        if (!q) return true;
        const location = String(item?.data?.location || item?.data?.destination || "");
        return `${item.title} ${location} ${item.type} ${item.source || ""}`.toLowerCase().includes(q);
      });
  }, [items, query, typeFilter]);

  if (!allowed) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <h1 className="text-xl font-bold text-rose-900">Accès refusé</h1>
          <p className="mt-2 text-sm text-rose-700">Cette section est réservée au mode agent.</p>
          <Link href="/agent" className="mt-4 inline-flex rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-800">Retour agent</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Hosting</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Listings</h1>
          <p className="mt-2 text-sm text-slate-600">Clique sur une annonce pour l’éditer comme un éditeur hosting.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/agent/listings/new" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">+ Create listing</Link>
          <Link href="/agent/inventory" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Inventory</Link>
        </div>
      </div>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, city, source" className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as any)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
            <option value="all">All types</option>
            <option value="yacht">Yacht</option>
            <option value="hotel">Hotel</option>
            <option value="home">Short-term rental</option>
          </select>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">{filtered.length} annonces</div>
        </div>
      </section>

      <section className="mt-5 space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">Loading listings...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">No listing found.</div>
        ) : (
          filtered.map((item) => {
            const location = String(item?.data?.location || item?.data?.destination || "");
            const thumbnail = String(item?.data?.thumbnail || item?.data?.images?.[0] || "");
            const workflow = workflowLabel(item.workflowStatus);
            const status = String(item.status || "published");
            return (
              <Link key={item.id} href={`/agent/listings/editor/${encodeURIComponent(item.id)}`} className="block rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-400">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    {thumbnail ? <img src={thumbnail} alt={item.title} className="h-14 w-16 rounded-lg object-cover" /> : <div className="h-14 w-16 rounded-lg bg-slate-100" />}
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">{location || "—"}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full border border-slate-200 px-3 py-1">{typeLabel(item.type)}</span>
                    <span className="rounded-full border border-slate-200 px-3 py-1">{status}</span>
                    <span className={`rounded-full px-3 py-1 ${item.workflowStatus === "completed" ? "bg-emerald-100 text-emerald-700" : item.workflowStatus === "paused" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>{workflow}</span>
                    <span className="rounded-full border border-slate-200 px-3 py-1">source: {item.source || "catalog"}</span>
                    <span className={`rounded-full px-3 py-1 ${item.editable ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>{item.editable ? "Editable" : "Read only"}</span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </section>
    </main>
  );
}
