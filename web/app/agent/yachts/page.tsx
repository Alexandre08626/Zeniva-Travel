"use client";
import { searchYachts } from "../../../src/lib/agent/inventory/yachts";
import { TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE } from "../../../src/design/tokens";
import Link from "next/link";
import { useRequireAnyPermission } from "../../../src/lib/roleGuards";

export default function AgentYachtsPage() {
  useRequireAnyPermission(["read_yachts_inventory", "inventory:all"], "/agent");
  const yachts = searchYachts();
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F3F6FB" }}>
      <div className="mx-auto max-w-5xl px-5 py-8 space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Yachts</p>
            <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>Zeniva Yacht catalogue</h1>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>Agents vendent, Zeniva Yacht délivre; commission sur la part 5% Travel.</p>
          </div>
          <div className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>
            Acces inventaire uniquement
          </div>
        </header>
        <section className="grid gap-3 md:grid-cols-2">
          {yachts.map((y) => (
            <div key={y.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold" style={{ color: TITLE_TEXT }}>{y.name}</p>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{y.length}</span>
              </div>
              <p className="text-sm" style={{ color: MUTED_TEXT }}>{y.location} · {y.guests} guests · Week {y.weekStart}</p>
              <p className="text-sm" style={{ color: MUTED_TEXT }}>Total Sell ${y.pricing.sell} (Travel share 5%)</p>
              <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>
                Propositions gerees par le back-office
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
