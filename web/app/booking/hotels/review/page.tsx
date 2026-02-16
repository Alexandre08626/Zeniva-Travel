import { Suspense } from "react";
import HotelReviewClient from "./HotelReviewClient";

export default function HotelReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 px-4 py-10">Loading...</div>}>
      <HotelReviewClient />
    </Suspense>
  );
}
