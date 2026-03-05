"use client";

import { I18nProvider } from "../src/lib/i18n/I18nProvider";
import { useEffect } from "react";
import { useAuthStore } from "../src/lib/authStore";
import { setTripUserScope, syncTripsFromServer } from "../lib/store/tripsStore";
import ReferralTracker from "../src/components/ReferralTracker.client";

function TripsScopeBridge() {
  const user = useAuthStore((s) => s.user);
  useEffect(() => {
    const email = user?.email || "";
    setTripUserScope(email || "guest");
    // Sync from Supabase every time user becomes available (page load OR login)
    if (email) {
      syncTripsFromServer(email).catch(() => undefined);
    }
  }, [user?.email]);
  return null;
}

function ActiveSpaceBridge() {
  const user = useAuthStore((s) => s.user);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const space = user?.activeSpace || "public";
    document.body.dataset.space = space;
  }, [user?.activeSpace]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <TripsScopeBridge />
      <ActiveSpaceBridge />
      <ReferralTracker />
      {children}
    </I18nProvider>
  );
}
