import HumanHandoffButton from "../../components/handoff/HumanHandoffButton.client";
import AgentAvailabilityToggle from "../../components/handoff/AgentAvailabilityToggle.client";
import AgentHandoffInbox from "../../components/handoff/AgentHandoffInbox.client";

export const dynamic = "force-dynamic";

const FAKE_CART = {
  total: 4280,
  total_label: "Total (USD)",
  currency: "USD",
  items: [
    { label: "Round-trip flight JFK ↔ CDG", detail: "2 travelers · Premium economy", amount: 2980, currency: "USD" },
    { label: "Hotel · Le Marais 4★", detail: "Mar 15 → Mar 22 (7 nights)", amount: 1100, currency: "USD" },
    { label: "Airport transfer · CDG", detail: "Round-trip private car", amount: 200, currency: "USD" },
  ],
};

/**
 * Demo route to validate the human-handoff flow end-to-end without touching
 * the live confirmation page. Open in two tabs (or two browsers) — one as
 * the visitor, one as the agent — to walk through chat, call, no-agent
 * fallback, and the agent's accept + payment-link flow.
 */
export default function HandoffDemoPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-10">
        <header>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Human-handoff demo</h1>
          <p className="text-slate-600 mt-2">
            Validate the &ldquo;Confirm with a human agent&rdquo; flow end-to-end. Open this page as the visitor, and{" "}
            <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs">/handoff-demo?role=agent</code> in another browser to act as the agent.
          </p>
        </header>

        {/* Visitor side */}
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900">Visitor view — confirmation page</h2>
            <p className="text-slate-600 text-sm mt-1">
              Mock recap with a primary &ldquo;Pay&rdquo; button and the new &ldquo;Confirm with a human agent&rdquo; button next to it.
            </p>
          </div>

          {/* Mocked cart */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Your itinerary</div>
            <ul className="space-y-2">
              {FAKE_CART.items.map((it) => (
                <li key={it.label} className="flex items-start justify-between gap-3 text-sm">
                  <div>
                    <div className="font-bold text-slate-900">{it.label}</div>
                    <div className="text-slate-500">{it.detail}</div>
                  </div>
                  <div className="font-mono font-bold tabular-nums text-slate-900">${it.amount.toLocaleString()}</div>
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-200 mt-4 pt-3 flex items-center justify-between font-black text-slate-900">
              <span>Total</span>
              <span>${FAKE_CART.total.toLocaleString()} USD</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-base font-black text-white shadow-lg bg-slate-900 hover:bg-slate-800 transition"
            >
              💳 Pay with ZeniPay
            </button>
            <HumanHandoffButton cartSnapshot={FAKE_CART} sourcePage="/handoff-demo" locale="en" />
          </div>
        </section>

        {/* Agent side */}
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-black text-slate-900">Agent view — dashboard widgets</h2>
              <p className="text-slate-600 text-sm mt-1">
                Drop these into the agent dashboard header / sidebar. The toggle controls your availability; the inbox lights up when a visitor requests human help.
              </p>
            </div>
            <AgentAvailabilityToggle />
          </div>
          <AgentHandoffInbox />
          <p className="text-xs text-slate-500">
            Tip: flip the toggle to <strong>Available</strong> in this tab, then click &ldquo;Confirm with a human agent&rdquo; above (or in a second tab) to fire a request.
          </p>
        </section>

        {/* FR variant */}
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8 space-y-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">Variante française</h2>
            <p className="text-slate-600 text-sm mt-1">Même bouton, copy FR — drop-in identique avec <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs">locale=&quot;fr&quot;</code>.</p>
          </div>
          <HumanHandoffButton cartSnapshot={FAKE_CART} sourcePage="/handoff-demo" locale="fr" />
        </section>
      </div>
    </main>
  );
}
