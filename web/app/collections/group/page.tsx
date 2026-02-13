"use client";
import React, { useState } from "react";
import Link from "next/link";
import Header from "../../../src/components/Header";
import Footer from "../../../src/components/Footer";
import { LIGHT_BG, TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE, ACCENT_GOLD, GRADIENT_START, GRADIENT_END } from "../../../src/design/tokens";

const GROUP_IDEAS = [
  { id: "g1", title: "Mexico — All-Inclusive Group Escape", blurb: "Private villas, group transfers, event planning.", img: "https://images.unsplash.com/photo-1501117170019-8782a8e5f9b8?auto=format&fit=crop&w=1200&q=60" },
  { id: "g2", title: "Europe Friends Trip (Italy / France / Spain)", blurb: "City-hopping with curated activities and dining.", img: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=1200&q=60" },
  { id: "g3", title: "Corporate Retreats", blurb: "Offsite planning, meeting facilities, team experiences.", img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=60" },
  { id: "g4", title: "Bachelor / Bachelorette Trips", blurb: "Tailored party itineraries with popular experiences.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=60" },
  { id: "g5", title: "Family & Multi-generation Trips", blurb: "Accessible, comfortable plans for all ages.", img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60" },
];

export default function GroupTripsPage() {
  const [query, setQuery] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [travelers, setTravelers] = useState("10");

  return (
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      <div className="w-screen left-1/2 right-1/2 -translate-x-1/2 relative">
        <div className="mx-auto w-full px-6 pt-5">
          <Header />
        </div>
      </div>

      <section className="mb-8 rounded-3xl px-6 py-8" style={{ background: `linear-gradient(110deg, ${GRADIENT_START} 0%, ${GRADIENT_END} 60%)` }}>
        <div className="mx-auto max-w-6xl text-white">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Traveler Catalog</p>
            <h1 className="text-3xl font-black">Full Travel Inventory</h1>
            <p className="text-sm text-white/90">
              Explore the full traveler catalog and connect with Zeniva to finalize your trip.
            </p>
          </div>
          <div className="mt-10 flex flex-col gap-6">
            <div className="flex flex-wrap gap-3">
              <Link href="/partners/resorts" className="rounded-full px-4 py-2 text-sm font-semibold bg-white/10 text-white">
                Hotels & Resorts
              </Link>
              <Link href="/yachts" className="rounded-full px-4 py-2 text-sm font-semibold bg-white/10 text-white">
                Yachts
              </Link>
              <Link href="/residences" className="rounded-full px-4 py-2 text-sm font-semibold bg-white/10 text-white">
                Short-term Rentals
              </Link>
              <Link href="/" className="rounded-full border border-white/50 px-4 py-2 text-sm font-semibold text-white">
                Flights
              </Link>
            </div>
            <div className="w-full rounded-3xl border border-white/35 bg-white/15 p-3 shadow-sm backdrop-blur">
              <div className="flex items-center gap-4 pb-3">
                <Link
                  href="/chat/r5ug551qmll3p6p3"
                  className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/15 p-1 shadow-sm backdrop-blur transition hover:bg-white/25"
                  aria-label="Chat with Lina"
                >
                  <img
                    src="/branding/lina-avatar.png"
                    alt="Lina"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                </Link>
                <div className="text-sm font-semibold text-white/90">
                  Lina concierge
                </div>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="flex-1">
                  <label htmlFor="group-search" className="sr-only">
                    Search destinations
                  </label>
                  <input
                    id="group-search"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search destinations or themes"
                    className="w-full rounded-full border border-white/40 bg-white/15 px-4 py-2 text-sm font-semibold text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/70"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <label htmlFor="group-checkin" className="sr-only">
                      Check-in date
                    </label>
                    <input
                      id="group-checkin"
                      type="date"
                      value={checkIn}
                      onChange={(event) => setCheckIn(event.target.value)}
                      className="w-full rounded-full border border-white/40 bg-white/15 px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white/70"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="group-checkout" className="sr-only">
                      Check-out date
                    </label>
                    <input
                      id="group-checkout"
                      type="date"
                      value={checkOut}
                      onChange={(event) => setCheckOut(event.target.value)}
                      className="w-full rounded-full border border-white/40 bg-white/15 px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white/70"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="group-travelers" className="sr-only">
                      Travelers
                    </label>
                    <select
                      id="group-travelers"
                      value={travelers}
                      onChange={(event) => setTravelers(event.target.value)}
                      className="w-full rounded-full border border-white/40 bg-white/15 px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white/70"
                    >
                      <option value="6" className="text-slate-900">6 travelers</option>
                      <option value="8" className="text-slate-900">8 travelers</option>
                      <option value="10" className="text-slate-900">10 travelers</option>
                      <option value="12" className="text-slate-900">12 travelers</option>
                      <option value="15" className="text-slate-900">15 travelers</option>
                      <option value="20" className="text-slate-900">20+ travelers</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-none px-6 pb-12">
        <section className="mt-4">
          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: MUTED_TEXT }}>Group Travel Concierge</p>
              <div>
                <h1 className="text-4xl md:text-5xl font-black leading-tight" style={{ color: TITLE_TEXT }}>Group Trips</h1>
                <p className="mt-2 text-lg md:text-xl font-semibold" style={{ color: MUTED_TEXT }}>
                  Ready-to-request itineraries for every occasion
                </p>
              </div>
              <p className="text-sm md:text-base max-w-xl" style={{ color: MUTED_TEXT }}>
                We design turnkey group escapes with flights, villas, transfers, private dining, and hosted experiences—so you can focus on the people, not the logistics.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/call" className="rounded-full px-5 py-2 text-sm font-bold text-white" style={{ backgroundColor: PREMIUM_BLUE }}>
                  Speak with a concierge
                </Link>
                <Link href="/proposals" className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
                  Review my proposals
                </Link>
              </div>
              <div className="flex flex-wrap gap-2 text-xs" style={{ color: MUTED_TEXT }}>
                <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200">Coordinated transfers & hosted check-ins</span>
                <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200">Rooming lists handled</span>
                <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200">Dining & activities pre-booked</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="h-[280px] w-full overflow-hidden rounded-2xl">
                <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=60" alt="Group travel" className="h-full w-full object-cover" />
              </div>
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
