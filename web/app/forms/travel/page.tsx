export const dynamic = "force-dynamic";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Trip Request — Get a Custom Travel Proposal",
  description: "Tell us where you want to go. Lina, Zeniva Travel's AI concierge, prepares a complete proposal — flights, hotel, transfers — and an advisor follows up. English or French.",
  alternates: { canonical: "https://www.zenivatravel.com/forms/travel" },
};

import { Suspense } from "react";
import TravelFormClient from "./TravelFormClient";

export default function TravelFormPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <TravelFormClient />
    </Suspense>
  );
}
