"use client";
import { useEffect, useState } from "react";

// Detect iOS
function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

// Detect Android
function isAndroid() {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent);
}

// Detect mobile
function isMobile() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod|android/i.test(navigator.userAgent);
}

// Already installed as PWA?
function isStandalone() {
  if (typeof window === "undefined") return false;
  return (window.navigator as any).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;
}

export default function PWAInstallBanner() {
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Only on mobile, not already installed, not dismissed recently
    if (!isMobile()) return;
    if (isStandalone()) return;

    const dismissed = localStorage.getItem("zeniva_pwa_dismissed");
    if (dismissed) {
      const dismissedAt = parseInt(dismissed);
      // Don't show for 7 days after dismissal
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }

    setIsIos(isIOS());

    if (isAndroid()) {
      // Android: intercept Chrome's install prompt
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShow(true);
      };
      window.addEventListener("beforeinstallprompt", handler as any);
      return () => window.removeEventListener("beforeinstallprompt", handler as any);
    } else if (isIOS()) {
      // iOS: always show instructions (Safari doesn't fire beforeinstallprompt)
      // Show after 3 seconds so page loads first
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
        setShow(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("zeniva_pwa_dismissed", Date.now().toString());
  };

  if (!show || installed) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "linear-gradient(135deg, #0B1B4D 0%, #0F2A6B 100%)",
        borderTop: "1px solid rgba(255,255,255,0.12)",
        padding: "16px 20px",
        paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        gap: 14,
        animation: "slideUp 0.4s ease-out",
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Icon */}
      <img
        src="/icons/icon-72x72.png"
        alt="Zeniva"
        style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0 }}
      />

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: "white", fontWeight: 800, fontSize: 14, margin: 0, lineHeight: 1.3 }}>
          Install Zeniva Travel
        </p>
        {isIos ? (
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, margin: "3px 0 0", lineHeight: 1.4 }}>
            Tap <strong style={{ color: "#E6B85A" }}>↑ Share</strong> then{" "}
            <strong style={{ color: "#E6B85A" }}>"Add to Home Screen"</strong>
          </p>
        ) : (
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, margin: "3px 0 0" }}>
            Add to your home screen — works offline
          </p>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        {!isIos && (
          <button
            onClick={handleInstall}
            style={{
              background: "#E6B85A",
              color: "#0B1B4D",
              border: "none",
              borderRadius: 999,
              padding: "8px 16px",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Install
          </button>
        )}
        <button
          onClick={handleDismiss}
          style={{
            background: "rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.7)",
            border: "none",
            borderRadius: 999,
            padding: "8px 12px",
            fontSize: 13,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {isIos ? "Got it" : "Later"}
        </button>
      </div>
    </div>
  );
}
