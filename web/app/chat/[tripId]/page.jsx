"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ChatLayout from "../../../components/chat/ChatLayout";
import ConversationsSidebar from "../../../components/chat/ConversationsSidebar";
import ChatThread from "../../../components/chat/ChatThread";
import TripSnapshotPanel from "../../../components/chat/TripSnapshotPanel";
import { ensureSeedTrip, useTripsStore } from "../../../lib/store/tripsStore";

export default function ChatTripPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = Array.isArray(params.tripId) ? params.tripId[0] : params.tripId;
  const { trip } = useTripsStore((s) => ({ trip: s.trips.find((t) => t.id === tripId) }));

  useEffect(() => {
    if (!tripId) {
      const fallback = ensureSeedTrip();
      router.replace(`/chat/${fallback}`);
      return;
    }
    if (!trip) {
      // ensure seed if unknown id
      ensureSeedTrip();
    }
  }, [tripId, trip, router]);

  return (
    <ChatLayout
      sidebar={<ConversationsSidebar currentTripId={tripId} />}
      chat={<ChatThread tripId={tripId} />}
      snapshot={<TripSnapshotPanel tripId={tripId} />}
      tripId={tripId}
    />
  );
}
