"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ChatLayout from "@/components/chat/ChatLayout";
import ChatThread from "@/components/chat/ChatThread";
import TripSnapshotPanel from "@/components/chat/TripSnapshotPanel";
import { ensureSeedTrip, useTripsStore } from "@/lib/store/tripsStore";

export default function AgentTripChatPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;
  const { trip } = useTripsStore((s) => ({ trip: s.trips.find((t: { id: string }) => t.id === tripId) }));

  useEffect(() => {
    if (!tripId) {
      const fallback = ensureSeedTrip();
      router.replace(`/agent/trip-search/chat/${fallback}`);
      return;
    }
    if (!trip) {
      ensureSeedTrip();
    }
  }, [tripId, trip, router]);

  return (
    <ChatLayout
      sidebar={null}
      chat={<ChatThread tripId={tripId} agentMode />}
      snapshot={<TripSnapshotPanel tripId={tripId} />}
      tripId={tripId}
      backHref="/agent/trip-search"
      backLabel="Trip Search"
      agentMode
    />
  );
}
