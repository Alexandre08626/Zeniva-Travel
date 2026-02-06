"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRequireAnyPermission } from "../../../src/lib/roleGuards";
import { useRequireRole } from "../../../src/lib/roleGuards";
import { useAuthStore, addAudit, isHQ } from "../../../src/lib/authStore";
import { PREMIUM_BLUE, TITLE_TEXT, MUTED_TEXT } from "../../../src/design/tokens";

const allowedRoles = ["hq", "admin", "travel_agent"] as const;

type Status = "pending_hq" | "needs_changes" | "approved" | "rejected" | "confirmed_paid" | "confirmed_unpaid";

type Department = "Travel" | "Yacht" | "Hotels" | "Flights";

type BookingRequest = {
  id: string;
  title: string;
  clientName: string;
  dossierId: string;
  agentEmail: string;
  department: Department;
  status: Status;
  sellingTotal: number;
  currency: "USD";
  updatedAt: string;
};

const SAMPLE: BookingRequest[] = [
  {
    id: "br-104",
    title: "Cancun resort request",
    clientName: "Dupuis",
    dossierId: "TRIP-104",
    agentEmail: "alice@zenivatravel.com",
    department: "Hotels",
    status: "pending_hq",
    sellingTotal: 7800,
    currency: "USD",
    updatedAt: "2026-01-09T14:20:00Z",
  },
  {
    id: "br-55",
    title: "Med Yacht Week",
    clientName: "HQ / Med Yacht",
    dossierId: "YCHT-55",
    agentEmail: "marco@zenivatravel.com",
    department: "Yacht",
    status: "needs_changes",
    sellingTotal: 48000,
    currency: "USD",
    updatedAt: "2026-01-09T09:10:00Z",
  },
];

const STATUS_LABELS: Record<Status, string> = {
  pending_hq: "Pending HQ",
  needs_changes: "Needs changes",
  approved: "Approved",
  rejected: "Rejected",
  confirmed_paid: "Confirmed & paid",
  confirmed_unpaid: "Confirmed (unpaid)",
};

function statusBadge(status: Status) {
  if (status === "confirmed_paid") return "bg-emerald-600 text-white";
  if (status === "approved") return "bg-sky-600 text-white";
  if (status === "pending_hq") return "bg-amber-500 text-white";
  if (status === "needs_changes") return "bg-rose-500 text-white";
  return "bg-slate-400 text-white";
}

function normalizeDepartment(provider: string): Department {
  const value = provider.toLowerCase();
  if (value.includes("yacht")) return "Yacht";
  if (value.includes("flight")) return "Flights";
  if (value.includes("hotel") || value.includes("duffel")) return "Hotels";
  if (value.includes("travel")) return "Travel";
  return "Travel";
}

