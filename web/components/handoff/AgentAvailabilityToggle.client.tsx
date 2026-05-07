"use client";
import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "../../src/lib/authStore";

type Status = "available" | "paused" | "offline";

const HEARTBEAT_INTERVAL_MS = 30_000;
const STORAGE_KEY = "zeniva_agent_availability";

const LABELS: Record<Status, string> = {
  available: "🟢 Available",
  paused: "🟡 Paused",
  offline: "⚪ Offline",
};

const NEXT: Record<Status, Status> = {
  available: "paused",
  paused: "offline",
  offline: "available",
};

/**
 * Drop-in toggle for the agent dashboard header. Persists status to
 * agents_availability and heartbeats every 30s while the dashboard is open
 * (so the row's last_active_at stays fresh — the availability endpoint
 * filters out anything older than 90s).
 */
export default function AgentAvailabilityToggle({ className = "" }: { className?: string }) {
  const user = useAuthStore((s) => s.user);
  const [status, setStatus] = useState<Status>("offline");
  const [busy, setBusy] = useState(false);
  const agentId = user?.email || "";

  const push = useCallback(
    async (next: Status) => {
      if (!agentId) return;
      setBusy(true);
      try {
        await fetch("/api/agent/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent_id: agentId, status: next }),
        });
        setStatus(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {}
      } finally {
        setBusy(false);
      }
    },
    [agentId]
  );

  useEffect(() => {
    if (!agentId) return;
    let initial: Status = "available";
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Status | null;
      if (saved === "available" || saved === "paused" || saved === "offline") initial = saved;
    } catch {}
    void push(initial);

    const heartbeat = setInterval(() => {
      const cur = (() => {
        try {
          return (localStorage.getItem(STORAGE_KEY) as Status) || "available";
        } catch {
          return "available";
        }
      })();
      void push(cur);
    }, HEARTBEAT_INTERVAL_MS);

    const onUnload = () => {
      try {
        navigator.sendBeacon(
          "/api/agent/availability",
          new Blob([JSON.stringify({ agent_id: agentId, status: "offline" })], { type: "application/json" })
        );
      } catch {}
    };
    window.addEventListener("beforeunload", onUnload);
    return () => {
      clearInterval(heartbeat);
      window.removeEventListener("beforeunload", onUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  if (!agentId) return null;

  return (
    <button
      type="button"
      onClick={() => push(NEXT[status])}
      disabled={busy}
      title="Click to cycle: Available → Paused → Offline"
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
        status === "available"
          ? "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
          : status === "paused"
          ? "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
          : "bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100"
      } ${className}`}
    >
      {LABELS[status]}
    </button>
  );
}
