"use client";

import { useEffect } from "react";
import { captureReferralFromUrl } from "../lib/influencer";

export default function ReferralTracker() {
  useEffect(() => {
    captureReferralFromUrl();
  }, []);
  return null;
}
