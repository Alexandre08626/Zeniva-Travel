"use client";
import { useRouter } from "next/navigation";
import { BRAND_BLUE, PREMIUM_BLUE, MUTED_TEXT, TITLE_TEXT } from "../../src/design/tokens";
import Label from "../../src/components/Label";
import {
  useTripsStore,
  updateSnapshot,
  generateProposal,
  setTripStatus,
  applyTripPatch,
} from "../../lib/store/tripsStore";

export default function TripSnapshotPanel({ tripId }) {
  const router = useRouter();
  const { tripDraft, trip, proposal } = useTripsStore((s) => ({
    tripDraft: s.tripDrafts[tripId],
    trip: s.trips.find((t) => t.id === tripId),
    proposal: s.proposals[tripId],
  }));

  // Fallback to trip fields if tripDraft is missing
  const effectiveSnapshot = {
    departure: tripDraft?.departureCity || trip?.origin || '',
    destination: tripDraft?.destination || trip?.destination || trip?.destinationCode || '',
    dates: tripDraft?.checkIn && tripDraft?.checkOut ? `${tripDraft.checkIn} → ${tripDraft.checkOut}` : '',
    travelers: tripDraft?.adults ? `${tripDraft.adults} adults` : '',
    budget: tripDraft?.budget ? `${tripDraft.currency || 'USD'} ${tripDraft.budget}` : '',
    style: tripDraft?.style || '',
    accommodationType: tripDraft?.accommodationType || '',
    transportationType: tripDraft?.transportationType || '',
  };

  const onChange = (field, value) => {
    applyTripPatch(tripId, { [field]: value });
  };

  const onGenerate = () => {
    const p = generateProposal(tripId);
    if (p) router.push(`/proposals/${tripId}/select`);
  };

  const onOpen = () => {
    router.push(`/proposals/${tripId}/select`);
  };

  const onMarkReady = () => setTripStatus(tripId, "Ready");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4" style={{ minHeight: "72vh" }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <Label>Trip snapshot</Label>
          <div className="text-lg font-extrabold" style={{ color: TITLE_TEXT }}>
            {trip?.title || "Trip"}
          </div>
        </div>
        <span className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>
          {tripDraft?.status || trip?.status || "Draft"}
        </span>
      </div>

      <div className="space-y-3">
        {[
          { key: "departure", label: "Departure city" },
          { key: "destination", label: "Destination" },
          { key: "dates", label: "Dates" },
          { key: "travelers", label: "Travelers" },
          { key: "budget", label: "Budget" },
          { key: "style", label: "Style" },
          { key: "accommodationType", label: "Accommodation Type", type: "select", options: ["Hotel", "Airbnb", "Yacht", "Resort", "Other"] },
          { key: "transportationType", label: "Transportation Type", type: "select", options: ["Flights", "No Flights"] },
          { key: "includeActivities", label: "Include Activities", type: "checkbox" },
          { key: "includeTransfers", label: "Include Transfers", type: "checkbox" },
        ].map((f) => (
          <div key={f.key} className="space-y-1">
            <div className="text-xs font-semibold flex items-center" style={{ color: MUTED_TEXT }}>
              {f.label}
              {effectiveSnapshot?.[f.key] && f.type !== "checkbox" && <span className="ml-1 text-green-600">✓</span>}
            </div>
            {f.type === "select" ? (
              <select
                value={effectiveSnapshot?.[f.key] || ""}
                onChange={(e) => onChange(f.key, e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-slate-300"
              >
                <option value="">Select {f.label.toLowerCase()}</option>
                {f.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : f.type === "checkbox" ? (
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(effectiveSnapshot?.[f.key])}
                  onChange={(e) => onChange(f.key, e.target.checked)}
                  className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 checked:bg-blue-600 checked:border-blue-600"
                />
                <span className="text-sm font-semibold">Include in proposal</span>
              </label>
            ) : (
              <input
                value={effectiveSnapshot?.[f.key] || ""}
                onChange={(e) => onChange(f.key, e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-slate-300"
                placeholder={`Enter ${f.label.toLowerCase()}`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>Missing Info</div>
        {!effectiveSnapshot?.dates && <div className="text-xs text-red-600">• Dates missing</div>}
        {!effectiveSnapshot?.destination && <div className="text-xs text-red-600">• Destination missing</div>}
        {!effectiveSnapshot?.travelers && <div className="text-xs text-red-600">• Travelers missing</div>}
        {!effectiveSnapshot?.budget && <div className="text-xs text-orange-600">• Budget not specified</div>}
        {!effectiveSnapshot?.accommodationType && <div className="text-xs text-orange-600">• Accommodation type not specified</div>}
        {!effectiveSnapshot?.transportationType && <div className="text-xs text-orange-600">• Transportation type not specified</div>}
      </div>

      {tripDraft?.lastPatch && (
        <div className="mt-4 p-2 bg-gray-50 rounded text-xs">
          <div className="font-semibold">Last AI Update ({new Date(tripDraft.lastPatch.timestamp).toLocaleTimeString()}):</div>
          <pre>{JSON.stringify(tripDraft.lastPatch, null, 2)}</pre>
        </div>
      )}

      <div className="mt-5 space-y-2">
        <button
          onClick={onGenerate}
          disabled={!effectiveSnapshot?.dates || !effectiveSnapshot?.destination || !effectiveSnapshot?.travelers}
          className={`w-full rounded-xl px-4 py-3 text-sm font-extrabold text-white ${!effectiveSnapshot?.dates || !effectiveSnapshot?.destination || !effectiveSnapshot?.travelers ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{ backgroundColor: BRAND_BLUE }}
        >
          Generate Proposal
        </button>
        <button
          onClick={onOpen}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-extrabold"
          style={{ color: PREMIUM_BLUE }}
        >
          Open Proposal
        </button>
        <button
          onClick={onMarkReady}
          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold"
          style={{ color: TITLE_TEXT }}
        >
          Mark Ready / Save
        </button>
        {proposal && (
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 border border-emerald-100">
            Proposal saved · {new Date(proposal.updatedAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
