"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const SKIP_PREFIXES = [
  "/chat",
  "/call",
  "/booking",
  "/checkout",
  "/agent",
  "/agents",
  "/admin",
  "/hq",
  "/login",
  "/signup",
  "/register",
  "/reset-password",
  "/set-password",
  "/payment",
  "/proposals",
  "/profile",
  "/documents",
  "/api",
  "/packages",
  "/fr/chat",
  "/fr/call",
  "/fr/proposals",
];

const STORAGE_KEY = "zeniva_exit_intent_v1";
const COOLDOWN_DAYS = 7;

function isSkipped(pathname: string | null): boolean {
  if (!pathname) return true;
  return SKIP_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function detectLocale(pathname: string | null): "fr" | "en" {
  return pathname?.startsWith("/fr") ? "fr" : "en";
}

const COPY = {
  en: {
    eyebrow: "Don't leave empty-handed",
    title: "Get a custom trip plan in 60 seconds",
    body: "Drop your email — Lina will send you 3 hand-picked package ideas tailored to your style. No spam, no commitment.",
    placeholderEmail: "your@email.com",
    placeholderName: "First name (optional)",
    cta: "Send my 3 ideas",
    busy: "Sending…",
    skip: "No thanks",
    success: "Got it! Check your inbox in a moment.",
    error: "Something went wrong — try again or chat with Lina directly.",
    chatLink: "Or chat with Lina now →",
  },
  fr: {
    eyebrow: "Ne pars pas les mains vides",
    title: "Reçois un plan de voyage personnalisé en 60 secondes",
    body: "Laisse ton courriel — Lina t'envoie 3 idées de forfaits choisis pour toi. Pas de spam, pas d'engagement.",
    placeholderEmail: "ton@courriel.com",
    placeholderName: "Prénom (optionnel)",
    cta: "Envoie mes 3 idées",
    busy: "Envoi…",
    skip: "Non merci",
    success: "Parfait! Vérifie ta boîte courriel d'ici quelques instants.",
    error: "Erreur — réessaie ou parle directement à Lina.",
    chatLink: "Ou parle à Lina maintenant →",
  },
};

export default function ExitIntentPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const armed = useRef(false);
  const fired = useRef(false);

  const skip = isSkipped(pathname);
  const locale = detectLocale(pathname);
  const t = COPY[locale];

  useEffect(() => {
    if (typeof window === "undefined" || skip) return;

    try {
      const last = window.localStorage.getItem(STORAGE_KEY);
      if (last) {
        const lastTime = parseInt(last, 10);
        if (Date.now() - lastTime < COOLDOWN_DAYS * 24 * 60 * 60 * 1000) return;
      }
    } catch {}

    const armTimer = window.setTimeout(() => {
      armed.current = true;
    }, 8000);

    const fire = () => {
      if (fired.current || !armed.current) return;
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

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY || 0;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const endY = e.changedTouches[0]?.clientY || 0;
      const scrolledTop = window.scrollY < 50;
      if (scrolledTop && endY - touchStartY > 80) {
        fire();
      }
    };

    let lastUrl = window.location.href;
    const popHandler = () => {
      if (window.location.href !== lastUrl) fire();
    };

    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("popstate", popHandler);

    return () => {
      window.clearTimeout(armTimer);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("popstate", popHandler);
    };
  }, [skip, pathname]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (skip || !open) return null;

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
          name: name.trim(),
          source: `exit_intent:${pathname || "unknown"}`,
        }),
      });
      if (!res.ok && res.status !== 200) throw new Error(`HTTP ${res.status}`);
      setDone(true);
      setTimeout(() => setOpen(false), 2200);
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
      aria-labelledby="exit-intent-title"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(11,27,77,0.55)",
        backdropFilter: "blur(4px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "0",
        animation: "zenivaExitFade 200ms ease-out",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <style>{`
        @keyframes zenivaExitFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes zenivaExitSlide { from { transform: translateY(40px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @media (min-width: 640px) {
          .zeniva-exit-card { border-radius: 24px !important; max-width: 440px !important; margin: auto !important; }
          .zeniva-exit-wrap { align-items: center !important; padding: 24px !important; }
        }
      `}</style>
      <div
        className="zeniva-exit-card"
        style={{
          background: "white",
          width: "100%",
          maxWidth: "100%",
          borderRadius: "24px 24px 0 0",
          padding: "28px 24px 32px",
          boxShadow: "0 -10px 40px rgba(11,27,77,0.25)",
          animation: "zenivaExitSlide 280ms ease-out",
          position: "relative",
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
            <div style={{ fontSize: 48, marginBottom: 8 }}>✨</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0B1B4D" }}>{t.success}</div>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "inline-block",
                background: "#FEF3C7",
                color: "#92400E",
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
            <h2
              id="exit-intent-title"
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#0B1B4D",
                lineHeight: 1.2,
                marginBottom: 10,
              }}
            >
              {t.title}
            </h2>
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
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.placeholderName}
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
              {error && (
                <div style={{ fontSize: 13, color: "#dc2626", padding: "4px 2px" }}>{error}</div>
              )}
              <button
                type="submit"
                disabled={busy}
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  background: busy ? "#94a3b8" : "linear-gradient(90deg, #0F6CF5, #0B1B4D)",
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

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <a
                href={locale === "fr" ? "/fr/chat" : "/chat"}
                onClick={() => setOpen(false)}
                style={{ fontSize: 13, color: "#0F6CF5", textDecoration: "none", fontWeight: 600 }}
              >
                {t.chatLink}
              </a>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                margin: "12px auto 0",
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
