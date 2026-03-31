"use client";
import { useParams } from "next/navigation";
import AgentChatLayout from "@/components/agent-chat/AgentChatLayout";
import AgentChatThread from "@/components/agent-chat/AgentChatThread";
import AgentTripSnapshotPanel from "@/components/agent-chat/AgentTripSnapshotPanel";

export default function AgentTripChatPage() {
  const params = useParams();
  const tripId = params.id as string;

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
