"use client";

import { useRouter } from "next/navigation";
import { applyTripPatch, createTrip, generateProposal, setProposalSelection, updateSnapshot } from "@/lib/store/tripsStore";

type AddToProposalButtonProps = {
  title: string;
  destination: string;
  accommodationType: "Airbnb" | "Yacht" | "Resort" | "Hotel";
  style?: string;
  price?: string;
  image: string;
  images?: string[];
  description?: string;
  specs?: string;
  amenities?: string[];
  roomLabel?: string;
  datesStorageKey?: string;
  label?: string;
  className?: string;
};

export default function AddToProposalButton({
  title,
  destination,
  accommodationType,
  style,
  price,
  image,
  images,
  description,
  specs,
  amenities,
  roomLabel,
  datesStorageKey,
  label = "Add to proposal",
  className = "rounded-full bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-900",
}: AddToProposalButtonProps) {
  const router = useRouter();

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  const parseMoney = (value?: string) => {
    if (!value) return null;
    const numeric = parseFloat(value.replace(/[^0-9.]/g, ""));
    return Number.isNaN(numeric) ? null : numeric;
  };

  const nightsBetween = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 1;
    const diff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const handleClick = async () => {
    const tripId = createTrip({
      title,
      destination,
      style: style || accommodationType,
    });

    const storedDates = (() => {
      if (typeof window === "undefined" || !datesStorageKey) return null;
      try {
        const raw = window.localStorage.getItem(datesStorageKey);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (_) {
        return null;
      }
    })();

    const checkIn = storedDates?.start || "";
    const checkOut = storedDates?.end || "";
    const dates = checkIn && checkOut ? `${checkIn} - ${checkOut}` : "";

    let resolvedPrice = price;
    if (accommodationType === "Airbnb" && price && /night/i.test(price) && checkIn && checkOut) {
      const nightly = parseMoney(price);
      if (nightly !== null) {
        const nights = nightsBetween(checkIn, checkOut);
        const subtotal = nights * nightly;
        const cleaningFee = 285;
        const conciergeFee = 120;
        const taxes = Math.round(subtotal * 0.12);
        const total = subtotal + cleaningFee + conciergeFee + taxes;
        resolvedPrice = formatMoney(total);
      }
    }

    updateSnapshot(tripId, {
      destination,
      travelers: "2 adults",
      style: style || accommodationType,
      accommodationType,
      budget: resolvedPrice,
      dates,
    });

    applyTripPatch(tripId, {
      destination,
      accommodationType,
      style: style || accommodationType,
      budget: resolvedPrice,
      checkIn,
      checkOut,
      dates,
    });

    setProposalSelection(tripId, {
      flight: null,
      activity: null,
      transfer: null,
      hotel: {
        id: title,
        name: title,
        location: destination,
        price: resolvedPrice,
        room: roomLabel || accommodationType,
        accommodationType,
        image,
        images: images || (image ? [image] : []),
        description,
        specs,
        amenities,
      },
    });

    await generateProposal(tripId);
    router.push("/proposals");
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {label}
    </button>
  );
}
