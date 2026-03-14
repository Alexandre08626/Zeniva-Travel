import { Suspense } from "react";
import TravelFormClient from "./TravelFormClient";

export default function TravelFormPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <TravelFormClient />
    </Suspense>
  );
}