export default function PurchaseOrdersPage() {
  useRequireRole(allowedRoles as any, "/login");
  useRequireAnyPermission(["sales:all", "sales:yacht"], "/agent");
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<BookingRequest[]>(SAMPLE);
  const [filterStatus, setFilterStatus] = useState<Status | "ALL">("ALL");
  const [filterDept, setFilterDept] = useState<Department | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const [client, setClient] = useState("");
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

  useEffect(() => {
    fetch("/api/booking-requests")
      .then((res) => res.json())
      .then((payload) => {
        const data = Array.isArray(payload?.data) ? payload.data : [];
        const normalized = data
          .filter((item) => item.source === "agent")
          .filter((item) => (isHQ(user) ? true : item.requestedBy === user?.email))
          .map((item) => ({
            id: item.id,
            title: item.title,
            clientName: item.clientName,
            dossierId: item.dossierId,
            agentEmail: item.requestedBy || "agent@zenivatravel.com",
            department: normalizeDepartment(item.provider || ""),
            status: item.status as Status,
            sellingTotal: item.totalAmount,
            currency: item.currency || "USD",
            updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
          }));
        setOrders(normalized);
      })
      .catch(() => undefined);
  }, [user]);

  const filtered = useMemo(() => {
    return orders.filter((request) => {
      const matchesStatus = filterStatus === "ALL" ? true : request.status === filterStatus;
      const matchesDept = filterDept === "ALL" ? true : request.department === filterDept;
      const matchesSearch = [request.title, request.clientName, request.dossierId, request.agentEmail].some((v) => v.toLowerCase().includes(search.toLowerCase()));
      return matchesStatus && matchesDept && matchesSearch;
    });
  }, [orders, filterStatus, filterDept, search]);

  const submitRequest = async () => {
    const now = new Date().toISOString();
    const totalNumber = Number(sellingTotal || supplierTotal || "0");
    const draft: BookingRequest = {
      id: `br-${orders.length + 1}-${Date.now()}`,
      title: notes.trim() || `${department} booking request`,
      clientName: client,
      dossierId,
      agentEmail: user?.email || "agent@zenivatravel.com",
      department,
      status: "pending_hq",
      sellingTotal: totalNumber,
      currency,
      updatedAt: now,
    };
    setOrders((prev) => [draft, ...prev]);
    addAudit("booking-request:submit", "booking-request", draft.id, {
      dossierId,
      department,
      sellingTotal: totalNumber,
      priority,
    });
    setSubmitMessage("Submitted to HQ. HQ will review and approve.");
    try {
      await fetch("/api/booking-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title,
          clientName: draft.clientName,
          dossierId: draft.dossierId,
          source: "agent",
          provider: department.toLowerCase(),
          totalAmount: totalNumber,
          currency,
          paymentStatus: "unknown",
          requestedBy: draft.agentEmail,
        }),
      });
    } catch {
      // ignore
    }
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

  const statusFilters: Status[] = ["pending_hq", "needs_changes", "approved", "rejected", "confirmed_paid", "confirmed_unpaid"];

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F3F6FB" }}>
      <div className="mx-auto max-w-6xl px-5 py-8 space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Partner Booking Requests</p>
            <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>Manual booking requests</h1>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>
              Submit manual partner requests to HQ for approval. Approved requests can be finalized for booking.
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
              <option value="Hotels">Hotels</option>
              <option value="Flights">Flights</option>
            </select>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search request, client, dossier"
              className="min-w-[220px] rounded-lg border border-slate-200 px-3 py-2"
            />
            <div className="rounded-full border border-amber-300 bg-amber-50 px-3 py-2 text-amber-700">Rule: HQ must approve before booking</div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">Request</th>
                  <th className="px-3 py-2 text-left">Client / Dossier</th>
                  <th className="px-3 py-2 text-left">Agent</th>
                  <th className="px-3 py-2 text-left">Dept</th>
                  <th className="px-3 py-2 text-left">Total</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Updated</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((po) => (
                  <tr key={po.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-semibold text-slate-900">{po.title}</td>
                    <td className="px-3 py-2 text-slate-700">
                      <div className="font-semibold">{po.clientName}</div>
                      <div className="text-xs text-slate-500">{po.dossierId}</div>
                    </td>
                    <td className="px-3 py-2 text-slate-700">{po.agentEmail}</td>
                    <td className="px-3 py-2 text-slate-700">{po.department}</td>
                    <td className="px-3 py-2 text-slate-900 font-bold">{po.currency} {po.sellingTotal.toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${statusBadge(po.status)}`}>
                        {STATUS_LABELS[po.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-600 text-xs">{new Date(po.updatedAt).toLocaleString()}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-4 text-center text-slate-500">No booking requests yet.</td>
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
              <h2 className="text-xl font-black" style={{ color: TITLE_TEXT }}>New booking request</h2>
              <p className="text-sm" style={{ color: MUTED_TEXT }}>Capture partner booking details and send to HQ for approval.</p>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">HQ approval required</div>
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
                <option value="Hotels">Hotels</option>
                <option value="Flights">Flights</option>
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
              Booking route
              <div className="flex gap-2 text-xs text-slate-700">
                <span className="rounded-full bg-slate-100 px-3 py-1">Manual partner request</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">HQ approval needed</span>
              </div>
              <p className="text-[11px]" style={{ color: MUTED_TEXT }}>Auto-confirmed API bookings are tracked by HQ separately.</p>
            </div>
          </div>

          <label className="space-y-1 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
            Notes / special requirements
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" rows={3} placeholder="Baggage, cancellation rules, supplier refs, attachments links" />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={submitRequest}
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
            <li>Manual partner requests require HQ approval before booking.</li>
            <li>Auto-confirmed API bookings go to HQ as confirmations only.</li>
            <li>HQ can approve, request changes, or reject manual requests.</li>
            <li>Agents see their requests; HQ sees all.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
