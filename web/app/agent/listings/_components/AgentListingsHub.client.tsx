"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import AgentListingCreateForm from "./AgentListingCreateForm";
import { useAuthStore } from "../../../../src/lib/authStore";
import { normalizeRbacRole } from "../../../../src/lib/rbac";

type ListingSource = "partner" | "catalog" | "resort" | "ycn" | "agent" | "airbnb";
type ListingType = "yacht" | "hotel" | "home";

type AgentListingSummary = {
  id: string;
  source: ListingSource;
  type?: ListingType;
  kind?: string;
  title?: string;
  location?: string;
  status?: "draft" | "published" | "archived";
  workflowStatus?: "in_progress" | "completed" | "paused";
  createdByAgent?: boolean;
  isEditable?: boolean;
  isReadOnly?: boolean;
  thumbnail?: string | null;
  updatedAt?: string | null;
};

function badgeClasses(variant: "muted" | "green" | "amber" | "red") {
  switch (variant) {
    case "green":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "amber":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "red":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    default:
      return "bg-slate-50 text-slate-700 ring-slate-200";
  }
}

function Pill({ children, variant }: { children: React.ReactNode; variant: "muted" | "green" | "amber" | "red" }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${badgeClasses(variant)}`}>
      {children}
    </span>
  );
}

export default function AgentListingsHubClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "list";
  const rawTypeFilter = (searchParams.get("type") || "all") as "all" | ListingType;

  const user = useAuthStore((s) => s.user);
  const roles = useMemo(() => (user?.roles && user.roles.length ? user.roles : user?.role ? [user.role] : []), [user]);
  const effectiveRole = useMemo(() => normalizeRbacRole(user?.effectiveRole) || normalizeRbacRole(roles[0]), [user?.effectiveRole, roles]);
  const isYachtBroker = effectiveRole === "yacht_broker";

  const typeFilter: "all" | ListingType = isYachtBroker ? "yacht" : rawTypeFilter;

  const [items, setItems] = useState<AgentListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/agent/listings", { cache: "no-store" });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Failed to load listings (${res.status})`);
        }
        const json = (await res.json()) as { data?: AgentListingSummary[] };
        if (!cancelled) setItems(Array.isArray(json.data) ? json.data : []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load listings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sorted = useMemo(() => {
    const copy = [...items];
    copy.sort((a, b) => {
      const da = a.updatedAt ? Date.parse(a.updatedAt) : 0;
      const db = b.updatedAt ? Date.parse(b.updatedAt) : 0;
      return db - da;
    });
    return copy;
  }, [items]);

  const filtered = useMemo(() => {
    if (typeFilter === "all") return sorted;
    return sorted.filter((item) => (item as any).type === typeFilter);
  }, [sorted, typeFilter]);

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return filtered;
    return filtered.filter((it) => {
      const data = (it as any).data || {};
      const title = String(it.title || "").toLowerCase();
      const location = String(it.location || data.location || data.destination || "").toLowerCase();
      const id = String(it.id || "").toLowerCase();
      return title.includes(q) || location.includes(q) || id.includes(q);
    });
  }, [filtered, query]);

  const setParam = (key: string, value?: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    router.push(`/agent/listings${qs ? `?${qs}` : ""}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Listings</h1>
          <p className="mt-1 text-sm text-slate-600">Manage your inventory like Airbnb Hosting.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/agent/listings")}
            className={`rounded-md px-3 py-2 text-sm font-medium ring-1 ring-inset ${
              view === "list" ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-900 ring-slate-300"
            }`}
          >
            All listings
          </button>
          <button
            type="button"
            onClick={() => router.push("/agent/listings?view=create")}
            className={`rounded-md px-3 py-2 text-sm font-medium ring-1 ring-inset ${
              view === "create" ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-900 ring-slate-300"
            }`}
          >
            Create listing
          </button>
        </div>
      </div>

      {view === "create" ? (
        <div className="mt-6">
          <AgentListingCreateForm mode="embedded" />
        </div>
      ) : (
        <div className="mt-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setParam("type", "all")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset ${
                typeFilter === "all" ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-900 ring-slate-300"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setParam("type", "yacht")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset ${
                typeFilter === "yacht" ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-900 ring-slate-300"
              }`}
            >
              Yacht
            </button>
            {!isYachtBroker && (
              <>
                <button
                  type="button"
                  onClick={() => setParam("type", "hotel")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset ${
                    typeFilter === "hotel" ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-900 ring-slate-300"
                  }`}
                >
                  Hotel
                </button>
                <button
                  type="button"
                  onClick={() => setParam("type", "home")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset ${
                    typeFilter === "home" ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-900 ring-slate-300"
                  }`}
                >
                  Short-term
                </button>
              </>
            )}

            <div className="ml-auto w-full sm:ml-0 sm:w-64">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search listings…"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">Loading…</div>
          ) : error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>
          ) : searched.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-700">
              No listings yet. <Link className="text-slate-900 underline" href="/agent/listings?view=create">Create one</Link>.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="grid grid-cols-12 gap-0 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
                <div className="col-span-6">Listing</div>
                <div className="col-span-2">Source</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Workflow</div>
              </div>

              <div className="divide-y divide-slate-200">
                {searched.map((it) => {
                  const data = (it as any).data || {};
                  const href = `/agent/listings/editor/${encodeURIComponent(it.id)}`;
                  const statusVariant = it.status === "published" ? "green" : it.status === "archived" ? "red" : "muted";
                  const workflowVariant = it.workflowStatus === "completed" ? "green" : it.workflowStatus === "paused" ? "amber" : "muted";
                  const thumb = it.thumbnail ?? data.thumbnail ?? (Array.isArray(data.images) ? data.images[0] : null) ?? null;
                  const location = it.location ?? data.location ?? data.destination ?? "";

                  return (
                    <Link
                      key={`${it.source}:${it.id}`}
                      href={href}
                      className="grid grid-cols-12 items-center gap-0 px-4 py-3 hover:bg-slate-50"
                    >
                      <div className="col-span-6 flex items-center gap-3">
                        <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md bg-slate-100">
                          {thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={thumb} alt="" className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-sm font-medium text-slate-900">{it.title || it.id}</span>
                            {it.createdByAgent ? <Pill variant="amber">Created by agent</Pill> : null}
                            {it.isReadOnly ? <Pill variant="muted">Read-only</Pill> : null}
                          </div>
                          <div className="mt-0.5 truncate text-xs text-slate-600">
                            {it.kind ? `${it.kind}${location ? ` • ${location}` : ""}` : location}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2 text-xs text-slate-700">{it.source}</div>
                      <div className="col-span-2">
                        <Pill variant={statusVariant}>{it.status || "draft"}</Pill>
                      </div>
                      <div className="col-span-2">
                        <Pill variant={workflowVariant}>{it.workflowStatus || "in_progress"}</Pill>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
