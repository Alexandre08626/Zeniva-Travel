"use client";
import React from "react";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import { LIGHT_BG, TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE } from "../../src/design/tokens";

export default function PartnerPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      <div className="mx-auto max-w-[1080px] px-6 pb-16 pt-6">
        <Header isLoggedIn={false} />

        {/* Hero */}
        <section className="rounded-[20px] border border-slate-100 bg-white px-8 py-10 shadow-sm">
          <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide" style={{ color: PREMIUM_BLUE }}>
                B2B partner program
              </div>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight" style={{ color: TITLE_TEXT }}>
                Grow bookings with Zeniva’s concierge network
              </h1>
              <p className="mt-4 text-base font-semibold" style={{ color: MUTED_TEXT }}>
                Connect your inventory and offers to a vetted audience of high-intent travelers. Unified onboarding, fast payouts, and concierge-led conversion.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="#apply"
                  className="rounded-full px-5 py-3 text-sm font-bold text-white shadow-sm"
                  style={{ backgroundColor: PREMIUM_BLUE }}
                >
                  Apply as Partner
                </a>
                <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>
                  Hotels · Villas · Yachts · Experiences · Air · Groups
                </div>
              </div>
            </div>
            <div className="rounded-[16px] border border-slate-100 bg-slate-50 p-6">
              <div className="grid grid-cols-2 gap-4 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-wide" style={{ color: MUTED_TEXT }}>Conversion</div>
                  <div className="mt-1 text-2xl font-extrabold">3.4x</div>
                  <div className="text-xs" style={{ color: MUTED_TEXT }}>vs. self-serve funnels</div>
                </div>
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-wide" style={{ color: MUTED_TEXT }}>Time to live</div>
                  <div className="mt-1 text-2xl font-extrabold">&lt; 7 days</div>
                  <div className="text-xs" style={{ color: MUTED_TEXT }}>from contract to first booking</div>
                </div>
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-wide" style={{ color: MUTED_TEXT }}>ADR focus</div>
                  <div className="mt-1 text-2xl font-extrabold">$1.8k</div>
                  <div className="text-xs" style={{ color: MUTED_TEXT }}>avg booking value</div>
                </div>
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-wide" style={{ color: MUTED_TEXT }}>Service</div>
                  <div className="mt-1 text-2xl font-extrabold">24/7</div>
                  <div className="text-xs" style={{ color: MUTED_TEXT }}>concierge + ops support</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partner categories */}
        <section className="mt-10 rounded-[16px] border border-slate-100 bg-white p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold" style={{ color: TITLE_TEXT }}>Who we partner with</h2>
              <p className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>Trusted suppliers ready for concierge-driven demand.</p>
            </div>
            <a href="#apply" className="text-sm font-semibold underline" style={{ color: PREMIUM_BLUE }}>Apply</a>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {["Hotels", "Villas and private residences", "Yachts & charters", "Experiences & excursions", "Aviation & air", "Group & MICE"].map((label) => {
              const displayLabel = label === "Villas and private residences" ? "Villas and short-term rentals" : label;
              return (
                <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
                  {displayLabel}
                </div>
              );
            })}
          </div>
        </section>

        {/* Value points */}
        <section className="mt-8 rounded-[16px] border border-slate-100 bg-white p-7">
          <div className="grid gap-6 md:grid-cols-3">
            {[{
              title: "High-intent demand",
              desc: "Concierge-qualified travelers with budgets verified before proposals are sent.",
            }, {
              title: "Unified onboarding",
              desc: "Single contract, simple rate sheet, and direct payments. We handle guest comms and verifications.",
            }, {
              title: "Operational coverage",
              desc: "24/7 concierge + ops team to manage changes, special requests, and payment collection.",
            }].map((item) => (
              <div key={item.title} className="rounded-lg border border-slate-100 bg-slate-50 p-5">
                <div className="text-sm font-bold" style={{ color: PREMIUM_BLUE }}>{item.title}</div>
                <p className="mt-2 text-sm font-semibold" style={{ color: MUTED_TEXT }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Onboarding steps */}
        <section className="mt-8 rounded-[16px] border border-slate-100 bg-white p-7">
          <h2 className="text-xl font-extrabold" style={{ color: TITLE_TEXT }}>How onboarding works</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {[{
              step: "1",
              title: "Apply",
              desc: "Share your inventory focus, rate structure, and service standards.",
            }, {
              step: "2",
              title: "Review",
              desc: "We align on pricing, blackouts, and fulfillment rules within 72 hours.",
            }, {
              step: "3",
              title: "Configure",
              desc: "Upload assets and promos; connect payouts if needed. Avg setup < 1 week.",
            }, {
              step: "4",
              title: "Go live",
              desc: "Your products surface in concierge proposals with ops-managed guest comms.",
            }].map((item) => (
              <div key={item.step} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide" style={{ color: PREMIUM_BLUE }}>Step {item.step}</div>
                <div className="mt-1 text-sm font-bold" style={{ color: TITLE_TEXT }}>{item.title}</div>
                <p className="mt-2 text-sm font-semibold" style={{ color: MUTED_TEXT }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Application form */}
        <section id="apply" className="mt-8 rounded-[16px] border border-slate-100 bg-white p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold" style={{ color: TITLE_TEXT }}>Apply as a partner</h2>
              <p className="text-sm font-semibold" style={{ color: MUTED_TEXT }}>Tell us about your business. We review every application.</p>
            </div>
            <div className="hidden md:block text-xs font-semibold" style={{ color: MUTED_TEXT }}>Response in 2 business days</div>
          </div>

          <form className="mt-5 grid gap-4 md:grid-cols-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold" style={{ color: TITLE_TEXT }}>Primary category</label>
              <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" required>
                <option value="">Select</option>
                <option>Hotel / Resort</option>
                <option>Villa / Residence</option>
                <option>Yacht / Charter</option>
                <option>Experience / Excursion</option>
                <option>Aviation / Air</option>
                <option>Group / MICE</option>
                <option>Other supplier</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold" style={{ color: TITLE_TEXT }}>Inventory scope</label>
              <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Rooms, cabins, listings, departures" />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold" style={{ color: TITLE_TEXT }}>Target markets / destinations</label>
              <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="e.g., Med, Caribbean, Alps, SE Asia" />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold" style={{ color: TITLE_TEXT }}>Notes</label>
              <textarea className="min-h-[120px] rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Share rate structure, blackout rules, service expectations." />
            </div>
            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>We onboard a limited number of partners each quarter.</div>
              <button
                type="submit"
                className="rounded-full px-6 py-3 text-sm font-bold text-white shadow-sm"
                style={{ backgroundColor: PREMIUM_BLUE }}
              >
                Submit application
              </button>
            </div>
          </form>
        </section>

        <Footer />
      </div>
    </main>
  );
}
