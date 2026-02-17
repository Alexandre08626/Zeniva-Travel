import { Suspense } from "react";

import AgentListingsHubClient from "./_components/AgentListingsHub.client";

export const dynamic = "force-dynamic";

export default function AgentListingsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-6 py-8 text-sm text-slate-600">Loading listings…</div>}>
      <AgentListingsHubClient />
    </Suspense>
  );
}
