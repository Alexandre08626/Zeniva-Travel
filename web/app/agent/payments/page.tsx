"use client";
import { listTrips } from "../../../src/lib/agent/store";
import { TITLE_TEXT, MUTED_TEXT } from "../../../src/design/tokens";

export default function PaymentsPage() {
  const trips = listTrips();
  const payments = trips.flatMap((t) => t.payments.map((p) => ({ ...p, tripId: t.id })));
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F3F6FB" }}>
      <div className="mx-auto max-w-5xl px-5 py-8 space-y-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Payments</p>
          <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>Payment links</h1>
          <p className="text-sm" style={{ color: MUTED_TEXT }}>Pending and paid requests across trips.</p>
        </header>
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-3">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="pb-2 pr-3">Trip</th>
                <th className="pb-2 pr-3">Amount</th>
                <th className="pb-2 pr-3">Status</th>
                <th className="pb-2 pr-3">Link</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && <tr><td className="py-2 text-slate-500" colSpan={4}>No payments yet.</td></tr>}
              {payments.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="py-2 pr-3" style={{ color: TITLE_TEXT }}>{p.tripId}</td>
                  <td className="py-2 pr-3" style={{ color: TITLE_TEXT }}>${p.amount} {p.currency}</td>
                  <td className="py-2 pr-3" style={{ color: TITLE_TEXT }}>{p.status}</td>
                  <td className="py-2 pr-3 text-xs" style={{ color: MUTED_TEXT }}>{p.link}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
