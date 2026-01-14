"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { BRAND_BLUE, LIGHT_BG, MUTED_TEXT, TITLE_TEXT } from "../../src/design/tokens";
import { useTripsStore, createTrip, deleteTrip } from "../../lib/store/tripsStore";

const statusColors = {
  Draft: "bg-slate-100 text-slate-700",
  Ready: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  Sent: "bg-blue-50 text-blue-700 border border-blue-100",
};

export default function ConversationsSidebar({ currentTripId }) {
  const router = useRouter();
  const { trips, messages } = useTripsStore((s) => ({ trips: s.trips, messages: s.messages }));

  const sortedTrips = useMemo(() => {
    return [...trips].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  }, [trips]);

  const previewFor = (tripId) => {
    const last = (messages[tripId] || []).slice(-1)[0];
    return last?.content || "Start planning";
  };

  const onSelect = (id) => {
    router.push(`/chat/${id}`);
  };

  const onNew = () => {
    const id = createTrip();
    router.push(`/chat/${id}`);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm" style={{ minHeight: "72vh" }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="text-sm font-bold" style={{ color: TITLE_TEXT }}>
          Trips
        </div>
        <button
          onClick={onNew}
          className="rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: BRAND_BLUE }}
        >
          + New Trip
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {sortedTrips.length === 0 && (
          <div className="px-4 py-6 text-sm" style={{ color: MUTED_TEXT }}>
            No trips yet. Create one to start planning.
          </div>
        )}
        {sortedTrips.map((trip) => {
          const active = trip.id === currentTripId;
          const statusClass = statusColors[trip.status] || "bg-slate-100 text-slate-700";
          return (
            <div
              key={trip.id}
              className={`w-full px-4 py-3 flex flex-col gap-1 transition ${
                active ? "bg-slate-50" : "bg-white"
              }`}
              style={{ backgroundColor: active ? LIGHT_BG : "white" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelect(trip.id)}
                    className="text-sm font-bold hover:underline"
                    style={{ color: TITLE_TEXT }}
                  >
                    {trip.title || "Trip"}
                  </button>
                  <button
                    onClick={() => deleteTrip(trip.id)}
                    title="Delete this conversation"
                    className="ml-1 text-slate-400 hover:text-red-500"
                    style={{ fontSize: 16 }}
                  >
                    🗑️
                  </button>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClass}`}>
                  {trip.status || "Draft"}
                </span>
              </div>
              <div className="text-xs line-clamp-2" style={{ color: MUTED_TEXT }}>
                {previewFor(trip.id)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
