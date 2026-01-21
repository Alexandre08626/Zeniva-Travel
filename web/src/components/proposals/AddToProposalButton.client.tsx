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
  roomLabel?: string;
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
  roomLabel,
  label = "Add to proposal",
  className = "rounded-full bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-900",
}: AddToProposalButtonProps) {
  const router = useRouter();

  const handleClick = async () => {
    const tripId = createTrip({
      title,
      destination,
      style: style || accommodationType,
    });

    updateSnapshot(tripId, {
      destination,
      travelers: "2 adults",
      style: style || accommodationType,
      accommodationType,
      budget: price,
    });

    applyTripPatch(tripId, {
      destination,
      accommodationType,
      style: style || accommodationType,
      budget: price,
    });

    setProposalSelection(tripId, {
      flight: null,
      activity: null,
      transfer: null,
      hotel: {
        id: title,
        name: title,
        location: destination,
        price,
        room: roomLabel || accommodationType,
        accommodationType,
        image,
        images: images || (image ? [image] : []),
        description,
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
