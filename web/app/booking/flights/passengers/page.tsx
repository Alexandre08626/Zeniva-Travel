"use client";
export const dynamic = "force-dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { persistWorkflowStatePatch } from "../../../../src/lib/workflowPersistence";

type Passenger = { firstName: string; lastName: string; dob: string; passport: string; };
type SearchContext = { passengers?: string; proposalTripId?: string; };

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
            <span>{s.icon}</span>
            <span>{s.label}</span>
            {idx < step && <span>✓</span>}
          </div>
          {idx < steps.length - 1 && <div className={`w-6 h-px ${idx < step ? "bg-emerald-400" : "bg-slate-200"}`} />}
        </div>
      ))}
    </div>
  );
}

export default function FlightPassengersPage() {
  const router = useRouter();
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [count, setCount] = useState(1);
  const [proposalTripId, setProposalTripId] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem("flight_selection");
    if (raw) {
      try {
        const parsed: { searchContext?: SearchContext } = JSON.parse(raw);
        const num = Number(parsed?.searchContext?.passengers || 1) || 1;
        setCount(num);
        setProposalTripId(String(parsed?.searchContext?.proposalTripId || ""));
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    setPassengers((prev) => {
      const next = [...prev];
      while (next.length < count) next.push({ firstName: "", lastName: "", dob: "", passport: "" });
      return next.slice(0, count);
    });
  }, [count]);

  const canContinue = useMemo(() => {
    if (passengers.length < count) return false;
    return passengers.slice(0, count).every((p) => p.firstName && p.lastName && p.dob);
  }, [passengers, count]);

  const onChange = (index: number, key: keyof Passenger, value: string) =>
    setPassengers((prev) => prev.map((p, i) => (i === index ? { ...p, [key]: value } : p)));

  const onContinue = () => {
    if (typeof window !== "undefined") {
      const payload = JSON.stringify(passengers);
      window.sessionStorage.setItem("flight_passengers", payload);
      window.localStorage.setItem("flight_passengers", payload);
      if (proposalTripId) void persistWorkflowStatePatch({ [proposalTripId]: { flight_passengers: passengers } });
    }
    router.push("/booking/flights/seats");
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Flight Booking</p>
          <h1 className="text-3xl font-black text-white mb-4">Traveler information</h1>
          <Stepper step={1} />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* Info banner */}
        <div className="rounded-2xl bg-blue-50 border border-blue-200 px-5 py-4 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">🛂</span>
          <div>
            <p className="font-bold text-blue-900">Passport & personal details required</p>
            <p className="text-sm text-blue-700 mt-0.5">Names must match your travel document exactly. Only date of birth is mandatory — passport number speeds up check-in.</p>
          </div>
        </div>

        {/* Passenger forms */}
        <div className="space-y-4">
          {passengers.map((p, idx) => (
            <div key={idx} className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-black text-white text-lg">{idx + 1}</div>
                <div>
                  <p className="text-white font-black">Passenger {idx + 1}</p>
                  <p className="text-slate-300 text-xs">{idx === 0 ? "Primary traveler" : "Additional traveler"}</p>
                </div>
                {p.firstName && p.lastName && p.dob && (
                  <span className="ml-auto text-emerald-400 text-sm font-black">✓ Complete</span>
                )}
              </div>
              <div className="p-6 grid gap-4 md:grid-cols-2">
                {[
                  { label: "First name", key: "firstName" as keyof Passenger, type: "text", placeholder: "As on passport", required: true },
                  { label: "Last name", key: "lastName" as keyof Passenger, type: "text", placeholder: "As on passport", required: true },
                  { label: "Date of birth", key: "dob" as keyof Passenger, type: "date", placeholder: "", required: true },
                  { label: "Passport number", key: "passport" as keyof Passenger, type: "text", placeholder: "Optional", required: false },
                ].map(({ label, key, type, placeholder, required }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      {label} {required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type={type}
                      value={p[key]}
                      onChange={(e) => onChange(idx, key, e.target.value)}
                      placeholder={placeholder}
                      className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${p[key] ? "border-emerald-400 bg-emerald-50/30" : "border-slate-200 bg-white focus:border-blue-400"}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
          <div>
            <p className="text-sm font-bold text-slate-700">{count} traveler{count > 1 ? "s" : ""}</p>
            <p className="text-xs text-slate-400">{passengers.filter(p => p.firstName && p.lastName && p.dob).length} of {count} complete</p>
          </div>
          <button
            disabled={!canContinue}
            onClick={onContinue}
            className="rounded-2xl px-8 py-3.5 text-sm font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg"
            style={{ background: canContinue ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "#94a3b8", boxShadow: canContinue ? "0 4px 15px rgba(37,99,235,0.4)" : "none" }}
          >
            Continue to seats →
          </button>
        </div>
      </div>
    </main>
  );
}
