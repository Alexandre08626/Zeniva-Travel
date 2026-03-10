"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/authStore";

function isIOS() { return /iphone|ipad|ipod/i.test(typeof navigator !== "undefined" ? navigator.userAgent : ""); }
function isStandalone() {
  if (typeof window === "undefined") return false;
  return (window.navigator as any).standalone === true || window.matchMedia("(display-mode: standalone)").matches;
}

export default function PWAPromptAfterLogin() {
  const { user } = useAuthStore();
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    // Only show if logged in, on mobile, not already in PWA mode
    if (!user?.email) return;
    if (isStandalone()) return;
    if (typeof window === "undefined") return;
    const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);
    if (!isMobile) return;
    // Only show once per session
    const seen = sessionStorage.getItem("zeniva_pwa_prompt_shown");
    if (seen) return;

    // Delay to let the page settle
    const t = setTimeout(() => {
      setShow(true);
      sessionStorage.setItem("zeniva_pwa_prompt_shown", "1");
    }, 2500);

    // Android prompt
    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => { clearTimeout(t); window.removeEventListener("beforeinstallprompt", handler); };
  }, [user?.email]);

  if (!show) return null;

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setShow(false);
    } else if (isIOS()) {
      setShowGuide(true);
    } else {
      setShow(false);
    }
  };

  const GOLD = "#E6B85A";
  const BLUE = "#0F6CF5";

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 5000, padding: "0 12px 20px", pointerEvents: "none" }}>
      <div style={{ background: "white", borderRadius: 20, padding: "18px 20px", boxShadow: "0 -4px 40px rgba(0,0,0,0.18)", border: "1.5px solid #e2e8f0", pointerEvents: "all", maxWidth: 480, margin: "0 auto" }}>
        {!showGuide ? (
          <>
            <button onClick={() => setShow(false)} style={{ position: "absolute", top: 10, right: 14, background: "none", border: "none", fontSize: 18, color: "#94a3b8", cursor: "pointer", lineHeight: 1 }}>✕</button>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <img src="/branding/lina-avatar.png" alt="Lina" style={{ width: 52, height: 52, borderRadius: "50%", border: `2px solid ${GOLD}`, objectFit: "cover" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: 15, color: "#0B1B4D", marginBottom: 2 }}>📲 Install the Zeniva app</div>
                <div style={{ color: "#64748b", fontSize: 13, lineHeight: 1.4 }}>Get instant access to your trips, Lina AI & exclusive offers — free</div>
              </div>
            </div>
            <button onClick={handleInstall} style={{ width: "100%", marginTop: 14, background: `linear-gradient(135deg, ${BLUE}, #0851c4)`, color: "white", border: "none", borderRadius: 50, padding: "13px", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
              📲 Add to Home Screen — Free
            </button>
          </>
        ) : (
          <>
            <div style={{ fontWeight: 900, fontSize: 15, color: "#0B1B4D", marginBottom: 10, textAlign: "center" }}>Install on iPhone</div>
            <ol style={{ color: "#475569", fontSize: 13, lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
              <li>Tap the <strong>Share</strong> button <span style={{ fontSize: 16 }}>⬆️</span> in Safari</li>
              <li>Scroll and tap <strong>"Add to Home Screen"</strong></li>
              <li>Tap <strong>"Add"</strong> — done!</li>
            </ol>
            <button onClick={() => setShow(false)} style={{ width: "100%", marginTop: 14, background: "#f1f5f9", color: "#0B1B4D", border: "none", borderRadius: 50, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Got it ✓
            </button>
          </>
        )}
      </div>
    </div>
  );
}
