"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { BRAND_BLUE, LIGHT_BG, MUTED_TEXT, PREMIUM_BLUE, TITLE_TEXT } from "../../../../src/design/tokens";
import { useTripsStore, generateProposal } from "../../../../lib/store/tripsStore";
import { getImagesForDestination, getPartnerHotelImages } from "../../../../src/lib/images";
import { computePrice, formatCurrency } from "../../../../src/lib/pricing";
import yachtsData from "../../../../src/data/ycn_packages.json";
import airbnbsData from "../../../../src/data/airbnbs.json";

export default function ProposalReviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = Array.isArray(params.tripId) ? params.tripId[0] : params.tripId;
  const mode = searchParams?.get("mode") || "";
  const isAgentMode = mode === "agent";
  const modeSuffix = isAgentMode ? "?mode=agent" : "";
  const [shareStatus, setShareStatus] = useState("");

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

  const extraHotels = tripDraft?.extraHotels || [];
  const extraActivities = tripDraft?.extraActivities || [];
  const extraTransfers = tripDraft?.extraTransfers || [];

  const allHotels = [selection?.hotel, ...extraHotels].filter(Boolean);
  const uniqueHotels = allHotels.filter((item, idx, arr) => {
    const key = `${item?.id || item?.name || idx}`;
    return arr.findIndex((h) => `${h?.id || h?.name || idx}` === key) === idx;
  });

  const getAccommodationType = (item) => {
    const rawType = item?.accommodationType || tripDraft?.accommodationType || "";
    if (typeof rawType === "string" && rawType.toLowerCase() === "airbnb") return "Residence";
    return rawType || (item?.room?.toLowerCase?.().includes("yacht") ? "Yacht" : item?.room?.toLowerCase?.().includes("residence") ? "Residence" : "Hotel");
  };

  const getAccommodationImages = (item, type) => {
    if (item?.images && item.images.length) return item.images;
    if (type === 'Yacht') {
      const yacht = yachtsData.find((y) => y.id === item?.id || y.title === item?.name);
      return yacht?.images || [item?.image].filter(Boolean);
    }
    if (type === 'Residence') {
      const airbnb = airbnbsData.find((a) => a.id === item?.id || a.title === item?.name);
      return airbnb?.images || [item?.image].filter(Boolean);
    }
    const fallback = getPartnerHotelImages(tripDraft?.destination || item?.location || item?.name).slice(0, 6);
    return fallback.length ? fallback : [item?.image].filter(Boolean);
  };

  const flight = selection?.flight || { airline: "Airline", route: "YUL → CUN", times: "19:20 – 08:45", fare: "Business", bags: "2 checked", flightNumber: "AC 456", duration: "4h 30m", date: "Dec 15, 2025", layovers: 0 };
  const hotel = selection?.hotel || { name: "Hotel Playa", room: "Junior Suite", location: "Beachfront", rating: 4.6 };
  const activity = selection?.activity;
  const transfer = selection?.transfer;
  const activityList = [activity, ...extraActivities].filter(Boolean);
  const transferList = [transfer, ...extraTransfers].filter(Boolean);

  const pricing = computePrice({ flight: selection?.flight, hotel: selection?.hotel, activity, transfer }, {
    ...tripDraft,
    extraHotels,
    extraActivities,
    extraTransfers,
  });
  const breakdown = [
    { label: "Flights", value: pricing.hasFlightPrice ? formatCurrency(pricing.flightTotal) : "On request" },
    { label: "Accommodation", value: pricing.hasHotelPrice ? formatCurrency(pricing.hotelTotal) : "On request" },
    ...(activityList.length ? [{ label: "Activities", value: pricing.hasActivityPrice ? formatCurrency(pricing.activityTotal) : "Included" }] : []),
    ...(transferList.length ? [{ label: "Transfers", value: pricing.hasTransferPrice ? formatCurrency(pricing.transferTotal) : "Included" }] : []),
    { label: "Fees & services", value: pricing.hasAnyPrice ? formatCurrency(pricing.fees) : "Included" },
  ];

  const onPay = () => router.push(`/checkout/${tripId}`);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/checkout/${tripId}` : "";
  const handleShare = async () => {
    const url = shareUrl || `/checkout/${tripId}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus("Payment link copied.");
    } catch {
      setShareStatus("Copy failed. Please copy the link manually.");
    }
  };

  if (!tripId) return null;

  return (
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <header className="flex items-center justify-between text-sm">
          <button
            onClick={() => router.push(isAgentMode ? `/agent/proposals` : `/proposals`)}
            className="text-blue-700 font-semibold"
          >
            {isAgentMode ? "Back to agent proposals" : "Back to proposals"}
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/proposals/${tripId}/select${modeSuffix}`)}
              className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700"
            >
              Edit selections
            </button>
            <button
              onClick={() => router.push(isAgentMode ? `/agent/lina/chat/${tripId}` : `/chat/${tripId}`)}
              className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700"
            >
              {isAgentMode ? "Back to Lina" : "Back to chat"}
            </button>
          </div>
        </header>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Zeniva travel</p>
          <h1 className="text-3xl font-black text-slate-900">Your tailored trip</h1>
          <div className="text-sm text-blue-800">
            {tripDraft?.destination || "Your trip"} · {isAgentMode ? "Review before sending to client" : "Review before payment"}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-2 rounded-3xl overflow-hidden">
          <div className="lg:col-span-2 lg:row-span-2 h-80 lg:h-full">
            <img src={heroImage} alt="Destination" className="h-full w-full object-cover" />
          </div>
          {((uniqueHotels[0]
            ? getAccommodationImages(uniqueHotels[0], getAccommodationType(uniqueHotels[0]))
            : [heroImage, heroImage, heroImage, heroImage]
          ).slice(0, 4)).map((img, i) => (
            <div key={i} className="h-40 lg:h-full">
              <img src={img} alt={`Trip ${i + 1}`} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>

        <section className="rounded-2xl border border-blue-100 bg-white p-6">
          <p className="text-lg font-bold text-slate-900">Trip overview</p>
          <p className="mt-1 text-sm text-slate-600">
            {tripDraft?.departureCity || "Departure"} → {tripDraft?.destination || "Destination"} · {tripDraft?.checkIn && tripDraft?.checkOut ? `${tripDraft.checkIn} to ${tripDraft.checkOut}` : "Flexible dates"}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-blue-800">
            <span className="font-semibold">4.92</span>
            <span>· 52 reviews</span>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            <section className="rounded-2xl border border-blue-100 bg-white shadow-sm p-6 space-y-2">
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

            {uniqueHotels.map((stay, idx) => {
              const type = getAccommodationType(stay);
              const label = type === 'Yacht' ? 'Yacht' : type === 'Residence' ? 'Short-term rental' : 'Hotel';
              const stayImages = getAccommodationImages(stay, type);
              return (
                <section key={`${stay?.id || stay?.name || idx}`} className="rounded-2xl border border-blue-100 bg-white shadow-sm p-6 space-y-2">
                  <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>{label}</div>
                  <div className="text-lg font-extrabold" style={{ color: TITLE_TEXT }}>
                    {stay.name} • {stay.location || "Central"}
                  </div>
                  <div className="text-sm" style={{ color: MUTED_TEXT }}>
                    {type === 'Yacht'
                      ? `Specs: ${stay.specs || "Yacht specs"}`
                      : type === 'Residence'
                        ? `Stay: ${stay.room || "Private stay"} • Rating: ${stay.rating || "4.9"}`
                        : `Room: ${stay.room || "Deluxe"} • Board: Breakfast • Rating: ${stay.rating || "4.5"}`}
                  </div>
                  <div className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>
                    {type === 'Yacht'
                      ? `Amenities: ${stay.amenities?.join(" • ") || "Yacht amenities"}`
                      : "Policies: Free cancellation until 7 days before arrival; pay at property or prepaid per partner terms."}
                  </div>
                  {stayImages.length > 0 && (
                    <div className="pt-4">
                      <div className="text-xs font-semibold mb-2" style={{ color: MUTED_TEXT }}>Photo gallery</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {stayImages.slice(0, 6).map((src, i) => (
                          <div key={i} className="aspect-square overflow-hidden rounded-lg">
                            <img src={src} alt={`${label} ${i + 1}`} className="h-full w-full object-cover hover:scale-105 transition-transform" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              );
            })}

            {activityList.map((act, idx) => (
              <section key={`activity-${idx}-${act?.id || act?.name || "item"}`} className="rounded-2xl border border-blue-100 bg-white shadow-sm p-6 space-y-2">
                <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>Activity</div>
                <div className="text-lg font-extrabold" style={{ color: TITLE_TEXT }}>
                  {act.name}
                </div>
                <div className="text-sm" style={{ color: MUTED_TEXT }}>
                  {act.date} at {act.time} • {act.supplier}
                </div>
                <div className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>
                  Includes: Guided tour, entrance fees, transportation.
                </div>
                {act.images && act.images.length > 0 && (
                  <div className="pt-4">
                    <div className="text-xs font-semibold mb-2" style={{ color: MUTED_TEXT }}>Photo gallery</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {act.images.slice(0, 6).map((src, i) => (
                        <div key={i} className="aspect-square overflow-hidden rounded-lg">
                          <img src={src} alt={`Activity ${i + 1}`} className="h-full w-full object-cover hover:scale-105 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ))}

            {transferList.map((item, idx) => (
              <section key={`transfer-${idx}-${item?.id || item?.name || "item"}`} className="rounded-2xl border border-blue-100 bg-white shadow-sm p-6 space-y-2">
                <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>Transfer</div>
                <div className="text-lg font-extrabold" style={{ color: TITLE_TEXT }}>
                  {item.name}
                </div>
                <div className="text-sm" style={{ color: MUTED_TEXT }}>
                  {item.route} • {item.date} • {item.supplier}
                </div>
                <div className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>
                  Vehicle: {item.vehicle} • {item.shared ? "Shared transfer" : "Private transfer"}.
                </div>
                {item.images && item.images.length > 0 && (
                  <div className="pt-4">
                    <div className="text-xs font-semibold mb-2" style={{ color: MUTED_TEXT }}>Photo gallery</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {item.images.slice(0, 6).map((src, i) => (
                        <div key={i} className="aspect-square overflow-hidden rounded-lg">
                          <img src={src} alt={`Transfer ${i + 1}`} className="h-full w-full object-cover hover:scale-105 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ))}

            <section className="rounded-2xl border border-blue-100 bg-white shadow-sm p-6 space-y-2">
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
                <span className="text-xl font-extrabold" style={{ color: PREMIUM_BLUE }}>
                  {pricing.hasAnyPrice ? formatCurrency(pricing.total) : "On request"}
                </span>
              </div>
              <div className="text-xs" style={{ color: MUTED_TEXT }}>
                Based on {pricing.travelers} traveler(s) and {pricing.nights} nights. Final pricing is confirmed at payment with live availability.
              </div>
            </section>
          </div>

          <aside className="space-y-4 sticky top-4">
            <div className="rounded-2xl border border-blue-200 bg-white shadow-sm p-5 space-y-2">
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

            {isAgentMode ? (
              <>
                <button
                  onClick={handleShare}
                  className="w-full rounded-xl px-4 py-3 text-sm font-extrabold text-white"
                  style={{ backgroundColor: BRAND_BLUE }}
                >
                  Send to client for payment
                </button>
                <button
                  onClick={onPay}
                  className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-700"
                >
                  Preview client payment page
                </button>
                <div className="rounded-xl border border-blue-200 bg-white p-3 text-xs" style={{ color: MUTED_TEXT }}>
                  Share link: {shareUrl || `/checkout/${tripId}`}
                  {shareStatus ? ` • ${shareStatus}` : ""}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={onPay}
                  className="w-full rounded-xl px-4 py-3 text-sm font-extrabold text-white"
                  style={{ backgroundColor: BRAND_BLUE }}
                >
                  Proceed to payment
                </button>
                <div className="rounded-xl border border-blue-200 bg-white p-3 text-xs" style={{ color: MUTED_TEXT }}>
                  You can adjust selections before paying. Policies and fare rules summarized above.
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
