"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ensureSeedTrip, setTripUserScope } from "../../../../lib/store/tripsStore";
import { useAuthStore } from "../../../../src/lib/authStore";

function AgentChatRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const scope = user?.email ? `agent:${user.email}` : "agent-guest";
    setTripUserScope(scope);
    const qp = searchParams?.get("tripId");
    const next = qp || ensureSeedTrip();
    router.replace(`/agent/lina/chat/${next}`);
  }, [router, searchParams, user?.email]);

  return null;
}

export default function AgentChatRedirectPage() {
  return (
    <Suspense fallback={null}>
      <AgentChatRedirect />
    </Suspense>
  );
}
