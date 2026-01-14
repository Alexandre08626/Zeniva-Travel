"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ensureSeedTrip } from "../../lib/store/tripsStore";

function ChatRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qp = searchParams?.get("tripId");
    const next = qp || ensureSeedTrip();
    router.replace(`/chat/${next}`);
  }, [router, searchParams]);

  return null;
}

export default function ChatRedirectPage() {
  return (
    <Suspense fallback={null}>
      <ChatRedirect />
    </Suspense>
  );
}
