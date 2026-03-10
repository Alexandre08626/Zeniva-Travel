"use client";
import { useEffect, useState } from "react";

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
function isAndroid() {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent);
}
function isMobile() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod|android/i.test(navigator.userAgent);
}
function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    (window.navigator as any).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

// ─── iOS Step-by-step guide overlay ─────────────────────────────────────────
function IOSGuide({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);

  const steps = [
    {
      icon: "1️⃣",
      title: 'Tap the Share button',
      desc: 'Look for the ↑ icon at the bottom of Safari',
      visual: (
        <div style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Fake browser bottom bar */}
          <div style={{
            width: "90%",
            background: "rgba(255,255,255,0.08)",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.12)",
            padding: "12px 20px",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            marginBottom: 8,
          }}>
            {["←", "→", "↑", "⊡", "≡"].map((icon, i) => (
              <div key={i} style={{
                width: 36, height: 36,
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 8,
                background: i === 2 ? "rgba(230,184,90,0.25)" : "transparent",
                border: i === 2 ? "2px solid #E6B85A" : "2px solid transparent",
                color: i === 2 ? "#E6B85A" : "rgba(255,255,255,0.4)",
                fontSize: i === 2 ? 20 : 16, fontWeight: 700,
                animation: i === 2 ? "pulseGold 1.2s ease-in-out infinite" : "none",
              }}>{icon}</div>
            ))}
          </div>
          {/* Arrow pointing to share button */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginLeft: -40,
            animation: "bounceArrow 1s ease-in-out infinite",
          }}>
            <div style={{ color: "#E6B85A", fontSize: 28, fontWeight: 900, lineHeight: 1 }}>↑</div>
            <div style={{
              background: "#E6B85A",
              color: "#0B1B4D",
              borderRadius: 8,
              padding: "4px 12px",
              fontSize: 12,
              fontWeight: 800,
              whiteSpace: "nowrap",
            }}>Tap here!</div>
          </div>
        </div>
      ),
    },
    {
      icon: "2️⃣",
      title: 'Tap "Add to Home Screen"',
      desc: 'Scroll down in the Share menu and tap this option',
      visual: (
        <div style={{ width: "90%", background: "rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
          {[
            { icon: "✉️", label: "Message" },
            { icon: "📋", label: "Copy Link" },
            { icon: "📲", label: "Add to Home Screen", highlight: true },
            { icon: "🔖", label: "Add Bookmark" },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
              background: item.highlight ? "rgba(230,184,90,0.12)" : "transparent",
              animation: item.highlight ? "pulseGold 1.2s ease-in-out infinite" : "none",
            }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{
                fontSize: 14,
                fontWeight: item.highlight ? 800 : 500,
                color: item.highlight ? "#E6B85A" : "rgba(255,255,255,0.7)",
              }}>{item.label}</span>
              {item.highlight && <span style={{ marginLeft: "auto", color: "#E6B85A", fontSize: 18 }}>👈</span>}
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: "3️⃣",
      title: 'Tap "Add" — You\'re done!',
      desc: "The Zeniva app icon will appear on your home screen",
      visual: (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          {/* App icon preview */}
          <div style={{
            width: 80, height: 80,
            borderRadius: 20,
            background: "linear-gradient(135deg, #0B1B4D, #0F2A6B)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 30px rgba(15,108,245,0.5)",
            border: "2px solid rgba(230,184,90,0.3)",
            animation: "floatIcon 2s ease-in-out infinite",
          }}>
            <img src="/icons/icon-72x72.png" alt="Zeniva" style={{ width: 64, height: 64, borderRadius: 14 }} />
          </div>
          <div style={{
            background: "rgba(255,255,255,0.06)",
            borderRadius: 14,
            padding: "12px 24px",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "80%",
          }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Add to Home Screen</span>
            <span style={{ color: "#0F6CF5", fontSize: 14, fontWeight: 800, animation: "pulseGold 1.2s ease-in-out infinite" }}>Add</span>
          </div>
        </div>
      ),
    },
  ];

  const current = steps[step - 1];

  return (
    <>
      <style>{`
        @keyframes pulseGold {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes bounceArrow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.04); }
        }
      `}</style>

      {/* Overlay backdrop */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 99999,
        background: "rgba(5,14,31,0.92)",
        backdropFilter: "blur(12px)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "flex-end",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 20, right: 20,
            width: 36, height: 36,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            border: "none", color: "white",
            fontSize: 18, cursor: "pointer",
          }}
        >×</button>

        {/* Card */}
        <div style={{
          width: "100%",
          maxWidth: 420,
          background: "linear-gradient(135deg, #0B1B4D 0%, #0A1530 100%)",
          borderRadius: "28px 28px 0 0",
          border: "1px solid rgba(255,255,255,0.1)",
          borderBottom: "none",
          padding: "28px 24px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}>
          {/* Progress dots */}
          <div style={{ display: "flex", gap: 8 }}>
            {steps.map((_, i) => (
              <div key={i} style={{
                width: i + 1 === step ? 24 : 8,
                height: 8, borderRadius: 4,
                background: i + 1 === step ? "#E6B85A" : "rgba(255,255,255,0.2)",
                transition: "all 0.3s ease",
              }} />
            ))}
          </div>

          {/* Step text */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 28, margin: "0 0 8px" }}>{current.icon}</p>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "white", margin: "0 0 6px" }}>{current.title}</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.5 }}>{current.desc}</p>
          </div>

          {/* Visual */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            {current.visual}
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", gap: 10, width: "100%" }}>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.08)",
                  border: "none", borderRadius: 14,
                  padding: "14px",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                }}
              >← Back</button>
            )}
            {step < steps.length ? (
              <button
                onClick={() => setStep(step + 1)}
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg, #E6B85A 0%, #c89b2a 100%)",
                  border: "none", borderRadius: 14,
                  padding: "14px",
                  color: "#0B1B4D",
                  fontSize: 14, fontWeight: 800, cursor: "pointer",
                }}
              >Next →</button>
            ) : (
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg, #0F6CF5 0%, #0B1B4D 100%)",
                  border: "none", borderRadius: 14,
                  padding: "14px",
                  color: "white",
                  fontSize: 14, fontWeight: 800, cursor: "pointer",
                }}
              >✅ Got it!</button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main banner ─────────────────────────────────────────────────────────────
