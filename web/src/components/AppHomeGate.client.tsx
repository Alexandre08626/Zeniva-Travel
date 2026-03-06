"use client";
import { useIsApp } from "../hooks/useIsApp";
import AppHome from "./AppHome.client";

export default function AppHomeGate({ children }: { children: React.ReactNode }) {
  const isApp = useIsApp();
  if (isApp) return <AppHome />;
  return <>{children}</>;
}
