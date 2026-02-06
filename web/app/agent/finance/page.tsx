"use client";
import { useMemo, useState } from "react";
import { useRequireAnyPermission } from "../../../src/lib/roleGuards";
import { TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE, ACCENT_GOLD } from "../../../src/design/tokens";

type Invoice = {
  id: string;
  client: string;
  product: string;
  status: "paid" | "pending" | "canceled";
  amount: string;
  agent: string;
  date: string;
  pdf?: string;
};

type Payment = {
  id: string;
  method: "Card" | "Stripe" | "Wire" | "Other";
  amount: string;
  date: string;
  client: string;
  agent: string;
  dossier: string;
};

type Commission = {
  id: string;
  agent: string;
  dossier: string;
  product: "Travel" | "Yacht" | "Resort" | "Excursion";
  status: "due" | "paid" | "pending";
  base: string;
  split: string;
  zeniva: string;
  agentShare: string;
};

const invoices: Invoice[] = [
  { id: "INV-2042", client: "Dupuis / Cancun", product: "Package", status: "paid", amount: "$6,200", agent: "Alice", date: "2026-01-05", pdf: "/invoices/INV-2042.pdf" },
  { id: "INV-2038", client: "HQ / Yacht Med", product: "Yacht", status: "pending", amount: "$42,500", agent: "Marco", date: "2026-01-03" },
  { id: "INV-2033", client: "NovaTech", product: "Flights", status: "paid", amount: "$18,900", agent: "Sara", date: "2025-12-28" },
  { id: "INV-2027", client: "Lavoie / Maldives", product: "Resort", status: "canceled", amount: "$11,400", agent: "Ben", date: "2025-12-19" },
];

const payments: Payment[] = [
  { id: "PAY-8841", method: "Card", amount: "$4,800", date: "2026-01-06", client: "Dupuis", agent: "Alice", dossier: "TRIP-104" },
  { id: "PAY-8833", method: "Wire", amount: "$18,500", date: "2026-01-04", client: "HQ Yacht", agent: "Marco", dossier: "YCHT-55" },
  { id: "PAY-8810", method: "Stripe", amount: "$6,900", date: "2026-01-02", client: "NovaTech", agent: "Sara", dossier: "TRIP-099" },
];

const commissions: Commission[] = [
  { id: "COM-551", agent: "Alice", dossier: "TRIP-104", product: "Travel", status: "due", base: "$1,240", split: "80/20", zeniva: "$248", agentShare: "$992" },
  { id: "COM-547", agent: "Marco", dossier: "YCHT-55", product: "Yacht", status: "pending", base: "$42,500", split: "95/5", zeniva: "$2,125", agentShare: "$40,375" },
  { id: "COM-540", agent: "Sara", dossier: "TRIP-099", product: "Travel", status: "paid", base: "$1,380", split: "80/20", zeniva: "$276", agentShare: "$1,104" },
];

