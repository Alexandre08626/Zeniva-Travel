"use client";
import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { BRAND_BLUE, LIGHT_BG, MUTED_TEXT, PREMIUM_BLUE, TITLE_TEXT } from "../../../../src/design/tokens";
import { useTripsStore, generateProposal } from "../../../../lib/store/tripsStore";
import { getImagesForDestination, getPartnerHotelImages } from "../../../../src/lib/images";
import { computePrice, formatCurrency } from "../../../../src/lib/pricing";
import yachtsData from "../../../../src/data/ycn_packages.json";
import airbnbsData from "../../../../src/data/airbnbs.json";

export default function ProposalReviewPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = Array.isArray(params.tripId) ? params.tripId[0] : params.tripId;

  const { proposal, selection, tripDraft } = useTripsStore((s) => ({
    proposal: s.proposals[tripId],
    selection: s.selections[tripId] || { flight: null, hotel: null, activity: null, transfer: null },
    tripDraft: s.tripDrafts[tripId] || {},
  }));

  useEffect(() => {
    if (tripId && !proposal) {
      generateProposal(tripId);
    }
  }, [tripId, proposal]);

  const heroImage = useMemo(() => {
    // Use selected accommodation image if available, otherwise fallback to destination images
    if (selection?.hotel?.image) {
      return selection.hotel.image;
    }
    const dest = tripDraft?.destination || proposal?.title || "trip";
    return getImagesForDestination(dest)[0];
  }, [tripDraft, proposal, selection]);

  const accommodationImages = useMemo(() => {
    if (!selection?.hotel?.id) return [];
    
    // For yachts
    if (tripDraft?.accommodationType === 'Yacht') {
      const yacht = yachtsData.find(y => y.id === selection.hotel.id);
      return yacht?.images || [selection.hotel.image].filter(Boolean);
    }
    
    // For Airbnbs
    if (tripDraft?.accommodationType === 'Airbnb') {
      const airbnb = airbnbsData.find(a => a.id === selection.hotel.id);
      return airbnb?.images || [selection.hotel.image].filter(Boolean);
    }
    
    // For hotels, use partner images
    return getPartnerHotelImages(tripDraft?.destination || selection.hotel.location || selection.hotel.name).slice(0, 6);
  }, [selection, tripDraft]);

  const flight = selection?.flight || { airline: "Airline", route: "YUL → CUN", times: "19:20 – 08:45", fare: "Business", bags: "2 checked", price: "$1,850", flightNumber: "AC 456", duration: "4h 30m", date: "Dec 15, 2025", layovers: 0 };
  const hotel = selection?.hotel || { name: "Hotel Playa", room: "Junior Suite", location: "Beachfront", price: "$420/night", rating: 4.6 };
  const activity = selection?.activity;
  const transfer = selection?.transfer;

  const pricing = computePrice({ flight, hotel, activity, transfer }, tripDraft);
  const breakdown = [
    { label: "Flights", value: formatCurrency(pricing.flightTotal) },
    { label: tripDraft?.accommodationType === 'Hotel' ? 'Hotel' : tripDraft?.accommodationType === 'Yacht' ? 'Yacht' : 'Villa', value: formatCurrency(pricing.hotelTotal) },
    ...(activity ? [{ label: "Activity", value: formatCurrency(pricing.activityTotal) }] : []),
    ...(transfer ? [{ label: "Transfer", value: formatCurrency(pricing.transferTotal) }] : []),
    { label: "Fees & services", value: formatCurrency(pricing.fees) },
  ];

  const onPay = () => router.push(`/checkout/${tripId}`);

  if (!tripId) return null;

  return (
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>
              Review & finalize
            </div>
            <h1 className="text-2xl font-black" style={{ color: TITLE_TEXT }}>
              Your tailored trip
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/proposals/${tripId}/select`)}
              className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold"
              style={{ color: PREMIUM_BLUE }}
            >
              Edit selections
            </button>
            <button
              onClick={() => router.push(`/chat/${tripId}`)}
              className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold"
              style={{ color: PREMIUM_BLUE }}
            >
              Back to chat
            </button>
          </div>
        </header>

        <div className="relative h-56 w-full overflow-hidden rounded-2xl">
          <img src={heroImage} alt="Destination" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 to-black/5" />
          <div className="absolute left-6 bottom-6 text-white">
            <div className="text-sm font-semibold">{tripDraft?.destination || "Your trip"}</div>
            <div className="text-2xl font-extrabold">Review before payment</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div className="lg:col-span-2 space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2">
              <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>Flight</div>
              <div className="text-lg font-extrabold" style={{ color: TITLE_TEXT }}>
                {flight.airline} • {flight.route}
              </div>
              <div className="text-sm" style={{ color: MUTED_TEXT }}>
                {flight.times} • {flight.fare} • {flight.bags}
              </div>
              {flight.flightNumber && (
                <div className="text-sm" style={{ color: MUTED_TEXT }}>
                  Flight: {flight.flightNumber}
                </div>
              )}
              {flight.date && (
                <div className="text-sm" style={{ color: MUTED_TEXT }}>
                  Date: {flight.date}
                </div>
              )}
              {flight.duration && (
                <div className="text-sm" style={{ color: MUTED_TEXT }}>
                  Duration: {flight.duration}
                </div>
              )}
              {flight.layovers > 0 && (
                <div className="text-sm" style={{ color: MUTED_TEXT }}>
                  Layovers: {flight.layovers}
                </div>
              )}
              <div className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>
                Fare rules: flexible changes with fee, cancellation subject to airline policy.
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2">
              <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>{tripDraft?.accommodationType === 'Hotel' ? 'Hotel' : tripDraft?.accommodationType === 'Yacht' ? 'Yacht' : 'Villa'}</div>
              <div className="text-lg font-extrabold" style={{ color: TITLE_TEXT }}>
                {hotel.name} • {hotel.location || "Central"}
              </div>
              <div className="text-sm" style={{ color: MUTED_TEXT }}>
                {tripDraft?.accommodationType === 'Yacht' ? `Specs: ${hotel.specs || "Yacht specs"}` : `Room: ${hotel.room || "Deluxe"} • Board: Breakfast • Rating: ${hotel.rating || "4.5"}`}
              </div>
              <div className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>
                {tripDraft?.accommodationType === 'Yacht' ? `Amenities: ${hotel.amenities?.join(" • ") || "Yacht amenities"}` : "Policies: Free cancellation until 7 days before arrival; pay at property or prepaid per partner terms."}
              </div>
              {accommodationImages.length > 0 && (
                <div className="pt-4">
                  <div className="text-xs font-semibold mb-2" style={{ color: MUTED_TEXT }}>Photo gallery</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {accommodationImages.slice(0, 6).map((src, i) => (
                      <div key={i} className="aspect-square overflow-hidden rounded-lg">
                        <img src={src} alt={`Accommodation ${i + 1}`} className="h-full w-full object-cover hover:scale-105 transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {activity && (
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2">
                <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>Activity</div>
                <div className="text-lg font-extrabold" style={{ color: TITLE_TEXT }}>
                  {activity.name}
                </div>
                <div className="text-sm" style={{ color: MUTED_TEXT }}>
                  {activity.date} at {activity.time} • {activity.supplier}
                </div>
                <div className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>
                  Includes: Guided tour, entrance fees, transportation.
                </div>
                {activity.images && activity.images.length > 0 && (
                  <div className="pt-4">
                    <div className="text-xs font-semibold mb-2" style={{ color: MUTED_TEXT }}>Photo gallery</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {activity.images.slice(0, 6).map((src, i) => (
                        <div key={i} className="aspect-square overflow-hidden rounded-lg">
                          <img src={src} alt={`Activity ${i + 1}`} className="h-full w-full object-cover hover:scale-105 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {transfer && (
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2">
                <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>Transfer</div>
                <div className="text-lg font-extrabold" style={{ color: TITLE_TEXT }}>
                  {transfer.name}
                </div>
                <div className="text-sm" style={{ color: MUTED_TEXT }}>
                  {transfer.route} • {transfer.date} • {transfer.supplier}
                </div>
                <div className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>
                  Vehicle: {transfer.vehicle} • {transfer.shared ? "Shared transfer" : "Private transfer"}.
                </div>
                {transfer.images && transfer.images.length > 0 && (
                  <div className="pt-4">
                    <div className="text-xs font-semibold mb-2" style={{ color: MUTED_TEXT }}>Photo gallery</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {transfer.images.slice(0, 6).map((src, i) => (
                        <div key={i} className="aspect-square overflow-hidden rounded-lg">
                          <img src={src} alt={`Transfer ${i + 1}`} className="h-full w-full object-cover hover:scale-105 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2">
              <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>Price breakdown</div>
              <div className="space-y-1">
                {breakdown.map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-sm" style={{ color: TITLE_TEXT }}>
                    <span>{row.label}</span>
                    <span className="font-semibold">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                <span className="text-sm font-bold" style={{ color: TITLE_TEXT }}>Total</span>
                <span className="text-xl font-extrabold" style={{ color: PREMIUM_BLUE }}>{formatCurrency(pricing.total)}</span>
              </div>
              <div className="text-xs" style={{ color: MUTED_TEXT }}>
                Based on {pricing.travelers} traveler(s) and {pricing.nights} nights. Final pricing is confirmed at payment with live availability.
              </div>
            </section>
          </div>

          <aside className="space-y-3 sticky top-4">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2">
              <div className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>Travel summary</div>
              <div className="text-sm" style={{ color: TITLE_TEXT }}>
                {tripDraft?.departureCity || "Departure TBC"} → {tripDraft?.destination || "Destination"}
              </div>
              <div className="text-sm" style={{ color: MUTED_TEXT }}>
                Dates: {tripDraft?.checkIn && tripDraft?.checkOut ? `${tripDraft.checkIn} to ${tripDraft.checkOut}` : "Flexible"}
              </div>
              <div className="text-sm" style={{ color: MUTED_TEXT }}>
                Travelers: {tripDraft?.adults || "2"}
              </div>
            </div>

            <button
              onClick={onPay}
              className="w-full rounded-full px-4 py-3 text-sm font-extrabold text-white"
              style={{ backgroundColor: BRAND_BLUE }}
            >
              Proceed to payment
            </button>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs" style={{ color: MUTED_TEXT }}>
              You can adjust selections before paying. Policies and fare rules summarized above.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
