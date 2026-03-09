"use client";
import { useIsApp } from "../hooks/useIsApp";
import AppAgentDashboard from "./AppAgentDashboard.client";

export default function AppAgentGate({ children }: { children: React.ReactNode }) {
  const isApp = useIsApp();
  // In app mode → show mobile-first agent dashboard
  // On desktop/browser → render site content as-is
  if (isApp) return <AppAgentDashboard />;
  return <>{children}</>;
}
