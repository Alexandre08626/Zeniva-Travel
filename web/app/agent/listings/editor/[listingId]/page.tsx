"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type TabKey = "details" | "photo-tour" | "pricing" | "availability" | "publish";

type ListingRecord = {
  id: string;
  type: "yacht" | "hotel" | "home";
  title: string;
  status?: string;
  workflowStatus?: string;
  source?: string;
  editable?: boolean;
  data?: Record<string, any>;
};

type EditorState = {
  title: string;
  description: string;
  location: string;
  currency: string;
  price: string;
  capacity: string;
  bedrooms: string;
  bathrooms: string;
  status: "published" | "draft" | "archived";
  workflowStatus: "in_progress" | "completed" | "paused";
  images: string[];
  coverIndex: number;
};

function safeString(value: unknown) {
  return String(value || "");
}

export default function AgentListingEditorPage() {
  const params = useParams<{ listingId: string }>();
  const router = useRouter();
  const listingId = decodeURIComponent(String(params?.listingId || ""));

  const [tab, setTab] = useState<TabKey>("details");
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<ListingRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [photoInput, setPhotoInput] = useState("");
  const [duplicating, setDuplicating] = useState(false);

  const [form, setForm] = useState<EditorState>({
    title: "",
    description: "",
    location: "",
    currency: "USD",
    price: "",
    capacity: "",
    bedrooms: "",
    bathrooms: "",
    status: "draft",
    workflowStatus: "in_progress",
    images: [],
    coverIndex: 0,
  });

  const coverImage = form.images[form.coverIndex] || form.images[0] || "";

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetch("/api/agent/listings", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { data: [] }))
      .then((payload) => {
        if (!active) return;
        const list: ListingRecord[] = Array.isArray(payload?.data) ? payload.data : [];
        const found = list.find((item) => String(item.id) === listingId) || null;
        setRecord(found);

        const data = (found?.data || {}) as Record<string, any>;
        const images = Array.isArray(data.images) ? data.images : [];
        setForm({
          title: safeString(found?.title || data.title),
          description: safeString(data.description),
          location: safeString(data.location || data.destination),
          currency: safeString(data.currency || "USD") || "USD",
          price: data.price != null ? String(data.price) : "",
          capacity: data.capacity != null ? String(data.capacity) : "",
          bedrooms: data.bedrooms != null ? String(data.bedrooms) : "",
          bathrooms: data.bathrooms != null ? String(data.bathrooms) : "",
          status: (String(found?.status || "draft") as any) || "draft",
          workflowStatus: (String(found?.workflowStatus || data.workflowStatus || "in_progress") as any) || "in_progress",
          images,
          coverIndex: 0,
        });
      })
      .catch(() => {
        if (!active) return;
        setRecord(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [listingId]);

  const tabs = useMemo(() => {
    return [
      { key: "details" as const, label: "Details" },
      { key: "photo-tour" as const, label: "Photo tour" },
      { key: "pricing" as const, label: "Pricing" },
      { key: "availability" as const, label: "Availability" },
      { key: "publish" as const, label: "Publish" },
    ];
  }, []);

  const addPhoto = () => {
    const value = photoInput.trim();
    if (!value) return;
    setForm((prev) => ({ ...prev, images: [...prev.images, value] }));
    setPhotoInput("");
  };

  const removePhoto = (index: number) => {
    setForm((prev) => {
      const next = prev.images.filter((_, idx) => idx !== index);
      const nextCover = Math.max(0, Math.min(prev.coverIndex, next.length - 1));
      return { ...prev, images: next, coverIndex: nextCover };
    });
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (!record) {
      setSaving(false);
      setError("Listing not found");
      return;
    }

    if (!record.editable) {
      setSaving(false);
      setError("This listing is read-only. Create a new listing to edit.");
      return;
    }

    if (!form.title.trim()) {
      setSaving(false);
      setError("Title is required");
      return;
    }

    try {
      const payload = {
        id: record.id,
        type: record.type,
        title: form.title,
        description: form.description,
        location: form.location,
        status: form.status,
        workflowStatus: form.workflowStatus,
        currency: form.currency,
        price: form.price ? Number(form.price) : undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        images: form.images,
        thumbnail: coverImage,
      };

      const response = await fetch("/api/agent/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Save failed");

      setSuccess("Saved");
      setRecord((prev) => (prev ? { ...prev, title: form.title, status: form.status, workflowStatus: form.workflowStatus, data: { ...(prev.data || {}), ...payload } } : prev));
    } catch (err: any) {
      setError(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const duplicateAsDraft = async () => {
    if (!record) return;
    setDuplicating(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        type: record.type,
        title: form.title,
        description: form.description,
        location: form.location,
        currency: form.currency,
        price: form.price ? Number(form.price) : undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        images: form.images,
        thumbnail: coverImage,
        status: "draft",
        workflowStatus: "in_progress",
      };

      const response = await fetch("/api/agent/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Duplicate failed");
      const createdId = result?.data?.id ? String(result.data.id) : "";
      if (!createdId) throw new Error("Duplicate failed");
      setSuccess("Draft copy created. Opening editor...");
      setTimeout(() => router.push(`/agent/listings/editor/${encodeURIComponent(createdId)}`), 400);
    } catch (err: any) {
      setError(err?.message || "Duplicate failed");
    } finally {
      setDuplicating(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading editor…</div>
      </main>
    );
  }

  if (!record) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <h1 className="text-xl font-bold text-rose-900">Listing not found</h1>
          <Link href="/agent/listings" className="mt-4 inline-flex rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-800">Back to listings</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Hosting editor</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">{record.title}</h1>
          <p className="mt-2 text-sm text-slate-600">{record.type.toUpperCase()} · {record.source || "catalog"} · {record.editable ? "Editable" : "Read only"}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/agent/listings" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Back</Link>
            {record.editable ? (
              <button onClick={() => void save()} disabled={saving} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : "Save"}</button>
            ) : (
              <button onClick={() => void duplicateAsDraft()} disabled={duplicating} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{duplicating ? "Creating…" : "Duplicate as draft"}</button>
            )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)} className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === t.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {error && <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
      {success && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{success}</div>}

      {tab === "details" && (
        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Title</label>
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Location</label>
              <input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Workflow</label>
              <select value={form.workflowStatus} onChange={(e) => setForm((p) => ({ ...p, workflowStatus: e.target.value as any }))} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
                <option value="in_progress">En cours</option>
                <option value="completed">Terminée</option>
                <option value="paused">En pause</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
              <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="h-32 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            </div>
          </div>
        </section>
      )}

      {tab === "photo-tour" && (
        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="text-sm font-bold text-slate-900">Cover</p>
              <div className="mt-3 aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
                {coverImage ? <img src={coverImage} alt="Cover" className="h-full w-full object-cover" /> : null}
              </div>
              <p className="mt-2 text-xs text-slate-500">Choisis une cover et organise tes photos.</p>
            </div>
            <div>
              <div className="flex gap-2">
                <input value={photoInput} onChange={(e) => setPhotoInput(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="https://..." />
                <button type="button" onClick={addPhoto} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Add</button>
              </div>

              {form.images.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">No photos yet.</div>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {form.images.map((img, index) => (
                    <div key={`${img}-${index}`} className="rounded-2xl border border-slate-200 p-2">
                      <img src={img} alt={`Photo ${index + 1}`} className="h-40 w-full rounded-xl object-cover" />
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <button type="button" onClick={() => setForm((p) => ({ ...p, coverIndex: index }))} className={`rounded-full px-3 py-1 text-xs font-semibold ${form.coverIndex === index ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                          {form.coverIndex === index ? "Cover" : "Set cover"}
                        </button>
                        <button type="button" onClick={() => removePhoto(index)} className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {tab === "pricing" && (
        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Price</label>
              <input type="number" min="0" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Currency</label>
              <input value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value.toUpperCase() }))} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            </div>
          </div>
        </section>
      )}

      {tab === "availability" && (
        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Availability is a placeholder (next: calendar + blackout dates).
          </div>
        </section>
      )}

      {tab === "publish" && (
        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Publication status</label>
              <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as any }))} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Workflow</label>
              <select value={form.workflowStatus} onChange={(e) => setForm((p) => ({ ...p, workflowStatus: e.target.value as any }))} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
                <option value="in_progress">En cours</option>
                <option value="completed">Terminée</option>
                <option value="paused">En pause</option>
              </select>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Tip: set <span className="font-semibold">Draft</span> while you work, then <span className="font-semibold">Published</span> when ready.
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => void save()} disabled={saving} className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : "Save changes"}</button>
            <button type="button" onClick={() => router.push("/agent/listings")} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700">Back to listings</button>
          </div>
        </section>
      )}
    </main>
  );
}
