"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  "/profile",
  "/documents",
  "/api",
];

function isSkipped(pathname: string | null): boolean {
  if (!pathname) return true;
  return SKIP_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function detectLocale(pathname: string | null): "fr" | "es" | "en" {
  if (pathname?.startsWith("/fr")) return "fr";
  if (pathname?.startsWith("/es")) return "es";
  return "en";
}

const LABEL: Record<string, { text: string; chatHref: string; callHref: string; chatPrompt: string }> = {
  en: {
    text: "💬 Get a custom trip in 60s",
    chatHref: "/chat?prompt=I+want+to+plan+a+trip",
    callHref: "/call",
    chatPrompt: "I want to plan a trip",
  },
  fr: {
    text: "💬 Obtiens ton voyage en 60s",
    chatHref: "/fr/chat",
    callHref: "/fr/call",
    chatPrompt: "Je veux planifier un voyage",
  },
  es: {
    text: "💬 Tu viaje en 60s",
    chatHref: "/chat?prompt=Quiero+planificar+un+viaje",
    callHref: "/call",
    chatPrompt: "Quiero planificar un viaje",
  },
};

export default function StickyMobileCTA() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);

  const skip = isSkipped(pathname);
  const locale = detectLocale(pathname);
  const t = LABEL[locale];

  useEffect(() => {
    if (typeof window === "undefined" || skip) return;
    if (window.innerWidth >= 768) return;

    const t1 = window.setTimeout(() => setVisible(true), 4000);

    const onScroll = () => {
      const scrolled = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max < 200) return;
      const pct = scrolled / max;
      if (pct > 0.95) setHidden(true);
      else setHidden(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(t1);
      window.removeEventListener("scroll", onScroll);
    };
  }, [skip, pathname]);

  if (skip || !visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: hidden ? "-80px" : "70px",
        left: 12,
        right: 12,
        zIndex: 9990,
        display: "flex",
        gap: 8,
        transition: "bottom 240ms ease-out",
        pointerEvents: hidden ? "none" : "auto",
      }}
      className="md:hidden"
    >
      <Link
        href={t.chatHref}
        style={{
          flex: 1,
          background: "linear-gradient(90deg, #0F6CF5, #0B1B4D)",
          color: "white",
          padding: "13px 16px",
          borderRadius: 14,
          textDecoration: "none",
          fontSize: 14,
          fontWeight: 800,
          textAlign: "center",
          boxShadow: "0 6px 20px rgba(11,27,77,0.35)",
          fontFamily: "inherit",
        }}
      >
        {t.text}
      </Link>
      <Link
        href={t.callHref}
        aria-label={locale === "fr" ? "Appeler Lina" : locale === "es" ? "Llamar a Lina" : "Call Lina"}
        style={{
          width: 50,
          height: 50,
          background: "white",
          color: "#0B1B4D",
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textDecoration: "none",
          fontSize: 22,
          boxShadow: "0 6px 20px rgba(11,27,77,0.25)",
          border: "1.5px solid #e2e8f0",
          flexShrink: 0,
        }}
      >
        📞
      </Link>
    </div>
  );
}
