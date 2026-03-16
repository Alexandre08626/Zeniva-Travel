"use client";
// Renders navigation-dependent components CLIENT-SIDE ONLY
// Uses mounted pattern instead of dynamic(ssr:false) to avoid /_global-error crash
import { useEffect, useState } from "react";

let BackButton: React.ComponentType | null = null;
let LinaAssistantDock: React.ComponentType | null = null;
let AppShell: React.ComponentType | null = null;
let LinaFloatingChat: React.ComponentType | null = null;

export default function ClientLayoutShell() {
  const [mounted, setMounted] = useState(false);
  const [BC, setBC] = useState<React.ComponentType | null>(null);
  const [LAD, setLAD] = useState<React.ComponentType | null>(null);
  const [AS, setAS] = useState<React.ComponentType | null>(null);
  const [LFC, setLFC] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    setMounted(true);
    // Lazy-load all navigation-dependent components after mount
    Promise.all([
      import("./BackButton.client"),
      import("./LinaAssistantDock"),
      import("./AppShell.client"),
      import("../../components/LinaFloatingChat"),
    ]).then(([bc, lad, as_, lfc]) => {
      setBC(() => bc.default);
      setLAD(() => lad.default);
      setAS(() => as_.default);
      setLFC(() => lfc.default);
    }).catch(() => {/* silent */});
  }, []);

  if (!mounted) return null;

  return (
    <>
      {BC && <BC />}
      {LAD && <LAD />}
      {AS && <AS />}
      {LFC && <LFC />}
    </>
  );
}
