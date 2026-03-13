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

    const result = urlParam || standalone || remembered;

    // Save PWA mode so internal navigation keeps app UI
    if (result) {
      localStorage.setItem("zeniva_pwa_mode", "1");
    }

    setIsApp(result);
  }, []);

  return isApp;
}
