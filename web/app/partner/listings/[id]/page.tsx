"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { mockListings } from "../../../../src/lib/mockData";
import { getListingRelations } from "../../../../src/lib/partnerRelations";
import PageHeader from "../../../../src/components/partner/PageHeader";

export default function PartnerListingDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  const listing = useMemo(() => mockListings.find((l) => l.id === id), [id]);
  const relations = useMemo(() => getListingRelations(id), [id]);
  const [form, setForm] = useState(() => ({
    title: listing?.title || "",
    type: listing?.type || "home",
    status: listing?.status || "draft",
    location: listing?.location || "",
    price: listing?.price?.toString() || "",
    currency: listing?.currency || "USD",
    capacity: listing?.capacity?.toString() || "",
    bedrooms: listing?.bedrooms?.toString() || "",
    bathrooms: listing?.bathrooms?.toString() || "",
    description: listing?.description || "",
    amenities: (listing?.amenities || []).join(", "),
  }));

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (typeof window !== "undefined") {
      window.showToast?.("Changes saved (demo)", "success");
    }
  };

  if (!id) {
    return (
      <div>
        <PageHeader
          title="Listing"
          subtitle="Listing details"
          backHref="/partner/listings"
          breadcrumbs={[
            { label: "Partner", href: "/partner/dashboard" },
            { label: "Listings", href: "/partner/listings" },
            { label: "Listing" },
          ]}
        />
        <div className="bg-white rounded-xl border border-gray-200 p-8">Missing listing id.</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div>
        <PageHeader
          title={`Listing ${id}`}
          subtitle="Listing details"
          backHref="/partner/listings"
          breadcrumbs={[
            { label: "Partner", href: "/partner/dashboard" },
            { label: "Listings", href: "/partner/listings" },
            { label: `Listing ${id}` },
          ]}
          actions={
            <Link
              href="/partner/listings"
              className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Back to Listings
            </Link>
          }
        />
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Listing not found</h2>
          <p className="text-sm text-gray-600">This listing is not available in the demo store yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={listing.title}
        subtitle={`${listing.type.toUpperCase()} · ${listing.location}`}
        backHref="/partner/listings"
        breadcrumbs={[
          { label: "Partner", href: "/partner/dashboard" },
          { label: "Listings", href: "/partner/listings" },
          { label: listing.title },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/partner/listings/${listing.id}`}
              className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              View public
            </Link>
            <button
              onClick={handleSave}
              className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Save changes
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="relative h-64 bg-gray-100">
            <Image
              src={listing.thumbnail}
              alt={listing.title}
              fill
              sizes="(min-width: 1024px) 720px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-sm font-semibold text-gray-700">
                Title
                <input
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm font-semibold text-gray-700">
                Location
                <input
                  value={form.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm font-semibold text-gray-700">
                Type
                <select
                  value={form.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="yacht">Yacht</option>
                  <option value="home">Home</option>
                  <option value="hotel">Hotel</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-gray-700">
                Status
                <select
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="paused">Paused</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="text-sm font-semibold text-gray-700">
                Price
                <input
                  value={form.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm font-semibold text-gray-700">
                Currency
                <input
                  value={form.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm font-semibold text-gray-700">
                Capacity
                <input
                  value={form.capacity}
                  onChange={(e) => handleChange("capacity", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm font-semibold text-gray-700">
                Bedrooms
                <input
                  value={form.bedrooms}
                  onChange={(e) => handleChange("bedrooms", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm font-semibold text-gray-700">
                Bathrooms
                <input
                  value={form.bathrooms}
                  onChange={(e) => handleChange("bathrooms", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <label className="text-sm font-semibold text-gray-700">
              Description
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>

            <label className="text-sm font-semibold text-gray-700">
              Amenities (comma separated)
              <input
                value={form.amenities}
                onChange={(e) => handleChange("amenities", e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-xs uppercase tracking-wide text-gray-500">Ownership & Agent</p>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Partner</p>
                <p className="mt-1 font-semibold text-gray-900">{relations.partner?.displayName || "Unassigned"}</p>
                {relations.partner && (
                  <p className="text-xs text-gray-500">{relations.partner.primaryContactEmail}</p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Property Owner</p>
                <p className="mt-1 font-semibold text-gray-900">{relations.owner?.name || "Unassigned"}</p>
                {relations.owner && (
                  <p className="text-xs text-gray-500">{relations.owner.email}</p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Managing Agent</p>
                <p className="mt-1 font-semibold text-gray-900">{relations.agent?.name || "Unassigned"}</p>
                {relations.agent && (
                  <p className="text-xs text-gray-500">{relations.agent.email}</p>
                )}
              </div>
              {relations.assignment && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                  <p className="text-xs uppercase tracking-wide text-emerald-700">Service level</p>
                  <p className="mt-1 font-semibold text-emerald-900 capitalize">{relations.assignment.serviceLevel}</p>
                  <p className="text-xs text-emerald-700">Managed since {relations.assignment.managedSince}</p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-xs uppercase tracking-wide text-gray-500">Performance</p>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Views</p>
                <p className="mt-1 font-semibold text-gray-900">{listing.views}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Bookings</p>
                <p className="mt-1 font-semibold text-gray-900">{listing.bookings}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Rating</p>
                <p className="mt-1 font-semibold text-gray-900">{listing.rating} ({listing.reviews})</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Revenue</p>
                <p className="mt-1 font-semibold text-gray-900">{listing.currency} {listing.revenue}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-xs uppercase tracking-wide text-gray-500">Amenities preview</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {(form.amenities || "")
                .split(",")
                .map((a) => a.trim())
                .filter(Boolean)
                .map((amenity) => (
                  <span key={amenity} className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                    {amenity}
                  </span>
                ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-xs uppercase tracking-wide text-gray-500">Quick actions</p>
            <div className="mt-3 flex flex-col gap-2">
              <Link
                href="/partner/calendar"
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Update availability
              </Link>
              <Link
                href="/partner/bookings"
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                View bookings
              </Link>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
