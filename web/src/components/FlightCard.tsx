import React from "react";

export default function FlightCard({
  offer,
  index,
  selected,
  onSelect,
}: any) {
  const route = offer?.route || "YUL → CUN";
  const carrier = offer?.carrier || "Airline";
  const price = offer?.price || "USD 1,200";
  const dates = offer?.dates || "2025-12-20 → 2025-12-27";

  return (
    <div className={`p-4 rounded-lg border ${selected ? "border-slate-900" : "border-slate-200"} bg-white`} style={{ minWidth: 320 }}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-extrabold">{route}</div>
          <div className="text-sm text-slate-500 mt-1">{carrier}</div>
        </div>
        <div className="text-right">
          <div className="font-extrabold">{price}</div>
          <div className="text-xs text-slate-500">{dates}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold">AI-Optimized</div>
        <button className={`rounded-md px-3 py-2 font-bold ${selected ? 'bg-slate-900 text-white' : 'bg-sky-500 text-white'}`} onClick={() => onSelect(index)}>
          {selected ? 'Selected' : 'Select'}
        </button>
      </div>
    </div>
  );
}
