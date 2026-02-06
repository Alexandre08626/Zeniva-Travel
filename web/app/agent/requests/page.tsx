"use client";

import { useEffect, useMemo, useState } from "react";
import { useRequireAnyPermission } from "../../../src/lib/roleGuards";
import { PREMIUM_BLUE, MUTED_TEXT, TITLE_TEXT } from "../../../src/design/tokens";

type AgentRequest = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  status: string;
  code: string | null;
  note: string | null;
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

export default function AgentRequestsPage() {
  useRequireAnyPermission(["accounts:manage"], "/login?space=agent");
  const [data, setData] = useState<AgentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agent-requests");
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Failed to load requests");
      setData(payload?.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const pending = useMemo(() => data.filter((r) => r.status === "pending"), [data]);
  const approved = useMemo(() => data.filter((r) => r.status === "approved"), [data]);
  const completed = useMemo(() => data.filter((r) => r.status === "completed"), [data]);

  const updateRequest = async (id: string, action: "approve" | "reject") => {
    try {
      const res = await fetch("/api/agent-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Update failed");
      setData((prev) => prev.map((r) => (r.id === id ? payload.data : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  };

  const copy = async (code: string | null) => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // ignore
    }
  };

  const renderTable = (rows: AgentRequest[], emptyText: string) => (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
      {rows.length === 0 ? (
        <p className="text-sm" style={{ color: MUTED_TEXT }}>{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-bold" style={{ color: TITLE_TEXT }}>{r.name}</div>
                  <div className="text-xs" style={{ color: MUTED_TEXT }}>{r.email} · {r.role || "travel_agent"}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateRequest(r.id, "approve")}
                        className="rounded-full px-4 py-2 text-xs font-semibold text-white"
                        style={{ backgroundColor: PREMIUM_BLUE }}
                      >
                        Approve & generate code
                      </button>
                      <button
                        onClick={() => updateRequest(r.id, "reject")}
                        className="rounded-full px-4 py-2 text-xs font-semibold border border-slate-200"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {r.code && (
                    <button
                      onClick={() => copy(r.code)}
                      className="rounded-full px-4 py-2 text-xs font-semibold border border-slate-200"
                    >
                      Copy code
                    </button>
                  )}
                </div>
              </div>
              {r.code && (
                <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-semibold">
                  Code: {r.code}
                </div>
              )}
              {r.note && (
                <p className="mt-2 text-xs" style={{ color: MUTED_TEXT }}>{r.note}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-5 py-10 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>Agent requests</h1>
          <p className="text-sm" style={{ color: MUTED_TEXT }}>Approve agents and share codes. Travelers and partners do not require a code.</p>
        </header>

        {error && <div className="text-sm text-rose-600">{error}</div>}

        <section className="space-y-3">
          <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Pending</h2>
          {loading ? <div className="text-sm" style={{ color: MUTED_TEXT }}>Loading…</div> : renderTable(pending, "No pending requests.")}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Approved</h2>
          {loading ? <div className="text-sm" style={{ color: MUTED_TEXT }}>Loading…</div> : renderTable(approved, "No approved requests.")}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Completed</h2>
          {loading ? <div className="text-sm" style={{ color: MUTED_TEXT }}>Loading…</div> : renderTable(completed, "No completed requests.")}
        </section>
      </div>
    </main>
  );
}
