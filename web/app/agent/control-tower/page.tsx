"use client";
import Link from "next/link";
import { useRequireHQ } from "../../../src/lib/roleGuards";
import { useAuthStore } from "../../../src/lib/authStore";
import { ACCENT_GOLD, PREMIUM_BLUE, TITLE_TEXT, MUTED_TEXT } from "../../../src/design/tokens";

const lanes = [
  { id: "needs-quote", title: "Needs quote", color: "border-amber-200 bg-amber-50" },
  { id: "need-approval", title: "Need approval", color: "border-blue-200 bg-blue-50" },
  { id: "ready-invoice", title: "Ready to invoice", color: "border-emerald-200 bg-emerald-50" },
  { id: "waiting-client", title: "Waiting client", color: "border-slate-200 bg-slate-50" },
  { id: "booked", title: "Booked", color: "border-indigo-200 bg-indigo-50" },
  { id: "docs-ready", title: "Docs ready", color: "border-teal-200 bg-teal-50" },
  { id: "post-trip", title: "Post-trip follow-up", color: "border-violet-200 bg-violet-50" },
];

const orders = [
  { id: "ORD-1042", client: "Morales / Paris", division: "TRAVEL", status: "Submitted", amount: "$4,200", owner: "Alice", updated: "2h" },
  { id: "ORD-1039", client: "Yacht / Med", division: "YACHT", status: "Approved", amount: "$18,500", owner: "Marco", updated: "4h" },
  { id: "ORD-1032", client: "Group / Cancun", division: "GROUPS", status: "Invoiced", amount: "$22,300", owner: "Sara", updated: "1d" },
  { id: "ORD-1028", client: "Villa / Tulum", division: "VILLAS", status: "Draft", amount: "$6,800", owner: "Ben", updated: "1d" },
];

export default function ControlTowerPage() {
  useRequireHQ("/agent");
  const audit = useAuthStore((s) => s.auditLog);
  const opsEntries = audit.filter((a) => [
    "lina:",
    "pricing:",
    "payment:",
    "docs:",
    "trip:"
  ].some((p) => a.action.startsWith(p)));
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F3F6FB" }}>
      <div className="mx-auto max-w-6xl px-5 py-8 space-y-8">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">HQ Control Tower</p>
            <h1 className="text-3xl md:text-4xl font-black" style={{ color: TITLE_TEXT }}>
              Command center
            </h1>
            <p className="text-sm md:text-base" style={{ color: MUTED_TEXT }}>
              Visibility across all dossiers, orders, finances, and agent performance.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/agent/finance" className="rounded-full px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: PREMIUM_BLUE }}>
              Finance
            </Link>
            <Link href="/agent/agents" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              Agents
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[{ label: "Active dossiers", value: "42", meta: "Across all divisions" }, { label: "Pipeline value", value: "$486k", meta: "Weighted" }, { label: "Confirmed bookings", value: "19", meta: "Last 30 days" }, { label: "Pending invoices", value: "11", meta: "Needs action" }, { label: "Disputes / chargebacks", value: "2", meta: "Open" }, { label: "Avg agent response", value: "12m", meta: "SLA" }, { label: "Top performer", value: "Sara", meta: "46% conversion" }, { label: "Docs ready", value: "8", meta: "Awaiting send" }, { label: "Waiting client", value: "15", meta: "Follow-up" }].map((card) => (
            <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">{card.label}</p>
              <p className="text-2xl font-black" style={{ color: TITLE_TEXT }}>{card.value}</p>
              <p className="text-xs" style={{ color: MUTED_TEXT }}>{card.meta}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Production queue</p>
              <h2 className="text-2xl font-black" style={{ color: TITLE_TEXT }}>Work Queue</h2>
              <p className="text-sm" style={{ color: MUTED_TEXT }}>Quote → Approval → Invoice → Docs → Follow-up</p>
            </div>
            <Link href="/agent/orders" className="rounded-full px-4 py-2 text-sm font-bold text-slate-900" style={{ backgroundColor: ACCENT_GOLD }}>
              View orders
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-7 text-sm">
            {lanes.map((lane) => (
              <div key={lane.id} className={`rounded-xl border ${lane.color} p-3 space-y-2`}>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">{lane.title}</p>
                <div className="rounded-lg bg-white/80 border border-white/70 p-2 shadow-sm">
                  <p className="text-xs text-slate-600">(placeholder) drag items here</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Orders</p>
              <h2 className="text-2xl font-black" style={{ color: TITLE_TEXT }}>Internal orders</h2>
              <p className="text-sm" style={{ color: MUTED_TEXT }}>Draft → Submitted → Approved → Invoiced → Paid → Closed</p>
            </div>
            <Link href="/agent/orders" className="rounded-full px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: PREMIUM_BLUE }}>
              Go to orders
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="pb-2 pr-3">Ref</th>
                  <th className="pb-2 pr-3">Client</th>
                  <th className="pb-2 pr-3">Division</th>
                  <th className="pb-2 pr-3">Status</th>
                  <th className="pb-2 pr-3">Amount</th>
                  <th className="pb-2 pr-3">Owner</th>
                  <th className="pb-2 pr-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-slate-100">
                    <td className="py-2 pr-3 font-semibold" style={{ color: TITLE_TEXT }}>{o.id}</td>
                    <td className="py-2 pr-3" style={{ color: TITLE_TEXT }}>{o.client}</td>
                    <td className="py-2 pr-3 text-xs font-semibold rounded-full">
                      <span className="rounded-full bg-slate-100 px-2 py-1">{o.division}</span>
                    </td>
                    <td className="py-2 pr-3">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold">{o.status}</span>
                    </td>
                    <td className="py-2 pr-3" style={{ color: TITLE_TEXT }}>{o.amount}</td>
                    <td className="py-2 pr-3" style={{ color: TITLE_TEXT }}>{o.owner}</td>
                    <td className="py-2 pr-3 text-slate-500">{o.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Ops Log</p>
              <h2 className="text-2xl font-black" style={{ color: TITLE_TEXT }}>Lina + Pricing + Payments</h2>
              <p className="text-sm" style={{ color: MUTED_TEXT }}>Assistant actions, overrides, payments, and docs for HQ visibility.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="pb-2 pr-3">Time</th>
                  <th className="pb-2 pr-3">Agent</th>
                  <th className="pb-2 pr-3">Action</th>
                  <th className="pb-2 pr-3">Target</th>
                  <th className="pb-2 pr-3">Meta</th>
                </tr>
              </thead>
              <tbody>
                {opsEntries.length === 0 && (
                  <tr>
                    <td className="py-2 text-slate-500" colSpan={5}>No actions yet.</td>
                  </tr>
                )}
                {opsEntries.slice(-50).reverse().map((e) => (
                  <tr key={e.id} className="border-t border-slate-100">
                    <td className="py-2 pr-3 text-slate-500">{new Date(e.timestamp).toLocaleString()}</td>
                    <td className="py-2 pr-3" style={{ color: TITLE_TEXT }}>{e.actor}</td>
                    <td className="py-2 pr-3" style={{ color: TITLE_TEXT }}>{e.action}</td>
                    <td className="py-2 pr-3" style={{ color: TITLE_TEXT }}>{e.targetId || "-"}</td>
                    <td className="py-2 pr-3 text-slate-500">{e.meta ? JSON.stringify(e.meta) : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
