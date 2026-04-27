"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const ACTIVE_PREFIXES = [
  "/booking",
  "/checkout",
  "/payment",
  "/proposals",
  "/select",
];

const STORAGE_KEY = "zeniva_checkout_abandonment_v1";
const COOLDOWN_DAYS = 14;

function isCheckoutFlow(pathname: string | null): boolean {
  if (!pathname) return false;
  return ACTIVE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function detectLocale(pathname: string | null): "fr" | "es" | "en" {
  if (pathname?.startsWith("/fr")) return "fr";
  if (pathname?.startsWith("/es")) return "es";
  return "en";
}

const COPY = {
  en: {
    eyebrow: "Save your trip",
    title: "We'll hold this for you",
    body: "Drop your email and Lina will save this trip + hold today's price for 48 hours. No commitment, no spam.",
    placeholderEmail: "your@email.com",
    cta: "Hold my trip 48h",
    busy: "Saving…",
    skip: "Continue without saving",
    success: "Saved! Check your inbox — link to resume your trip is on the way.",
    error: "Couldn't save — try again or talk to Lina.",
  },
  fr: {
    eyebrow: "Sauvegarde ton voyage",
    title: "On garde ça pour toi",
    body: "Laisse ton courriel et Lina sauvegarde ton voyage + garde le prix d'aujourd'hui 48h. Aucun engagement, aucun spam.",
    placeholderEmail: "ton@courriel.com",
    cta: "Garde mon voyage 48h",
    busy: "Sauvegarde…",
    skip: "Continuer sans sauvegarder",
    success: "Sauvegardé! Vérifie ta boîte courriel — le lien pour reprendre ton voyage arrive.",
    error: "Erreur — réessaie ou parle à Lina.",
  },
  es: {
    eyebrow: "Guarda tu viaje",
    title: "Lo guardamos por ti",
    body: "Deja tu email y Lina guarda tu viaje + retiene el precio de hoy por 48h. Sin compromiso, sin spam.",
    placeholderEmail: "tu@email.com",
    cta: "Guarda mi viaje 48h",
    busy: "Guardando…",
    skip: "Continuar sin guardar",
    success: "¡Guardado! Revisa tu bandeja — el enlace para reanudar tu viaje está en camino.",
    error: "Error — intenta de nuevo o habla con Lina.",
  },
};

export default function CheckoutAbandonmentCapture() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const armed = useRef(false);
  const fired = useRef(false);
  const userInteracted = useRef(false);

  const inFlow = isCheckoutFlow(pathname);
  const locale = detectLocale(pathname);
  const t = COPY[locale];

  useEffect(() => {
    if (typeof window === "undefined" || !inFlow) return;

    try {
      const last = window.localStorage.getItem(STORAGE_KEY);
      if (last && Date.now() - parseInt(last, 10) < COOLDOWN_DAYS * 86400000) return;
    } catch {}

    const armTimer = window.setTimeout(() => {
      armed.current = true;
    }, 12000);

    const onInput = () => {
      userInteracted.current = true;
    };
    document.addEventListener("input", onInput, { passive: true });
    document.addEventListener("change", onInput, { passive: true });

    const fire = () => {
      if (fired.current || !armed.current || !userInteracted.current) return;
      fired.current = true;
      setOpen(true);
      try {
        window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
      } catch {}
    };

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && (e.relatedTarget === null || (e.relatedTarget as Node)?.nodeName === "HTML")) {
        fire();
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        fire();
      }
    };

    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearTimeout(armTimer);
      document.removeEventListener("input", onInput);
      document.removeEventListener("change", onInput);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [inFlow, pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!inFlow || !open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError(t.error);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          source: `booking_abandonment:${pathname || "unknown"}`,
        }),
      });
      if (!res.ok && res.status !== 200) throw new Error(`HTTP ${res.status}`);
      setDone(true);
      setTimeout(() => setOpen(false), 2600);
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(11,27,77,0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 99998,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: 0,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <style>{`
        @keyframes zenivaCheckSlide { from { transform: translateY(40px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @media (min-width: 640px) {
          .zeniva-check-card { border-radius: 24px !important; max-width: 460px !important; margin: auto !important; }
          .zeniva-check-wrap { align-items: center !important; padding: 24px !important; }
        }
      `}</style>
      <div
        className="zeniva-check-card"
        style={{
          background: "white",
          width: "100%",
          maxWidth: "100%",
          borderRadius: "24px 24px 0 0",
          padding: "28px 24px 32px",
          animation: "zenivaCheckSlide 280ms ease-out",
          boxShadow: "0 -10px 40px rgba(11,27,77,0.3)",
          position: "relative",
          fontFamily: "system-ui, sans-serif",
          color: "#0f172a",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Close"
          onClick={() => setOpen(false)}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 44,
            height: 44,
            border: "none",
            background: "transparent",
            color: "#64748b",
            fontSize: 22,
            cursor: "pointer",
            borderRadius: 12,
          }}
        >
          ×
        </button>

        {done ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0B1B4D", lineHeight: 1.4 }}>{t.success}</div>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "inline-block",
                background: "#DCFCE7",
                color: "#166534",
                padding: "4px 12px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.4,
                marginBottom: 12,
              }}
            >
              {t.eyebrow}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0B1B4D", lineHeight: 1.2, marginBottom: 10 }}>{t.title}</h2>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.5, marginBottom: 18 }}>{t.body}</p>

            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.placeholderEmail}
                disabled={busy}
                style={{
                  width: "100%",
                  padding: "13px 14px",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: 12,
                  fontSize: 15,
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              {error && <div style={{ fontSize: 13, color: "#dc2626", padding: "4px 2px" }}>{error}</div>}
              <button
                type="submit"
                disabled={busy}
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  background: busy ? "#94a3b8" : "linear-gradient(90deg, #16a34a, #166534)",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: busy ? "default" : "pointer",
                  marginTop: 4,
                  fontFamily: "inherit",
                }}
              >
                {busy ? t.busy : t.cta}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                margin: "14px auto 0",
                background: "none",
                border: "none",
                color: "#94a3b8",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {t.skip}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
