"use client";
import { useEffect, useState } from "react";

export function useIsApp(): boolean {
  const [isApp, setIsApp] = useState(false);
  useEffect(() => {
    const standalone =
      (window.navigator as any).standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;
    setIsApp(standalone);
  }, []);
  return isApp;
}
