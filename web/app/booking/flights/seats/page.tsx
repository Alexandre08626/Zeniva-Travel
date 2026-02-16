"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { persistWorkflowStatePatch } from "../../../../src/lib/workflowPersistence";

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

type Seat = {
  id: string;
  price: number;
  zone: "front" | "standard" | "rear";
};

const ROWS = Array.from({ length: 16 }, (_, idx) => idx + 6);
const COLS = ["A", "B", "C", "D", "E", "F"];

function buildSeats(): Seat[] {
  return ROWS.flatMap((row) =>
    COLS.map((col) => {
      const zone: Seat["zone"] = row <= 8 ? "front" : row <= 14 ? "standard" : "rear";
      const price = zone === "front" ? 59 : zone === "standard" ? 29 : 15;
      return { id: `${row}${col}`, price, zone };
    })
  );
}

const SEATS = buildSeats();

export default function FlightSeatsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [passengerCount, setPassengerCount] = useState(1);
  const [activePassenger, setActivePassenger] = useState(0);
  const [proposalTripId, setProposalTripId] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem("flight_passengers");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setPassengerCount(Array.isArray(parsed) ? parsed.length : 1);
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem("flight_selection");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setProposalTripId(String(parsed?.searchContext?.proposalTripId || ""));
    } catch {
      setProposalTripId("");
    }
  }, []);

  useEffect(() => {
    setSelected((prev) => {
      const next = [...prev];
      while (next.length < passengerCount) next.push("");
      return next.slice(0, passengerCount);
    });
  }, [passengerCount]);

  const onSelect = (index: number, seat: string) => {
    setSelected((prev) => prev.map((s, i) => (i === index ? seat : s)));
  };

  const canContinue = selected.length >= passengerCount && selected.slice(0, passengerCount).every((s) => s);

  const onContinue = () => {
    if (typeof window !== "undefined") {
      const payload = JSON.stringify(selected);
      window.sessionStorage.setItem("flight_seats", payload);
      window.localStorage.setItem("flight_seats", payload);

      if (proposalTripId) {
        void persistWorkflowStatePatch({
          [proposalTripId]: {
            flight_seats: selected,
          },
        });
      }
    }
    router.push("/booking/flights/bags");
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Seat selection</p>
              <h1 className="text-2xl font-black text-slate-900">Choose your seats</h1>
            </div>
            <Stepper step={2} />
          </div>
        </header>

        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-1">Front cabin · $59</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Standard · $29</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Rear · $15</span>
          </div>

          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <div className="space-y-3">
              {Array.from({ length: passengerCount }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePassenger(idx)}
                  className={`w-full text-left border rounded-xl p-4 space-y-2 ${activePassenger === idx ? "border-blue-500 bg-blue-50" : "border-slate-200"}`}
                >
                  <div className="text-sm font-semibold text-slate-700">Passenger {idx + 1}</div>
                  <div className="text-sm text-slate-500">
                    Seat: <span className="font-semibold text-slate-900">{selected[idx] || "Not selected"}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="relative rounded-[36px] border border-slate-200 bg-white p-4 shadow-inner overflow-hidden">
              <svg
                viewBox="0 0 600 900"
                className="absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                <path
                  d="M300 20 C360 40 400 80 420 130 L450 220 L540 300 L540 340 L430 320 L420 420 L520 520 L520 560 L410 520 L380 760 L300 880 L220 760 L190 520 L80 560 L80 520 L180 420 L170 320 L60 340 L60 300 L150 220 L180 130 C200 80 240 40 300 20 Z"
                  fill="#f1f5f9"
                  stroke="#e2e8f0"
                  strokeWidth="6"
                />
              </svg>

              <div className="relative rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Nose</span>
                  <span>Tail</span>
                </div>

                <div className="space-y-2">
                  {ROWS.map((row) => (
                    <div key={row} className="grid grid-cols-[32px_1fr_32px_1fr] items-center gap-2">
                      <div className="text-[11px] font-semibold text-slate-500">{row}</div>
                      <div className="grid grid-cols-3 gap-2">
                        {COLS.slice(0, 3).map((col) => {
                          const seat = SEATS.find((s) => s.id === `${row}${col}`) as Seat;
                          const isSelected = selected.includes(seat.id);
                          const zoneClass = seat.zone === "front" ? "bg-amber-100" : seat.zone === "standard" ? "bg-slate-100" : "bg-emerald-100";
                          return (
                            <button
                              key={seat.id}
                              type="button"
                              onClick={() => onSelect(activePassenger, seat.id)}
                              className={`rounded-lg border px-2 py-1 text-[11px] font-semibold ${isSelected ? "bg-blue-600 text-white border-blue-600" : `${zoneClass} border-slate-200 text-slate-700`}`}
                            >
                              {seat.id}
                              <span className="block text-[10px] font-normal">${seat.price}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="text-center text-[10px] font-semibold text-slate-400">aisle</div>

                      <div className="grid grid-cols-3 gap-2">
                        {COLS.slice(3).map((col) => {
                          const seat = SEATS.find((s) => s.id === `${row}${col}`) as Seat;
                          const isSelected = selected.includes(seat.id);
                          const zoneClass = seat.zone === "front" ? "bg-amber-100" : seat.zone === "standard" ? "bg-slate-100" : "bg-emerald-100";
                          return (
                            <button
                              key={seat.id}
                              type="button"
                              onClick={() => onSelect(activePassenger, seat.id)}
                              className={`rounded-lg border px-2 py-1 text-[11px] font-semibold ${isSelected ? "bg-blue-600 text-white border-blue-600" : `${zoneClass} border-slate-200 text-slate-700`}`}
                            >
                              {seat.id}
                              <span className="block text-[10px] font-normal">${seat.price}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              disabled={!canContinue}
              onClick={onContinue}
              className={`rounded-full px-5 py-2 text-sm font-semibold ${canContinue ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-400"}`}
            >
              Continue to bags
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
