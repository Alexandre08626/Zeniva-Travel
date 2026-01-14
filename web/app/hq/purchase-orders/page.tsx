"use client";

import { useMemo, useState } from "react";
import { useRequireRole } from "../../../src/lib/roleGuards";
import { useAuthStore, addAudit, isHQ } from "../../../src/lib/authStore";
import { TITLE_TEXT, MUTED_TEXT } from "../../../src/design/tokens";

const allowedRoles = ["hq", "admin"] as const;

type Status =
  | "DRAFT"
  | "SUBMITTED_TO_HQ"
  | "NEEDS_CHANGES"
  | "APPROVED"
  | "INVOICED"
  | "PAID"
  | "CLOSED"
  | "CANCELLED";

type Department = "Travel" | "Yacht";

type PO = {
  id: string;
  poNumber: string;
  client: string;
  dossierId: string;
  agent: string;
  department: Department;
  status: Status;
  sellingTotal: number;
  currency: "USD" | "CAD";
  submittedAt?: string;
  updatedAt: string;
};

const SAMPLE: PO[] = [
  {
    id: "po-104",
    poNumber: "PO-2026-104",
    client: "Dupuis / Cancun",
    dossierId: "TRIP-104",
    agent: "alice@zeniva.ca",
    department: "Travel",
    status: "SUBMITTED_TO_HQ",
    sellingTotal: 7800,
    currency: "CAD",
    submittedAt: "2026-01-09T14:20:00Z",
    updatedAt: "2026-01-09T14:20:00Z",
  },
  {
    id: "po-55",
    poNumber: "PO-2026-055",
    client: "HQ / Med Yacht",
    dossierId: "YCHT-55",
    agent: "marco@zeniva.ca",
    department: "Yacht",
    status: "NEEDS_CHANGES",
    sellingTotal: 48000,
    currency: "USD",
    submittedAt: "2026-01-08T17:45:00Z",
    updatedAt: "2026-01-09T09:10:00Z",
  },
];

const STATUS_LABELS: Record<Status, string> = {
  DRAFT: "Draft",
  SUBMITTED_TO_HQ: "Submitted to HQ",
  NEEDS_CHANGES: "Needs changes",
  APPROVED: "Approved",
  INVOICED: "Invoiced",
  PAID: "Paid",
  CLOSED: "Closed",
  CANCELLED: "Cancelled",
};

function statusBadge(status: Status) {
  if (status === "PAID") return "bg-emerald-600 text-white";
  if (status === "INVOICED") return "bg-blue-600 text-white";
  if (status === "APPROVED") return "bg-sky-600 text-white";
  if (status === "SUBMITTED_TO_HQ") return "bg-amber-500 text-white";
  if (status === "NEEDS_CHANGES") return "bg-rose-500 text-white";
  if (status === "DRAFT") return "bg-slate-700 text-white";
  if (status === "CLOSED") return "bg-slate-500 text-white";
  return "bg-slate-400 text-white";
}

export default function HQPurchaseOrdersPage() {
  useRequireRole(allowedRoles as any, "/login");
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<PO[]>(SAMPLE);
  const [filterStatus, setFilterStatus] = useState<Status | "ALL">("ALL");
  const [filterDept, setFilterDept] = useState<Department | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [comment, setComment] = useState("");

  const filtered = useMemo(() => {
    return orders.filter((po) => {
      const matchesStatus = filterStatus === "ALL" ? true : po.status === filterStatus;
      const matchesDept = filterDept === "ALL" ? true : po.department === filterDept;
      const matchesSearch = [po.client, po.dossierId, po.poNumber, po.agent].some((v) => v.toLowerCase().includes(search.toLowerCase()));
      return matchesStatus && matchesDept && matchesSearch;
    });
  }, [orders, filterStatus, filterDept, search]);

  const updateStatus = (id: string, status: Status) => {
    setOrders((prev) => prev.map((po) => (po.id === id ? { ...po, status, updatedAt: new Date().toISOString() } : po)));
    addAudit(`hq:po:${status.toLowerCase()}`, "purchase-order", id, { status, comment });
    setComment("");
  };

  const statusFilters: Status[] = [
    "SUBMITTED_TO_HQ",
    "NEEDS_CHANGES",
    "APPROVED",
    "INVOICED",
    "PAID",
    "CLOSED",
    "CANCELLED",
  ];

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#EEF2F7" }}>
      <div className="mx-auto max-w-6xl px-5 py-8 space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">HQ Inbox</p>
            <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>Purchase Orders (HQ)</h1>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>Approve, request changes, invoice, mark paid/closed. Only HQ can mark Paid.</p>
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
            {user?.email} · {user?.role?.toUpperCase()}
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex flex-wrap gap-2 text-[12px] font-semibold text-slate-700">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as Status | "ALL")} className="rounded-lg border border-slate-200 px-3 py-2">
              <option value="ALL">All statuses</option>
              {statusFilters.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value as Department | "ALL")} className="rounded-lg border border-slate-200 px-3 py-2">
              <option value="ALL">All departments</option>
              <option value="Travel">Travel</option>
              <option value="Yacht">Yacht</option>
            </select>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search PO, client, agent"
              className="min-w-[220px] rounded-lg border border-slate-200 px-3 py-2"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">PO #</th>
                  <th className="px-3 py-2 text-left">Client / Dossier</th>
                  <th className="px-3 py-2 text-left">Agent</th>
                  <th className="px-3 py-2 text-left">Dept</th>
                  <th className="px-3 py-2 text-left">Total</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((po) => (
                  <tr key={po.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-semibold text-slate-900">{po.poNumber}</td>
                    <td className="px-3 py-2 text-slate-700">
                      <div className="font-semibold">{po.client}</div>
                      <div className="text-xs text-slate-500">{po.dossierId}</div>
                    </td>
                    <td className="px-3 py-2 text-slate-700">{po.agent}</td>
                    <td className="px-3 py-2 text-slate-700">{po.department}</td>
                    <td className="px-3 py-2 text-slate-900 font-bold">{po.currency} {po.sellingTotal.toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${statusBadge(po.status)}`}>
                        {STATUS_LABELS[po.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-700 space-y-1">
                      <button onClick={() => updateStatus(po.id, "NEEDS_CHANGES")} className="rounded-full border border-slate-300 px-3 py-1 hover:border-slate-400">Needs changes</button>
                      <button onClick={() => updateStatus(po.id, "APPROVED")} className="rounded-full border border-emerald-500 px-3 py-1 text-emerald-700">Approve</button>
                      <button onClick={() => updateStatus(po.id, "INVOICED")} className="rounded-full border border-blue-500 px-3 py-1 text-blue-700">Invoice</button>
                      <button onClick={() => updateStatus(po.id, "PAID")} className="rounded-full border border-amber-500 px-3 py-1 text-amber-700">Mark paid</button>
                      <button onClick={() => updateStatus(po.id, "CLOSED")} className="rounded-full border border-slate-400 px-3 py-1 text-slate-700">Close</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-4 text-center text-slate-500">No purchase orders.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">HQ Comments</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            rows={3}
            placeholder="Comment included when requesting changes or approving"
          />
          <p className="text-[12px]" style={{ color: MUTED_TEXT }}>Audit trail logged per status change. Paid only allowed for HQ/Admin.</p>
        </section>
      </div>
    </main>
  );
}
