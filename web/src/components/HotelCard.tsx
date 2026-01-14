import React from "react";

export default function HotelCard({ hotel, index, selected, onSelect }: any) {
  const name = hotel?.name || "Hotel Playa";
  const rating = hotel?.rating || 4.4;
  const price = hotel?.price || "USD 220/night";
  const location = hotel?.location || "Playa del Carmen";
  const image = hotel?.image || "https://images.unsplash.com/photo-1542317854-9f5b0ad0f3a5?auto=format&fit=crop&w=800&q=60";

  return (
    <div className={`rounded-lg border ${selected ? "border-slate-900" : "border-slate-200"} bg-white`} style={{ minWidth: 300 }}>
      <div className="h-40 w-full overflow-hidden rounded-t-lg bg-slate-100">
        <img src={image} alt={name} className="w-full h-full object-cover transform hover:scale-105 transition duration-500" />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-lg font-extrabold">{name}</div>
            <div className="text-sm text-slate-500 mt-1">{location}</div>
          </div>
          <div className="text-right">
            <div className="font-extrabold">{price}</div>
            <div className="text-xs text-slate-500">{rating} ★</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="rounded-full bg-slate-50 px-3 py-1 text-xs">Free cancellation</div>
          <button className={`rounded-md px-3 py-2 font-bold ${selected ? 'bg-slate-900 text-white' : 'bg-emerald-500 text-white'}`} onClick={() => onSelect(index)}>
            {selected ? 'Selected' : 'Select'}
          </button>
        </div>
      </div>
    </div>
  );
}
