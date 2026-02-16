"use client";

import { useEffect, useMemo, useState } from "react";
import { TITLE_TEXT, MUTED_TEXT } from "../../../src/design/tokens";
import { useRequireAnyPermission } from "../../../src/lib/roleGuards";

const emptyForm = {
  title: "",
  location: "",
  price: "",
  currency: "USD",
  thumbnail: "",
  images: "",
  description: "",
  status: "draft",
};

type YachtListing = {
  id: string;
  title: string;
  status: string;
  data?: Record<string, any> | null;
  created_at?: string | null;
  updated_at?: string | null;
};

function normalizeImagesInput(value: string) {
  return value
    .split(/[\n,]+/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function listingToForm(listing: YachtListing) {
  const data = listing.data || {};
  return {
    title: String(listing.title || data.title || ""),
    location: String(data.location || data.destination || ""),
    price: data.price !== undefined && data.price !== null ? String(data.price) : "",
    currency: String(data.currency || "USD"),
    thumbnail: String(data.thumbnail || ""),
    images: Array.isArray(data.images) ? data.images.join("\n") : "",
    description: String(data.description || ""),
    status: String(listing.status || "draft"),
  };
}

export default function YachtBrokerAdminPage() {
  useRequireAnyPermission(["yacht_listings:manage"], "/agent");

  const [listings, setListings] = useState<YachtListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const title = mode === "edit" ? "Edit listing" : "Create a yacht listing";

  const sortedListings = useMemo(() => {
    return [...listings].sort((a, b) => {
      const left = a.updated_at || a.created_at || "";
      const right = b.updated_at || b.created_at || "";
      return right.localeCompare(left);
    });
  }, [listings]);

  const loadListings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/yacht/listings", { cache: "no-store" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Failed to load listings");
      setListings(Array.isArray(payload?.data) ? payload.data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const resetForm = () => {
    setForm({ ...emptyForm });
    setMode("create");
    setActiveId(null);
  };

  const submitForm = async () => {
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError("");
    const payload = {
      id: activeId || undefined,
      title: form.title.trim(),
      location: form.location.trim(),
      price: form.price ? Number(form.price) : undefined,
      currency: form.currency.trim() || "USD",
      thumbnail: form.thumbnail.trim(),
      images: normalizeImagesInput(form.images),
      description: form.description.trim(),
      status: form.status,
    };

    try {
      const res = await fetch("/api/yacht/listings", {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save listing");
      await loadListings();
      resetForm();
    } catch (err: any) {
      setError(err?.message || "Failed to save listing");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (listing: YachtListing) => {
    setMode("edit");
    setActiveId(listing.id);
    setForm(listingToForm(listing));
  };

  const handleStatusChange = async (listing: YachtListing, status: string) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/yacht/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: listing.id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update status");
      await loadListings();
    } catch (err: any) {
      setError(err?.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F5F7FB" }}>
      <div className="mx-auto max-w-6xl px-5 py-8 space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Yacht Broker</p>
            <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>Yacht listings admin</h1>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>
              Create and publish yacht listings visible to travelers.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold"
              onClick={loadListings}
              disabled={loading}
            >
              Refresh
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>{title}</h2>
              <p className="text-xs" style={{ color: MUTED_TEXT }}>
                {mode === "edit" ? "Update the listing details." : "Add a new yacht to the catalog."}
              </p>
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-600">
                Title
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Location
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={form.location}
                  onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-semibold text-slate-600">
                  Price
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.price}
                    onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                  />
                </label>
                <label className="block text-xs font-semibold text-slate-600">
                  Currency
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.currency}
                    onChange={(event) => setForm((prev) => ({ ...prev, currency: event.target.value }))}
                  />
                </label>
              </div>
              <label className="block text-xs font-semibold text-slate-600">
                Thumbnail URL
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={form.thumbnail}
                  onChange={(event) => setForm((prev) => ({ ...prev, thumbnail: event.target.value }))}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Images (one per line)
                <textarea
                  className="mt-1 min-h-[90px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={form.images}
                  onChange={(event) => setForm((prev) => ({ ...prev, images: event.target.value }))}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Description
                <textarea
                  className="mt-1 min-h-[80px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Status
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={form.status}
                  onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                onClick={submitForm}
                disabled={saving}
              >
                {saving ? "Saving..." : mode === "edit" ? "Save changes" : "Create listing"}
              </button>
              {mode === "edit" && (
                <button
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Listings</h2>
              <span className="text-xs" style={{ color: MUTED_TEXT }}>{sortedListings.length} total</span>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm" style={{ color: MUTED_TEXT }}>
                Loading listings...
              </div>
            ) : sortedListings.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm" style={{ color: MUTED_TEXT }}>
                No yacht listings yet.
              </div>
            ) : (
              <div className="grid gap-3">
                {sortedListings.map((listing) => {
                  const data = listing.data || {};
                  const priceLabel = data.price ? `${data.currency || "USD"} ${data.price}` : "Request";
                  return (
                    <div key={listing.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-lg font-bold" style={{ color: TITLE_TEXT }}>{listing.title}</p>
                          <p className="text-sm" style={{ color: MUTED_TEXT }}>
                            {(data.location || data.destination || "Location TBD")} · {priceLabel}
                          </p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                          {listing.status || "draft"}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold"
                          onClick={() => handleEdit(listing)}
                        >
                          Edit
                        </button>
                        {listing.status !== "published" && (
                          <button
                            className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white"
                            onClick={() => handleStatusChange(listing, "published")}
                            disabled={saving}
                          >
                            Publish
                          </button>
                        )}
                        {listing.status === "published" && (
                          <button
                            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold"
                            onClick={() => handleStatusChange(listing, "draft")}
                            disabled={saving}
                          >
                            Unpublish
                          </button>
                        )}
                        {listing.status !== "archived" && (
                          <button
                            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold"
                            onClick={() => handleStatusChange(listing, "archived")}
                            disabled={saving}
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
