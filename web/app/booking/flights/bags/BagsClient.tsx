"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { persistWorkflowStatePatch } from "../../../../src/lib/workflowPersistence";

function Stepper({ step }: { step: number }) {
  const steps = [
    { label: "Review", icon: "📋" },
    { label: "Passengers", icon: "👤" },
    { label: "Seats", icon: "💺" },
    { label: "Bags", icon: "🧳" },
    { label: "Payment", icon: "💳" },
  ];
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {steps.map((s, idx) => (
        <div key={s.label} className="flex items-center gap-1">
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap transition ${idx === step ? "bg-blue-600 text-white shadow-md" : idx < step ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
            <span>{s.icon}</span><span>{s.label}</span>{idx < step && <span>✓</span>}
          </div>
          {idx < steps.length - 1 && <div className={`w-6 h-px ${idx < step ? "bg-emerald-400" : "bg-slate-200"}`} />}
        </div>
      ))}
    </div>
  );
}

const BAGGAGE_OPTIONS = [
  {
    type: "carryOn" as const,
    icon: "🎒",
    title: "Carry-on bag",
    subtitle: "Under-seat or overhead bin",
    price: 0,
    extraPrice: 15,
    maxDims: "22 × 14 × 9 in (55 × 35 × 22 cm)",
    maxWeight: "Up to 10 kg",
    included: true,
    options: [0, 1, 2],
    labels: ["None", "1 bag (included)", "2 bags (+$15)"],
  },
  {
    type: "checked" as const,
    icon: "🧳",
    title: "Checked bag",
    subtitle: "Checked at the airport counter",
    price: 35,
    extraPrice: 35,
    maxDims: "30 × 20 × 11 in (76 × 50 × 28 cm)",
    maxWeight: "Up to 23 kg",
    included: false,
    options: [0, 1, 2, 3],
    labels: ["None", "1 bag (+$35)", "2 bags (+$70)", "3 bags (+$105)"],
  },
];

export default function FlightBagsPage() {
  const router = useRouter();
  const [carryOn, setCarryOn] = useState(1);
  const [checked, setChecked] = useState(0);

  const totalCost = Math.max(0, (carryOn - 1) * 15) + checked * 35;

  const onContinue = () => {
    if (typeof window !== "undefined") {
      const payload = JSON.stringify({ carryOn, checked });
      window.sessionStorage.setItem("flight_bags", payload);
      window.localStorage.setItem("flight_bags", payload);
      const selectionRaw = window.sessionStorage.getItem("flight_selection");
      if (selectionRaw) {
        try {
          const parsed = JSON.parse(selectionRaw);
          const proposalTripId = String(parsed?.searchContext?.proposalTripId || "");
          if (proposalTripId) void persistWorkflowStatePatch({ [proposalTripId]: { flight_bags: { carryOn, checked } } });
        } catch { /* ignore */ }
      }
    }
    router.push("/booking/flights/payment");
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Flight Booking</p>
          <h1 className="text-3xl font-black text-white mb-4">Baggage selection</h1>
          <Stepper step={3} />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 space-y-5">
        {/* Baggage cards */}
        {BAGGAGE_OPTIONS.map((opt) => {
          const currentVal = opt.type === "carryOn" ? carryOn : checked;
          const setter = opt.type === "carryOn" ? setCarryOn : setChecked;
          return (
            <div key={opt.type} className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl flex-shrink-0">{opt.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900">{opt.title}</h3>
                    {opt.included && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full px-2 py-0.5">1 INCLUDED</span>}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{opt.subtitle}</p>
                  <div className="flex gap-4 mt-1 text-xs text-slate-400">
                    <span>📐 {opt.maxDims}</span>
                    <span>⚖️ {opt.maxWeight}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {opt.options.map((val, i) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setter(val)}
                    className={`rounded-2xl border-2 p-4 text-center transition-all ${currentVal === val ? "border-blue-500 bg-blue-50 shadow-md" : "border-slate-200 bg-white hover:border-slate-300"}`}
                  >
                    <div className="text-2xl mb-1">{val === 0 ? "🚫" : opt.icon.repeat(Math.min(val, 3))}</div>
                    <div className="text-xs font-black text-slate-800">{opt.labels[i]}</div>
                    {currentVal === val && <div className="text-[10px] text-blue-600 font-bold mt-1">✓ Selected</div>}
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {/* Summary + CTA */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Baggage summary</p>
            <div className="flex gap-4 mt-2">
              <div>
                <p className="text-white font-black">{carryOn} carry-on</p>
                <p className="text-slate-400 text-xs">{carryOn === 0 ? "None" : carryOn === 1 ? "Included" : "+$" + ((carryOn - 1) * 15)}</p>
              </div>
              <div>
                <p className="text-white font-black">{checked} checked</p>
                <p className="text-slate-400 text-xs">{checked === 0 ? "None" : "+$" + (checked * 35)}</p>
              </div>
            </div>
            {totalCost > 0 && (
              <p className="text-amber-400 font-black text-lg mt-2">+${totalCost} added</p>
            )}
          </div>
          <button
            onClick={onContinue}
            className="rounded-2xl px-8 py-3.5 text-sm font-black text-slate-900 transition-all shadow-lg flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #E6B85A, #d4a442)", boxShadow: "0 4px 15px rgba(230,184,90,0.4)" }}
          >
            Continue to payment →
          </button>
        </div>
      </div>
    </main>
  );
}
