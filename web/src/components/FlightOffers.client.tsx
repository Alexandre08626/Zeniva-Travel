"use client";
import React, { useState } from "react";

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
  badge?: string;
};

export default function FlightOffers({ offers = [], roundTrip = false }: { offers: OfferCard[]; roundTrip?: boolean }) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  const canProceed = !roundTrip ? selected.length === 1 : selected.length >= 2;

  return (
    <div className="space-y-3">
      {offers.map((r) => (
        <div
          key={r.id}
          className={`rounded-xl border p-4 shadow-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between ${selected.includes(r.id) ? 'ring-2 ring-blue-200 border-blue-300 bg-white' : 'bg-slate-50 border-slate-200'}`}
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-800">
              {r.carrier[0] || "?"}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{r.carrier} · {r.code}</p>
              <p className="text-xl font-black text-slate-900">{r.depart} → {r.arrive}</p>
              <p className="text-sm text-slate-600">{r.duration} · {r.stops} · {r.cabin}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:flex-col md:items-end">
            <span className="text-lg font-black text-slate-900">{r.price}</span>
            <div className="flex items-center gap-2">
              {r.badge && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">{r.badge}</span>}
              <button onClick={() => toggle(r.id)} className={`rounded-full px-4 py-2 text-sm font-semibold ${selected.includes(r.id) ? 'bg-slate-800 text-white' : 'bg-black text-white'}`}>
                {selected.includes(r.id) ? 'Selected' : 'Select'}
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">Selected: {selected.length}</div>
        <div>
          <button disabled={!canProceed} onClick={() => alert(`Proceeding with ${selected.join(', ')}`)} className={`rounded-full px-4 py-2 font-semibold ${canProceed ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
