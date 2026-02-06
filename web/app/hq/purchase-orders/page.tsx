"use client";

import { useEffect, useMemo, useState } from "react";
import { useRequireRole } from "../../../src/lib/roleGuards";
import { useAuthStore, addAudit } from "../../../src/lib/authStore";
import { TITLE_TEXT, MUTED_TEXT } from "../../../src/design/tokens";

const allowedRoles = ["hq", "admin"] as const;

type Status =
  | "pending_hq"
  | "needs_changes"
  | "rejected"
  | "approved"
  | "confirmed_paid"
  | "confirmed_unpaid";

type BookingRequest = {
  id: string;
  title: string;
  clientName: string;
  dossierId: string;
  source: "agent" | "lina" | "api";
  provider: string;
  status: Status;
  paymentStatus: "paid" | "unpaid" | "unknown";
  confirmationReference?: string;
  approvedBy?: string;
  approvedAt?: string;
  requestedBy?: string;
  totalAmount: number;
  currency: "USD" | "CAD";
  createdAt: string;
  updatedAt: string;
  flagged?: boolean;
};
const STATUS_LABELS: Record<Status, string> = {
  pending_hq: "Pending HQ",
  needs_changes: "Needs changes",
  rejected: "Rejected",
  approved: "Approved",
  confirmed_paid: "Confirmed & paid",
  confirmed_unpaid: "Confirmed (unpaid)",
};

function statusBadge(status: Status) {
  if (status === "confirmed_paid") return "bg-emerald-600 text-white";
  if (status === "approved") return "bg-sky-600 text-white";
  if (status === "pending_hq") return "bg-amber-500 text-white";
  if (status === "needs_changes") return "bg-rose-500 text-white";
  return "bg-slate-500 text-white";
}

export default function HQPurchaseOrdersPage() {
  useRequireRole(allowedRoles as any, "/login");
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<BookingRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"approval" | "confirmed">("approval");
  const [search, setSearch] = useState("");
  const [comment, setComment] = useState("");
  const [selected, setSelected] = useState<BookingRequest | null>(null);

  useEffect(() => {
    fetch("/api/booking-requests")
      .then((res) => res.json())
      .then((payload) => {
        const data = Array.isArray(payload?.data) ? payload.data : [];
        setOrders(data);
      })
      .catch(() => undefined);
  }, []);

  const filtered = useMemo(() => {
    return orders
      .filter((item) => (activeTab === "approval" ? item.status !== "confirmed_paid" : item.status === "confirmed_paid"))
      .filter((item) => {
        const matchesSearch = [item.title, item.clientName, item.dossierId, item.provider, item.requestedBy || ""].some((v) =>
          v.toLowerCase().includes(search.toLowerCase())
        );
        return matchesSearch;
      });
  }, [orders, activeTab, search]);

  const updateStatus = async (id: string, status: Status) => {
    setOrders((prev) => prev.map((item) => (item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item)));
    addAudit(`hq:booking:${status}`, "booking-request", id, { status, comment });
    setComment("");
    try {
      await fetch("/api/booking-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    } catch {
      // ignore
    }
  };

  const flagIssue = async (id: string) => {
    setOrders((prev) => prev.map((item) => (item.id === id ? { ...item, flagged: true, updatedAt: new Date().toISOString() } : item)));
    addAudit("hq:booking:flag", "booking-request", id, { comment });
    setComment("");
    try {
      await fetch("/api/booking-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, flagged: true }),
      });
    } catch {
      // ignore
    }
  };

  const downloadDetails = (item: BookingRequest) => {
    const blob = new Blob([JSON.stringify(item, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `booking-request-${item.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#EEF2F7" }}>
      <div className="mx-auto max-w-6xl px-5 py-8 space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">HQ Inbox</p>
            <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>Booking Requests</h1>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>Review partner booking requests and confirmed, paid items from integrations.</p>
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
            {user?.email} · {user?.role?.toUpperCase()}
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-slate-700">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                onClick={() => setActiveTab("approval")}
                className={`rounded-full px-4 py-1 ${activeTab === "approval" ? "bg-white shadow" : "text-slate-600"}`}
              >
                Needs approval
              </button>
              <button
                onClick={() => setActiveTab("confirmed")}
                className={`rounded-full px-4 py-1 ${activeTab === "confirmed" ? "bg-white shadow" : "text-slate-600"}`}
              >
                Confirmed & paid
              </button>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search request, client, provider"
              className="min-w-[240px] rounded-lg border border-slate-200 px-3 py-2"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">Request</th>
                  <th className="px-3 py-2 text-left">Client / Dossier</th>
                  <th className="px-3 py-2 text-left">Provider</th>
                  <th className="px-3 py-2 text-left">Total</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Payment</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-700">
                      <div className="font-semibold text-slate-900">{item.title}</div>
                      <div className="text-xs text-slate-500">Requested by {item.requestedBy || "System"}</div>
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      <div className="font-semibold">{item.clientName}</div>
                      <div className="text-xs text-slate-500">{item.dossierId}</div>
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      <div className="font-semibold">{item.provider}</div>
                      <div className="text-xs text-slate-500">{item.source.toUpperCase()}</div>
                    </td>
                    <td className="px-3 py-2 text-slate-900 font-bold">{item.currency} {item.totalAmount.toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${statusBadge(item.status)}`}>
                        {STATUS_LABELS[item.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      <div className="font-semibold capitalize">{item.paymentStatus}</div>
                      <div className="text-xs text-slate-500">{item.confirmationReference || "No ref"}</div>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-700 space-y-1">
                      {activeTab === "approval" ? (
                        <>
                          <button onClick={() => updateStatus(item.id, "needs_changes")} className="rounded-full border border-slate-300 px-3 py-1 hover:border-slate-400">Needs changes</button>
                          <button onClick={() => updateStatus(item.id, "approved")} className="rounded-full border border-emerald-500 px-3 py-1 text-emerald-700">Approve</button>
                          <button onClick={() => updateStatus(item.id, "rejected")} className="rounded-full border border-rose-500 px-3 py-1 text-rose-700">Reject</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setSelected(item)} className="rounded-full border border-slate-300 px-3 py-1 hover:border-slate-400">View</button>
                          <button onClick={() => downloadDetails(item)} className="rounded-full border border-slate-300 px-3 py-1 hover:border-slate-400">Download</button>
                          <button onClick={() => flagIssue(item.id)} className="rounded-full border border-slate-300 px-3 py-1 hover:border-slate-400">Flag issue</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-4 text-center text-slate-500">No booking requests.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {selected && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Confirmation Details</p>
                <h2 className="text-xl font-black" style={{ color: TITLE_TEXT }}>{selected.title}</h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                Close
              </button>
            </div>
            <div className="grid gap-4 text-sm text-slate-700 md:grid-cols-3">
              <div>
                <div className="text-xs text-slate-500">Provider</div>
                <div className="font-semibold">{selected.provider}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Confirmation</div>
                <div className="font-semibold">{selected.confirmationReference || "No ref"}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Payment status</div>
                <div className="font-semibold capitalize">{selected.paymentStatus}</div>
              </div>
            </div>
            <pre className="max-h-72 overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">
              {JSON.stringify(selected, null, 2)}
            </pre>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">HQ Comments</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            rows={3}
            placeholder="Comment included when requesting changes or approving"
          />
          <p className="text-[12px]" style={{ color: MUTED_TEXT }}>Audit trail logged per action. Use comments to capture approval or issue context.</p>
        </section>
      </div>
    </main>
  );
}