export default function PWAInstallBanner() {
  const [show, setShow] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [ios, setIos] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (!isMobile()) return;
    if (isStandalone()) return;
    // Never show on the travel form or set-password pages
    if (typeof window !== "undefined" && (window.location.pathname.startsWith("/forms/") || window.location.pathname.startsWith("/set-password"))) return;

    setIos(isIOS());

    if (isAndroid()) {
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShow(true);
      };
      window.addEventListener("beforeinstallprompt", handler as any);
      // Also show banner even without the prompt event (some Android don't fire it)
      setShow(true);
      return () => window.removeEventListener("beforeinstallprompt", handler as any);
    }

    if (isIOS()) {
      // Always show on iOS — no dismissal
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (outcome === "accepted") setShow(false);
    } else {
      setShowGuide(true);
    }
  };

  const handleGotIt = () => {
    if (ios) {
      // Open step-by-step guide
      setShowGuide(true);
    } else {
      handleInstall();
    }
  };

  if (!show) return null;

  return (
    <>
      {showGuide && <IOSGuide onClose={() => { setShowGuide(false); setShow(false); }} />}

      {/* Bottom banner — always visible until guide is opened */}
      {!showGuide && (
        <div style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          zIndex: 9990,
          background: "linear-gradient(135deg, #0B1B4D 0%, #0F2A6B 100%)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          padding: "14px 20px",
          paddingBottom: "calc(14px + env(safe-area-inset-bottom))",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          gap: 14,
          animation: "slideUp 0.4s ease-out",
        }}>
          <style>{`
            @keyframes slideUp {
              from { transform: translateY(100%); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>

          {/* Lina icon */}
          <img
            src="/icons/icon-72x72.png"
            alt="Zeniva"
            style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, border: "1.5px solid rgba(230,184,90,0.3)" }}
          />

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: "white", fontWeight: 800, fontSize: 13, margin: 0 }}>
              📲 Install Zeniva Travel
            </p>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, margin: "3px 0 0", lineHeight: 1.4 }}>
              {ios
                ? "Add to Home Screen for the full app experience"
                : "Install the app — works offline too"}
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={handleGotIt}
            style={{
              background: "linear-gradient(135deg, #E6B85A 0%, #c89b2a 100%)",
              color: "#0B1B4D",
              border: "none",
              borderRadius: 12,
              padding: "10px 18px",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              boxShadow: "0 4px 16px rgba(230,184,90,0.4)",
            }}
          >
            {ios ? "Show me →" : "Install →"}
          </button>
        </div>
      )}
    </>
  );
}
