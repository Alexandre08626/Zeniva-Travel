export const dynamic = "force-dynamic";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yacht Charter Request — Private Charter Quote",
  description: "Request a private yacht charter quote from ZeniYacht by Zeniva Travel: destination, dates, guests and budget. A charter specialist reviews every request.",
  alternates: { canonical: "https://www.zenivatravel.com/forms/yacht" },
};

import { Suspense } from "react";
import YachtFormClient from "./YachtFormClient";

export default function YachtFormPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <YachtFormClient />
    </Suspense>
  );
}
