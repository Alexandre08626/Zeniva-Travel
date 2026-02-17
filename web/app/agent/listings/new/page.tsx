"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AgentCreateListingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/agent/listings?view=create");
  }, [router]);

  return null;
}