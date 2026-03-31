"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AgentChatLayout from "@/components/agent-chat/AgentChatLayout";
import AgentChatThread from "@/components/agent-chat/AgentChatThread";
import AgentTripSnapshotPanel from "@/components/agent-chat/AgentTripSnapshotPanel";
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
    if (!trip) ensureSeedTrip();
  }, [tripId, trip, router]);

  return (
    <AgentChatLayout
      sidebar={null}
      chat={<AgentChatThread tripId={tripId} />}
      snapshot={<AgentTripSnapshotPanel tripId={tripId} />}
      tripId={tripId}
      backHref="/agent/trip-search"
      backLabel="Trip Search"
    />
  );
}
