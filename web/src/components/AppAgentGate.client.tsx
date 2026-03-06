"use client";
import { useIsApp } from "../hooks/useIsApp";
import AppAgentHome from "./AppAgentHome.client";

export default function AppAgentGate({ children }: { children: React.ReactNode }) {
  const isApp = useIsApp();
  if (isApp) return <AppAgentHome />;
  return <>{children}</>;
}
