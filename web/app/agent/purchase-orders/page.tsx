"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRequireAnyPermission } from "../../../src/lib/roleGuards";
import { useRequireRole } from "../../../src/lib/roleGuards";
import { useAuthStore, addAudit, isHQ } from "../../../src/lib/authStore";
import { PREMIUM_BLUE, TITLE_TEXT, MUTED_TEXT, ACCENT_GOLD } from "../../../src/design/tokens";

const allowedRoles = ["hq", "admin", "travel_agent"] as const;

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
  currency: "USD";
  submittedAt?: string;
  updatedAt: string;
};

const SAMPLE: PO[] = [
  {
    id: "po-104",
    poNumber: "PO-2026-104",
    client: "Dupuis / Cancun",
    dossierId: "TRIP-104",
    agent: "alice@zenivatravel.com",
    department: "Travel",
    status: "SUBMITTED_TO_HQ",
    sellingTotal: 7800,
    currency: "USD",
    submittedAt: "2026-01-09T14:20:00Z",
    updatedAt: "2026-01-09T14:20:00Z",
  },
  {
    id: "po-55",
    poNumber: "PO-2026-055",
    client: "HQ / Med Yacht",
    dossierId: "YCHT-55",
    agent: "marco@zenivatravel.com",
    department: "Yacht",
    status: "NEEDS_CHANGES",
    sellingTotal: 48000,
    currency: "USD",
    submittedAt: "2026-01-08T17:45:00Z",
    updatedAt: "2026-01-09T09:10:00Z",
  },
  {
    id: "po-099",
    poNumber: "PO-2026-099",
    client: "NovaTech",
    dossierId: "TRIP-099",
    agent: "sara@zenivatravel.com",
    department: "Travel",
    status: "INVOICED",
    sellingTotal: 11250,
    currency: "USD",
    submittedAt: "2026-01-07T10:30:00Z",
    updatedAt: "2026-01-08T08:00:00Z",
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

export default function PurchaseOrdersPage() {
  useRequireRole(allowedRoles as any, "/login");
  useRequireAnyPermission(["sales:all", "sales:yacht"], "/agent");
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<PO[]>(SAMPLE);
  const [filterStatus, setFilterStatus] = useState<Status | "ALL">("ALL");
  const [filterDept, setFilterDept] = useState<Department | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const [client, setClient] = useState(""
  );
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [dossierId, setDossierId] = useState("");
  const [department, setDepartment] = useState<Department>("Travel");
  const [supplierTotal, setSupplierTotal] = useState("");
  const [markup, setMarkup] = useState("");
  const [sellingTotal, setSellingTotal] = useState("");
  const currency = "USD" as const;
  const [travelDates, setTravelDates] = useState("");
  const [pax, setPax] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return orders.filter((po) => {
      const matchesStatus = filterStatus === "ALL" ? true : po.status === filterStatus;
      const matchesDept = filterDept === "ALL" ? true : po.department === filterDept;
      const matchesSearch = [po.client, po.dossierId, po.poNumber].some((v) => v.toLowerCase().includes(search.toLowerCase()));
      return matchesStatus && matchesDept && matchesSearch;
    });
  }, [orders, filterStatus, filterDept, search]);

  const addDraft = (status: Status) => {
    const now = new Date().toISOString();
    const poNumber = `PO-${now.slice(0, 10).replace(/-/g, "")}-${orders.length + 1}`;
    const totalNumber = Number(sellingTotal || supplierTotal || "0");
    const draft: PO = {
      id: `po-${orders.length + 1}-${Date.now()}`,
      poNumber,
      client,
      dossierId,
      agent: user?.email || "agent@zenivatravel.com",
      department,
      status,
      sellingTotal: totalNumber,
      currency,
      submittedAt: status === "SUBMITTED_TO_HQ" ? now : undefined,
      updatedAt: now,
    };
    setOrders((prev) => [draft, ...prev]);
    addAudit(`po:${status === "SUBMITTED_TO_HQ" ? "submit" : "draft"}`, "purchase-order", poNumber, {
      dossierId,
      department,
      sellingTotal: totalNumber,
      priority,
    });
    setSubmitMessage(status === "SUBMITTED_TO_HQ" ? "Submitted to HQ. HQ will review and invoice." : "Draft saved.");
    setClient("");
    setClientEmail("");
    setClientPhone("");
    setDossierId("");
    setSupplierTotal("");
    setMarkup("");
    setSellingTotal("");
    setTravelDates("");
    setPax("");
    setNotes("");
  };

  const statusFilters: Status[] = [
    "DRAFT",
    "SUBMITTED_TO_HQ",
    "NEEDS_CHANGES",
    "APPROVED",
    "INVOICED",
    "PAID",
    "CLOSED",
    "CANCELLED",
  ];

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F3F6FB" }}>
      <div className="mx-auto max-w-6xl px-5 py-8 space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Purchase Orders</p>
            <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>Purchase Orders</h1>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>
              No invoice without a Purchase Order. Link dossier, agent, and department; submit to HQ for approval and invoicing.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">{user?.email} · {user?.role?.toUpperCase()}</span>
            {isHQ(user) && (
              <Link href="/hq/purchase-orders" className="rounded-full border border-slate-200 bg-white px-3 py-1.5 hover:border-slate-300">
                HQ Inbox
              </Link>
            )}
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
              placeholder="Search PO, client, dossier"
              className="min-w-[220px] rounded-lg border border-slate-200 px-3 py-2"
            />
            <div className="rounded-full border border-amber-300 bg-amber-50 px-3 py-2 text-amber-700">Rule: no invoice without PO</div>
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
                  <th className="px-3 py-2 text-left">Submitted</th>
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
                    <td className="px-3 py-2 text-slate-600 text-xs">{po.submittedAt ? new Date(po.submittedAt).toLocaleString() : "—"}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-4 text-center text-slate-500">No purchase orders yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Create / submit</p>
              <h2 className="text-xl font-black" style={{ color: TITLE_TEXT }}>New Purchase Order</h2>
              <p className="text-sm" style={{ color: MUTED_TEXT }}>Link dossier and pricing. Submit to HQ; pricing locks after submission.</p>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Department split enforced</div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              Client name
              <input value={client} onChange={(e) => setClient(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              Client email
              <input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              Client phone
              <input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              Dossier ID
              <input value={dossierId} onChange={(e) => setDossierId(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="TRIP-104" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              Department
              <select value={department} onChange={(e) => setDepartment(e.target.value as Department)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="Travel">Travel</option>
                <option value="Yacht">Yacht</option>
              </select>
            </label>
            <label className="space-y-1 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              Travel dates
              <input value={travelDates} onChange={(e) => setTravelDates(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="2026-02-12 → 2026-02-19" />
            </label>
            <label className="space-y-1 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              Passengers (adults/children)
              <input value={pax} onChange={(e) => setPax(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="2 adults" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              Supplier total
              <input value={supplierTotal} onChange={(e) => setSupplierTotal(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="7800" />
            </label>
            <label className="space-y-1 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              Markup / fees
              <input value={markup} onChange={(e) => setMarkup(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="450" />
            </label>
            <label className="space-y-1 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              Selling total (client)
              <input value={sellingTotal} onChange={(e) => setSellingTotal(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="8250" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              Currency
              <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">USD</div>
            </div>
            <label className="space-y-1 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              Priority
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option>Normal</option>
                <option>Urgent</option>
                <option>Priority</option>
              </select>
            </label>
            <div className="space-y-1 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              Revenue split
              <div className="flex gap-2 text-xs text-slate-700">
                <span className="rounded-full bg-slate-100 px-3 py-1">Travel 5%</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">Yacht 95%</span>
              </div>
              <p className="text-[11px]" style={{ color: MUTED_TEXT }}>Stored once invoiced; aligns with HQ controls.</p>
            </div>
          </div>

          <label className="space-y-1 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
            Notes / special requirements
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" rows={3} placeholder="Baggage, cancellation rules, supplier refs, attachments links" />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => addDraft("DRAFT")}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold hover:border-slate-400"
              style={{ color: TITLE_TEXT }}
            >
              Save draft
            </button>
            <button
              type="button"
              onClick={() => addDraft("SUBMITTED_TO_HQ")}
              className="rounded-full px-4 py-2 text-sm font-bold text-white"
              style={{ backgroundColor: PREMIUM_BLUE }}
            >
              Submit to HQ
            </button>
            {submitMessage && <span className="text-sm font-semibold text-emerald-600">{submitMessage}</span>}
          </div>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <div className="font-bold text-amber-900">Rules</div>
          <ul className="list-disc pl-5 space-y-1">
            <li>No invoice without Purchase Order.</li>
            <li>Every PO links dossier, agent, department, and selling total.</li>
            <li>HQ inbox: approves, requests changes, invoices, marks paid, closes.</li>
            <li>Agents see their POs; HQ sees all. Only HQ marks Paid.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
