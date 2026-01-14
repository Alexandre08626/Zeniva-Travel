"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { resortPartners, type ResortPartner, type ResortStatus } from "@/src/data/partners/resorts";
import { TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE } from "@/src/design/tokens";

const statusLabel: Record<ResortStatus, string> = {
  active: "Active",
  onboarding: "Onboarding",
  suspended: "Suspended",
};

const statusColor: Record<ResortStatus, string> = {
  active: "bg-emerald-100 text-emerald-800",
  onboarding: "bg-amber-100 text-amber-800",
  suspended: "bg-slate-200 text-slate-700",
};

export default function PartnerResortsPage() {
  const [selectedId, setSelectedId] = useState(resortPartners[0]?.id ?? "");
  const [filters, setFilters] = useState<{ status: ResortStatus | "all"; type: string }>({ status: "all", type: "" });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const filtered = useMemo(() => {
    return resortPartners.filter((r) => {
      const matchStatus = filters.status === "all" || r.status === filters.status;
      const matchType = !filters.type || r.type.toLowerCase().includes(filters.type.toLowerCase());
      return matchStatus && matchType;
    });
  }, [filters]);

  const selected = resortPartners.find((r) => r.id === selectedId) ?? filtered[0] ?? resortPartners[0];

  const openLightbox = (images: string[], idx: number) => {
    setLightboxImages(images);
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const goPrev = () => {
    setLightboxIndex((i) => (lightboxImages.length ? (i - 1 + lightboxImages.length) % lightboxImages.length : 0));
  };

  const goNext = () => {
    setLightboxIndex((i) => (lightboxImages.length ? (i + 1) % lightboxImages.length : 0));
  };

  return (
    <>
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Partner Resorts</p>
            <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>Official hotel partner base</h1>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>
              Centralize partner data, media, rates, and marketing assets for Lina AI and agents. Closed B2B network only.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">{resortPartners.filter(r => r.status === "active").length} active</span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">{resortPartners.filter(r => r.status === "onboarding").length} onboarding</span>
          </div>
        </header>

        <section className="rounded-2xl bg-white shadow-sm border border-slate-200 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-3">
              <select
                value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as ResortStatus | "all" }))}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="onboarding">Onboarding</option>
                <option value="suspended">Suspended</option>
              </select>
              <input
                placeholder="Filter by type (resort, boutique...)"
                className="rounded-lg border px-3 py-2 text-sm"
                value={filters.type}
                onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
              />
            </div>
            <Link
              href="#new-partner"
              className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-900"
            >
              Add partner
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {filtered.map((r) => {
              const cover = r.media?.[0]?.images?.[0] || "/branding/icon-proposals.svg";
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={`rounded-xl border text-left transition shadow-sm overflow-hidden ${selected?.id === r.id ? "border-black shadow" : "border-slate-200"}`}
                >
                  <div className="h-32 w-full overflow-hidden bg-slate-100">
                    <Image
                      src={cover}
                      alt={r.name}
                      width={800}
                      height={480}
                      className="h-full w-full object-cover"
                      sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 100vw"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusColor[r.status]}`}>
                        {statusLabel[r.status]}
                      </div>
                      <span className="text-xs text-slate-500">{r.type}</span>
                    </div>
                    <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>{r.name}</h3>
                    <p className="text-sm text-slate-600">{r.destination}</p>
                    <div className="mt-1 flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-700">View partner</span>
                      <span className="text-xs text-slate-500">Marketing · Sales · Ops</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {selected && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Partner file</p>
                    <h2 className="text-2xl font-black" style={{ color: TITLE_TEXT }}>{selected.name}</h2>
                    <p className="text-sm text-slate-600">{selected.destination} · {selected.type}</p>
                    <p className="mt-2 text-sm" style={{ color: MUTED_TEXT }}>{selected.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-700">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold">{selected.positioning}</span>
                      {selected.keywords.map((k) => (
                        <span key={k} className="rounded-full bg-slate-100 px-2 py-1">{k}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 text-sm font-semibold">
                    <Link href="/payment" className="rounded-full bg-black px-3 py-1.5 text-white text-center shadow hover:bg-slate-900">
                      Book with Zeniva
                    </Link>
                    <Link href="/proposals" className="rounded-full border px-3 py-1.5 text-center text-slate-800 hover:bg-slate-50">
                      Add to proposal
                    </Link>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                    <div className="font-semibold text-slate-900">Commercials</div>
                    <ul className="mt-2 space-y-1">
                      <li>Model: {selected.commercials.model}</li>
                      <li>Commission: {selected.commercials.commission}</li>
                      {selected.commercials.netRate && <li>Net: {selected.commercials.netRate}</li>}
                      {selected.commercials.blackoutNotes && <li>Blackouts: {selected.commercials.blackoutNotes}</li>}
                    </ul>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                    <div className="font-semibold text-slate-900">Pricing & availability</div>
                    <ul className="mt-2 space-y-1">
                      <li>Public from: {selected.pricing.publicRateFrom}</li>
                      {selected.pricing.netRateFrom && <li>Net from: {selected.pricing.netRateFrom}</li>}
                      <li>{selected.pricing.seasonality}</li>
                      {selected.pricing.blackoutDates && <li>Blackouts: {selected.pricing.blackoutDates}</li>}
                      {selected.pricing.availabilityNotes && <li>{selected.pricing.availabilityNotes}</li>}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                    <div className="font-semibold text-slate-900">Rooms</div>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      {selected.roomTypes.map((r) => <li key={r}>{r}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                    <div className="font-semibold text-slate-900">Amenities & policies</div>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      {selected.amenities.map((a) => <li key={a}>{a}</li>)}
                      {selected.policies.map((p) => <li key={p}>{p}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Photos & media</p>
                    <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Approved assets</h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">Reuse in ads, proposals, socials</span>
                </div>
                <div className="space-y-3">
                  {selected.media.map((cat) => (
                    <div key={cat.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-800">{cat.name}</div>
                        <div className="text-xs text-slate-500">{cat.images.length} assets</div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {cat.images.map((img, idx) => (
                          <button
                            key={img}
                            type="button"
                            onClick={() => openLightbox(cat.images, idx)}
                            className="h-32 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-black"
                          >
                            <Image
                              src={img}
                              alt={`${selected.name} ${cat.name} ${idx + 1}`}
                              width={900}
                              height={520}
                              className="h-full w-full object-cover"
                              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Marketing & ads</p>
                    <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Ready-to-run copy</h3>
                  </div>
                  <div className="text-xs text-slate-600">Targets: {selected.marketing.targetMarkets.join(", ")}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-800">
                  <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                    <div className="font-semibold text-slate-900">Ad hooks</div>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      {selected.marketing.adHooks.map((h) => <li key={h}>{h}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                    <div className="font-semibold text-slate-900">Social captions</div>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      {selected.marketing.socialCaptions.map((c) => <li key={c}>{c}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                    <div className="font-semibold text-slate-900">Video script</div>
                    <p className="mt-2 text-slate-700">{selected.marketing.videoScript}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3 bg-slate-50 space-y-2">
                    <div className="font-semibold text-slate-900">Campaign settings</div>
                    <p className="text-slate-700">Markets: {selected.marketing.targetMarkets.join(", ")}</p>
                    <p className="text-slate-700">Client types: {selected.marketing.clientTypes.join(", ")}</p>
                    <p className="text-slate-700">Budget: {selected.marketing.budgetRange}</p>
                    <div className="text-xs text-slate-600">History:</div>
                    <ul className="space-y-1 list-disc list-inside text-sm">
                      {selected.marketing.campaignHistory.map((h) => <li key={h}>{h}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" id="new-partner">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Add travel service</p>
                <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Flights · Transfers · Cars</h3>
                <form className="mt-3 space-y-3">
                  <select className="w-full rounded-lg border px-3 py-2 text-sm bg-slate-50 font-semibold">
                    <option value="flight">Flight</option>
                    <option value="transfer">Transfer</option>
                    <option value="car">Car rental</option>
                  </select>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="From (city / airport / pickup)" />
                    <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="To (city / airport / dropoff)" />
                  </div>
                  <div className="rounded-lg border px-3 py-3 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                      <span>Calendrier</span>
                      <span className="text-xs text-slate-500">Sélectionnez vos dates</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <input type="date" className="w-full rounded-lg border px-3 py-2 text-sm" title="Date de départ / pickup" />
                      <input type="time" className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Heure" />
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <input type="date" className="w-full rounded-lg border px-3 py-2 text-sm" title="Date de retour (optionnel)" />
                      <input type="time" className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Heure retour (optionnel)" />
                    </div>
                  </div>
                  <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Supplier (airline / ground op / rental agency)" />
                  <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Travelers & baggage (e.g., 2 adults, 2 checked)" />
                  <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Flight # or vehicle class" />
                  <div className="rounded-lg border border-dashed px-3 py-2 text-sm bg-slate-50">
                    <label className="flex items-center gap-2 font-semibold text-slate-900">
                      <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300" />
                      Let Lina AI auto-prepare
                    </label>
                    <p className="mt-1 text-xs text-slate-600">AI drafts routes, seat prefs, ground notes, and checks feasibility.</p>
                    <textarea className="mt-2 w-full rounded-md border px-2 py-2 text-sm" placeholder="Instructions for Lina (e.g., window seats, VIP meet & greet, bilingual driver)"></textarea>
                  </div>
                  <textarea className="w-full rounded-lg border px-3 py-2 text-sm min-h-[90px]" placeholder="Notes: seat prefs, child seats, meet & greet, extras"></textarea>
                  <button type="button" className="w-full rounded-full bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-900">
                    Save & launch Lina ops
                  </button>
                </form>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Lina AI tasks</p>
                <ul className="space-y-2 text-sm text-slate-800">
                  <li>✔️ Crawl official site for description, rooms, amenities, policies</li>
                  <li>✔️ Extract photos for ads/proposals (categorize)</li>
                  <li>✔️ Detect positioning & keywords</li>
                  <li>✔️ Prepare ad hooks, captions, video script</li>
                  <li>✔️ Store rates/seasonality/blackouts</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2 text-sm text-slate-800">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Agent workflow</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Consult validated copy & media</li>
                  <li>Insert into proposals instantly</li>
                  <li>Reuse ad-approved assets in campaigns</li>
                </ul>
                <Link href="/proposals" className="inline-flex items-center rounded-full bg-white border px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50">
                  Open proposals
                </Link>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3 text-sm text-slate-800">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Scalability</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>One hotel at a time, closed network</li>
                  <li>Data reusable by Lina, agents, marketing</li>
                  <li>Faster than open OTAs; partner-first</li>
                </ul>
              </div>
            </aside>
          </section>
        )}
      </div>
    </main>

    {lightboxOpen && lightboxImages.length > 0 && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true">
        <button
          type="button"
          onClick={closeLightbox}
          className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-slate-900 shadow"
        >
          Close
        </button>
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900 shadow"
        >
          Prev
        </button>
        <div className="relative max-w-5xl w-full">
          <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-900">
            <Image
              src={lightboxImages[lightboxIndex]}
              alt="Gallery item"
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          <div className="mt-3 flex justify-center gap-2">
            {lightboxImages.map((img, idx) => (
              <button
                key={img}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className={`h-14 w-20 overflow-hidden rounded border ${idx === lightboxIndex ? "border-white" : "border-slate-400/60"}`}
              >
                <Image
                  src={img}
                  alt={`Thumb ${idx + 1}`}
                  width={160}
                  height={90}
                  className="h-full w-full object-cover"
                  sizes="120px"
                />
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900 shadow"
        >
          Next
        </button>
      </div>
    )}
    </>
  );
}
