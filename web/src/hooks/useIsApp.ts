"use client";
import { useEffect, useState } from "react";

export function useIsApp(): boolean | null {
  // null = loading (prevents flash of wrong content)
  const [isApp, setIsApp] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. URL param — most reliable (manifest start_url = "/?pwa=1")
    const urlParam = new URLSearchParams(window.location.search).get("pwa") === "1";

    // 2. Native standalone detection (PWA installed on home screen)
    const standalone =
      (window.navigator as any).standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;

    // 3. localStorage — persists across navigations once PWA is detected
    const remembered = localStorage.getItem("zeniva_pwa_mode") === "1";

    // 4. Mobile browser + logged-in client → app experience
    const isMobile = window.innerWidth < 768;
    const isLoggedIn = !!localStorage.getItem("zeniva_token") || !!document.cookie.includes("zeniva_token");
    const mobileClient = isMobile && isLoggedIn;

    const result = urlParam || standalone || remembered || mobileClient;

    // Persist PWA mode (only for actual PWA, not just mobile+logged-in)
    if (urlParam || standalone) {
      localStorage.setItem("zeniva_pwa_mode", "1");
    }

    setIsApp(result);
  }, []);

  return isApp;
}
