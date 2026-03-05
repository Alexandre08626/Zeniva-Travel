"use client";
export const dynamic = "force-dynamic";
import { Suspense } from "react";
import AgentChatClient from "./AgentChat.client";

export default function AgentChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Loading inbox…</div>}>
      <AgentChatClient />
    </Suspense>
  );
}
