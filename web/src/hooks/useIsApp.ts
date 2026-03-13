"use client";
import { useEffect, useState } from "react";

export function useIsApp(): boolean | null {
  // null = loading (don't render either mode yet — prevents flash)
  const [isApp, setIsApp] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. URL param — most reliable (manifest start_url has ?pwa=1)
    const urlParam = new URLSearchParams(window.location.search).get("pwa") === "1";

    // 2. Native standalone detection (PWA installed)
    const standalone =
      (window.navigator as any).standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;

    // 3. localStorage persistence — once PWA mode detected, keep it across navigations
    const remembered = localStorage.getItem("zeniva_pwa_mode") === "1";

    // 4. Mobile browser — show app UI on all phones (< 768px)
    const isMobile = window.innerWidth < 768;

    const result = urlParam || standalone || remembered || isMobile;

    // Persist PWA mode
    if (urlParam || standalone) {
      localStorage.setItem("zeniva_pwa_mode", "1");
    }

    setIsApp(result);
  }, []);

  return isApp;
}
