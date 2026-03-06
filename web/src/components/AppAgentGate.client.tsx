"use client";
import { useIsApp } from "../hooks/useIsApp";

export default function AppAgentGate({ children }: { children: React.ReactNode }) {
  const isApp = useIsApp();

  if (!isApp) return <>{children}</>;

  // In app mode: same white site content but adapted for PWA
  // - header hidden by AppShell CSS already
  // - add bottom padding for agent bottom nav
  // - add safe-area top padding since site header is hidden
  return (
    <div style={{
      paddingTop: "env(safe-area-inset-top, 0px)",
      paddingBottom: "calc(80px + env(safe-area-inset-bottom, 0px))",
      minHeight: "100dvh",
    }}>
      {children}
    </div>
  );
}
