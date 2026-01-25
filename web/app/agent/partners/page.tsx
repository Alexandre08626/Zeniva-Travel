"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "../../../src/lib/authStore";
import { TITLE_TEXT, MUTED_TEXT } from "../../../src/design/tokens";
import { partnerOrganizations, propertyOwners, listingAssignments, type PartnerOrganization, type PropertyOwner } from "../../../src/lib/partnerRelations";
import { mockListings } from "../../../src/lib/mockData";
import { resortPartners } from "../../../src/data/partners/resorts";
import AirbnbAvailability from "../../../src/components/airbnbs/AirbnbAvailability.client";


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

type ListingType = "yacht" | "home" | "hotel";

type PartnerListing = {
  id: string;
  partnerId?: string;
  title: string;
  type: ListingType;
  status?: string;
  thumbnail?: string;
  images?: string[];
  location?: string;
  price?: number | string;
  currency?: string;
  description?: string;
  amenities?: string[];
  capacity?: number;
  bedrooms?: number;
  bathrooms?: number;
  rating?: number;
  reviews?: number;
};

const TYPE_LABELS: Record<ListingType, string> = {
  yacht: "Yacht",
  home: "Airbnb",
  hotel: "Hotel",
};

export default function PartnerAccountsPage() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<PartnerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<"all" | ListingType>("all");
  const [query, setQuery] = useState("");
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [remoteListings, setRemoteListings] = useState<PartnerListing[]>([]);
  const [bookingDetails, setBookingDetails] = useState({
    checkIn: "",
    checkOut: "",
    travelers: 2,
    rooms: 1,
    roomType: "Standard",
  });

  const canView = !!user && (() => {
    const roles = user.roles || (user.role ? [user.role] : []);
    return roles.includes("hq") || roles.includes("admin");
  })();

  const dynamicPartners = useMemo<PartnerOrganization[]>(() => {
    if (!data.length) return [];
    const partnerAccounts = data.filter((account) => {
      const roles = Array.isArray(account.roles) && account.roles.length ? account.roles : account.role ? [account.role] : [];
      return roles.includes("partner_owner") || roles.includes("partner_staff");
    });

    return partnerAccounts.map((account, index) => {
      const baseId = account.id || account.email || account.name || `partner-${index + 1}`;
      const normalized = String(baseId).toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const partnerId = normalized || `partner-${index + 1}`;
      return {
        id: partnerId,
        displayName: account.name || "Partner",
        legalName: account.name || "Partner",
        primaryContactEmail: account.email,
        phone: "—",
        ownerId: `owner-${partnerId}`,
      } as PartnerOrganization;
    });
  }, [data]);

  const dynamicOwners = useMemo<PropertyOwner[]>(() => {
    return dynamicPartners.map((partner) => ({
      id: partner.ownerId,
      name: partner.displayName,
      email: partner.primaryContactEmail,
      phone: partner.phone || "—",
    }));
  }, [dynamicPartners]);

  const mergedPartners = useMemo<PartnerOrganization[]>(() => {
    const dedupe = new Map<string, PartnerOrganization>();
    [...partnerOrganizations, ...dynamicPartners].forEach((partner) => {
      const key = partner.id || partner.primaryContactEmail;
      if (!key) return;
      if (!dedupe.has(key)) dedupe.set(key, partner);
    });
    return Array.from(dedupe.values());
  }, [dynamicPartners]);

  const mergedOwners = useMemo<PropertyOwner[]>(() => {
    const dedupe = new Map<string, PropertyOwner>();
    [...propertyOwners, ...dynamicOwners].forEach((owner) => {
      const key = owner.id || owner.email;
      if (!key) return;
      if (!dedupe.has(key)) dedupe.set(key, owner);
    });
    return Array.from(dedupe.values());
  }, [dynamicOwners]);

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

  useEffect(() => {
    if (!canView) return;
    let active = true;

    const extractLocationFromDescription = (description?: string) => {
      if (!description) return "";
      const marker = "property location";
      const lower = description.toLowerCase();
      const idx = lower.indexOf(marker);
      if (idx === -1) return "";
      const after = description.slice(idx + marker.length);
      const lines = after.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const first = lines[0] || "";
      if (!first || first === "â€‹") return "";
      return first;
    };

    const normalizeHomeLocation = (location?: string, description?: string) => {
      const raw = (location || "").trim();
      if (raw && raw.toLowerCase() !== "property description") return raw;
      return extractLocationFromDescription(description);
    };

    const mapPartnerForHome = (location?: string, description?: string) => {
      const loc = (normalizeHomeLocation(location, description) || "").toLowerCase();
      if (loc.includes("barcelona")) return "partner-home-02";
      if (loc.includes("lac-beauport") || loc.includes("beauport") || loc.includes("quebec") || loc.includes("canada")) return "partner-home-01";
      if (loc.includes("tulum") || loc.includes("quintana roo") || loc.includes("holbox") || loc.includes("mexico") || loc.includes("méxico")) return "partner-home-03";
      if (loc.includes("polynes") || loc.includes("tahiti") || loc.includes("bora bora") || loc.includes("tikehau") || loc.includes("taha'a") || loc.includes("tahaa") || loc.includes("moorea") || loc.includes("papeete")) return "partner-home-04";
      if (loc.includes("florida") || loc.includes("floride") || loc.includes("fort lauderdale") || loc.includes("hollywood") || loc.includes("hallandale") || loc.includes("pompano") || loc.includes("deerfield") || loc.includes("sunny isles") || loc.includes("wilton manors") || loc.includes("états-unis") || loc.includes("etats-unis") || loc.includes("usa") || loc.includes("united states")) return "partner-home-05";
      if (loc.includes("dominican") || loc.includes("juan dolio")) return "partner-home-06";
      if (loc.includes("madagascar")) return "partner-home-07";
      return undefined;
    };

    const mapPartnerForResort = (destination?: string, email?: string) => {
      const dest = (destination || "").toLowerCase();
      const mail = (email || "").toLowerCase();
      if (mail.includes("pearlresorts") || dest.includes("bora bora") || dest.includes("tahiti") || dest.includes("tikehau") || dest.includes("taha'a") || dest.includes("tahaa")) {
        return "partner-resort-02";
      }
      if (dest.includes("dominican") || dest.includes("punta cana") || mail.includes("tribe")) {
        return "partner-resort-03";
      }
      return "partner-resort-01";
    };

    const resortListings: PartnerListing[] = resortPartners.map((resort) => ({
      id: `resort-${resort.id}`,
      partnerId: mapPartnerForResort(resort.destination, resort.contact?.email),
      title: resort.name,
      type: "hotel",
      status: resort.status,
      thumbnail: resort.media?.[0]?.images?.[0],
      images: resort.media?.flatMap((cat) => cat.images) || [],
      location: resort.destination,
      price: resort.pricing?.publicRateFrom,
      currency: resort.pricing?.publicRateFrom?.includes("$") ? "USD" : undefined,
      description: resort.description,
      amenities: resort.amenities,
    }));

    const ycnReq = fetch("/api/partners/ycn").then((r) => r.json()).catch(() => []);
    const yachtReq = fetch("/api/public/listings?type=yacht")
      .then((r) => r.json())
      .then((res) => (res && res.data) || [])
      .catch(() => []);
    const airbnbReq = fetch("/api/partners/airbnbs").then((r) => r.json()).catch(() => []);
    const homeReq = fetch("/api/public/listings?type=home")
      .then((r) => r.json())
      .then((res) => (res && res.data) || [])
      .catch(() => []);

    Promise.all([ycnReq, yachtReq, airbnbReq, homeReq])
      .then(([ycnData, yachtData, airbnbData, homeData]) => {
        if (!active) return;
        const ycnListings: PartnerListing[] = (ycnData || []).map((item: any, idx: number) => ({
          id: item?.id || `ycn-${idx}`,
          partnerId: "partner-yacht-01",
          title: item?.title || "Yacht Charter",
          type: "yacht",
          status: "published",
          thumbnail: item?.thumbnail || (item?.images && item.images[0]),
          images: item?.images || [],
          location: item?.destination || "",
          price: (item?.prices && item.prices[0]) || "Request",
          currency: (item?.prices && item.prices[0] && item.prices[0].includes("USD")) ? "USD" : undefined,
        }));

        const yachtListings: PartnerListing[] = (yachtData || []).map((item: any, idx: number) => ({
          id: item?.id || `yacht-${idx}`,
          partnerId: item?.partnerId || "partner-yacht-01",
          title: item?.title || "Yacht Charter",
          type: "yacht",
          status: item?.status || "published",
          thumbnail: item?.data?.thumbnail || (item?.data?.images && item.data.images[0]),
          images: item?.data?.images || [],
          location: item?.data?.location || item?.data?.destination || "",
          price: (item?.data?.prices && item.data.prices[0]) || item?.data?.price || "Request",
          currency: item?.data?.currency,
        }));

        const airbnbListings: PartnerListing[] = (airbnbData || [])
          .map((item: any, idx: number) => {
            const mappedLocation = normalizeHomeLocation(item?.location, item?.description);
            const partnerId = mapPartnerForHome(item?.location, item?.description);
            if (!partnerId) return null;
            return {
              id: item?.id || `airbnb-${idx}`,
              partnerId,
              title: item?.title || "Residence",
              type: "home",
              status: "published",
              thumbnail: item?.thumbnail || (item?.images && item.images[0]),
              images: item?.images || [],
              location: mappedLocation || item?.location || "",
              description: item?.description || "",
            } as PartnerListing;
          })
          .filter(Boolean) as PartnerListing[];

        const homeListings: PartnerListing[] = (homeData || [])
          .map((item: any, idx: number) => {
            const partnerId = mapPartnerForHome(item?.data?.location || item?.data?.destination, item?.data?.description);
            if (!partnerId) return null;
            return {
              id: item?.id || `home-${idx}`,
              partnerId,
              title: item?.title || "Residence",
              type: "home",
              status: item?.status || "published",
              thumbnail: item?.data?.thumbnail || (item?.data?.images && item.data.images[0]),
              images: item?.data?.images || [],
              location: item?.data?.location || item?.data?.destination || "",
              description: item?.data?.description || "",
            } as PartnerListing;
          })
          .filter(Boolean) as PartnerListing[];

        setRemoteListings([...resortListings, ...ycnListings, ...yachtListings, ...airbnbListings, ...homeListings]);
      })
      .catch(() => {
        if (!active) return;
        setRemoteListings(resortListings);
      });

    return () => {
      active = false;
    };
  }, [canView]);

  const partnerListings = useMemo<PartnerListing[]>(() => {
    const baseListings = mockListings
      .filter((listing) => listing.status === "published")
      .map((listing) => ({
        id: listing.id,
        partnerId: listing.partnerId,
        title: listing.title,
        type: listing.type as ListingType,
        status: listing.status,
        thumbnail: listing.thumbnail,
        images: listing.amenities
          ? (listing.amenities.map(() => listing.thumbnail).filter(Boolean) as string[])
          : listing.thumbnail
            ? [listing.thumbnail]
            : [],
        location: listing.location,
        price: listing.price,
        currency: listing.currency,
        description: listing.description,
        amenities: listing.amenities,
        capacity: listing.capacity,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        rating: listing.rating,
        reviews: listing.reviews,
      }));

    const dedupe = new Map<string, PartnerListing>();
    [...baseListings, ...remoteListings].forEach((listing) => {
      if (!listing?.id) return;
      if (!dedupe.has(listing.id)) {
        dedupe.set(listing.id, listing);
      }
    });
    return Array.from(dedupe.values());
  }, [remoteListings]);

  const partnersWithListings = useMemo(() => {
    return mergedPartners.map((partner) => {
      const account = data.find((row) => row.id === partner.id || row.email === partner.primaryContactEmail);
      const owner = mergedOwners.find((o) => o.id === partner.ownerId);
      const listings = partnerListings.filter((listing) => listing.partnerId === partner.id);
      const assignments = listingAssignments.filter((assignment) => assignment.partnerId === partner.id);
      const locations = Array.from(new Set(listings.map((listing) => listing.location)));
      return {
        partner,
        owner,
        account,
        listings,
        assignments,
        locations,
        listingTypes: Array.from(new Set(listings.map((listing) => listing.type as ListingType))),
      };
    });
  }, [data, partnerListings]);

  const filteredPartners = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return partnersWithListings
      .filter((entry) => (typeFilter === "all" ? true : entry.listings.some((listing) => listing.type === typeFilter)))
      .filter((entry) => {
        if (!normalizedQuery) return true;
        const haystack = [
          entry.partner.displayName,
          entry.partner.legalName,
          entry.partner.primaryContactEmail,
          entry.owner?.name,
          ...entry.locations,
          ...entry.listings.map((listing) => listing.title),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .sort((a, b) => a.partner.displayName.localeCompare(b.partner.displayName));
  }, [partnersWithListings, query, typeFilter]);

  const selectedPartner = useMemo(() => {
    if (!filteredPartners.length) return null;
    const byId = filteredPartners.find((entry) => entry.partner.id === selectedPartnerId);
    return byId || filteredPartners[0];
  }, [filteredPartners, selectedPartnerId]);

  const selectedListing = useMemo(() => {
    if (!selectedPartner || !selectedListingId) return null;
    return selectedPartner.listings.find((listing) => listing.id === selectedListingId) || null;
  }, [selectedPartner, selectedListingId]);

  useEffect(() => {
    if (!selectedPartner?.listings?.length) {
      setSelectedListingId(null);
      return;
    }
    setSelectedListingId((prev) => prev || selectedPartner.listings[0].id);
  }, [selectedPartner]);

  const bookingStorageKey = selectedListing ? `agent:partner:dates:${selectedListing.id}` : "";

  useEffect(() => {
    if (!selectedListingId) return;
    setBookingDetails({
      checkIn: "",
      checkOut: "",
      travelers: 2,
      rooms: 1,
      roomType: "Standard",
    });
  }, [selectedListingId]);

  useEffect(() => {
    if (!bookingStorageKey || typeof window === "undefined") return;
    const stored = window.localStorage.getItem(bookingStorageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { start?: string; end?: string };
        setBookingDetails((prev) => ({
          ...prev,
          checkIn: parsed.start || "",
          checkOut: parsed.end || "",
        }));
      } catch {
        // ignore
      }
    }

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string; start: string | null; end: string | null }>).detail;
      if (!detail || detail.key !== bookingStorageKey) return;
      setBookingDetails((prev) => ({
        ...prev,
        checkIn: detail.start || "",
        checkOut: detail.end || "",
      }));
    };

    window.addEventListener("airbnb:dates", handler as EventListener);
    return () => window.removeEventListener("airbnb:dates", handler as EventListener);
  }, [bookingStorageKey]);

  const handleDownloadPresentation = (listing: PartnerListing) => {
    const title = listing.title || "Partner Listing";
    const heroImage = listing.images?.[0] || listing.thumbnail || "";
    const amenities = listing.amenities?.length ? listing.amenities : [];
    const priceLabel = listing.price
      ? `${listing.currency ? `${listing.currency} ` : ""}${listing.price}`
      : "Price on request";

    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} – Zeniva Travel</title>
    <style>
      body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #0f172a; background: #f8fafc; }
      .wrap { max-width: 720px; margin: 0 auto; padding: 32px 24px 48px; }
      .card { background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); overflow: hidden; }
      .hero { width: 100%; height: 280px; object-fit: cover; background: #e2e8f0; }
      .content { padding: 24px; }
      .badge { display: inline-block; padding: 6px 12px; border-radius: 999px; background: #0f172a; color: #fff; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
      h1 { margin: 16px 0 6px; font-size: 26px; }
      .muted { color: #475569; font-size: 14px; margin: 0 0 12px; }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 16px 0; }
      .panel { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; font-size: 14px; }
      .panel strong { display: block; margin-bottom: 4px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; }
      .amenities { display: flex; flex-wrap: wrap; gap: 8px; }
      .amenities span { border: 1px solid #e2e8f0; border-radius: 999px; padding: 6px 10px; font-size: 12px; }
      .cta { margin-top: 20px; font-size: 14px; color: #0f172a; }
      .footer { margin-top: 20px; font-size: 12px; color: #94a3b8; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        ${heroImage ? `<img class="hero" src="${heroImage}" alt="${title}" />` : `<div class="hero"></div>`}
        <div class="content">
          <span class="badge">Zeniva Partner</span>
          <h1>${title}</h1>
          <p class="muted">${listing.location || "Destination available on request"}</p>
          <div class="grid">
            <div class="panel"><strong>Category</strong>${TYPE_LABELS[listing.type]}</div>
            <div class="panel"><strong>Price</strong>${priceLabel}</div>
            <div class="panel"><strong>Capacity</strong>${listing.capacity ? `${listing.capacity} guests` : "Custom"}</div>
            <div class="panel"><strong>Bedrooms</strong>${listing.bedrooms ?? "Custom"}</div>
            <div class="panel"><strong>Bathrooms</strong>${listing.bathrooms ?? "Custom"}</div>
            <div class="panel"><strong>Rating</strong>${listing.rating ? `${listing.rating} (${listing.reviews || 0} reviews)` : "Preferred partner"}</div>
          </div>
          <p class="muted">${listing.description || "A curated Zeniva Travel partner listing prepared for your client."}</p>
          ${amenities.length ? `<div class="amenities">${amenities.map((a) => `<span>${a}</span>`).join("")}</div>` : ""}
          <p class="cta">Reply to this email to reserve or request a full itinerary. We will confirm availability and finalize pricing.</p>
          <div class="footer">Zeniva Travel · Private partner network</div>
        </div>
      </div>
    </div>
  </body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-presentation.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  };


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

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 text-sm space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTypeFilter("all")}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${typeFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                All partners
              </button>
              {(["yacht", "home", "hotel"] as ListingType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTypeFilter(type)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${typeFilter === type ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
                >
                  {TYPE_LABELS[type]}
                </button>
              ))}
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search partner, location, or listing"
              className="w-full md:w-64 rounded-full border border-slate-200 px-4 py-2 text-sm"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{filteredPartners.length} partners</span>
            {loading && <span>Syncing partner accounts…</span>}
          </div>
          {!loading && filteredPartners.length === 0 && (
            <p className="text-slate-500">No partners match the current filters.</p>
          )}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_1.4fr]">
          <div className="space-y-3">
            {filteredPartners.map((entry) => (
              <button
                key={entry.partner.id}
                type="button"
                onClick={() => setSelectedPartnerId(entry.partner.id)}
                className={`w-full rounded-2xl border p-4 text-left shadow-sm transition ${selectedPartner?.partner.id === entry.partner.id ? "border-slate-900 bg-white" : "border-slate-200 bg-white hover:border-slate-300"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>{entry.partner.displayName}</h3>
                    <p className="text-xs" style={{ color: MUTED_TEXT }}>{entry.partner.primaryContactEmail}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${entry.account?.status === "suspended" ? "bg-rose-100 text-rose-700" : entry.account?.status === "disabled" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {entry.account?.status || "active"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                  {entry.listingTypes.map((type) => (
                    <span key={type} className="rounded-full border border-slate-200 px-3 py-1">
                      {TYPE_LABELS[type]}
                    </span>
                  ))}
                  {!entry.listingTypes.length && (
                    <span className="rounded-full border border-slate-200 px-3 py-1">No listings</span>
                  )}
                </div>
                <p className="mt-3 text-xs text-slate-500">Listings: {entry.listings.length}</p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {!selectedPartner ? (
              <p className="text-sm text-slate-500">Select a partner to view details.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Partner profile</p>
                  <h2 className="text-2xl font-black" style={{ color: TITLE_TEXT }}>{selectedPartner.partner.displayName}</h2>
                  <p className="text-sm" style={{ color: MUTED_TEXT }}>{selectedPartner.partner.legalName}</p>
                </div>

                <div className="grid gap-3 md:grid-cols-2 text-sm">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-500">Primary contact</p>
                    <p className="font-semibold" style={{ color: TITLE_TEXT }}>{selectedPartner.partner.primaryContactEmail}</p>
                    <p className="text-xs text-slate-500">{selectedPartner.partner.phone}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-500">Owner</p>
                    <p className="font-semibold" style={{ color: TITLE_TEXT }}>{selectedPartner.owner?.name || "—"}</p>
                    <p className="text-xs text-slate-500">{selectedPartner.owner?.email || ""}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-500">Locations</p>
                    <p className="font-semibold" style={{ color: TITLE_TEXT }}>{selectedPartner.locations.join(" · ") || "—"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-500">Service level</p>
                    <p className="font-semibold" style={{ color: TITLE_TEXT }}>{selectedPartner.assignments[0]?.serviceLevel || "standard"}</p>
                  </div>
                </div>

                {selectedListing && (
                  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Listing</p>
                        <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>{selectedListing.title}</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownloadPresentation(selectedListing)}
                        className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
                      >
                        Télécharger
                      </button>
                    </div>

                    {selectedListing.images && selectedListing.images.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {selectedListing.images.slice(0, 4).map((img, idx) => (
                          <img key={`${img}-${idx}`} src={img} alt={selectedListing.title} className="h-40 w-full rounded-xl object-cover" />
                        ))}
                      </div>
                    ) : selectedListing.thumbnail ? (
                      <img src={selectedListing.thumbnail} alt={selectedListing.title} className="h-52 w-full rounded-xl object-cover" />
                    ) : null}

                    <div className="grid gap-3 md:grid-cols-2 text-sm">
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-slate-500">Location</p>
                        <p className="font-semibold" style={{ color: TITLE_TEXT }}>{selectedListing.location || "—"}</p>
                        <p className="text-xs text-slate-500">{TYPE_LABELS[selectedListing.type]} · {selectedListing.status || "published"}</p>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-slate-500">Price</p>
                        <p className="font-semibold" style={{ color: TITLE_TEXT }}>
                          {selectedListing.price ? `${selectedListing.currency ? `${selectedListing.currency} ` : ""}${selectedListing.price}` : "Price on request"}
                        </p>
                        {selectedListing.rating ? (
                          <p className="text-xs text-slate-500">Rating {selectedListing.rating} · {selectedListing.reviews || 0} reviews</p>
                        ) : (
                          <p className="text-xs text-slate-500">Preferred partner listing</p>
                        )}
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-slate-500">Capacity</p>
                        <p className="font-semibold" style={{ color: TITLE_TEXT }}>
                          {selectedListing.capacity ? `${selectedListing.capacity} guests` : "—"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {selectedListing.bedrooms ? `${selectedListing.bedrooms} beds` : ""}{selectedListing.bathrooms ? ` · ${selectedListing.bathrooms} baths` : ""}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-slate-500">Description</p>
                        <p className="text-sm text-slate-700">{selectedListing.description || "No description available."}</p>
                      </div>
                    </div>

                    {selectedListing.amenities && selectedListing.amenities.length > 0 && (
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-slate-500">Amenities</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          {selectedListing.amenities.map((amenity) => (
                            <span key={amenity} className="rounded-full border border-slate-200 px-2 py-1">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="rounded-xl border border-slate-100 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Reservation details</p>
                      <div className="mt-3 space-y-4">
                        {bookingStorageKey && (
                          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                            <AirbnbAvailability storageKey={bookingStorageKey} />
                          </div>
                        )}
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="text-xs font-semibold text-slate-600">
                            Travelers
                            <input
                              type="number"
                              min={1}
                              value={bookingDetails.travelers}
                              onChange={(e) => setBookingDetails((prev) => ({ ...prev, travelers: Number(e.target.value || 1) }))}
                              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </label>
                          {selectedListing.type === "hotel" && (
                            <label className="text-xs font-semibold text-slate-600">
                              Rooms
                              <input
                                type="number"
                                min={1}
                                value={bookingDetails.rooms}
                                onChange={(e) => setBookingDetails((prev) => ({ ...prev, rooms: Number(e.target.value || 1) }))}
                                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                              />
                            </label>
                          )}
                          {selectedListing.type === "hotel" && (
                            <label className="text-xs font-semibold text-slate-600 sm:col-span-2">
                              Room type
                              <select
                                value={bookingDetails.roomType}
                                onChange={(e) => setBookingDetails((prev) => ({ ...prev, roomType: e.target.value }))}
                                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                              >
                                <option value="Standard">Standard</option>
                                <option value="Deluxe">Deluxe</option>
                                <option value="Suite">Suite</option>
                                <option value="Family">Family</option>
                              </select>
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">Listings</p>
                    <span className="text-xs text-slate-500">{selectedPartner.listings.length} total</span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {selectedPartner.listings.map((listing: PartnerListing) => (
                      <button
                        key={listing.id}
                        type="button"
                        onClick={() => setSelectedListingId(listing.id)}
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-slate-300"
                      >
                        <div className="flex items-center gap-3">
                          {listing.thumbnail ? (
                            <img
                              src={listing.thumbnail}
                              alt={listing.title}
                              className="h-14 w-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-14 w-16 rounded-lg bg-slate-100" />
                          )}
                          <div>
                            <p className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>{listing.title}</p>
                            <p className="text-xs text-slate-500">{listing.location}</p>
                            <p className="text-xs text-slate-500">
                              {TYPE_LABELS[listing.type as ListingType]} · {listing.price ? `${listing.currency ? `${listing.currency} ` : ""}${listing.price}` : "Price on request"}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>


        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 text-xs text-slate-500">
          Manage partner accounts and onboarding from this directory. Future actions (suspend, view listings) can be added here.
        </div>
      </div>
    </main>
  );
}
