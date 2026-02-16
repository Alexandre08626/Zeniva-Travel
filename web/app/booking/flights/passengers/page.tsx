"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Passenger = {
  firstName: string;
  lastName: string;
  dob: string;
  passport: string;
};

type SearchContext = {
  passengers?: string;
};

type SelectionState = {
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

export default function FlightPassengersPage() {
  const router = useRouter();
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [count, setCount] = useState(1);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem("flight_selection");
    if (raw) {
      try {
        const parsed: SelectionState = JSON.parse(raw);
        const num = Number(parsed?.searchContext?.passengers || 1) || 1;
        setCount(num);
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    setPassengers((prev) => {
      const next = [...prev];
      while (next.length < count) {
        next.push({ firstName: "", lastName: "", dob: "", passport: "" });
      }
      return next.slice(0, count);
    });
  }, [count]);

  const canContinue = useMemo(() => {
    if (passengers.length < count) return false;
    return passengers.slice(0, count).every((p) => p.firstName && p.lastName && p.dob);
  }, [passengers, count]);

  const onChange = (index: number, key: keyof Passenger, value: string) => {
    setPassengers((prev) => prev.map((p, i) => (i === index ? { ...p, [key]: value } : p)));
  };

  const onContinue = () => {
    if (typeof window !== "undefined") {
      const payload = JSON.stringify(passengers);
      window.sessionStorage.setItem("flight_passengers", payload);
      window.localStorage.setItem("flight_passengers", payload);
    }
    router.push("/booking/flights/seats");
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Passenger details</p>
              <h1 className="text-2xl font-black text-slate-900">Traveler information</h1>
            </div>
            <Stepper step={1} />
          </div>
        </header>

        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
          {passengers.map((p, idx) => (
            <div key={idx} className="border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="text-sm font-semibold text-slate-700">Passenger {idx + 1}</div>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">
                  First name
                  <input value={p.firstName} onChange={(e) => onChange(idx, "firstName", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Last name
                  <input value={p.lastName} onChange={(e) => onChange(idx, "lastName", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Date of birth
                  <input type="date" value={p.dob} onChange={(e) => onChange(idx, "dob", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Passport (optional)
                  <input value={p.passport} onChange={(e) => onChange(idx, "passport", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </label>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              disabled={!canContinue}
              onClick={onContinue}
              className={`rounded-full px-5 py-2 text-sm font-semibold ${canContinue ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-400"}`}
            >
              Continue to seats
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
