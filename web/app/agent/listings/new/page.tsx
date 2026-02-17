"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "../../../../src/lib/authStore";
import { normalizeRbacRole } from "../../../../src/lib/rbac";

type ListingType = "yacht" | "hotel" | "home";

type FormState = {
  type: ListingType;
  status: "published" | "draft" | "archived";
  workflowStatus: "in_progress" | "completed" | "paused";
  title: string;
  description: string;
  location: string;
  price: string;
  currency: string;
  capacity: string;
  bedrooms: string;
  bathrooms: string;
  images: string[];
  coverIndex: number;
  partnerId: string;
};

const initialState: FormState = {
  type: "yacht",
  status: "draft",
  workflowStatus: "in_progress",
  title: "",
  description: "",
  location: "",
  price: "",
  currency: "USD",
  capacity: "",
  bedrooms: "",
  bathrooms: "",
  images: [],
  coverIndex: 0,
  partnerId: "",
};

export default function AgentCreateListingPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [form, setForm] = useState<FormState>(initialState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [photoInput, setPhotoInput] = useState("");

  const roles = user?.roles && user.roles.length ? user.roles : user?.role ? [user.role] : [];
  const effectiveRole = normalizeRbacRole(user?.effectiveRole) || normalizeRbacRole(roles[0]);
  const isAdmin = effectiveRole === "hq" || effectiveRole === "admin";
  const isYachtBroker = effectiveRole === "yacht_broker";
  const canCreate = isAdmin || isYachtBroker;

  const allowedTypes = useMemo<ListingType[]>(() => {
    if (isAdmin) return ["yacht", "hotel", "home"];
    return ["yacht"];
  }, [isAdmin]);

  const publishTarget = form.type === "yacht" ? "/yachts" : form.type === "hotel" ? "/hotels" : "/residences";
  const coverImage = form.images[form.coverIndex] || form.images[0] || "";

  if (!canCreate) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <h1 className="text-xl font-bold text-rose-900">Access denied</h1>
          <p className="mt-2 text-sm text-rose-700">Only admin or yacht broker roles can create listings in agent mode.</p>
          <Link href="/agent" className="mt-4 inline-flex rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-800">
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!form.images.length) {
      setError("Add at least one photo URL.");
      return;
    }

    if (!isAdmin && form.type !== "yacht") {
      setError("Broker mode can only create yacht listings.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        thumbnail: coverImage,
        images: form.images,
        price: form.price ? Number(form.price) : undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
      };

      const response = await fetch("/api/agent/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error || "Failed to publish listing");
      }

      const createdId = result?.data?.id ? String(result.data.id) : "";
      setSuccess("Listing created. Opening editor...");

      setTimeout(() => {
        router.push(createdId ? `/agent/listings/editor/${encodeURIComponent(createdId)}` : "/agent/listings");
      }, 600);
    } catch (submitError: any) {
      setError(submitError?.message || "Failed to publish listing.");
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Agent mode</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Create listing</h1>
          <p className="mt-2 text-sm text-slate-600">Publish inventory directly to public pages and the agent partner console.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/agent/inventory" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300">
            Inventory
          </Link>
          <Link href="/agent" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300">
            Back
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Listing type</label>
          <div className="flex flex-wrap gap-2">
            {allowedTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, type }))}
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${form.type === type ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700"}`}
              >
                {type === "home" ? "Short-term rental" : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          {!isAdmin && <p className="mt-2 text-xs text-slate-500">Broker mode is restricted to yacht listings.</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Publication status</label>
            <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as any }))} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Workflow status</label>
            <select value={form.workflowStatus} onChange={(event) => setForm((prev) => ({ ...prev, workflowStatus: event.target.value as any }))} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
              <option value="in_progress">En cours</option>
              <option value="completed">Terminée</option>
              <option value="paused">En pause</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Title</label>
            <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Listing title" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
            <textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} className="h-28 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Description" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Location</label>
            <input value={form.location} onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="City, country" />
          </div>
          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Photos manager</label>
            <div className="flex gap-2">
              <input value={photoInput} onChange={(event) => setPhotoInput(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="https://..." />
              <button type="button" onClick={addPhoto} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Add</button>
            </div>
            <p className="mt-2 text-xs text-slate-500">Ajoute les URLs photos une à une, choisis la cover, supprime celles en trop.</p>
            {form.images.length > 0 && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {form.images.map((img, index) => (
                  <div key={`${img}-${index}`} className="rounded-xl border border-slate-200 bg-white p-2">
                    <img src={img} alt={`Photo ${index + 1}`} className="h-28 w-full rounded-lg object-cover" />
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, coverIndex: index }))}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${form.coverIndex === index ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}
                      >
                        {form.coverIndex === index ? "Cover" : "Set cover"}
                      </button>
                      <button type="button" onClick={() => removePhoto(index)} className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Price</label>
            <input type="number" min="0" value={form.price} onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="0" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Currency</label>
            <input value={form.currency} onChange={(event) => setForm((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="USD" maxLength={5} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Capacity</label>
            <input type="number" min="0" value={form.capacity} onChange={(event) => setForm((prev) => ({ ...prev, capacity: event.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Guests" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Bedrooms</label>
            <input type="number" min="0" value={form.bedrooms} onChange={(event) => setForm((prev) => ({ ...prev, bedrooms: event.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Bedrooms" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Bathrooms</label>
            <input type="number" min="0" value={form.bathrooms} onChange={(event) => setForm((prev) => ({ ...prev, bathrooms: event.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Bathrooms" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Partner ID (optional)</label>
            <input value={form.partnerId} onChange={(event) => setForm((prev) => ({ ...prev, partnerId: event.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="partner-yacht-01" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Publish target: <span className="font-semibold text-slate-900">{publishTarget}</span> · Workflow: <span className="font-semibold text-slate-900">{form.workflowStatus === "completed" ? "Terminée" : form.workflowStatus === "paused" ? "En pause" : "En cours"}</span>
        </div>

        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
        {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{success}</div>}

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? "Publishing..." : "Publish listing"}
          </button>
        </div>
      </form>
    </main>
  );
}