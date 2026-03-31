"use client";
import { useEffect } from "react";
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

export default function TripSnapshotPanel({ tripId, proposalMode = "" }) {
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

  const parseDateRange = (value) => {
    if (!value) return {};
    const matches = value.match(/\d{4}-\d{2}-\d{2}/g);
    if (!matches || matches.length === 0) return {};
    if (matches.length === 1) return { checkIn: matches[0] };
    return { checkIn: matches[0], checkOut: matches[1] };
  };

  const parseAdults = (value) => {
    const n = parseInt(String(value).replace(/[^0-9]/g, ""), 10);
    return Number.isFinite(n) ? n : null;
  };

  const parseBudget = (value) => {
    const cleaned = String(value).replace(/[^0-9.]/g, "");
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : null;
  };

  useEffect(() => {
    if (!tripId || !tripDraft) return;
    const patch = {};

    if (!tripDraft.departureCity && tripDraft.departure) {
      patch.departureCity = tripDraft.departure;
    }

    if ((!tripDraft.checkIn || !tripDraft.checkOut) && tripDraft.dates) {
      Object.assign(patch, parseDateRange(tripDraft.dates));
    }

    if (!tripDraft.adults && tripDraft.travelers) {
      const adults = parseAdults(tripDraft.travelers);
      if (adults !== null) patch.adults = adults;
    }

    if (tripDraft.budget && typeof tripDraft.budget === "string") {
      const budget = parseBudget(tripDraft.budget);
      if (budget !== null) patch.budget = budget;
    }

    if (Object.keys(patch).length) {
      applyTripPatch(tripId, patch);
    }
  }, [tripId, tripDraft]);

  const onChange = (field, value) => {
    switch (field) {
      case "departure":
        applyTripPatch(tripId, { departureCity: value });
        return;
      case "destination":
        applyTripPatch(tripId, { destination: value });
        return;
      case "dates": {
        const parsed = parseDateRange(value);
        applyTripPatch(tripId, { ...parsed });
        return;
      }
      case "travelers": {
        const adults = parseAdults(value);
        if (adults !== null) {
          applyTripPatch(tripId, { adults });
        }
        return;
      }
      case "budget": {
        const budget = parseBudget(value);
        applyTripPatch(tripId, { budget: budget ?? value });
        return;
      }
      case "style":
        applyTripPatch(tripId, { style: value });
        return;
      case "accommodationType":
        applyTripPatch(tripId, { accommodationType: value });
        return;
      case "transportationType":
        applyTripPatch(tripId, { transportationType: value });
        return;
      case "includeActivities":
        applyTripPatch(tripId, { includeActivities: Boolean(value) });
        return;
      case "includeTransfers":
        applyTripPatch(tripId, { includeTransfers: Boolean(value) });
        return;
      default:
        applyTripPatch(tripId, { [field]: value });
    }
  };

  const proposalSuffix = proposalMode ? `?mode=${encodeURIComponent(proposalMode)}` : "";

  const onGenerate = () => {
    const p = generateProposal(tripId);
    if (p) router.push(`/proposals/${tripId}/select${proposalSuffix}`);
  };

  const onOpen = () => {
    router.push(`/proposals/${tripId}/select${proposalSuffix}`);
  };

  const onMarkReady = () => setTripStatus(tripId, "Ready");

  return (
    <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Trip Snapshot</div>
          <div className="text-base font-black text-slate-900">{trip?.title || "My Trip"}</div>
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
          {tripDraft?.status || trip?.status || "Draft"}
        </span>
      </div>

      <div className="mb-4 space-y-2">
        <button
          onClick={onGenerate}
          disabled={!effectiveSnapshot?.dates || !effectiveSnapshot?.destination || !effectiveSnapshot?.travelers}
          className="w-full rounded-xl px-4 py-3 text-sm font-black text-[#0B1B4D] transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{ background: "linear-gradient(90deg, #E6B85A, #f0c96b)" }}
        >
          🚀 Generate Proposal
        </button>
        <button
          onClick={onOpen}
          className="w-full rounded-xl px-4 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50 transition-all border border-blue-200"
        >
          View Proposal →
        </button>
        {proposal && (
          <div className="rounded-lg px-3 py-2 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            ✅ Proposal saved · {new Date(proposal.updatedAt).toLocaleString()}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {[
          { key: "departure", label: "Departure city" },
          { key: "destination", label: "Destination" },
          { key: "dates", label: "Dates" },
          { key: "travelers", label: "Travelers" },
          { key: "budget", label: "Budget" },
          { key: "style", label: "Style" },
          { key: "accommodationType", label: "Accommodation Type", type: "select", options: [
            { value: "Hotel", label: "Hotel" },
            { value: "Residence", label: "Short-term rental" },
            { value: "Airbnb", label: "ZeniStay" },
            { value: "Yacht", label: "Yacht" },
            { value: "Resort", label: "Resort" },
            { value: "Other", label: "Other" },
          ] },
          { key: "transportationType", label: "Transportation Type", type: "select", options: ["Flights", "No Flights"] },
          { key: "includeActivities", label: "Include Activities", type: "checkbox" },
          { key: "includeTransfers", label: "Include Transfers", type: "checkbox" },
        ].map((f) => (
          <div key={f.key} className="space-y-1">
            <div className="text-xs font-bold flex items-center gap-1 text-slate-500">
              {f.label}
              {effectiveSnapshot?.[f.key] && f.type !== "checkbox" && <span className="text-green-500">✓</span>}
            </div>
            {f.type === "select" ? (
              <select
                value={effectiveSnapshot?.[f.key] || ""}
                onChange={(e) => onChange(f.key, e.target.value)}
                className="w-full rounded-xl px-3 py-2 text-sm font-semibold outline-none text-slate-800 bg-slate-50 border border-slate-200 focus:border-blue-400"
              >
                <option value="">Select...</option>
                {f.options.map((opt) => (
                  typeof opt === "string"
                    ? <option key={opt} value={opt}>{opt}</option>
                    : <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : f.type === "checkbox" ? (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(effectiveSnapshot?.[f.key])}
                  onChange={(e) => onChange(f.key, e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span className="text-sm text-slate-600">Include in proposal</span>
              </label>
            ) : (
              <input
                value={effectiveSnapshot?.[f.key] || ""}
                onChange={(e) => onChange(f.key, e.target.value)}
                className="w-full rounded-xl px-3 py-2 text-sm font-semibold outline-none text-slate-800 bg-slate-50 border border-slate-200 focus:border-blue-400 placeholder-slate-400"
                placeholder={`Enter ${f.label.toLowerCase()}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Missing info hints */}
      <div className="mt-4 rounded-xl p-3 space-y-1 bg-slate-50 border border-slate-200">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Needed for proposal</div>
        {!effectiveSnapshot?.dates && <div className="text-xs text-red-500">✗ Dates missing</div>}
        {!effectiveSnapshot?.destination && <div className="text-xs text-red-500">✗ Destination missing</div>}
        {!effectiveSnapshot?.travelers && <div className="text-xs text-red-500">✗ Travelers missing</div>}
        {!effectiveSnapshot?.budget && <div className="text-xs text-amber-600">○ Budget not set</div>}
        {effectiveSnapshot?.dates && effectiveSnapshot?.destination && effectiveSnapshot?.travelers && (
          <div className="text-xs text-green-600 font-bold">✓ Ready to generate!</div>
        )}
      </div>

    </div>
  );
}
