export const dynamic = "force-dynamic";
import { Suspense } from "react";
import TravelerChatClient from "./TravelerChatClient";

export default function TravelerAgentChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-400">Loading…</div>}>
      <TravelerChatClient />
    </Suspense>
  );
}
