"use client";

import { useEffect } from "react";
import { captureReferralFromUrl } from "../lib/influencer";

export default function ReferralTracker() {
  useEffect(() => {
    const attribution = captureReferralFromUrl();
    if (attribution?.referralCode) {
      fetch("/api/influencer/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: attribution.referralCode, path: window.location.pathname }),
      }).catch(() => undefined);
    }
  }, []);
  return null;
}
