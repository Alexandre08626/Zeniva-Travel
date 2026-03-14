import { Suspense } from "react";
import TravelerAgentChatClient from "./AgentChatClient";

export default function TravelerAgentChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-400">Loading…</div>}>
      <TravelerAgentChatClient />
    </Suspense>
  );
}
