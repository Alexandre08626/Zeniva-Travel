import { Suspense } from "react";
import YachtsPageClient from "./YachtsPageClient";

export default function YachtsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <YachtsPageClient />
    </Suspense>
  );
}
