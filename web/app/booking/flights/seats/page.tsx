"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

type Seat = { id: string; price: number; zone: "front" | "standard" | "rear"; };
const ROWS = Array.from({ length: 16 }, (_, i) => i + 6);
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

const ZONE_COLORS: Record<string, string> = {
  front: "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100",
  standard: "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100",
  rear: "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100",
};

export default function FlightSeatsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [passengerCount, setPassengerCount] = useState(1);
  const [activePassenger, setActivePassenger] = useState(0);
  const [passengerNames, setPassengerNames] = useState<string[]>([]);
  const [proposalTripId, setProposalTripId] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem("flight_passengers");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setPassengerCount(parsed.length);
          setPassengerNames(parsed.map((p: { firstName?: string; lastName?: string }) => `${p.firstName || ""} ${p.lastName || ""}`.trim()));
        }
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
    } catch { setProposalTripId(""); }
  }, []);

  useEffect(() => {
    setSelected((prev) => {
      const next = [...prev];
      while (next.length < passengerCount) next.push("");
      return next.slice(0, passengerCount);
    });
  }, [passengerCount]);

  const onSelect = (index: number, seat: string) =>
    setSelected((prev) => prev.map((s, i) => (i === index ? seat : s)));

  const canContinue = selected.length >= passengerCount && selected.slice(0, passengerCount).every((s) => s);

  const onContinue = () => {
    if (typeof window !== "undefined") {
      const payload = JSON.stringify(selected);
      window.sessionStorage.setItem("flight_seats", payload);
      window.localStorage.setItem("flight_seats", payload);
      if (proposalTripId) void persistWorkflowStatePatch({ [proposalTripId]: { flight_seats: selected } });
    }
    router.push("/booking/flights/bags");
  };

  const totalSeatCost = selected
    .filter(Boolean)
    .reduce((sum, id) => sum + (SEATS.find((s) => s.id === id)?.price || 0), 0);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Flight Booking</p>
          <h1 className="text-3xl font-black text-white mb-4">Choose your seats</h1>
          <Stepper step={2} />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 space-y-5">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3">
          {[
            { zone: "front", label: "Business/Front", price: "$59", color: "bg-amber-100 border-amber-300 text-amber-800" },
            { zone: "standard", label: "Standard", price: "$29", color: "bg-blue-100 border-blue-300 text-blue-800" },
            { zone: "rear", label: "Economy/Rear", price: "$15", color: "bg-emerald-100 border-emerald-300 text-emerald-800" },
            { zone: "selected", label: "Your selection", price: "", color: "bg-blue-600 border-blue-600 text-white" },
          ].map(({ label, price, color }) => (
            <div key={label} className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${color}`}>
              <div className="w-3 h-3 rounded-sm border border-current" />
              {label} {price && <span className="opacity-70">{price}</span>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
          {/* Passenger selector */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select passenger to assign</p>
            {Array.from({ length: passengerCount }).map((_, idx) => {
              const seat = selected[idx];
              const seatObj = seat ? SEATS.find((s) => s.id === seat) : null;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePassenger(idx)}
                  className={`w-full text-left rounded-2xl border-2 p-4 transition ${activePassenger === idx ? "border-blue-500 bg-blue-50 shadow-md" : "border-slate-200 bg-white hover:border-slate-300"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${activePassenger === idx ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{passengerNames[idx] || `Passenger ${idx + 1}`}</p>
                      {seat ? (
                        <p className="text-xs text-emerald-600 font-bold mt-0.5">💺 Seat {seat} · ${seatObj?.price || 0}</p>
                      ) : (
                        <p className="text-xs text-amber-600 font-medium mt-0.5">⚠️ No seat selected</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {totalSeatCost > 0 && (
              <div className="rounded-2xl bg-slate-900 p-4">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Seats total</p>
                <p className="text-2xl font-black text-white mt-1">${totalSeatCost}</p>
                <p className="text-slate-400 text-[10px] mt-1">Added to your booking</p>
              </div>
            )}
          </div>

          {/* Seat map */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-800 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white font-black">✈️</span>
                <span className="text-white text-sm font-bold">Cabin view</span>
              </div>
              <p className="text-slate-400 text-xs">Selecting for: <span className="text-white font-bold">{passengerNames[activePassenger] || `Passenger ${activePassenger + 1}`}</span></p>
            </div>

            <div className="p-4 overflow-y-auto max-h-[580px]">
              {/* Nose indicator */}
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-slate-100 border border-slate-200 px-4 py-1 text-xs font-bold text-slate-500">✈ NOSE</div>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-[28px_1fr_24px_1fr] gap-2 mb-2 px-1">
                <div />
                <div className="grid grid-cols-3 gap-1.5">
                  {["A", "B", "C"].map(c => <div key={c} className="text-center text-[10px] font-black text-slate-400">{c}</div>)}
                </div>
                <div />
                <div className="grid grid-cols-3 gap-1.5">
                  {["D", "E", "F"].map(c => <div key={c} className="text-center text-[10px] font-black text-slate-400">{c}</div>)}
                </div>
              </div>

              <div className="space-y-1.5">
                {ROWS.map((row) => {
                  const isFirstInZone = row === 6 || row === 9 || row === 15;
                  const zoneLabel = row === 6 ? "✨ Front cabin" : row === 9 ? "💺 Standard" : row === 15 ? "🌿 Rear" : null;
                  return (
                    <div key={row}>
                      {zoneLabel && (
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-1.5 pl-8">{zoneLabel}</div>
                      )}
                      <div className="grid grid-cols-[28px_1fr_24px_1fr] gap-2 items-center">
                        <div className="text-[11px] font-bold text-slate-400 text-right">{row}</div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {COLS.slice(0, 3).map((col) => {
                            const seat = SEATS.find((s) => s.id === `${row}${col}`) as Seat;
                            const isSelected = selected.includes(seat.id);
                            const isActiveSelected = selected[activePassenger] === seat.id;
                            return (
                              <button
                                key={seat.id}
                                type="button"
                                onClick={() => onSelect(activePassenger, seat.id)}
                                className={`rounded-lg border-2 py-1.5 text-center transition-all ${isSelected ? (isActiveSelected ? "bg-blue-600 border-blue-600 text-white shadow-lg scale-105" : "bg-slate-600 border-slate-600 text-white") : `${ZONE_COLORS[seat.zone]} border`}`}
                              >
                                <div className="text-[10px] font-black">{seat.id}</div>
                                <div className="text-[9px] opacity-70">${seat.price}</div>
                              </button>
                            );
                          })}
                        </div>
                        <div className="text-center text-[9px] font-bold text-slate-300">│</div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {COLS.slice(3).map((col) => {
                            const seat = SEATS.find((s) => s.id === `${row}${col}`) as Seat;
                            const isSelected = selected.includes(seat.id);
                            const isActiveSelected = selected[activePassenger] === seat.id;
                            return (
                              <button
                                key={seat.id}
                                type="button"
                                onClick={() => onSelect(activePassenger, seat.id)}
                                className={`rounded-lg border-2 py-1.5 text-center transition-all ${isSelected ? (isActiveSelected ? "bg-blue-600 border-blue-600 text-white shadow-lg scale-105" : "bg-slate-600 border-slate-600 text-white") : `${ZONE_COLORS[seat.zone]} border`}`}
                              >
                                <div className="text-[10px] font-black">{seat.id}</div>
                                <div className="text-[9px] opacity-70">${seat.price}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tail indicator */}
              <div className="flex justify-center mt-4">
                <div className="rounded-full bg-slate-100 border border-slate-200 px-4 py-1 text-xs font-bold text-slate-500">TAIL ✈</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
          <div>
            <p className="text-sm font-bold text-slate-700">{selected.filter(Boolean).length} of {passengerCount} seats selected</p>
            <p className="text-xs text-slate-400">You can skip — seats will be randomly assigned</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onContinue} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Skip seats
            </button>
            <button
              disabled={!canContinue}
              onClick={onContinue}
              className="rounded-2xl px-8 py-3 text-sm font-black text-white transition-all disabled:opacity-40"
              style={{ background: canContinue ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "#94a3b8" }}
            >
              Continue to bags →
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
