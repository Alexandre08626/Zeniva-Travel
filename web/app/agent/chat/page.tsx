"use client";
export const dynamic = "force-dynamic";
import { Suspense } from "react";
import AgentChatClient from "./AgentChat.client";
import AppAgentInbox from "../../../src/components/AppAgentInbox.client";
import { useIsApp } from "../../../src/hooks/useIsApp";

function AgentChatRouter() {
  const isApp = useIsApp();
  // On mobile app (PWA standalone) → use the new mobile-first inbox
  // On desktop/browser → use the existing desktop chat
  if (isApp) return <AppAgentInbox />;
  return <AgentChatClient />;
}

export default function AgentChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Loading inbox…</div>}>
      <AgentChatRouter />
    </Suspense>
  );
}
