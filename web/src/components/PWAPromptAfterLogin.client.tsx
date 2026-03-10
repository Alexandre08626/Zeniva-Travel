"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "../lib/authStore";

function isIOS() { return /iphone|ipad|ipod/i.test(typeof navigator !== "undefined" ? navigator.userAgent : ""); }
function isStandalone() {
  if (typeof window === "undefined") return false;
  return (window.navigator as any).standalone === true || window.matchMedia("(display-mode: standalone)").matches;
}

const APP_URL = "https://www.zenivatravel.com";
const QR_API = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=0B1B4D&bgcolor=ffffff&qzone=1&data=${encodeURIComponent(APP_URL)}`;
const GOLD = "#E6B85A";
const BLUE = "#0F6CF5";

export default function PWAPromptAfterLogin() {
  const { user } = useAuthStore();
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [step, setStep] = useState<"banner" | "qr" | "guide">("banner");

  useEffect(() => {
    if (!user?.email) return;
    if (isStandalone()) return;
    if (typeof window === "undefined") return;
    const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);
    if (!isMobile) return;
    const seen = sessionStorage.getItem("zeniva_pwa_prompt_shown");
    if (seen) return;

    const t = setTimeout(() => {
      setShow(true);
      sessionStorage.setItem("zeniva_pwa_prompt_shown", "1");
    }, 2500);

    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => { clearTimeout(t); window.removeEventListener("beforeinstallprompt", handler); };
  }, [user?.email]);

  if (!show) return null;

  const handleGo = async () => {
    if (deferredPrompt) {
      // Android — prompt native install
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setShow(false);
    } else if (isIOS()) {
      // iOS — show QR + guide
      setStep("qr");
    } else {
      setStep("qr");
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 5000, padding: "0 12px 20px", pointerEvents: "none" }}>
      <div style={{
        background: "white", borderRadius: 24, padding: "20px",
        boxShadow: "0 -4px 40px rgba(0,0,0,0.18)", border: "1.5px solid #e2e8f0",
        pointerEvents: "all", maxWidth: 480, margin: "0 auto", position: "relative"
      }}>
        <button onClick={() => setShow(false)} style={{ position: "absolute", top: 12, right: 16, background: "none", border: "none", fontSize: 18, color: "#94a3b8", cursor: "pointer", lineHeight: 1 }}>✕</button>

        {/* Step 1 — Banner */}
        {step === "banner" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <img src="/branding/lina-avatar.png" alt="Lina" style={{ width: 54, height: 54, borderRadius: "50%", border: `2.5px solid ${GOLD}`, objectFit: "cover" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: 15, color: "#0B1B4D", marginBottom: 3 }}>📲 Get the Zeniva app</div>
                <div style={{ color: "#64748b", fontSize: 13, lineHeight: 1.5 }}>Your trips, Lina AI & exclusive deals — always at your fingertips</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={handleGo} style={{
                flex: 1, background: `linear-gradient(135deg, ${BLUE}, #0851c4)`,
                color: "white", border: "none", borderRadius: 50, padding: "13px",
                fontSize: 15, fontWeight: 800, cursor: "pointer"
              }}>
                Go 🚀
              </button>
              <button onClick={() => setStep("qr")} style={{
                flex: 1, background: "#f8fafc", color: "#0B1B4D",
                border: "1.5px solid #e2e8f0", borderRadius: 50, padding: "13px",
                fontSize: 14, fontWeight: 700, cursor: "pointer"
              }}>
                📷 QR Code
              </button>
            </div>
          </>
        )}

        {/* Step 2 — QR Code */}
        {step === "qr" && (
          <>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 900, fontSize: 16, color: "#0B1B4D", marginBottom: 4 }}>📷 Scan to install</div>
              <div style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>Scan with your camera or share this code</div>
              <div style={{ display: "inline-block", padding: 12, background: "white", borderRadius: 16, border: `3px solid ${GOLD}`, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <img
                  src={QR_API}
                  alt="QR Code Zeniva"
                  width={180}
                  height={180}
                  style={{ display: "block", borderRadius: 8 }}
                />
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>zenivatravel.com</div>
            </div>

            {isIOS() && (
              <div style={{ marginTop: 16, background: "#f8fafc", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#0B1B4D", marginBottom: 6 }}>📱 Install on iPhone:</div>
                <ol style={{ color: "#475569", fontSize: 13, lineHeight: 1.9, paddingLeft: 18, margin: 0 }}>
                  <li>Tap <strong>Share</strong> <span>⬆️</span> in Safari</li>
                  <li>Tap <strong>"Add to Home Screen"</strong></li>
                  <li>Tap <strong>"Add"</strong> ✓</li>
                </ol>
              </div>
            )}

            <button onClick={() => setShow(false)} style={{
              width: "100%", marginTop: 14, background: `linear-gradient(135deg, ${BLUE}, #0851c4)`,
              color: "white", border: "none", borderRadius: 50, padding: "13px",
              fontSize: 15, fontWeight: 800, cursor: "pointer"
            }}>
              Done ✓
            </button>
          </>
        )}
      </div>
    </div>
  );
}
