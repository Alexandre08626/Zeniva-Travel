"use client";
import { useIsApp } from "../hooks/useIsApp";
import AppHome from "./AppHome.client";

export default function AppHomeGate({ children }: { children: React.ReactNode }) {
  const isApp = useIsApp();

  // null = still detecting (avoid flash of wrong content)
  if (isApp === null) {
    return (
      <div style={{
        minHeight: "100dvh",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <img src="/branding/lina-avatar.png" alt="Zeniva" style={{ width: 48, height: 48, borderRadius: "50%", opacity: 0.5 }} />
      </div>
    );
  }

  if (isApp) return <AppHome />;
  return <>{children}</>;
}
