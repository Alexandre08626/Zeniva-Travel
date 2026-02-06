import { buildInfluencerCode } from "./influencerShared";

export type ReferralAttribution = {
  referralCode: string;
  influencerId: string;
  capturedAt: string;
  source?: string;
};

const REFERRAL_KEY = "zeniva_referral_attribution_v1";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function captureReferralFromUrl() {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const code = params.get("ref") || params.get("referral") || "";
  if (!code) return null;
  const influencerId = params.get("influencer") || code;
  const attribution: ReferralAttribution = {
    referralCode: code,
    influencerId,
    capturedAt: new Date().toISOString(),
    source: window.location.pathname,
  };
  writeJson(REFERRAL_KEY, attribution);
  return attribution;
}

export function getStoredReferral(): ReferralAttribution | null {
  return readJson<ReferralAttribution | null>(REFERRAL_KEY, null);
}

export function clearStoredReferral() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(REFERRAL_KEY);
  } catch {
    // ignore
  }
}

export { buildInfluencerCode };
