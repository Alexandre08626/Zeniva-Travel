"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { useAuthStore } from "../../../src/lib/authStore";
import { normalizeRbacRole } from "../../../src/lib/rbac";
import { mockListings } from "../../../src/lib/mockData";
import { resortPartners } from "../../../src/data/partners/resorts";

type ListingType = "yacht" | "hotel" | "home";
type WorkflowStatus = "in_progress" | "completed" | "paused";

type InventoryListing = {
  id: string;
  title: string;
  type: ListingType;
  location: string;
  source: "ycn" | "partner" | "resort" | "airbnb" | "catalog";
  publicationStatus: string;
  workflowStatus: WorkflowStatus;
  createdByAgent: boolean;
  thumbnail?: string;
  priceLabel?: string;
};

function normalizeWorkflowStatus(value: unknown): WorkflowStatus {
  const status = String(value || "in_progress").toLowerCase().trim();
  if (status === "completed" || status === "paused") return status;
  return "in_progress";
}

function workflowLabel(status: WorkflowStatus) {
  if (status === "completed") return "Terminée";
  if (status === "paused") return "En pause";
  return "En cours";
}

function publicationLabel(status: string) {
  const value = String(status || "published").toLowerCase();
  if (value === "draft") return "Brouillon";
  if (value === "archived") return "Archivée";
  return "Publiée";
}

