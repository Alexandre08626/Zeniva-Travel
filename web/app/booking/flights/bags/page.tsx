"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

export default function FlightBagsPage() {
  const router = useRouter();
  const [carryOn, setCarryOn] = useState(1);
  const [checked, setChecked] = useState(0);

  const onContinue = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("flight_bags", JSON.stringify({ carryOn, checked }));
    }
    router.push("/booking/flights/payment");
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Bags</p>
              <h1 className="text-2xl font-black text-slate-900">Choose your baggage</h1>
            </div>
            <Stepper step={3} />
          </div>
        </header>

        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              Carry-on bags
              <input
                type="number"
                min={0}
                value={carryOn}
                onChange={(e) => setCarryOn(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Checked bags
              <input
                type="number"
                min={0}
                value={checked}
                onChange={(e) => setChecked(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onContinue}
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
