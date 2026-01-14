"use client";
import React from "react";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import { LIGHT_BG, TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE } from "../../src/design/tokens";
import Link from "next/link";

export default function PaymentPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      <div className="mx-auto max-w-[900px] px-5 pb-12 pt-6">
        <Header isLoggedIn={false} />

        <div className="rounded-[20px] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color: TITLE_TEXT }}>Checkout</h1>
              <p className="mt-2 text-sm font-semibold" style={{ color: MUTED_TEXT }}>Secure payment with 3D Secure. Your card is encrypted.</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
            <section className="lg:col-span-2 space-y-5">
              <div className="rounded-xl border border-slate-200 p-4">
                <h2 className="text-sm font-semibold text-slate-700">Traveler details</h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="First name" />
                  <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Last name" />
                  <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Email" />
                  <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Phone" />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-700">Payment method</h2>
                  <span className="text-xs font-semibold text-slate-500">Visa · MasterCard · Amex</span>
                </div>
                <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Card number" />
                <div className="grid grid-cols-3 gap-3">
                  <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="MM/YY" />
                  <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="CVC" />
                  <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Name on card" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Billing address" />
                  <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="City" />
                  <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="State / Province" />
                  <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Postal code" />
                  <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Country" />
                  <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Promo / discount code" />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <input id="agree" type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                  <label htmlFor="agree" className="text-sm text-slate-700">I agree to terms, cancellation policy, and credit card authorization.</label>
                </div>
                <button className="w-full rounded-full px-6 py-3 font-extrabold text-white" style={{ backgroundColor: PREMIUM_BLUE }}>
                  Pay securely
                </button>
                <p className="text-xs text-slate-500">You will receive an email confirmation with invoice and charter details.</p>
              </div>
            </section>

            <aside className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50">
              <h2 className="text-sm font-semibold text-slate-700">Booking summary</h2>
              <div className="text-base font-bold" style={{ color: TITLE_TEXT }}>43ft Leopard Power Cat (2017)</div>
              <div className="text-sm text-slate-600">Haulover · Sat, Mar 22 · 4h · 8 guests</div>
              <div className="border-t border-slate-200 pt-3 space-y-2 text-sm text-slate-700">
                <div className="flex justify-between"><span>Base rate</span><span>$1,700.00</span></div>
                <div className="flex justify-between"><span>Gratuity (15%)</span><span>$255.00</span></div>
                <div className="flex justify-between"><span>Taxes & fees</span><span>$68.00</span></div>
                <div className="flex justify-between font-bold text-slate-900"><span>Total due</span><span>$2,023.00</span></div>
              </div>
              <div className="rounded-lg bg-white border border-slate-200 p-3 text-xs text-slate-600">
                Need changes? Contact concierge before paying. Funds are held until charter confirmation.
              </div>
            </aside>
          </div>

          <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
            <Link href="/yachts" className="underline">Back to yachts</Link>
            <span>Payments secured by your provider (Stripe recommended).</span>
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
}
