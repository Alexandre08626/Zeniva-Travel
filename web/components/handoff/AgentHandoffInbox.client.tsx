"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../src/lib/supabase/client";
import { useAuthStore } from "../../src/lib/authStore";
import { projectCartSnapshot } from "./CartSidebar.client";

interface HandoffRow {
  id: string;
  client_email: string | null;
  client_name: string | null;
  contact_method: string;
  status: string;
  cart_snapshot: Record<string, unknown> | null;
  source_page: string | null;
  locale: string;
  requested_at: string;
}

const PING_DATA_URI =
  "data:audio/wav;base64,UklGRl4FAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YToFAAB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/f39/f4CAgIB/";

/**
 * Live list of pending human-handoff requests for the agent dashboard.
 * Subscribes to inserts on human_handoff_requests via Supabase Realtime,
 * plays a soft tone + pulses a badge when a new one arrives. Click to open
 * the agent's handoff acceptance page.
 */
export default function AgentHandoffInbox({ className = "" }: { className?: string }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<HandoffRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let alive = true;
    const supabase = getSupabaseClient();

    (async () => {
      const { data, error } = await supabase
        .from("human_handoff_requests")
        .select("id, client_email, client_name, contact_method, status, cart_snapshot, source_page, locale, requested_at")
        .eq("status", "pending")
        .order("requested_at", { ascending: false })
        .limit(20);
      if (!alive) return;
      if (error) setError(error.message);
      if (data) setItems(data as HandoffRow[]);
    })();

    const channel = supabase
      .channel("agent-handoff-inbox")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "human_handoff_requests" },
        (payload) => {
          const row = payload.new as HandoffRow;
          if (row.status !== "pending") return;
          if (!alive) return;
          setItems((prev) => [row, ...prev.filter((p) => p.id !== row.id)].slice(0, 20));
          try {
            audioRef.current?.play().catch(() => undefined);
          } catch {}
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "human_handoff_requests" },
        (payload) => {
          const row = payload.new as HandoffRow;
          if (!alive) return;
          if (row.status !== "pending") {
            setItems((prev) => prev.filter((p) => p.id !== row.id));
          }
        }
      )
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, []);

  async function open(row: HandoffRow) {
    if (claimingId) return;
    const agentId = user?.id || user?.email || "agent";
    setClaimingId(row.id);
    try {
      const res = await fetch("/api/handoff/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: row.id, agent_id: agentId }),
      });
      if (res.status === 409) {
        // Another agent already claimed it — the realtime UPDATE will purge
        // the row, but drop it locally too so the UI feels instant.
        setItems((prev) => prev.filter((p) => p.id !== row.id));
        return;
      }
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || "Failed to accept request");
      }
      // Optimistically remove — realtime UPDATE will hit too but this avoids
      // any flicker between click and the WS round-trip.
      setItems((prev) => prev.filter((p) => p.id !== row.id));
      if (row.contact_method === "call") {
        router.push(`/agent/handoff/${encodeURIComponent(row.id)}?locale=${row.locale || "en"}`);
      } else {
        // Use the deterministic handoff channel id so the agent sees the
        // same thread the visitor is typing in. The "label" makes the
        // sidebar entry meaningful.
        const cart = projectCartSnapshot(row.cart_snapshot);
        const labelBits = [row.client_name || row.client_email || "Visitor", row.source_page, cart.totalAmount].filter(Boolean);
        const label = labelBits.join(" · ");
        const channel = `handoff-${row.id}`;
        router.push(
          `/agent/chat?channel=${encodeURIComponent(channel)}&label=${encodeURIComponent(label)}`,
        );
      }
    } catch (err: any) {
      setError(err?.message || "Failed to accept request");
    } finally {
      setClaimingId(null);
    }
  }

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <audio ref={audioRef} src={PING_DATA_URI} preload="auto" />
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900">Incoming handoffs</h3>
        <span
          className={`text-xs font-bold rounded-full px-2 py-0.5 ${
            items.length > 0 ? "bg-rose-100 text-rose-700 animate-pulse" : "bg-slate-100 text-slate-500"
          }`}
        >
          {items.length}
        </span>
      </div>

      {error ? <p className="px-4 py-3 text-xs text-rose-600">{error}</p> : null}
      {items.length === 0 ? (
        <p className="px-4 py-6 text-sm text-slate-500 text-center">No pending requests right now.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((row) => {
            const cart = projectCartSnapshot(row.cart_snapshot);
            return (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => void open(row)}
                  disabled={claimingId === row.id}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 transition flex items-start gap-3 disabled:opacity-60 disabled:cursor-wait"
                >
                  <div className="text-2xl">{row.contact_method === "call" ? "📹" : "🗨️"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 truncate">
                        {row.client_name || row.client_email || "Anonymous"}
                      </span>
                      <span className="text-xs text-slate-400">{timeAgo(row.requested_at)}</span>
                    </div>
                    <div className="text-xs text-slate-600 truncate">
                      {cart.totalAmount ? `${cart.totalAmount} · ` : ""}
                      {row.source_page || "Confirmation page"}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-900 bg-amber-100 border border-amber-200 rounded-full px-2 py-0.5">
                    {claimingId === row.id ? "Accepting…" : "Accept →"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  return new Date(iso).toLocaleTimeString();
}
