"use client";
// Renders navigation-dependent components CLIENT-SIDE ONLY
// Uses mounted pattern instead of dynamic(ssr:false) to avoid /_global-error crash
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

let BackButton: React.ComponentType | null = null;
let AppShell: React.ComponentType | null = null;
let LinaFloatingChat: React.ComponentType | null = null;
let BottomNav: React.ComponentType | null = null;

// Routes that must render fully standalone (no nav, no Lina chat, no bottom
// nav, no back button). The investor pitch is sent as a public link and must
// not surface any chrome that points back into the marketing site.
const STANDALONE_ROUTES = ["/pitch"];

function isStandaloneRoute(pathname: string | null) {
  if (!pathname) return false;
  return STANDALONE_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export default function ClientLayoutShell() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [BC, setBC] = useState<React.ComponentType | null>(null);
  const [AS, setAS] = useState<React.ComponentType | null>(null);
  const [LFC, setLFC] = useState<React.ComponentType | null>(null);
  const [BN, setBN] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    setMounted(true);
    // Lazy-load all navigation-dependent components after mount
    Promise.all([
      import("./BackButton.client"),
      import("./AppShell.client"),
      import("../../components/LinaFloatingChat"),
      import("../../components/BottomNav"),
    ]).then(([bc, as_, lfc, bn]) => {
      setBC(() => bc.default);
      setAS(() => as_.default);
      setLFC(() => lfc.default);
      setBN(() => bn.default);
    }).catch(() => {/* silent */});
  }, []);

  if (!mounted) return null;
  if (isStandaloneRoute(pathname)) return null;

  return (
    <>
      {BC && <BC />}
      {AS && <AS />}
      {LFC && <LFC />}
      {BN && <BN />}
    </>
  );
}
