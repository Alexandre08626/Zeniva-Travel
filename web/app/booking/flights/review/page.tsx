import { Suspense } from "react";
import FlightReviewClient from "./FlightReviewClient";

export default function FlightReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 px-4 py-10">Loading...</div>}>
      <FlightReviewClient />
    </Suspense>
  );
}
