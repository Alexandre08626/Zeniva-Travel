import React from "react";
import { formatCurrency, parseMoney } from "../lib/pricing";

function parseFlightPrice(flight: any): number | null {
  if (!flight) return null;
  if (flight.outbound && flight.inbound) {
    const out = parseMoney(flight.outbound?.price);
    const ins = parseMoney(flight.inbound?.price);
    if (out !== null && ins !== null) return out + ins;
    if (out !== null) return out;
    if (ins !== null) return ins;
    return parseMoney(flight.price);
  }
  return parseMoney(flight.price);
}

export default function SelectedSummary({ flight, hotel, villa, activity, transfer, car, shortterm, tripDraft, onProceed }: any) {
  const travelers = (() => {
    const raw = tripDraft?.adults ?? tripDraft?.travelers ?? tripDraft?.guests;
    if (typeof raw === "number" && raw > 0) return raw;
    if (typeof raw === "string") { const n = parseInt(raw, 10); if (!isNaN(n) && n > 0) return n; }
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
  const flightPrice = parseFlightPrice(flight);

  // Hotel
  const hotelPriceRaw = parseMoney(hotel?.price);
  const hotelTotal = hotelPriceRaw !== null
    ? (/night/i.test(String(hotel?.price || "")) ? hotelPriceRaw * nights : hotelPriceRaw)
    : null;

  // Villa / ZeniStay / ZeniYacht
  const accommodation = villa || shortterm || null;
  const accommodationLabel =
    villa ? (tripDraft?.accommodationType === "ZeniYacht" ? "ZeniYacht 🛥" : "ZeniStay 🏠") :
    shortterm ? "ZeniStay 🏠" :
    hotel ? "ZeniHotel 🏨" : null;

  const villaPriceRaw = parseMoney(accommodation?.price);
  const villaTotal = villaPriceRaw !== null
    ? (/night/i.test(String(accommodation?.price || "")) || accommodation?.pricePerNight
        ? (accommodation?.pricePerNight ? parseMoney(String(accommodation.pricePerNight)) ?? villaPriceRaw : villaPriceRaw) * nights
        : villaPriceRaw)
    : null;

  // Activity / Experience
  const activityTotal = parseMoney(activity?.price);

  // Transfer
  const transferTotal = parseMoney(transfer?.price);

  // Car rental
  const carTotal = parseMoney(car?.price ?? car?.totalPrice ?? car?.priceTotal);

  const hasFlightPrice = flightPrice !== null;
  const hasHotelPrice = hotel ? hotelTotal !== null : false;
  const hasVillaPrice = accommodation ? villaTotal !== null : false;
  const hasCarPrice = carTotal !== null;

  const hasAnyPrice = hasFlightPrice || hasHotelPrice || hasVillaPrice || activityTotal !== null || transferTotal !== null || hasCarPrice;

  const subtotal =
    (flightPrice ?? 0) +
    (hotelTotal ?? 0) +
    (villaTotal ?? 0) +
    (activityTotal ?? 0) +
    (transferTotal ?? 0) +
    (carTotal ?? 0);

  const fees = hasAnyPrice ? Math.round(subtotal * 0.06 * 100) / 100 : 0;
  const total = subtotal + fees;

  const flightRouteLines = String(flight?.route || "").split("/").map(p => p.trim()).filter(Boolean);

  return (
    <div className="p-4 rounded-lg border border-slate-200 bg-white w-full">
      <h3 className="text-lg font-bold">Selected Summary</h3>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">

        {/* Flight */}
        {flight && (
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
              {hasFlightPrice
                ? <span className="text-emerald-700">{formatCurrency(flightPrice!)}</span>
                : <span className="text-amber-600">On request</span>}
            </div>
            {isRoundTrip && (
              <div className="text-[10px] text-slate-400 mt-0.5">
                Out: {parseMoney(flight.outbound?.price) !== null ? formatCurrency(parseMoney(flight.outbound.price)!) : "—"}
                {" "} · Ret: {parseMoney(flight.inbound?.price) !== null ? formatCurrency(parseMoney(flight.inbound.price)!) : "—"}
              </div>
            )}
          </div>
        )}

        {/* Hotel */}
        {hotel && !accommodation && (
          <div>
            <div className="text-sm text-slate-500">ZeniHotel 🏨</div>
            <div className="font-bold">{hotel.name}</div>
            <div className="text-xs text-slate-500">{nights} nights • {hotel.price || "Price on request"}</div>
            <div className="text-xs font-semibold text-slate-700">
              {hasHotelPrice
                ? <span className="text-emerald-700">{formatCurrency(hotelTotal!)}</span>
                : <span className="text-amber-600">On request</span>}
            </div>
          </div>
        )}

        {/* Villa / ZeniStay / ZeniYacht */}
        {accommodation && (
          <div>
            <div className="text-sm text-slate-500">{accommodationLabel}</div>
            <div className="font-bold">{accommodation.name}</div>
            <div className="text-xs text-slate-500">
              {accommodation.city || ""}{accommodation.city ? " • " : ""}{nights} nights
              {accommodation.pricePerNight ? ` • $${accommodation.pricePerNight}/night` : accommodation.price ? ` • ${accommodation.price}` : ""}
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {hasVillaPrice
                ? <span className="text-emerald-700">{formatCurrency(villaTotal!)}</span>
                : <span className="text-amber-600">On request</span>}
            </div>
          </div>
        )}

        {/* Activity / ZeniXP */}
        {activity && (
          <div>
            <div className="text-sm text-slate-500">ZeniXP 🎯</div>
            <div className="font-bold">{activity.name || activity.title}</div>
            <div className="text-xs text-slate-500">{activity.date} {activity.time ? `at ${activity.time}` : ""}</div>
            <div className="text-xs font-semibold text-slate-700">
              {activityTotal !== null
                ? <span className="text-emerald-700">{formatCurrency(activityTotal)}</span>
                : <span className="text-slate-400">Included</span>}
            </div>
          </div>
        )}

        {/* Transfer / ZeniTransfers */}
        {transfer && (
          <div>
            <div className="text-sm text-slate-500">ZeniTransfers 🚐</div>
            <div className="font-bold">{transfer.name || transfer.title}</div>
            <div className="text-xs text-slate-500">{transfer.route || transfer.pickup} • {transfer.date}</div>
            <div className="text-xs font-semibold text-slate-700">
              {transferTotal !== null
                ? <span className="text-emerald-700">{formatCurrency(transferTotal)}</span>
                : <span className="text-slate-400">Included</span>}
            </div>
          </div>
        )}

        {/* Car / ZeniCar */}
        {car && (
          <div>
            <div className="text-sm text-slate-500">ZeniCar 🚗</div>
            <div className="font-bold">{car.name || car.category || "Rental Car"}</div>
            <div className="text-xs text-slate-500">{car.pickup || ""} • {car.pickupDate || ""}</div>
            <div className="text-xs font-semibold text-slate-700">
              {hasCarPrice
                ? <span className="text-emerald-700">{formatCurrency(carTotal!)}</span>
                : <span className="text-amber-600">On request</span>}
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
        {hasHotelPrice && !accommodation && (
          <div className="flex justify-between text-xs text-slate-500">
            <span>ZeniHotel ({nights} nights)</span>
            <span>{formatCurrency(hotelTotal!)}</span>
          </div>
        )}
        {hasVillaPrice && (
          <div className="flex justify-between text-xs text-slate-500">
            <span>{accommodationLabel?.replace(/\s+[🛥🏠]/u, "")} ({nights} nights)</span>
            <span>{formatCurrency(villaTotal!)}</span>
          </div>
        )}
        {activityTotal !== null && (
          <div className="flex justify-between text-xs text-slate-500">
            <span>ZeniXP</span>
            <span>{formatCurrency(activityTotal)}</span>
          </div>
        )}
        {transferTotal !== null && (
          <div className="flex justify-between text-xs text-slate-500">
            <span>ZeniTransfers</span>
            <span>{formatCurrency(transferTotal)}</span>
          </div>
        )}
        {hasCarPrice && (
          <div className="flex justify-between text-xs text-slate-500">
            <span>ZeniCar</span>
            <span>{formatCurrency(carTotal!)}</span>
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

      <div className="mt-4">
        <button
          className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-md font-bold hover:bg-slate-700 transition-colors"
          onClick={onProceed}
        >
          Continue 🔒
        </button>
        <div className="flex justify-center gap-4 mt-2 text-xs text-slate-400">
          <span>↩️ Flexible</span>
          <span>⭐ Best Rate</span>
        </div>
      </div>
    </div>
  );
}
