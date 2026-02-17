"use client";

import { useEffect } from "react";

function detectOs() {
  if (typeof navigator === "undefined") return "unknown";
  const platform = (navigator.platform || "").toLowerCase();
  const userAgent = (navigator.userAgent || "").toLowerCase();
  if (platform.includes("mac") || userAgent.includes("mac os")) return "macos";
  if (platform.includes("win") || userAgent.includes("windows")) return "windows";
  if (platform.includes("linux") || userAgent.includes("linux")) return "linux";
  return "unknown";
}

export default function PlatformOsTag() {
  useEffect(() => {
    const os = detectOs();
    document.documentElement.dataset.os = os;
    document.body.dataset.os = os;
  }, []);

  return null;
}
