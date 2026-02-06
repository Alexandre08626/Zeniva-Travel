"use client";
import { computeCommissions } from "../../../src/lib/agent/commissions";
import { listTrips, getClientById } from "../../../src/lib/agent/store";
import { useAuthStore } from "../../../src/lib/authStore";
import { useRequireAnyPermission } from "../../../src/lib/roleGuards";
import { TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE } from "../../../src/design/tokens";

export default function CommissionsPage() {
  useRequireAnyPermission(["payments:all", "payments:yacht"], "/agent");
  const user = useAuthStore((s) => s.user);
  const lines = computeCommissions();
  const trips = listTrips();

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F3F6FB" }}>
      <div className="mx-auto max-w-5xl px-5 py-8 space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Commissions</p>
            <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>Agent commissions</h1>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>Yacht rule enforced: commission base = 5% travel share for yacht items.</p>
          </div>
          {user && <span className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-semibold" style={{ color: TITLE_TEXT }}>{user.email}</span>}
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Lines</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{lines.length} entries</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="pb-2 pr-3">Trip</th>
                  <th className="pb-2 pr-3">Client</th>
                  <th className="pb-2 pr-3">Product</th>
                  <th className="pb-2 pr-3">Sell base</th>
                  <th className="pb-2 pr-3">Pct</th>
                  <th className="pb-2 pr-3">Commission</th>
                  <th className="pb-2 pr-3">Bonuses</th>
                  <th className="pb-2 pr-3">Total</th>
                  <th className="pb-2 pr-3">Agent</th>
                </tr>
              </thead>
              <tbody>
                {lines.length === 0 && (
                  <tr><td className="py-2 text-slate-500" colSpan={9}>No commission lines yet.</td></tr>
                )}
                {lines.map((l) => {
                  const trip = trips.find((t) => t.id === l.tripId);
                  const client = trip ? getClientById(trip.clientId) : null;
                  return (
                    <tr key={`${l.tripId}-${l.componentId}`} className="border-t border-slate-100">
                      <td className="py-2 pr-3" style={{ color: TITLE_TEXT }}>{l.tripId}</td>
                      <td className="py-2 pr-3" style={{ color: TITLE_TEXT }}>{client?.name || l.clientName}</td>
                      <td className="py-2 pr-3 text-xs font-semibold"><span className="rounded-full bg-slate-100 px-2 py-1">{l.productKind}</span></td>
                      <td className="py-2 pr-3" style={{ color: TITLE_TEXT }}>${l.sellBase}</td>
                      <td className="py-2 pr-3" style={{ color: TITLE_TEXT }}>{l.commissionPct}%</td>
                      <td className="py-2 pr-3" style={{ color: TITLE_TEXT }}>${l.commissionAmount}</td>
                      <td className="py-2 pr-3 text-xs" style={{ color: MUTED_TEXT }}>
                        {l.bonuses.length === 0 && <span>-</span>}
                        {l.bonuses.map((b) => (
                          <span key={b.label} className="mr-2 rounded-full bg-amber-100 px-2 py-1 font-semibold text-slate-900">{b.label} +${b.amount}</span>
                        ))}
                      </td>
                      <td className="py-2 pr-3 font-semibold" style={{ color: TITLE_TEXT }}>${l.totalCommission}</td>
                      <td className="py-2 pr-3" style={{ color: TITLE_TEXT }}>{l.agentEmail}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Rules</h2>
          </div>
          <ul className="list-disc pl-5 text-sm" style={{ color: MUTED_TEXT }}>
            <li>Yacht: 95% Zeniva Yacht / 5% Zeniva Travel; agent commission applies only on the 5% travel share.</li>
            <li>Commission lines show only when the client is owned by an agent (origin = agent).</li>
            <li>Commission overrides (%) apply when set on the trip.</li>
            <li>Bonus logic (mock): +1% client creation, +1% manual build (3+ items), +1% rebooking keywords.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
