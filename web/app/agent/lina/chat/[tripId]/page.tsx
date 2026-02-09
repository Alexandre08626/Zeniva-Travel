"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ChatLayout from "../../../../../components/chat/ChatLayout";
import ConversationsSidebar from "../../../../../components/chat/ConversationsSidebar";
import ChatThread from "../../../../../components/chat/ChatThread";
import TripSnapshotPanel from "../../../../../components/chat/TripSnapshotPanel";
import { ensureSeedTrip, setTripUserScope, useTripsStore } from "../../../../../lib/store/tripsStore";
import { useAuthStore } from "../../../../../src/lib/authStore";

export default function AgentLinaTripChatPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const tripId = Array.isArray(params.tripId) ? params.tripId[0] : params.tripId;
  const { trip } = useTripsStore((s) => ({ trip: s.trips.find((t) => t.id === tripId) }));

  useEffect(() => {
    const scope = user?.email ? `agent:${user.email}` : "agent-guest";
    setTripUserScope(scope);

    if (!tripId) {
      const fallback = ensureSeedTrip();
      router.replace(`/agent/lina/chat/${fallback}`);
      return;
    }
    if (!trip) {
      ensureSeedTrip();
    }
  }, [tripId, trip, router, user?.email]);

  return (
    <ChatLayout
      sidebar={<ConversationsSidebar currentTripId={tripId} basePath="/agent/lina/chat" />}
      chat={<ChatThread tripId={tripId} proposalMode="agent" />}
      snapshot={<TripSnapshotPanel tripId={tripId} proposalMode="agent" />}
      tripId={tripId}
      backHref="/agent/lina"
      backLabel="Back to Lina Desk"
      pillLabel="Lina AI • Agent Travel Builder"
      callHref={`/call/${tripId}?mode=agent`}
      callLabel="Call Lina (Agent)"
    />
  );
}
