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
};

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
  const router = useRouter();

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
          className={`rounded-xl border p-4 shadow-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between ${selected.includes(r.id) ? 'ring-2 ring-blue-200 border-blue-300 bg-white' : 'bg-slate-50 border-slate-200'}`}
        >
          <div className="flex items-start gap-3">
            {r.carrierLogo ? (
              <img
                src={r.carrierLogo}
                alt={r.carrier}
                className="h-10 w-10 rounded-full bg-white border border-slate-200 object-contain p-1"
                loading="lazy"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-800">
                {r.carrier[0] || "?"}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-slate-800">{r.carrier}{r.carrierCode ? ` (${r.carrierCode})` : ""} · {r.code}</p>
              <p className="text-xl font-black text-slate-900">{r.depart} → {r.arrive}</p>
              <p className="text-sm text-slate-600">{r.duration} · {r.stops} · {r.cabin}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:flex-col md:items-end">
            <span className="text-lg font-black text-slate-900">{r.price}</span>
            <div className="flex items-center gap-2">
              {r.badge && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">{r.badge}</span>}
              <button onClick={() => toggle(r)} className={`rounded-full px-4 py-2 text-sm font-semibold ${selected.includes(r.id) ? 'bg-slate-800 text-white' : 'bg-black text-white'}`}>
                {selected.includes(r.id) ? 'Selected' : 'Select'}
              </button>
            </div>
          </div>
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
