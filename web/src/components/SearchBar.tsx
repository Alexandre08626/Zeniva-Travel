import React from "react";
import Link from "next/link";
import { BRAND_BLUE, PREMIUM_BLUE } from "../design/tokens";

export default function SearchBar() {
  return (
    <div className="mt-6 rounded-3xl bg-white p-6 shadow-lg">
      <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full overflow-hidden" style={{ backgroundColor: "#EEF5FF" }}>
            <img src="/branding/lina-avatar.png" alt="Lina small" className="h-12 w-12 object-cover" />
          </div>
          <div>
            <div className="text-sm font-extrabold" style={{ color: "#040f3fff" }}>
              Smart Trip Search
            </div>
            <div className="text-xs font-medium" style={{ color: "#6B7280" }}>
              Describe your trip in one sentence
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <span className="inline-flex items-center rounded-full px-3 py-2 text-xs font-semibold bg-slate-100 text-slate-900">Flights + Hotels</span>
          <span className="inline-flex items-center rounded-full px-3 py-2 text-xs font-semibold bg-slate-100 text-slate-900">Curated</span>
        </div>
      </div>

      <form action="/chat" method="GET" className="mt-5 grid gap-3 lg:grid-cols-12 items-center">
        <input
          name="prompt"
          placeholder="e.g. 7 nights, 2 adults, premium resort, March"
          className="lg:col-span-9 w-full rounded-2xl bg-slate-50 px-6 py-4 text-base font-semibold text-slate-900 outline-none shadow-inner"
          style={{ border: '1px solid rgba(15, 23, 42, 0.06)' }}
        />

        <button type="submit" className="lg:col-span-3 rounded-2xl px-6 py-3 text-sm font-extrabold text-white shadow" style={{ background: `linear-gradient(90deg, ${BRAND_BLUE} 0%, ${PREMIUM_BLUE} 100%)` }}>
          Ask Lina
        </button>

        <div className="lg:col-span-12 grid gap-3 md:grid-cols-4 mt-2">
          <input name="from" placeholder="From (ex: YUL)" className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none border border-transparent" />
          <input name="to" placeholder="Destination (ex: CUN)" className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none border border-transparent" />
          <input name="dates" placeholder="Dates (ex: Dec 20–27)" className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none border border-transparent" />
          <input name="budget" placeholder="Budget (ex: 3500)" className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none border border-transparent" />
        </div>

        <div className="lg:col-span-12 flex items-center gap-3 text-xs mt-3">
          <span className="text-xs font-semibold" style={{ color: "#6B7280" }}>Try:</span>
          <Link className="text-xs font-extrabold underline" style={{ color: PREMIUM_BLUE }} href={{ pathname: "/chat", query: { prompt: "Build me a premium all-inclusive trip to Playa del Carmen for 2 adults, 5 nights." } }}>
            Playa del Carmen
          </Link>
          <span className="text-xs font-semibold" style={{ color: "#6B7280" }}>·</span>
          <Link className="text-xs font-extrabold underline" style={{ color: PREMIUM_BLUE }} href={{ pathname: "/chat", query: { prompt: "Miami weekend getaway: flight + boutique hotel, 2 adults." } }}>
            Miami weekend
          </Link>
        </div>
      </form>
    </div>
  );
}
