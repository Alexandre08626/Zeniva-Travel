"use client";
// AppAgentGate — always renders children (same site content in app and browser)
export default function AppAgentGate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