export default function AgentInventoryPage() {
  const user = useAuthStore((state) => state.user);
  const roles = user?.roles && user.roles.length ? user.roles : user?.role ? [user.role] : [];
  const effectiveRole = normalizeRbacRole(user?.effectiveRole) || normalizeRbacRole(roles[0]);
  const isAgent = effectiveRole === "hq" || effectiveRole === "admin" || effectiveRole === "travel_agent" || effectiveRole === "yacht_broker";

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ListingType>("all");
  const [workflowFilter, setWorkflowFilter] = useState<"all" | WorkflowStatus>("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | InventoryListing["source"]>("all");
  const [items, setItems] = useState<InventoryListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAgent) {
      setItems([]);
      setLoading(false);
      return;
    }

    let active = true;

    const staticFromMock: InventoryListing[] = mockListings.map((listing) => ({
      id: `mock-${listing.id}`,
      title: listing.title,
      type: listing.type as ListingType,
      location: listing.location || "",
      source: "catalog",
      publicationStatus: String(listing.status || "published"),
      workflowStatus: normalizeWorkflowStatus((listing as any).workflowStatus),
      createdByAgent: Boolean((listing as any).createdByAgent),
      thumbnail: listing.thumbnail,
      priceLabel: listing.price ? `${listing.currency || "USD"} ${listing.price}` : undefined,
    }));

    const staticResorts: InventoryListing[] = resortPartners.map((resort) => ({
      id: `resort-${resort.id}`,
      title: resort.name,
      type: "hotel",
      location: resort.destination,
      source: "resort",
      publicationStatus: resort.status || "published",
      workflowStatus: "in_progress",
      createdByAgent: false,
      thumbnail: resort.media?.[0]?.images?.[0],
      priceLabel: resort.pricing?.publicRateFrom,
    }));

    const load = async () => {
      try {
        const [ycnReq, yachtsReq, homesReq, hotelsReq, airbnbsReq] = await Promise.all([
          fetch("/api/partners/ycn", { cache: "no-store" }),
          fetch("/api/public/listings?type=yacht", { cache: "no-store" }),
          fetch("/api/public/listings?type=home", { cache: "no-store" }),
          fetch("/api/public/listings?type=hotel", { cache: "no-store" }),
          fetch("/api/partners/airbnbs", { cache: "no-store" }),
        ]);

        const ycnData = ycnReq.ok ? await ycnReq.json() : [];
        const yachtsData = yachtsReq.ok ? await yachtsReq.json() : { data: [] };
        const homesData = homesReq.ok ? await homesReq.json() : { data: [] };
        const hotelsData = hotelsReq.ok ? await hotelsReq.json() : { data: [] };
        const airbnbsData = airbnbsReq.ok ? await airbnbsReq.json() : [];

        const ycnListings: InventoryListing[] = (Array.isArray(ycnData) ? ycnData : []).map((item: any, index: number) => ({
          id: `ycn-${item?.id || index}`,
          title: item?.title || "Yacht Charter",
          type: "yacht",
          location: item?.destination || "",
          source: "ycn",
          publicationStatus: "published",
          workflowStatus: "in_progress",
          createdByAgent: false,
          thumbnail: item?.thumbnail || item?.images?.[0],
          priceLabel: Array.isArray(item?.prices) && item.prices.length ? item.prices[0] : undefined,
        }));

        const publicYachts: InventoryListing[] = ((yachtsData && yachtsData.data) || []).map((item: any, index: number) => {
          const data = item?.data || {};
          return {
            id: `public-yacht-${item?.id || index}`,
            title: item?.title || data?.title || "Yacht Charter",
            type: "yacht",
            location: data?.location || data?.destination || "",
            source: "partner",
            publicationStatus: item?.status || "published",
            workflowStatus: normalizeWorkflowStatus(data?.workflowStatus),
            createdByAgent: Boolean(item?.createdByAgent || data?.createdByAgent),
            thumbnail: data?.thumbnail || data?.images?.[0],
            priceLabel: Array.isArray(data?.prices) && data.prices.length ? data.prices[0] : data?.price ? `${data?.currency || "USD"} ${data.price}` : undefined,
          } as InventoryListing;
        });

        const publicHomes: InventoryListing[] = ((homesData && homesData.data) || []).map((item: any, index: number) => {
          const data = item?.data || item || {};
          return {
            id: `public-home-${item?.id || data?.id || index}`,
            title: item?.title || data?.title || "Residence",
            type: "home",
            location: data?.location || data?.destination || "",
            source: "partner",
            publicationStatus: item?.status || data?.status || "published",
            workflowStatus: normalizeWorkflowStatus(data?.workflowStatus),
            createdByAgent: Boolean(item?.createdByAgent || data?.createdByAgent),
            thumbnail: data?.thumbnail || data?.images?.[0],
            priceLabel: data?.price ? `${data?.currency || "USD"} ${data.price}` : undefined,
          } as InventoryListing;
        });

        const publicHotels: InventoryListing[] = ((hotelsData && hotelsData.data) || []).map((item: any, index: number) => {
          const data = item?.data || item || {};
          return {
            id: `public-hotel-${item?.id || data?.id || index}`,
            title: item?.title || data?.title || "Hotel",
            type: "hotel",
            location: data?.location || data?.destination || "",
            source: "partner",
            publicationStatus: item?.status || data?.status || "published",
            workflowStatus: normalizeWorkflowStatus(data?.workflowStatus),
            createdByAgent: Boolean(item?.createdByAgent || data?.createdByAgent),
            thumbnail: data?.thumbnail || data?.images?.[0],
            priceLabel: data?.price ? `${data?.currency || "USD"} ${data.price}` : undefined,
          } as InventoryListing;
        });

        const airbnbListings: InventoryListing[] = (Array.isArray(airbnbsData) ? airbnbsData : []).map((item: any, index: number) => ({
          id: `airbnb-${item?.id || index}`,
          title: item?.title || "Residence",
          type: "home",
          location: item?.location || "",
          source: "airbnb",
          publicationStatus: "published",
          workflowStatus: "in_progress",
          createdByAgent: false,
          thumbnail: item?.thumbnail || item?.images?.[0],
        }));

        const merged = [
          ...staticFromMock,
          ...staticResorts,
          ...ycnListings,
          ...publicYachts,
          ...publicHomes,
          ...publicHotels,
          ...airbnbListings,
        ];

        const dedupe = new Map<string, InventoryListing>();
        merged.forEach((entry) => {
          const key = `${entry.type}:${entry.title}:${entry.location}`.toLowerCase();
          if (!dedupe.has(key)) dedupe.set(key, entry);
        });

        if (active) setItems(Array.from(dedupe.values()));
      } catch {
        if (active) setItems([...staticFromMock, ...staticResorts]);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [isAgent]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((item) => (typeFilter === "all" ? true : item.type === typeFilter))
      .filter((item) => (workflowFilter === "all" ? true : item.workflowStatus === workflowFilter))
      .filter((item) => (sourceFilter === "all" ? true : item.source === sourceFilter))
      .filter((item) => {
        if (!q) return true;
        const haystack = `${item.title} ${item.location} ${item.type} ${item.source}`.toLowerCase();
        return haystack.includes(q);
      });
  }, [items, query, typeFilter, workflowFilter, sourceFilter]);

  const stats = useMemo(() => {
    const total = items.length;
    const yachts = items.filter((item) => item.type === "yacht").length;
    const partnerListings = items.filter((item) => item.source === "partner" || item.source === "resort" || item.source === "airbnb").length;
    const completed = items.filter((item) => item.workflowStatus === "completed").length;
    return { total, yachts, partnerListings, completed };
  }, [items]);

  if (!isAgent) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <h1 className="text-xl font-bold text-rose-900">Accès refusé</h1>
          <p className="mt-2 text-sm text-rose-700">Cette vue inventaire est réservée aux rôles agent.</p>
          <Link href="/agent" className="mt-4 inline-flex rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-800">
            Retour agent
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Agent Inventory</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Inventaire complet</h1>
          <p className="mt-2 text-sm text-slate-600">Toutes les annonces partenaires + tous les yachts existants, avec suivi terminée/non.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/agent/listings/new" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">+ Ajouter une annonce</Link>
          <Link href="/agent" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Retour</Link>
        </div>
      </div>

      <section className="mt-6 grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Total annonces</p><p className="text-2xl font-black text-slate-900">{stats.total}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Annonces yachts</p><p className="text-2xl font-black text-slate-900">{stats.yachts}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Annonces partenaires</p><p className="text-2xl font-black text-slate-900">{stats.partnerListings}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Terminées</p><p className="text-2xl font-black text-slate-900">{stats.completed}</p></div>
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Recherche titre / lieu / source" className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as any)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
            <option value="all">Tous types</option>
            <option value="yacht">Yacht</option>
            <option value="hotel">Hôtel</option>
            <option value="home">Location courte durée</option>
          </select>
          <select value={workflowFilter} onChange={(event) => setWorkflowFilter(event.target.value as any)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
            <option value="all">Tous workflows</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminée</option>
            <option value="paused">En pause</option>
          </select>
          <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as any)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
            <option value="all">Toutes sources</option>
            <option value="partner">Partenaire publié</option>
            <option value="ycn">YCN</option>
            <option value="resort">Resort catalog</option>
            <option value="airbnb">Airbnb catalog</option>
            <option value="catalog">Catalogue interne</option>
          </select>
        </div>
      </section>

      <section className="mt-5 space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">Chargement inventaire…</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">Aucune annonce pour ces filtres.</div>
        ) : (
          filtered.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  {item.thumbnail ? <img src={item.thumbnail} alt={item.title} className="h-14 w-16 rounded-lg object-cover" /> : <div className="h-14 w-16 rounded-lg bg-slate-100" />}
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{item.title}</h2>
                    <p className="text-xs text-slate-500">{item.location || "—"}</p>
                    <p className="text-xs text-slate-500">{item.priceLabel || "Prix sur demande"}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <span className="rounded-full border border-slate-200 px-3 py-1">{item.type === "home" ? "Short-term rental" : item.type}</span>
                  <span className="rounded-full border border-slate-200 px-3 py-1">Source: {item.source}</span>
                  <span className={`rounded-full px-3 py-1 ${item.workflowStatus === "completed" ? "bg-emerald-100 text-emerald-700" : item.workflowStatus === "paused" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>{workflowLabel(item.workflowStatus)}</span>
                  <span className="rounded-full border border-slate-200 px-3 py-1">{publicationLabel(item.publicationStatus)}</span>
                  {item.createdByAgent && <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">Créée par agent</span>}
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
