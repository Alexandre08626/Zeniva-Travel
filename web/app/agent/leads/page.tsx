"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LeadsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/agent/outreach/newLeads");
  }, [router]);
  return (
    <div className="min-h-screen bg-[#F3F6FB] flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );
}
