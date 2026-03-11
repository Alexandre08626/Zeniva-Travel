import React from "react";
import { computePrice, formatCurrency } from "../lib/pricing";

export default function SelectedSummary({ flight, hotel, activity, transfer, tripDraft, onProceed }: any) {
  const pricing = computePrice({ flight, hotel, activity, transfer }, tripDraft);

  const flightRouteLines = String(flight?.route || "")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  const accommodationLabel = tripDraft?.accommodationType === "Yacht" ? "Yacht" :
                             (tripDraft?.accommodationType === "Airbnb" || tripDraft?.accommodationType === "Residence") ? "Short-term rental" :
                             "Hotel";

  return (
    <div className="p-4 rounded-lg border border-slate-200 bg-white w-full">
      <h3 className="text-lg font-bold">Selected Summary</h3>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <div className="text-sm text-slate-500">Flight</div>
          <div className="font-bold leading-tight">
            {flightRouteLines.length ? (
              flightRouteLines.map((line, idx) => <div key={`flight-route-${idx}`}>{line}</div>)
            ) : (
              <div>YUL → CUN</div>
            )}
          </div>
          <div className="text-xs text-slate-500">{flight?.fare || "Premium"} • {flight?.bags || "1 checked"}</div>
          <div className="text-xs text-slate-500">
            {pricing.travelers} traveler(s) • {pricing.hasFlightPrice ? formatCurrency(pricing.flightTotal) : "On request"}
          </div>
        </div>

        <div>
          <div className="text-sm text-slate-500">{accommodationLabel}</div>
          <div className="font-bold">{hotel?.name || "Hotel Playa"}</div>
          <div className="text-xs text-slate-500">{pricing.nights} nights • {hotel?.price || "Price on request"}</div>
          <div className="text-xs text-slate-500">
            {pricing.hasHotelPrice ? formatCurrency(pricing.hotelTotal) : "On request"}
          </div>
        </div>

        {activity && (
          <div>
            <div className="text-sm text-slate-500">Activity</div>
            <div className="font-bold">{activity.name}</div>
            <div className="text-xs text-slate-500">{activity.date} at {activity.time}</div>
            <div className="text-xs text-slate-500">
              {pricing.hasActivityPrice ? formatCurrency(pricing.activityTotal || 0) : "Included"}
            </div>
          </div>
        )}

        {transfer && (
          <div>
            <div className="text-sm text-slate-500">Transfer</div>
            <div className="font-bold">{transfer.name}</div>
            <div className="text-xs text-slate-500">{transfer.route} • {transfer.date}</div>
            <div className="text-xs text-slate-500">
              {pricing.hasTransferPrice ? formatCurrency(pricing.transferTotal || 0) : "Included"}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="text-slate-500">Service fee (6%)</div>
        <div className="font-semibold">{pricing.hasAnyPrice ? formatCurrency(pricing.fees) : "Included"}</div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="text-sm font-semibold">Total (est.)</div>
        <div className="text-lg font-extrabold">
          {pricing.hasAnyPrice ? formatCurrency(pricing.total) : "On request"}
        </div>
      </div>

      {/* Add-ons: Show only if not already included */}
      {(!tripDraft?.includeActivities || !tripDraft?.includeTransfers) && (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Add to your trip</p>
          <div className="flex flex-wrap gap-2">
            {!tripDraft?.includeActivities && (
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    // Enable activities and reload to show section
                    const event = new CustomEvent("zeniva:enable-addon", { detail: { type: "activities" } });
                    window.dispatchEvent(event);
                  }
                }}
                className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
              >
                🎯 + Add Experiences
              </button>
            )}
            {!tripDraft?.includeTransfers && (
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    const event = new CustomEvent("zeniva:enable-addon", { detail: { type: "transfers" } });
                    window.dispatchEvent(event);
                  }
                }}
                className="flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-100 transition"
              >
                🚗 + Add Transfers
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-end">
        <button className="bg-slate-900 text-white px-4 py-2 rounded-md font-bold" onClick={onProceed}>
          Continue
        </button>
      </div>
    </div>
  );
}
