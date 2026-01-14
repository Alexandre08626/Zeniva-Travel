"use client";

import { I18nProvider } from "../src/lib/i18n/I18nProvider";
import { useEffect } from "react";
import { useAuthStore } from "../src/lib/authStore";
import { setTripUserScope } from "../lib/store/tripsStore";

function TripsScopeBridge() {
  const user = useAuthStore((s) => s.user);
  useEffect(() => {
    setTripUserScope(user?.email || "guest");
  }, [user?.email]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <TripsScopeBridge />
      {children}
    </I18nProvider>
  );
}
