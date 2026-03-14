export const dynamic = "force-dynamic";
"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ensureSeedTrip } from "../../lib/store/tripsStore";

function ChatRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qp = searchParams?.get("tripId");
    const q = searchParams?.get("q"); // initial message from app quick prompts
    const next = qp || ensureSeedTrip();
    const url = q ? `/chat/${next}?q=${encodeURIComponent(q)}` : `/chat/${next}`;
    router.replace(url);
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
