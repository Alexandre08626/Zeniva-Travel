"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "../../../src/components/Header";
import Footer from "../../../src/components/Footer";
import { LIGHT_BG, TITLE_TEXT, MUTED_TEXT } from "../../../src/design/tokens";

export default function TransfersSearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TransfersSearchContent />
    </Suspense>
  );
}

function TransfersSearchContent() {
  const params = useSearchParams();
  const pickup = params.get("pickup") || "";
  const dropoff = params.get("dropoff") || "";
  const date = params.get("date") || "";
  const passengers = params.get("passengers") || "2";

  return (
    <main style={{ backgroundColor: LIGHT_BG }}>
      <Header isLoggedIn={false} />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Search Results</p>
          <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>Transfer Options</h1>
          <p className="text-sm" style={{ color: MUTED_TEXT }}>
            From {pickup || "Pickup Location"} to {dropoff || "Drop-off Location"} on {date || "Selected Date"} for {passengers} passengers
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-lg" style={{ color: MUTED_TEXT }}>
            Transfer search functionality coming soon. Please use the chat with Lina to arrange transfers for your trip.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}