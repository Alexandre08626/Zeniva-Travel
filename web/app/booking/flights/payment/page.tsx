"use client";

import { useEffect, useMemo, useState } from "react";
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
};

function getAirlineLogo(code?: string, carrier?: string) {
  const normalizedCode = (code || "").trim().toUpperCase();
  if (normalizedCode) return `https://images.kiwi.com/airlines/64/${normalizedCode}.png`;
  const fallbackCode = String(carrier || "").trim().slice(0, 2).toUpperCase();
  return fallbackCode ? `https://images.kiwi.com/airlines/64/${fallbackCode}.png` : "";
}

type SelectionState = {
  offers: OfferCard[];
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

export default function FlightPaymentPage() {
  const router = useRouter();
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [passengers, setPassengers] = useState<any[]>([]);
  const [bags, setBags] = useState<{ carryOn: number; checked: number }>({ carryOn: 0, checked: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem("flight_selection");
    if (raw) {
      try {
        setSelection(JSON.parse(raw));
      } catch (_) {}
    }
    const paxRaw = window.sessionStorage.getItem("flight_passengers");
    if (paxRaw) {
      try {
        const parsed = JSON.parse(paxRaw);
        setPassengers(Array.isArray(parsed) ? parsed : []);
      } catch (_) {}
    }
    const bagRaw = window.sessionStorage.getItem("flight_bags");
    if (bagRaw) {
      try {
        const parsed = JSON.parse(bagRaw);
        setBags({ carryOn: Number(parsed?.carryOn || 0), checked: Number(parsed?.checked || 0) });
      } catch (_) {}
    }
  }, []);

  const offers = selection?.offers || [];
  const totalPrice = useMemo(() => {
    const base = offers.reduce((sum, o) => sum + (Number(String(o.price).replace(/[^0-9.]/g, "")) || 0), 0);
    const bagFee = bags.checked * 35 + bags.carryOn * 0;
    const total = base + bagFee;
    return total ? `USD ${total.toFixed(2)}` : offers[0]?.price || "Price on request";
  }, [offers, bags]);

  const onPay = () => {
    const primary = offers[0];
    if (!primary) return;
    const params = new URLSearchParams({
      type: "flight",
      carrier: primary.carrier,
      code: primary.code,
      depart: primary.depart,
      arrive: primary.arrive,
      duration: primary.duration,
      stops: primary.stops,
      cabin: primary.cabin,
      price: primary.price,
    });
    router.push(`/payment?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Payment</p>
              <h1 className="text-2xl font-black text-slate-900">Review & confirm</h1>
            </div>
            <Stepper step={4} />
          </div>
        </header>

        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-700">Selected flights</p>
            {offers.map((o) => (
              <div key={o.id} className="mt-2 border border-slate-200 rounded-2xl p-3 flex items-start gap-3">
                {(o.carrierLogo || getAirlineLogo(o.carrierCode, o.carrier)) ? (
                  <img
                    src={o.carrierLogo || getAirlineLogo(o.carrierCode, o.carrier)}
                    alt={o.carrier}
                    className="h-10 w-10 rounded-xl bg-white border border-slate-200 object-contain p-1"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-800">
                    {o.carrier?.[0] || "?"}
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold text-slate-800">{o.carrier}{o.carrierCode ? ` (${o.carrierCode})` : ""} · {o.code}</div>
                  <div className="text-sm text-slate-600">{o.depart} → {o.arrive} · {o.duration} · {o.stops}</div>
                  <div className="text-sm text-slate-600">Cabin: {o.cabin}</div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700">Passengers</p>
            <div className="text-sm text-slate-600">{passengers.length || 1} traveler(s)</div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700">Bags</p>
            <div className="text-sm text-slate-600">Carry-on: {bags.carryOn} · Checked: {bags.checked}</div>
          </div>

          <div className="border-t pt-4 flex items-center justify-between text-sm font-semibold text-slate-700">
            <span>Total due</span>
            <span className="text-lg font-black text-slate-900">{totalPrice}</span>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onPay}
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white"
            >
              Continue to payment
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
