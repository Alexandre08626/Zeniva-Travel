import React from "react";
import { formatCurrency, parseMoney } from "../lib/pricing";

function parseFlightPrice(flight: any): number | null {
  if (!flight) return null;
  // Round trip: outbound + inbound prices combined
  if (flight.outbound && flight.inbound) {
    const out = parseMoney(flight.outbound?.price);
    const ins = parseMoney(flight.inbound?.price);
    if (out !== null && ins !== null) return out + ins;
    if (out !== null) return out;
    if (ins !== null) return ins;
    // fallback to combined price field
    return parseMoney(flight.price);
  }
  return parseMoney(flight.price);
}

export default function SelectedSummary({ flight, hotel, activity, transfer, tripDraft, onProceed }: any) {
  const travelers = (() => {
    const raw = tripDraft?.adults ?? tripDraft?.travelers ?? tripDraft?.guests;
    if (typeof raw === "number" && raw > 0) return raw;
    if (typeof raw === "string") {
      const n = parseInt(raw, 10);
      if (!isNaN(n) && n > 0) return n;
    }
    return 1;
  })();

  const nights = (() => {
    const raw = tripDraft?.dates || (tripDraft?.checkIn && tripDraft?.checkOut ? `${tripDraft.checkIn} - ${tripDraft.checkOut}` : null);
    if (!raw) return 5;
    const m = String(raw).match(/(\d+)\s*nights?/i);
    if (m) return parseInt(m[1], 10);
    const parts = String(raw).split(/\s*(?:→|–|—|-|to)\s*/i);
    if (parts.length >= 2) {
      const s = Date.parse(parts[0].trim()), e = Date.parse(parts[1].trim());
      if (!isNaN(s) && !isNaN(e)) return Math.max(1, Math.round((e - s) / 86400000));
    }
    return 5;
  })();

  const isRoundTrip = Boolean(flight?.outbound && flight?.inbound);
  const flightPrice = parseFlightPrice(flight); // already total for all travelers from Duffel
  const hotelPriceRaw = parseMoney(hotel?.price);
  const hotelTotal = hotelPriceRaw !== null
    ? (/night/i.test(String(hotel?.price || "")) ? hotelPriceRaw * nights : hotelPriceRaw)
    : null;
  const activityTotal = parseMoney(activity?.price);
  const transferTotal = parseMoney(transfer?.price);

  const hasFlightPrice = flightPrice !== null;
  const hasHotelPrice = hotelTotal !== null;
  const hasAnyPrice = hasFlightPrice || hasHotelPrice || activityTotal !== null || transferTotal !== null;

  const subtotal = (flightPrice ?? 0) + (hotelTotal ?? 0) + (activityTotal ?? 0) + (transferTotal ?? 0);
  const fees = hasAnyPrice ? Math.round(subtotal * 0.06 * 100) / 100 : 0;
  const total = subtotal + fees;

  const flightRouteLines = String(flight?.route || "")
    .split("/")
    .map((p) => p.trim())
    .filter(Boolean);

  const accommodationLabel =
    tripDraft?.accommodationType === "ZeniYacht" ? "ZeniYacht" :
    tripDraft?.accommodationType === "ZeniStay" || tripDraft?.accommodationType === "Residence" ? "ZeniStay" :
    "Hotel";

  return (
    <div className="p-4 rounded-lg border border-slate-200 bg-white w-full">
      <h3 className="text-lg font-bold">Selected Summary</h3>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Flight */}
        <div>
          <div className="text-sm text-slate-500">Flight {isRoundTrip ? "✈️↩️ Round Trip" : "✈️"}</div>
          <div className="font-bold leading-tight">
            {flightRouteLines.length
              ? flightRouteLines.map((line, idx) => <div key={idx}>{line}</div>)
              : <div>{flight?.airline || "—"}</div>}
          </div>
          <div className="text-xs text-slate-500">{flight?.fare || "Economy"} • {flight?.bags || "1 checked"}</div>
          <div className="text-xs font-semibold text-slate-700">
            {travelers} traveler(s) •{" "}
            {hasFlightPrice ? (
              <span className="text-emerald-700">{formatCurrency(flightPrice!)}</span>
            ) : (
              <span className="text-amber-600">On request</span>
            )}
          </div>
          {isRoundTrip && (
            <div className="text-[10px] text-slate-400 mt-0.5">
              Out: {parseMoney(flight.outbound?.price) !== null ? formatCurrency(parseMoney(flight.outbound.price)!) : "—"}
              {" "} · Ret: {parseMoney(flight.inbound?.price) !== null ? formatCurrency(parseMoney(flight.inbound.price)!) : "—"}
            </div>
          )}
        </div>

        {/* Hotel */}
        {hotel && (
          <div>
            <div className="text-sm text-slate-500">{accommodationLabel} 🏨</div>
            <div className="font-bold">{hotel.name}</div>
            <div className="text-xs text-slate-500">{nights} nights • {hotel.price || "Price on request"}</div>
            <div className="text-xs font-semibold text-slate-700">
              {hasHotelPrice ? (
                <span className="text-emerald-700">{formatCurrency(hotelTotal!)}</span>
              ) : (
                <span className="text-amber-600">On request</span>
              )}
            </div>
          </div>
        )}

        {/* Activity */}
        {activity && (
          <div>
            <div className="text-sm text-slate-500">Activity 🎯</div>
            <div className="font-bold">{activity.name}</div>
            <div className="text-xs text-slate-500">{activity.date} at {activity.time}</div>
            <div className="text-xs font-semibold text-slate-700">
              {activityTotal !== null ? <span className="text-emerald-700">{formatCurrency(activityTotal)}</span> : <span className="text-slate-400">Included</span>}
            </div>
          </div>
        )}

        {/* Transfer */}
        {transfer && (
          <div>
            <div className="text-sm text-slate-500">Transfer 🚐</div>
            <div className="font-bold">{transfer.name}</div>
            <div className="text-xs text-slate-500">{transfer.route} • {transfer.date}</div>
            <div className="text-xs font-semibold text-slate-700">
              {transferTotal !== null ? <span className="text-emerald-700">{formatCurrency(transferTotal)}</span> : <span className="text-slate-400">Included</span>}
            </div>
          </div>
        )}
      </div>

      {/* Price breakdown */}
      <div className="mt-4 space-y-1 border-t pt-3">
        {hasFlightPrice && (
          <div className="flex justify-between text-xs text-slate-500">
            <span>Flight{isRoundTrip ? " (round trip)" : ""}</span>
            <span>{formatCurrency(flightPrice!)}</span>
          </div>
        )}
        {hasHotelPrice && (
          <div className="flex justify-between text-xs text-slate-500">
            <span>{accommodationLabel} ({nights} nights)</span>
            <span>{formatCurrency(hotelTotal!)}</span>
          </div>
        )}
        {activityTotal !== null && (
          <div className="flex justify-between text-xs text-slate-500">
            <span>Activity</span>
            <span>{formatCurrency(activityTotal)}</span>
          </div>
        )}
        {hasAnyPrice && (
          <div className="flex justify-between text-sm text-slate-500 pt-1">
            <span>Service fee (6%)</span>
            <span className="font-semibold">{formatCurrency(fees)}</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-1 border-t mt-1">
          <span className="text-sm font-semibold">Total (est.)</span>
          <span className="text-xl font-extrabold text-slate-900">
            {hasAnyPrice ? formatCurrency(total) : <span className="text-amber-600 text-base">On request</span>}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end">
        <button
          className="bg-slate-900 text-white px-4 py-2 rounded-md font-bold hover:bg-slate-700 transition-colors"
          onClick={onProceed}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
