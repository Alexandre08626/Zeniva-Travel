"use client";
import React from "react";
import Link from "next/link";
import Header from "../../../src/components/Header";
import Footer from "../../../src/components/Footer";
import TravelSearchWidget from "../../../src/components/TravelSearchWidget";
import LinaWidget from "../../../src/components/LinaWidget";
import AutoTranslate from "../../../src/components/AutoTranslate";
import { LIGHT_BG, TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE, ACCENT_GOLD, GRADIENT_START, GRADIENT_END } from "../../../src/design/tokens";

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
      <div className="mx-auto w-full max-w-none px-6 pb-12 pt-6">
        <Header />

        {/* HERO SECTION (Lina Search) */}
        <section
          className="mt-4 mb-8"
          style={{
            position: "relative",
            left: "50%",
            right: "50%",
            marginLeft: "-50vw",
            marginRight: "-50vw",
            width: "100vw",
          }}
        >
          <div className="relative rounded-3xl overflow-hidden mx-auto" style={{ width: "100%", maxWidth: "none" }}>
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(110deg, ${GRADIENT_START} 0%, ${GRADIENT_END} 60%)`,
                opacity: 0.98,
              }}
            />

            <div className="relative z-10 w-full mx-auto px-5 py-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-left">
                  <div className="mb-3 flex items-center justify-center md:justify-start gap-4">
                    <img
                      src="/branding/logo.png"
                      alt="Zeniva logo"
                      className="w-auto rounded-lg shadow-sm"
                      style={{ height: "clamp(2.5rem, 6.5vw, 4.25rem)" }}
                    />
                    <div>
                      <div
                        className="font-extrabold tracking-tight text-white"
                        style={{
                          fontSize: "clamp(2.5rem, 6.5vw, 4.25rem)",
                          lineHeight: 0.95,
                          background: "linear-gradient(90deg,#ffffff 60%, #E6B85A 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          textShadow: "0 8px 24px rgba(11,27,77,0.28)",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        Zeniva Travel AI
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-md text-white/90 max-w-xl md:max-w-2xl">
                    <AutoTranslate
                      text="Tailor-made journeys, expert recommendations, and ready-to-book itineraries."
                      className="inline"
                    />
                  </p>

                  <div className="mt-6 mx-auto md:mx-0" style={{ width: "min(820px, 100%)" }}>
                    <div className="bg-white rounded-2xl shadow-lg p-4">
                      <TravelSearchWidget />
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[
                          { id: "q1", label: "Family trip", prompt: "Family beach trip, 7 nights" },
                          { id: "q2", label: "Romantic", prompt: "Honeymoon Santorini, 5 nights" },
                          { id: "q3", label: "Budget", prompt: "Sunny destinations under $1500" },
                        ].map((q) => (
                          <Link
                            key={q.id}
                            href={`/chat?prompt=${encodeURIComponent(q.prompt)}`}
                            className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
                          >
                            {q.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 hidden md:flex items-center justify-center pr-12">
                  <div className="flex flex-col items-center gap-3">
                    <span
                      className="font-extrabold tracking-tight"
                      style={{
                        fontSize: "clamp(1.25rem, 2.6vw, 1.75rem)",
                        lineHeight: 1,
                        background: "linear-gradient(90deg,#ffffff 60%, #E6B85A 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        textShadow: "0 6px 18px rgba(11,27,77,0.22)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Lina AI
                    </span>
                    <LinaWidget size={Math.min(336, Math.max(192, 21 * 16))} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

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
                <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200">VIP transfers & hosted check-ins</span>
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
