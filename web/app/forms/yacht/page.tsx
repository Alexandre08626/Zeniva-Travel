import { Suspense } from "react";
import YachtFormClient from "./YachtFormClient";

export default function YachtFormPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <YachtFormClient />
    </Suspense>
  );
}
