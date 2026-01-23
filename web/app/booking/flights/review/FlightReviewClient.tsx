"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

type SearchContext = {
  from?: string;
  to?: string;
  depart?: string;
  ret?: string;
  passengers?: string;
  cabin?: string;
};

type SelectionState = {
  offers: OfferCard[];
  searchContext?: SearchContext;
};

function Stepper({ step }: { step: number }) {
  const steps = ["Review", "Passengers", "Seats", "Bags", "Payment"];
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
      {steps.map((label, idx) => (
        <div key={label} className={`rounded-full px-3 py-1 border ${idx === step ? "bg-blue-600 text-white border-blue-600" : "bg-white border-slate-200"}`}>
          {idx + 1}. {label}
        </div>
      ))}
    </div>
  );
}

export default function FlightReviewClient() {
  const router = useRouter();
  const params = useSearchParams();
  const selection = useMemo<SelectionState | null>(() => {
    if (typeof window !== "undefined") {
      const raw = window.sessionStorage.getItem("flight_selection");
      if (raw) {
        try {
          return JSON.parse(raw) as SelectionState;
        } catch (_) {
          // ignore parse errors
        }
      }
    }

    const offer: OfferCard = {
      id: params.get("id") || "offer",
      carrier: params.get("carrier") || "Airline",
      code: params.get("code") || "",
      duration: params.get("duration") || "",
      depart: params.get("depart") || "",
      arrive: params.get("arrive") || "",
      price: params.get("price") || "",
      cabin: params.get("cabin") || "",
      stops: params.get("stops") || "",
    };

    const searchContext: SearchContext = {
      from: params.get("from") || "",
      to: params.get("to") || "",
      depart: params.get("departDate") || "",
      ret: params.get("returnDate") || "",
      passengers: params.get("passengers") || "",
      cabin: params.get("cabin") || "",
    };

    return { offers: [offer], searchContext };
  }, [params]);

  const offers = selection?.offers || [];
  const searchContext = selection?.searchContext || {};
  const totalPrice = useMemo(() => {
    const numbers = offers.map((o) => Number(String(o.price || "").replace(/[^0-9.]/g, "")) || 0);
    const sum = numbers.reduce((a, b) => a + b, 0);
    return sum ? `USD ${sum.toFixed(2)}` : offers[0]?.price || "Price on request";
  }, [offers]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Flight review</p>
              <h1 className="text-2xl font-black text-slate-900">Itinerary summary</h1>
            </div>
            <Stepper step={0} />
          </div>
          <p className="text-sm text-slate-600">
            {searchContext.from || "Origin"} → {searchContext.to || "Destination"} · {searchContext.depart || "Date"}{searchContext.ret ? ` → ${searchContext.ret}` : ""}
          </p>
        </header>

        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
          {offers.map((offer) => (
            <div key={offer.id} className="border border-slate-200 rounded-xl p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">{offer.carrier} · {offer.code}</p>
                <p className="text-xl font-black text-slate-900">{offer.depart} → {offer.arrive}</p>
                <p className="text-sm text-slate-600">{offer.duration} · {offer.stops} · {offer.cabin}</p>
              </div>
              <div className="text-lg font-black text-slate-900">{offer.price}</div>
            </div>
          ))}

          <div className="border-t pt-4 flex items-center justify-between text-sm font-semibold text-slate-700">
            <span>Total</span>
            <span className="text-lg font-black text-slate-900">{totalPrice}</span>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => router.push("/booking/flights/passengers")}
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white"
            >
              Continue to passenger details
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
