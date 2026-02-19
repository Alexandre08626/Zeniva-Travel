"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

type OfferCard = {
  id: string;
  carrier: string;
  code: string;
  duration: string;
  depart: string;
  arrive: string;
  price: string;
  cabin: string;
  stops: string;
  carrierCode?: string;
  carrierLogo?: string;
  badge?: string;
  slices?: Array<{
    origin?: { code?: string; name?: string };
    destination?: { code?: string; name?: string };
    departingAt?: string;
    arrivingAt?: string;
    durationMinutes?: number;
    segments: Array<{
      marketingCarrier?: string;
      operatingCarrier?: string;
      marketingCarrierCode?: string;
      operatingCarrierCode?: string;
      marketingFlightNumber?: string;
      operatingFlightNumber?: string;
      departingAt?: string;
      arrivingAt?: string;
      origin?: { code?: string; name?: string };
      destination?: { code?: string; name?: string };
      aircraft?: string;
      cabin?: string;
      distanceKm?: number;
      amenities?: string[];
    }>;
  }>;
};

function getAirlineLogo(code?: string, carrier?: string) {
  const normalizedCode = (code || "").trim().toUpperCase();
  if (normalizedCode) return `https://images.kiwi.com/airlines/64/${normalizedCode}.png`;
  const fallbackCode = String(carrier || "").trim().slice(0, 2).toUpperCase();
  return fallbackCode ? `https://images.kiwi.com/airlines/64/${fallbackCode}.png` : "";
}

type SearchContext = {
  from?: string;
  to?: string;
  depart?: string;
  ret?: string;
  passengers?: string;
  cabin?: string;
};

