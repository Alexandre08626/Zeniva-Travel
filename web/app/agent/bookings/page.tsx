"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE } from "../../../src/design/tokens";
import { bookings, BookingStatus } from "./data";
import { useT } from "../../../src/lib/i18n/I18nProvider";

const statusColor: Record<BookingStatus, { bg: string; text: string }> = {
  Pending: { bg: "bg-amber-50", text: "text-amber-700" },
  Confirmed: { bg: "bg-blue-50", text: "text-blue-700" },
  Ticketed: { bg: "bg-emerald-50", text: "text-emerald-700" },
  Invoiced: { bg: "bg-slate-100", text: "text-slate-700" },
};

export default function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "All">("Confirmed");
  const [query, setQuery] = useState("");
  const t = useT();

  const filtered = useMemo(() => {
    return bookings
      .filter((b) => b.status !== "Pending")
      .filter((b) => {
        const matchesStatus = statusFilter === "All" ? true : b.status === statusFilter;
        const q = query.toLowerCase();
        const matchesQuery = [b.id, b.client, b.destination, b.type].some((v) => v.toLowerCase().includes(q));
        return matchesStatus && matchesQuery;
      });
  }, [statusFilter, query]);

  const totals = useMemo(() => {
    const byStatus = { Confirmed: 0, Ticketed: 0, Invoiced: 0 } as Record<Exclude<BookingStatus, "Pending">, number>;
    bookings
      .filter((b) => b.status !== "Pending")
      .forEach((b) => {
        if (b.status in byStatus) {
          // @ts-expect-error runtime narrowing
          byStatus[b.status] += 1;
        }
      });
    return byStatus;
  }, []);

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F3F6FB" }}>
      <div className="mx-auto max-w-6xl px-5 py-8 space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t("bookings.label")}</p>
            <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>{t("bookings.title")}</h1>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>{t("bookings.subtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white px-3 py-2 text-slate-800 border border-slate-200 shadow-sm">{t("bookings.total")} {bookings.length}</span>
            <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700 border border-emerald-100">{t("bookings.ticketed")} {totals.Ticketed}</span>
            <span className="rounded-full bg-blue-50 px-3 py-2 text-blue-700 border border-blue-100">{t("bookings.confirmed")} {totals.Confirmed}</span>
            <span className="rounded-full bg-slate-100 px-3 py-2 text-slate-700 border border-slate-200">{t("bookings.invoiced")} {totals.Invoiced}</span>
          </div>
        </header>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              {(["All", "Confirmed", "Ticketed", "Invoiced"] as const).map((s) => {
                const active = statusFilter === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s as BookingStatus | "All")}
                    className="rounded-full border px-3 py-1.5"
                    style={{
                      borderColor: active ? PREMIUM_BLUE : "#e2e8f0",
                      backgroundColor: active ? PREMIUM_BLUE : "#fff",
                      color: active ? "#fff" : TITLE_TEXT,
                    }}
                  >
                    {s === "All"
                      ? t("bookings.statusAll")
                      : s === "Confirmed"
                      ? t("bookings.statusConfirmed")
                      : s === "Ticketed"
                      ? t("bookings.statusTicketed")
                      : t("bookings.statusInvoiced")}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("bookings.searchPlaceholder")}
                className="w-full md:w-72 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {filtered.map((b) => (
              <div key={b.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-bold" style={{ color: TITLE_TEXT }}>{b.id} · {b.client}</div>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${statusColor[b.status].bg} ${statusColor[b.status].text}`}>
                    {b.status}
                  </span>
                </div>
                <div className="text-sm" style={{ color: TITLE_TEXT }}>{b.destination} · {b.type}</div>
                <div className="text-xs" style={{ color: MUTED_TEXT }}>{b.startDate} → {b.endDate} • Pax {b.pax} • Agent {b.agent}</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold" style={{ color: TITLE_TEXT }}>{b.currency} {b.amount.toLocaleString()}</span>
                  <Link
                    href={`/agent/trips/${b.tripId || b.id}`}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold"
                    style={{ color: PREMIUM_BLUE }}
                  >
                    {t("bookings.viewFile")}
                  </Link>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                {t("bookings.noResults")}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">{t("bookings.auditTitle")}</p>
          <ul className="space-y-1 text-xs" style={{ color: MUTED_TEXT }}>
            <li>{t("bookings.auditOne")}</li>
            <li>{t("bookings.auditTwo")}</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
