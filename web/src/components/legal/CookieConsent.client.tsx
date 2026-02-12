"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { applyTracking } from "./tracking";

type ConsentState = {
  version: string;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

type PartialConsent = Partial<Omit<ConsentState, "version" | "updatedAt">> & {
  updatedAt?: string;
};

const CONSENT_VERSION = "v1";
const CONSENT_COOKIE_NAME = "zeniva_consent";
const CONSENT_STORAGE_KEY = "zeniva_consent_state";

const DEFAULT_CONSENT: ConsentState = {
  version: CONSENT_VERSION,
  analytics: false,
  marketing: false,
  updatedAt: "",
};

const getFocusable = (container: HTMLElement | null) => {
  if (!container) return [] as HTMLElement[];
  const focusable = container.querySelectorAll<HTMLElement>(
    "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
  );
  return Array.from(focusable).filter((el) => !el.hasAttribute("disabled"));
};

const encodeCookieValue = (state: ConsentState) => {
  const value = `${CONSENT_VERSION}.analytics=${state.analytics ? 1 : 0};marketing=${
    state.marketing ? 1 : 0
  };timestamp=${state.updatedAt}`;
  return encodeURIComponent(value);
};

const parseCookieValue = (value: string | undefined) => {
  if (!value) return null;
  try {
    const decoded = decodeURIComponent(value);
    const parts = decoded.split(";");
    const version = parts[0]?.split(".")?.[0] || CONSENT_VERSION;
    const analyticsPart = parts.find((part) => part.includes("analytics="));
    const marketingPart = parts.find((part) => part.includes("marketing="));
    const timestampPart = parts.find((part) => part.includes("timestamp="));
    return {
      version,
      analytics: analyticsPart?.includes("=1") || false,
      marketing: marketingPart?.includes("=1") || false,
      updatedAt: timestampPart?.split("=")?.[1] || "",
    } as ConsentState;
  } catch {
    return null;
  }
};

const getCookieValue = (name: string) => {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`));
  return match?.split("=")[1];
};

const setCookieValue = (name: string, value: string) => {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; samesite=lax`;
};

export default function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const syncGlobal = useCallback(
    (state: ConsentState) => {
      if (typeof window === "undefined") return;
      window.zenivaConsent = {
        analytics: state.analytics,
        marketing: state.marketing,
        updatedAt: state.updatedAt,
      };
      const event = new CustomEvent("zeniva:consent-changed", { detail: state });
      window.dispatchEvent(event);
    },
    []
  );

  const persistState = useCallback((state: ConsentState) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
    setCookieValue(CONSENT_COOKIE_NAME, encodeCookieValue(state));
  }, []);

  const applyConsent = useCallback(
    (next: ConsentState) => {
      setConsent(next);
      persistState(next);
      syncGlobal(next);
      applyTracking({ analytics: next.analytics, marketing: next.marketing });
      setBannerOpen(false);
      setModalOpen(false);
    },
    [persistState, syncGlobal]
  );

  const openModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const updateConsent = useCallback(
    (partial: PartialConsent) => {
      const next: ConsentState = {
        ...consent,
        ...partial,
        updatedAt: partial.updatedAt || new Date().toISOString(),
      };
      applyConsent(next);
    },
    [applyConsent, consent]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    let stored: ConsentState | null = null;
    try {
      const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
      stored = raw ? (JSON.parse(raw) as ConsentState) : null;
    } catch {
      stored = null;
    }
    if (!stored) {
      stored = parseCookieValue(getCookieValue(CONSENT_COOKIE_NAME));
    }
    if (stored && stored.version === CONSENT_VERSION) {
      setConsent(stored);
      syncGlobal(stored);
      applyTracking({ analytics: stored.analytics, marketing: stored.marketing });
      setBannerOpen(false);
    } else {
      setBannerOpen(true);
      syncGlobal(DEFAULT_CONSENT);
    }
  }, [syncGlobal]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.zenivaSetConsent = (partial) => {
      updateConsent(partial);
    };
    window.zenivaOpenCookieSettings = () => {
      openModal();
    };
  }, [openModal, updateConsent]);

  useEffect(() => {
    if (!modalOpen) return;
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    const focusable = getFocusable(modalRef.current);
    focusable[0]?.focus();

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }
      if (event.key !== "Tab") return;
      const elements = getFocusable(modalRef.current);
      if (elements.length === 0) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      lastFocusedRef.current?.focus();
    };
  }, [closeModal, modalOpen]);

  const bannerLabel = useMemo(() => {
    return "Zeniva Travel uses cookies for essential, analytics, and marketing purposes.";
  }, []);

  if (!bannerOpen && !modalOpen) return null;

  return (
    <>
      {bannerOpen && (
        <div className="consent-banner" role="region" aria-label={bannerLabel}>
          <div className="consent-banner-inner">
            <div>
              <strong>Cookie preferences</strong>
              <p>
                We use essential cookies to operate the site and optional cookies to
                improve performance and personalize marketing. You can manage your
                preferences at any time.
              </p>
            </div>
            <div className="consent-actions">
              <button
                type="button"
                className="legal-button secondary"
                onClick={() => updateConsent({ analytics: false, marketing: false })}
              >
                Reject non-essential
              </button>
              <button
                type="button"
                className="legal-button tertiary"
                onClick={openModal}
              >
                Manage preferences
              </button>
              <button
                type="button"
                className="legal-button primary"
                onClick={() => updateConsent({ analytics: true, marketing: true })}
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="consent-modal" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">
          <div className="consent-modal-card" ref={modalRef}>
            <div className="consent-modal-header">
              <h2 id="cookie-modal-title">Cookie preferences</h2>
              <button type="button" className="legal-button tertiary" onClick={closeModal}>
                Close
              </button>
            </div>
            <p className="consent-modal-intro">
              Select which cookies you allow. Essential cookies are required for
              core functionality and cannot be disabled.
            </p>
            <div className="consent-toggle">
              <div>
                <strong>Essential</strong>
                <p>Required for site security, network management, and accessibility.</p>
              </div>
              <input type="checkbox" checked disabled aria-label="Essential cookies" />
            </div>
            <div className="consent-toggle">
              <div>
                <strong>Analytics</strong>
                <p>Helps us understand usage and improve the experience.</p>
              </div>
              <input
                type="checkbox"
                aria-label="Analytics cookies"
                checked={consent.analytics}
                onChange={(event) =>
                  setConsent((prev) => ({ ...prev, analytics: event.target.checked }))
                }
              />
            </div>
            <div className="consent-toggle">
              <div>
                <strong>Marketing</strong>
                <p>Used for advertising and campaign measurement.</p>
              </div>
              <input
                type="checkbox"
                aria-label="Marketing cookies"
                checked={consent.marketing}
                onChange={(event) =>
                  setConsent((prev) => ({ ...prev, marketing: event.target.checked }))
                }
              />
            </div>
            <div className="consent-actions">
              <button
                type="button"
                className="legal-button secondary"
                onClick={() => updateConsent({ analytics: false, marketing: false })}
              >
                Reject non-essential
              </button>
              <button
                type="button"
                className="legal-button primary"
                onClick={() =>
                  updateConsent({
                    analytics: consent.analytics,
                    marketing: consent.marketing,
                  })
                }
              >
                Save preferences
              </button>
            </div>
            <p className="consent-modal-note">
              If you turn off a category after scripts have loaded, some third-party
              cookies may remain until they expire.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
