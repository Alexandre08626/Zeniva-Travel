"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import AgentListingCreateForm from "./AgentListingCreateForm";

type ListingSource = "partner" | "catalog" | "resort" | "ycn";

type AgentListingSummary = {
  id: string;
  source: ListingSource;
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

  const [items, setItems] = useState<AgentListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const json = (await res.json()) as { items?: AgentListingSummary[] };
        if (!cancelled) setItems(json.items || []);
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
          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">Loading…</div>
          ) : error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>
          ) : sorted.length === 0 ? (
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
                {sorted.map((it) => {
                  const href = `/agent/listings/editor/${encodeURIComponent(it.id)}`;
                  const statusVariant = it.status === "published" ? "green" : it.status === "archived" ? "red" : "muted";
                  const workflowVariant = it.workflowStatus === "completed" ? "green" : it.workflowStatus === "paused" ? "amber" : "muted";

                  return (
                    <Link
                      key={`${it.source}:${it.id}`}
                      href={href}
                      className="grid grid-cols-12 items-center gap-0 px-4 py-3 hover:bg-slate-50"
                    >
                      <div className="col-span-6 flex items-center gap-3">
                        <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md bg-slate-100">
                          {it.thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={it.thumbnail} alt="" className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-sm font-medium text-slate-900">{it.title || it.id}</span>
                            {it.createdByAgent ? <Pill variant="amber">Created by agent</Pill> : null}
                            {it.isReadOnly ? <Pill variant="muted">Read-only</Pill> : null}
                          </div>
                          <div className="mt-0.5 truncate text-xs text-slate-600">
                            {it.kind ? `${it.kind}${it.location ? ` • ${it.location}` : ""}` : it.location || ""}
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
