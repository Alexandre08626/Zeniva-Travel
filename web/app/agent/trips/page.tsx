"use client";
import Link from "next/link";
import { listTrips, getClientById } from "../../../src/lib/agent/store";
import { TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE } from "../../../src/design/tokens";

export default function TripsPage() {
  const trips = listTrips();
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F3F6FB" }}>
      <div className="mx-auto max-w-5xl px-5 py-8 space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Trips</p>
            <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>Trip files</h1>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>Travel + Yacht dossiers.</p>
          </div>
          <Link href="/agent/trips/T-501" className="rounded-full px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: PREMIUM_BLUE }}>
            Open workspace
          </Link>
        </header>
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-3">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="pb-2 pr-3">Trip</th>
                  <th className="pb-2 pr-3">Client</th>
                  <th className="pb-2 pr-3">Division</th>
                  <th className="pb-2 pr-3">Status</th>
                  <th className="pb-2 pr-3">Owner</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((t) => {
                  const client = getClientById(t.clientId);
                  return (
                    <tr key={t.id} className="border-t border-slate-100">
                      <td className="py-2 pr-3" style={{ color: TITLE_TEXT }}>
                        <Link href={`/agent/trips/${t.id}`} className="font-semibold underline" style={{ color: PREMIUM_BLUE }}>{t.title}</Link>
                      </td>
                      <td className="py-2 pr-3" style={{ color: TITLE_TEXT }}>{client?.name || t.clientId}</td>
                      <td className="py-2 pr-3 text-xs font-semibold"><span className="rounded-full bg-slate-100 px-2 py-1">{t.division}</span></td>
                      <td className="py-2 pr-3" style={{ color: TITLE_TEXT }}>{t.status}</td>
                      <td className="py-2 pr-3" style={{ color: TITLE_TEXT }}>{t.ownerEmail || client?.ownerEmail}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
