"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ClientsPage from "../../clients/page";
import { useAuthStore, isHQ } from "../../../../src/lib/authStore";
import { resolveAgentIdFromSlug, toAgentWorkspaceId } from "../../../../src/lib/agent/agentWorkspace";

export default function AgentWorkspaceClientsPage() {
  const params = useParams();
  const raw = Array.isArray(params.agentId) ? params.agentId[0] : params.agentId;
  const agentId = resolveAgentIdFromSlug(String(raw || ""));
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);
  const selfId = toAgentWorkspaceId(user);

  const allowed = useMemo(() => {
    if (!agentId) return false;
    if (hq) return true;
    return Boolean(selfId && selfId === agentId);
  }, [agentId, hq, selfId]);

  useEffect(() => {
    if (!agentId) return;
    try {
      window.localStorage.setItem("zeniva_agent_workspace", agentId);
    } catch {
      // ignore
    }
  }, [agentId]);

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold">Sign in required</h1>
          <p className="mt-2 text-sm text-slate-600">Please sign in to access the agent workspace.</p>
          <Link href="/login" className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold">Access denied</h1>
          <p className="mt-2 text-sm text-slate-600">You do not have permission to access this agent workspace.</p>
        </div>
      </main>
    );
  }
  return <ClientsPage />;
}
