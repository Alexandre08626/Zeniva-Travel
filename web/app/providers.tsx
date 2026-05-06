"use client";

import { I18nProvider } from "../src/lib/i18n/I18nProvider";
import { CurrencyProvider } from "../src/lib/i18n/CurrencyProvider";
import { useEffect } from "react";
import { useAuthStore } from "../src/lib/authStore";
import { setTripUserScope, syncTripsFromServer } from "../lib/store/tripsStore";
import ReferralTracker from "../src/components/ReferralTracker.client";
import GlobalTranslator from "../src/components/GlobalTranslator.client";

function TripsScopeBridge() {
  const user = useAuthStore((s) => s.user);
  useEffect(() => {
    const email = user?.email || "";
    setTripUserScope(email || "guest");
    if (email) {
      // 1. Pull from Supabase (merge server + local)
      syncTripsFromServer(email)
        .then(() => {
          // 2. Push merged local state back to Supabase
          // This ensures all local trips that were never pushed get saved
          import("../lib/store/tripsStore").then((mod) => {
            const state = mod.getState?.();
            if (!state) return;
            fetch("/api/user-data", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, tripsState: state }),
            }).catch(() => undefined);
          }).catch(() => undefined);
        })
        .catch(() => undefined);
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
      <CurrencyProvider>
        <TripsScopeBridge />
        <ActiveSpaceBridge />
        <ReferralTracker />
        <GlobalTranslator />
        {children}
      </CurrencyProvider>
    </I18nProvider>
  );
}
