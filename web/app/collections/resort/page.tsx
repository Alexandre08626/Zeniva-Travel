"use client";
import React from "react";
import Link from "next/link";
import Header from "../../../src/components/Header";
import Footer from "../../../src/components/Footer";
import { LIGHT_BG, TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE, ACCENT_GOLD } from "../../../src/design/tokens";

const RESORTS = [
  { id: "r1", title: "Maldives — Private Island Escape", location: "Maldives", blurb: "Overwater villas, private transfers, wellness programs.", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=60" },
  { id: "r2", title: "Cancun All-Inclusive", location: "Cancun, Mexico", blurb: "Beachfront suites with great dining and activities.", img: "https://images.unsplash.com/photo-1501117170019-8782a8e5f9b8?auto=format&fit=crop&w=1200&q=60" },
  { id: "r3", title: "Dominican Republic — 5★ Retreat", location: "Punta Cana", blurb: "Family-friendly stays with tailored experiences.", img: "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1200&q=60" },
  { id: "r4", title: "Dubai Partner Resorts", location: "Dubai, UAE", blurb: "Iconic hotels, private drivers, curated dining.", img: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=60" },
];

export default function ResortsPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      <div className="mx-auto max-w-[1100px] px-5 pb-12 pt-6">
        <Header />

        <section className="hidden sm:block rounded-[24px] overflow-hidden border border-slate-100 shadow-sm" style={{ background: "radial-gradient(circle at 20% 20%, #1e293b, #0b1324)" }}>
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-10 text-white space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Partner Resorts</p>
              <h1 className="text-4xl md:text-5xl font-black leading-tight">All‑Inclusive Resorts & Partner Stays
                <span className="block text-white/80 text-2xl md:text-3xl font-semibold mt-2">AI‑curated stays, smooth transfers, concierge support</span>
              </h1>
              <p className="text-sm md:text-base text-white/80 max-w-xl">
                Lina AI and our team curate resorts for comfort, location, amenities, and seamless arrivals. We handle holds, arrivals, and trip coordination end‑to‑end.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/call" className="rounded-full px-5 py-2 text-sm font-bold text-slate-900" style={{ backgroundColor: ACCENT_GOLD || "#f8d475" }}>
                  Speak with a concierge
                </Link>
                <Link href="/proposals" className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white">
                  Review my proposals
                </Link>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-white/80">
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Priority confirmations</span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Airport fast track</span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Butler & spa scheduling</span>
              </div>
            </div>
            <div className="relative hidden md:block">
              <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1400&q=60" alt="Resort" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-l from-[#0b1324]/65 to-transparent" />
            </div>
          </div>
        </section>

        <div className="mt-8 rounded-[20px] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black" style={{ color: TITLE_TEXT }}>Curated resort picks</h2>
              <p className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>AI‑curated stays with smooth transfers, spa holds, and dining reservations pre‑arranged.</p>
            </div>
            <Link href="/call" className="rounded-full px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: PREMIUM_BLUE }}>
              Request a tailored stay
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {RESORTS.map((r) => (
              <div key={r.id} className="rounded-xl overflow-hidden border border-slate-100 bg-white shadow-sm flex flex-col">
                <div className="relative h-44 overflow-hidden">
                  <img src={r.img} alt={r.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/85 px-3 py-1 text-xs font-bold" style={{ color: TITLE_TEXT }}>
                    Concierge held
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: TITLE_TEXT }}>{r.title}</h3>
                    <div className="text-sm text-slate-600 mt-1">{r.location}</div>
                    <p className="mt-3 text-sm text-slate-700">{r.blurb}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <span className="rounded-lg bg-slate-50 px-3 py-2 border border-slate-100">Priority arrival & transfers</span>
                    <span className="rounded-lg bg-slate-50 px-3 py-2 border border-slate-100">Spa & dining holds</span>
                    <span className="rounded-lg bg-slate-50 px-3 py-2 border border-slate-100">Suite & villa focus</span>
                    <span className="rounded-lg bg-slate-50 px-3 py-2 border border-slate-100">On-call concierge</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    <Link href="/call" className="rounded-full px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: PREMIUM_BLUE }}>
                      Request quote
                    </Link>
                    <Link href="/proposals" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
                      Save to my proposals
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
}