export default function FlightOffers({
  offers = [],
  roundTrip = false,
  searchContext,
}: {
  offers: OfferCard[];
  roundTrip?: boolean;
  searchContext?: SearchContext;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const router = useRouter();

  const fmtTime = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  const fmtDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  };

  const fmtDuration = (minutes?: number) => {
    if (!minutes && minutes !== 0) return "";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (!h) return `${m}m`;
    if (!m) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const diffMinutes = (a?: string, b?: string) => {
    if (!a || !b) return null;
    const da = new Date(a);
    const db = new Date(b);
    if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) return null;
    const ms = db.getTime() - da.getTime();
    if (!Number.isFinite(ms) || ms <= 0) return null;
    return Math.round(ms / 60000);
  };

  function goToReview(selectedOffers: OfferCard[]) {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        "flight_selection",
        JSON.stringify({ offers: selectedOffers, searchContext })
      );
    }
    const first = selectedOffers[0];
    const params = new URLSearchParams({
      id: first?.id || "",
      carrier: first?.carrier || "",
      carrierCode: first?.carrierCode || "",
      carrierLogo: first?.carrierLogo || "",
      code: first?.code || "",
      depart: first?.depart || "",
      arrive: first?.arrive || "",
      duration: first?.duration || "",
      stops: first?.stops || "",
      cabin: first?.cabin || "",
      price: first?.price || "",
      from: searchContext?.from || "",
      to: searchContext?.to || "",
      departDate: searchContext?.depart || "",
      returnDate: searchContext?.ret || "",
      passengers: searchContext?.passengers || "",
    });
    router.push(`/booking/flights/review?${params.toString()}`);
  }

  function toggle(offer: OfferCard) {
    setSelected([offer.id]);
    goToReview([offer]);
  }

  const canProceed = selected.length >= 1;

  return (
    <div className="space-y-3">
      {offers.map((r) => (
        <div
          key={r.id}
          className={`rounded-2xl border p-4 shadow-sm transition-all flex flex-col gap-3 md:flex-row md:items-center md:justify-between ${selected.includes(r.id) ? 'ring-2 ring-blue-200 border-blue-300 bg-white' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'}`}
        >
          <div className="flex items-start gap-3">
            {(r.carrierLogo || getAirlineLogo(r.carrierCode, r.carrier)) ? (
              <img
                src={r.carrierLogo || getAirlineLogo(r.carrierCode, r.carrier)}
                alt={r.carrier}
                className="h-12 w-12 rounded-xl bg-white border border-slate-200 object-contain p-1"
                loading="lazy"
              />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-800">
                {r.carrier[0] || "?"}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">{r.carrier}{r.carrierCode ? ` (${r.carrierCode})` : ""} · {r.code}</p>
              <p className="text-xl font-black text-slate-900">{r.depart} → {r.arrive}</p>
              <p className="text-sm text-slate-600">{r.duration} · {r.stops} · {r.cabin || "Cabin details pending"}</p>
              <div className="mt-1">
                <button
                  type="button"
                  onClick={() => setExpandedId((prev) => (prev === r.id ? null : r.id))}
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  Flight details
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:flex-col md:items-end">
            <span className="text-xl font-black text-slate-900">{r.price}</span>
            <div className="flex items-center gap-2">
              {r.badge && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">{r.badge}</span>}
              <button onClick={() => toggle(r)} className={`rounded-full px-4 py-2 text-sm font-semibold ${selected.includes(r.id) ? 'bg-slate-800 text-white' : 'bg-black text-white'}`}>
                {selected.includes(r.id) ? 'Selected' : 'Select'}
              </button>
            </div>
          </div>

          {expandedId === r.id ? (
            <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {Array.isArray(r.slices) && r.slices.length > 0 ? (
                <div className="space-y-4">
                  {r.slices.map((slice, sliceIdx) => (
                    <div key={`slice-${r.id}-${sliceIdx}`} className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                          {r.slices && r.slices.length > 1
                            ? sliceIdx === 0
                              ? "Outbound"
                              : "Return"
                            : "Itinerary"}
                        </div>
                        <div className="text-xs text-slate-600">
                          {(slice.origin?.name || slice.origin?.code || "").trim()} → {(slice.destination?.name || slice.destination?.code || "").trim()}
                          {slice.departingAt ? ` · ${fmtDate(slice.departingAt)}` : ""}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {(slice.segments || []).map((seg, segIdx) => {
                          const operatedBy = seg.operatingCarrier && seg.marketingCarrier && seg.operatingCarrier !== seg.marketingCarrier
                            ? seg.operatingCarrier
                            : "";
                          const dep = seg.departingAt;
                          const arr = seg.arrivingAt;
                          const next = (slice.segments || [])[segIdx + 1];
                          const layoverMin = next ? diffMinutes(arr, next.departingAt) : null;

                          return (
                            <div key={`seg-${r.id}-${sliceIdx}-${segIdx}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                              <div className="text-xs font-semibold text-slate-600">Flight {segIdx + 1} of {(slice.segments || []).length}</div>
                              <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
                                <div className="font-semibold text-slate-900">
                                  {seg.marketingCarrier || r.carrier}
                                  {seg.marketingFlightNumber ? ` · ${seg.marketingFlightNumber}` : (r.code ? ` · ${r.code}` : "")}
                                </div>
                                <div className="text-xs text-slate-600">Cabin: {seg.cabin || r.cabin || "—"}</div>
                              </div>
                              {operatedBy ? (
                                <div className="text-xs text-slate-600">Operated by {operatedBy}</div>
                              ) : null}
                              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                <div>
                                  <div className="font-semibold text-slate-700">{seg.origin?.name || seg.origin?.code || "Origin"}</div>
                                  <div className="text-slate-600">{seg.origin?.code || ""} · {fmtTime(dep)}{dep ? ` · ${fmtDate(dep)}` : ""}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-700">{seg.destination?.name || seg.destination?.code || "Destination"}</div>
                                  <div className="text-slate-600">{seg.destination?.code || ""} · {fmtTime(arr)}{arr ? ` · ${fmtDate(arr)}` : ""}</div>
                                </div>
                              </div>

                              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-600">
                                {seg.aircraft ? <div>Aircraft: {seg.aircraft}</div> : null}
                                {typeof seg.distanceKm === "number" ? <div>Distance: {seg.distanceKm} km</div> : null}
                                {Array.isArray(seg.amenities) && seg.amenities.length > 0 ? (
                                  <div>Amenities: {seg.amenities.slice(0, 4).join(", ")}</div>
                                ) : null}
                              </div>

                              {layoverMin !== null ? (
                                <div className="mt-2 text-xs text-slate-600">
                                  {fmtDuration(layoverMin)} layover
                                  {next?.origin?.name || next?.origin?.code ? ` in ${next.origin?.name || next.origin?.code}` : ""}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="text-xs font-semibold text-slate-600">Itinerary</div>
                  <div className="mt-1">Carrier: {r.carrier}{r.code ? ` · ${r.code}` : ""}</div>
                  <div>Duration: {r.duration || "—"} · Stops: {r.stops || "—"}</div>
                  <div>Cabin: {r.cabin || "—"}</div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      ))}
      {roundTrip && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">Selected: {selected.length}</div>
          <div>
            <button
              disabled={!canProceed}
              onClick={() => {
                const chosen = offers.filter((o) => selected.includes(o.id));
                if (chosen.length) goToReview(chosen);
              }}
              className={`rounded-full px-4 py-2 font-semibold ${canProceed ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}
            >
              Review selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
