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
  proposalTripId?: string;
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
      window.sessionStorage.setItem("flight_selection", JSON.stringify({ offers: selectedOffers, searchContext }));
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

  const getStopsLabel = (stops: string) => {
    if (!stops) return { label: "—", color: "bg-slate-100 text-slate-600" };
    if (/nonstop|direct/i.test(stops)) return { label: "Direct", color: "bg-emerald-100 text-emerald-700" };
    if (/1\s*stop/i.test(stops)) return { label: "1 stop", color: "bg-amber-100 text-amber-700" };
    return { label: stops, color: "bg-orange-100 text-orange-700" };
  };

  return (
    <div className="space-y-3">
      {offers.map((r) => {
        const isExpanded = expandedId === r.id;
        const isSelected = selected.includes(r.id);
        const logoSrc = r.carrierLogo || getAirlineLogo(r.carrierCode, r.carrier);
        const stopsInfo = getStopsLabel(r.stops);

        return (
          <div key={r.id} className={`rounded-2xl border overflow-hidden transition-all ${isSelected ? "border-blue-500 ring-2 ring-blue-100 bg-blue-50/30" : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"}`}>
            {/* Main card */}
            <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Airline logo */}
              <div className="flex-shrink-0">
                {logoSrc ? (
                  <img src={logoSrc} alt={r.carrier} className="h-14 w-14 rounded-xl bg-white border border-slate-200 object-contain p-1 shadow-sm" loading="lazy" />
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-lg font-black text-slate-700">
                    {(r.carrier || "?")[0]}
                  </div>
                )}
              </div>

              {/* Flight timeline */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-xs font-bold text-slate-500">{r.carrier}</span>
                  {r.code && <span className="text-[10px] bg-slate-100 text-slate-500 rounded px-1.5 py-0.5 font-bold">{r.code}</span>}
                  <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${stopsInfo.color}`}>{stopsInfo.label}</span>
                  {r.badge && <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-blue-100 text-blue-700">{r.badge}</span>}
                </div>

                {/* Timeline row */}
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-black text-slate-900 leading-none">{r.depart}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{searchContext?.from?.toUpperCase() || "DEP"}</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-0.5 min-w-[60px]">
                    <p className="text-[10px] font-semibold text-slate-400">{r.duration}</p>
                    <div className="relative w-full flex items-center">
                      <div className="h-px w-full bg-slate-300" />
                      <div className="absolute left-1/2 -translate-x-1/2 bg-white border border-slate-300 rounded-full px-1 text-[9px] text-slate-400 whitespace-nowrap">✈</div>
                    </div>
                    <p className="text-[9px] text-slate-400">{r.cabin}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-slate-900 leading-none">{r.arrive}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{searchContext?.to?.toUpperCase() || "ARR"}</p>
                  </div>
                </div>
              </div>

              {/* Price + actions */}
              <div className="flex sm:flex-col items-center sm:items-end gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900">{r.price}</p>
                  <p className="text-[10px] text-slate-400">per person</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : r.id)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                  >
                    {isExpanded ? "Hide" : "Details"}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle(r)}
                    className={`rounded-xl px-4 py-2 text-xs font-black transition ${isSelected ? "bg-blue-600 text-white" : "bg-slate-900 text-white hover:bg-slate-700"}`}
                  >
                    {isSelected ? "✓ Selected" : "Select →"}
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded details */}
            {isExpanded && (
              <div className="border-t border-slate-100 bg-slate-50 px-4 py-4">
                {Array.isArray(r.slices) && r.slices.length > 0 ? (
                  <div className="space-y-4">
                    {r.slices.map((slice, sliceIdx) => (
                      <div key={`slice-${r.id}-${sliceIdx}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`rounded-full px-3 py-1 text-[10px] font-black ${sliceIdx === 0 ? "bg-blue-600 text-white" : "bg-purple-600 text-white"}`}>
                            {r.slices && r.slices.length > 1 ? (sliceIdx === 0 ? "✈ OUTBOUND" : "✈ RETURN") : "✈ ITINERARY"}
                          </div>
                          <span className="text-xs text-slate-500">
                            {(slice.origin?.name || slice.origin?.code || "").trim()} → {(slice.destination?.name || slice.destination?.code || "").trim()}
                            {slice.departingAt ? ` · ${fmtDate(slice.departingAt)}` : ""}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {(slice.segments || []).map((seg, segIdx) => {
                            const dep = seg.departingAt;
                            const arr = seg.arrivingAt;
                            const next = (slice.segments || [])[segIdx + 1];
                            const layoverMin = next ? diffMinutes(arr, next.departingAt) : null;
                            const operatedBy = seg.operatingCarrier && seg.operatingCarrier !== seg.marketingCarrier ? seg.operatingCarrier : "";
                            return (
                              <div key={`seg-${r.id}-${sliceIdx}-${segIdx}`}>
                                <div className="rounded-xl border border-slate-200 bg-white p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-black text-slate-700">
                                      {seg.marketingCarrier || r.carrier} {seg.marketingFlightNumber || r.code || ""}
                                    </span>
                                    <span className="text-[10px] bg-slate-100 text-slate-500 rounded px-2 py-0.5 font-bold">{seg.cabin || r.cabin || "Economy"}</span>
                                  </div>
                                  {operatedBy && <p className="text-[10px] text-slate-400 mb-2">Operated by {operatedBy}</p>}
                                  <div className="flex items-center gap-3">
                                    <div className="text-center">
                                      <p className="text-lg font-black text-slate-900">{fmtTime(dep)}</p>
                                      <p className="text-[10px] font-bold text-slate-700">{seg.origin?.code || ""}</p>
                                      <p className="text-[9px] text-slate-400">{fmtDate(dep)}</p>
                                    </div>
                                    <div className="flex-1 text-center">
                                      <div className="h-px w-full bg-slate-300 relative">
                                        <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1 text-[9px] text-slate-400">✈</span>
                                      </div>
                                      {seg.aircraft && <p className="text-[9px] text-slate-400 mt-1">{seg.aircraft}</p>}
                                    </div>
                                    <div className="text-center">
                                      <p className="text-lg font-black text-slate-900">{fmtTime(arr)}</p>
                                      <p className="text-[10px] font-bold text-slate-700">{seg.destination?.code || ""}</p>
                                      <p className="text-[9px] text-slate-400">{fmtDate(arr)}</p>
                                    </div>
                                  </div>
                                  {Array.isArray(seg.amenities) && seg.amenities.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {seg.amenities.slice(0, 4).map((a) => (
                                        <span key={a} className="text-[9px] bg-blue-50 text-blue-600 rounded px-1.5 py-0.5 font-semibold">{a}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                {layoverMin !== null && (
                                  <div className="flex items-center gap-2 py-2 px-3">
                                    <div className="h-px flex-1 bg-amber-200" />
                                    <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                                      ⏱ {fmtDuration(layoverMin)} layover{next?.origin?.name ? ` at ${next.origin.name}` : next?.origin?.code ? ` at ${next.origin.code}` : ""}
                                    </span>
                                    <div className="h-px flex-1 bg-amber-200" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-600">
                    <p className="font-semibold">{r.carrier} {r.code}</p>
                    <p>Duration: {r.duration} · Stops: {r.stops} · Cabin: {r.cabin}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {roundTrip && (
        <div className="flex items-center justify-between rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-sm text-slate-600">{selected.length} of 1 flight selected</p>
          <button
            disabled={!canProceed}
            onClick={() => {
              const chosen = offers.filter((o) => selected.includes(o.id));
              if (chosen.length) goToReview(chosen);
            }}
            className={`rounded-2xl px-6 py-2.5 text-sm font-black transition ${canProceed ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
          >
            Review selection →
          </button>
        </div>
      )}
    </div>
  );
}