export default function FinancePage() {
  const user = useRequireAnyPermission(["finance:all"], "/agent");
  const [filter, setFilter] = useState("all");

  const paidTotal = useMemo(() => invoices.filter((i) => i.status === "paid").length, []);
  const pendingTotal = useMemo(() => invoices.filter((i) => i.status === "pending").length, []);
  const commissionDue = useMemo(() => commissions.filter((c) => c.status !== "paid").length, []);

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#0f172a" }}>
      <div className="mx-auto max-w-6xl px-5 py-8 space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">HQ only • Finance</p>
            <h1 className="text-3xl md:text-4xl font-black text-white">Finance Control (HQ)</h1>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>
              Consolidated invoices, payments, commissions, and synthesis. Exports and accounting integrations are staged here.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <button className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-100">Export CSV</button>
            <button className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-100">Export PDF</button>
            <button className="rounded-full border border-emerald-500 bg-emerald-600 px-3 py-1.5 text-white">Prepare accounting sync</button>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-3">
          {[{ label: "Paid invoices", value: paidTotal, meta: "Across all products" }, { label: "Pending invoices", value: pendingTotal, meta: "Needs HQ action" }, { label: "Commissions due", value: commissionDue, meta: "Travel + Yacht (95/5)" }].map((c) => (
            <div key={c.label} className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">{c.label}</p>
              <p className="text-2xl font-black text-white">{c.value}</p>
              <p className="text-xs" style={{ color: MUTED_TEXT }}>{c.meta}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 shadow-sm p-5 space-y-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Invoices</p>
              <h2 className="text-xl font-black text-white">Billing</h2>
              <p className="text-sm" style={{ color: MUTED_TEXT }}>PDF + structured data. Paid / pending / canceled.</p>
            </div>
            <div className="flex gap-2 text-xs font-semibold">
              {["all", "paid", "pending", "canceled"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="rounded-full border px-3 py-1.5"
                  style={{
                    backgroundColor: filter === f ? PREMIUM_BLUE : "transparent",
                    color: filter === f ? "white" : "#cbd5e1",
                    borderColor: filter === f ? PREMIUM_BLUE : "#1e293b",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-slate-100">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="pb-2 pr-3">Invoice</th>
                  <th className="pb-2 pr-3">Client</th>
                  <th className="pb-2 pr-3">Product</th>
                  <th className="pb-2 pr-3">Status</th>
                  <th className="pb-2 pr-3">Amount</th>
                  <th className="pb-2 pr-3">Agent</th>
                  <th className="pb-2 pr-3">Date</th>
                  <th className="pb-2 pr-3">PDF</th>
                </tr>
              </thead>
              <tbody>
                {invoices
                  .filter((i) => filter === "all" || i.status === filter)
                  .map((i) => (
                    <tr key={i.id} className="border-t border-slate-800">
                      <td className="py-2 pr-3 font-semibold text-white">{i.id}</td>
                      <td className="py-2 pr-3 text-slate-100">{i.client}</td>
                      <td className="py-2 pr-3 text-slate-100">{i.product}</td>
                      <td className="py-2 pr-3">
                        <span className="rounded-full bg-slate-800 px-2 py-1 text-[11px] font-bold" style={{ color: statusColor(i.status) }}>
                          {i.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-white">{i.amount}</td>
                      <td className="py-2 pr-3 text-slate-100">{i.agent}</td>
                      <td className="py-2 pr-3 text-slate-400">{i.date}</td>
                      <td className="py-2 pr-3 text-slate-200">
                        {i.pdf ? (
                          <a href={i.pdf} className="underline" target="_blank" rel="noreferrer" style={{ color: PREMIUM_BLUE }}>
                            PDF
                          </a>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 shadow-sm p-5 space-y-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Paiements</p>
              <h2 className="text-xl font-black text-white">Payments received</h2>
              <p className="text-sm" style={{ color: MUTED_TEXT }}>Card, Stripe, Wire, other. Linked to dossiers and agents.</p>
            </div>
            <div className="rounded-full border border-emerald-500 bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">
              Reconciliation view
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-slate-100">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="pb-2 pr-3">Payment</th>
                  <th className="pb-2 pr-3">Method</th>
                  <th className="pb-2 pr-3">Amount</th>
                  <th className="pb-2 pr-3">Date</th>
                  <th className="pb-2 pr-3">Client</th>
                  <th className="pb-2 pr-3">Agent</th>
                  <th className="pb-2 pr-3">Dossier</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t border-slate-800">
                    <td className="py-2 pr-3 font-semibold text-white">{p.id}</td>
                    <td className="py-2 pr-3 text-slate-100">{p.method}</td>
                    <td className="py-2 pr-3 text-white">{p.amount}</td>
                    <td className="py-2 pr-3 text-slate-400">{p.date}</td>
                    <td className="py-2 pr-3 text-slate-100">{p.client}</td>
                    <td className="py-2 pr-3 text-slate-100">{p.agent}</td>
                    <td className="py-2 pr-3 text-slate-100">{p.dossier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 shadow-sm p-5 space-y-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Commissions</p>
              <h2 className="text-xl font-black text-white">Splits & payouts</h2>
              <p className="text-sm" style={{ color: MUTED_TEXT }}>Travel agents, Zeniva Travel, Zeniva Yacht (95/5) — due, pending, paid.</p>
            </div>
            <div className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200">
              Rules enforced: yacht 95/5, travel agent 80/20
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-slate-100">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="pb-2 pr-3">ID</th>
                  <th className="pb-2 pr-3">Agent</th>
                  <th className="pb-2 pr-3">Dossier</th>
                  <th className="pb-2 pr-3">Product</th>
                  <th className="pb-2 pr-3">Status</th>
                  <th className="pb-2 pr-3">Base</th>
                  <th className="pb-2 pr-3">Split</th>
                  <th className="pb-2 pr-3">Zeniva</th>
                  <th className="pb-2 pr-3">Agent share</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c) => (
                  <tr key={c.id} className="border-t border-slate-800">
                    <td className="py-2 pr-3 font-semibold text-white">{c.id}</td>
                    <td className="py-2 pr-3 text-slate-100">{c.agent}</td>
                    <td className="py-2 pr-3 text-slate-100">{c.dossier}</td>
                    <td className="py-2 pr-3 text-slate-100">{c.product}</td>
                    <td className="py-2 pr-3">
                      <span className="rounded-full bg-slate-800 px-2 py-1 text-[11px] font-bold" style={{ color: statusColor(c.status) }}>
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-white">{c.base}</td>
                    <td className="py-2 pr-3 text-slate-100">{c.split}</td>
                    <td className="py-2 pr-3 text-white">{c.zeniva}</td>
                    <td className="py-2 pr-3 text-white">{c.agentShare}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 shadow-sm p-5 space-y-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Synthesis</p>
              <h2 className="text-xl font-black text-white">Revenue & margins</h2>
              <p className="text-sm" style={{ color: MUTED_TEXT }}>By period, agent, product, client. Forecast ready for export/API.</p>
            </div>
            <div className="rounded-full border border-indigo-500 bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white">Lina HQ mode</div>
          </div>
          <div className="grid gap-3 md:grid-cols-3 text-sm">
            {[{ label: "Revenue MTD", value: "$186k" }, { label: "Revenue 30d", value: "$482k" }, { label: "Margin", value: "19%" }, { label: "Top agent", value: "Sara" }, { label: "Top product", value: "Yacht" }, { label: "Forecast next 30d", value: "$520k" }].map((card) => (
              <div key={card.label} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">{card.label}</p>
                <p className="text-lg font-black text-white">{card.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Lina HQ briefing</p>
            <div className="mt-2 grid gap-2 text-sm text-slate-100">
              <p>• Ask Lina: "Résumé financier du mois"</p>
              <p>• Ask Lina: "Top 3 agents par revenus"</p>
              <p>• Ask Lina: "Anomalies de paiement / chargebacks"</p>
              <p>• Ask Lina: "Préparer rapport PDF pour comptabilité"</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function statusColor(status: string) {
  if (status === "paid") return ACCENT_GOLD;
  if (status === "pending") return PREMIUM_BLUE;
  return "#94a3b8";
}
