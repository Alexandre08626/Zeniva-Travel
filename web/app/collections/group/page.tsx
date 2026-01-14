"use client";
import React from "react";
import Link from "next/link";
import Header from "../../../src/components/Header";
import Footer from "../../../src/components/Footer";
import { LIGHT_BG, TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE, ACCENT_GOLD } from "../../../src/design/tokens";

const GROUP_IDEAS = [
  { id: "g1", title: "Mexico — All-Inclusive Group Escape", blurb: "Private villas, group transfers, event planning.", img: "https://images.unsplash.com/photo-1501117170019-8782a8e5f9b8?auto=format&fit=crop&w=1200&q=60" },
  { id: "g2", title: "Europe Friends Trip (Italy / France / Spain)", blurb: "City-hopping with curated activities and dining.", img: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=1200&q=60" },
  { id: "g3", title: "Corporate Retreats", blurb: "Offsite planning, meeting facilities, team experiences.", img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=60" },
  { id: "g4", title: "Bachelor / Bachelorette Trips", blurb: "Tailored party itineraries with VIP experiences.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=60" },
  { id: "g5", title: "Family & Multi-generation Trips", blurb: "Accessible, comfortable plans for all ages.", img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60" },
];

export default function GroupTripsPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      <div className="mx-auto max-w-[1100px] px-5 pb-12 pt-6">
        <Header />

        <section className="rounded-[24px] overflow-hidden border border-slate-100 shadow-sm" style={{ background: "linear-gradient(120deg, #0f172a, #0f253f)" }}>
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-10 text-white space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Group Travel Concierge</p>
              <h1 className="text-4xl md:text-5xl font-black leading-tight">Group Trips
                <span className="block text-white/80 text-2xl md:text-3xl font-semibold mt-2">Ready-to-request itineraries for every occasion</span>
              </h1>
              <p className="text-sm md:text-base text-white/80 max-w-xl">
                We design turnkey group escapes with flights, villas, transfers, private dining, and hosted experiences—so you can focus on the people, not the logistics.
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
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">VIP transfers & hosted check-ins</span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Rooming lists handled</span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Dining & activities pre-booked</span>
              </div>
            </div>
            <div className="relative hidden md:block">
              <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=60" alt="Group travel" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-l from-[#0f172a]/60 to-transparent" />
            </div>
          </div>
        </section>

        <div className="mt-8 rounded-[20px] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black" style={{ color: TITLE_TEXT }}>Pre-built group travel ideas</h2>
              <p className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>Select a template and we will tailor it to your headcount, dates, and preferences.</p>
            </div>
            <Link href="/call" className="rounded-full px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: PREMIUM_BLUE }}>
              Request an itinerary
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GROUP_IDEAS.map((g) => (
              <div key={g.id} className="rounded-xl overflow-hidden border border-slate-100 bg-white shadow-sm flex flex-col">
                <div className="relative h-40 overflow-hidden">
                  <img src={g.img} alt={g.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/85 px-3 py-1 text-xs font-bold" style={{ color: TITLE_TEXT }}>
                    Ready to request
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: TITLE_TEXT }}>{g.title}</h3>
                    <p className="mt-2 text-sm text-slate-700">{g.blurb}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <span className="rounded-lg bg-slate-50 px-3 py-2 border border-slate-100">Flights + room blocks</span>
                    <span className="rounded-lg bg-slate-50 px-3 py-2 border border-slate-100">Private transfers</span>
                    <span className="rounded-lg bg-slate-50 px-3 py-2 border border-slate-100">Dining & buyouts</span>
                    <span className="rounded-lg bg-slate-50 px-3 py-2 border border-slate-100">Hosted activities</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    <Link href="/call" className="rounded-full px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: PREMIUM_BLUE }}>
                      Book a consult
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
