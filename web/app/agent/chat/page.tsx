"use client";
import { Suspense } from "react";
import AgentChatClient from "./AgentChat.client";
import AppAgentInbox from "../../../src/components/AppAgentInbox.client";
import AgentHandoffInbox from "../../../components/handoff/AgentHandoffInbox.client";
import AgentAvailabilityToggle from "../../../components/handoff/AgentAvailabilityToggle.client";
import { useIsApp } from "../../../src/hooks/useIsApp";

function AgentChatRouter() {
  const isApp = useIsApp();
  // Sticky handoff inbox banner above whichever inbox the agent is using —
  // visible on desktop AND mobile so we can answer incoming chat/call
  // handoff requests without leaving the chat page.
  return (
    <>
      <div
        className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 px-3 py-2"
        style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
      >
        <div className="max-w-3xl mx-auto flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <AgentHandoffInbox />
          </div>
          <div className="pt-2 shrink-0">
            <AgentAvailabilityToggle />
          </div>
        </div>
      </div>
      {isApp ? <AppAgentInbox /> : <AgentChatClient />}
    </>
  );
}

export default function AgentChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Loading inbox…</div>}>
      <AgentChatRouter />
    </Suspense>
  );
}
