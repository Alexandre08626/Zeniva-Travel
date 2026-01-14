"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ensureSeedTrip } from "../../lib/store/tripsStore";

function CallRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qp = searchParams?.get("tripId");
    const next = qp || ensureSeedTrip();
    router.replace(`/call/${next}`);
  }, [router, searchParams]);

  return null;
}

export default function CallRedirectPage() {
  return (
    <Suspense fallback={null}>
      <CallRedirect />
    </Suspense>
  );
}
