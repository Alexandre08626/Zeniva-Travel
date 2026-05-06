"use client";
import { useState } from "react";

export interface BookInitial {
  hotelId: string;
  hotelSlug: string;
  hotelName: string;
  hotelLocation: string;
  hotelPhoto: string;
  from: string;
  checkIn: string;
  checkOut: string;
  travelers: string;
  price: string;
}

export default function BookHotelClient({ initial }: { initial: BookInitial }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [from, setFrom] = useState(initial.from);
  const [checkIn, setCheckIn] = useState(initial.checkIn);
  const [checkOut, setCheckOut] = useState(initial.checkOut);
  const [travelers, setTravelers] = useState(initial.travelers || "2");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [setupUrl, setSetupUrl] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [chargedAmount, setChargedAmount] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [error, setError] = useState("");

  const basePrice = Math.round(Number(initial.price) || 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Please enter your name and email — email is required so we can create your free account.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const destination = initial.hotelLocation || initial.hotelName;

      // 1) Create the lead + account
      const formRes = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: "travel-agent",
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          destination,
          hotelName: initial.hotelName,
          hotelId: initial.hotelId,
          hotelUrl: `https://www.zenivatravel.com/hotel/${initial.hotelSlug}/${initial.hotelId}`,
          departureCity: from,
          checkIn,
          checkOut,
          pax: travelers,
          quotedPrice: initial.price,
          memberDiscount: "15% (first booking via hotel share link)",
          notes: notes.trim(),
        }),
      });
      const formJson = await formRes.json().catch(() => ({}));
      if (!formRes.ok) {
        throw new Error(formJson?.error || "Failed to submit booking request");
      }
      const isNewAccount = Boolean(formJson?.setupUrl);
      if (isNewAccount) setSetupUrl(formJson.setupUrl);

      // 2) Generate the ZeniPay checkout link with the agent-quoted price.
      //    Apply the 15% discount only for brand-new accounts.
      if (basePrice > 0) {
        const finalAmount = isNewAccount
          ? Math.round(basePrice * 0.85 * 100) / 100
          : basePrice;
        const datesStr = checkIn && checkOut ? ` (${checkIn} → ${checkOut})` : "";
        const description = `Zeniva Travel · ${initial.hotelName}${datesStr} · ${travelers} traveler${Number(travelers) > 1 ? "s" : ""}${isNewAccount ? " · 15% member discount" : ""}`;
        try {
          const payRes = await fetch("/api/zenipay/payments/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: finalAmount,
              currency: "USD",
              description,
              customerName: name.trim(),
              customerEmail: email.trim(),
            }),
          });
          const payJson = await payRes.json().catch(() => ({}));
          if (payRes.ok && payJson?.checkout_url) {
            setPaymentUrl(payJson.checkout_url);
            setChargedAmount(finalAmount);
            setDiscountApplied(isNewAccount);
          }
        } catch {
          // Payment link failed — keep the lead, but the success screen
          // will fall back to "agent will email you with a link".
        }
      }

      setSubmitted(true);
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-5 py-10">
        <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-8">
          <div className="text-center">
            <div className="text-5xl mb-3">✅</div>
            <h1 className="text-2xl font-black text-[#0B1B4D]">
              {paymentUrl ? "You're almost there!" : "Booking request sent!"}
            </h1>
            <p className="mt-3 text-slate-600">
              Thanks {name.split(" ")[0]} — your stay at{" "}
              <strong>{initial.hotelName}</strong> is reserved for{" "}
              <strong>
                {checkIn || "TBD"}
                {checkOut ? ` → ${checkOut}` : ""}
              </strong>{" "}
              for <strong>{travelers}</strong> traveler{Number(travelers) > 1 ? "s" : ""}.
            </p>
          </div>

          {paymentUrl ? (
            <div className="mt-6 bg-gradient-to-br from-[#0B1B4D] to-[#0F3A8A] rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#E6B85A]">
                  Pay securely with ZeniPay
                </p>
                {discountApplied && (
                  <span className="bg-[#E6B85A] text-[#0B1B4D] text-[10px] font-black px-2 py-1 rounded-full">
                    −15% MEMBER
                  </span>
                )}
              </div>
              {discountApplied && basePrice > 0 && (
                <p className="text-xs text-white/60 line-through mb-1">
                  Original ${basePrice.toLocaleString()}
                </p>
              )}
              <p className="text-3xl font-black">
                ${chargedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                <span className="text-sm text-white/70 font-medium">USD</span>
              </p>
              <a
                href={paymentUrl}
                className="block text-center mt-4 px-6 py-4 rounded-full bg-[#E6B85A] text-[#0B1B4D] font-black text-base hover:opacity-95 transition shadow-lg"
              >
                💳 Pay now
              </a>
              <p className="mt-3 text-[11px] text-white/60 text-center">
                You'll be redirected to ZeniPay's secure checkout. Bank-grade encryption.
              </p>
            </div>
          ) : (
            <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center text-sm text-slate-600">
              We couldn't generate a payment link automatically — a Zeniva
              Travel agent will email you at <strong>{email}</strong> within
              1 hour with a secure ZeniPay link.
            </div>
          )}

          {setupUrl && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
              <p className="text-xs font-bold text-amber-900">
                Welcome, member! 🎉
              </p>
              <p className="mt-1 text-xs text-amber-800/85">
                Your free Zeniva account is ready. Set a password to log in
                and track your booking.
              </p>
              <a
                href={setupUrl}
                className="inline-block mt-3 px-4 py-2 rounded-full bg-amber-900 text-white font-bold text-xs hover:opacity-90 transition"
              >
                🔒 Set my password
              </a>
            </div>
          )}

          <p className="mt-6 text-center">
            <a href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition">
              Back to Zeniva Travel
            </a>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <a href={`/hotel/${initial.hotelSlug}/${initial.hotelId}`} className="text-xs text-slate-500 hover:text-slate-700">
            ← Back to hotel
          </a>
          <span className="text-sm font-black text-[#0B1B4D]">
            ZENIVA <span className="text-[#E6B85A]">TRAVEL</span>
          </span>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-5 py-8 sm:py-12">
        {/* Hotel summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          <div className="flex items-stretch gap-4 p-4 sm:p-5">
            {initial.hotelPhoto && (
              <img
                src={initial.hotelPhoto}
                alt={initial.hotelName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold tracking-widest text-[#E6B85A] uppercase">You're booking</p>
              <h1 className="mt-1 text-lg sm:text-xl font-black text-[#0B1B4D] leading-tight">
                {initial.hotelName}
              </h1>
              {initial.hotelLocation && (
                <p className="mt-1 text-xs text-slate-500">📍 {initial.hotelLocation}</p>
              )}
              {initial.price && (
                <p className="mt-2 text-sm font-black text-[#0F6CF5]">
                  💰 From ${Number(initial.price).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7 space-y-5">
          <div>
            <h2 className="text-lg font-black text-[#0B1B4D]">Confirm your trip details</h2>
            <p className="mt-1 text-xs text-slate-500">
              Edit anything that needs to change. We'll send you a final quote and a ZeniPay link to confirm.
            </p>
          </div>

          {/* Trip details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Departure city">
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="e.g. New York"
                className={inputCls}
              />
            </Field>
            <Field label="Travelers">
              <input
                type="number"
                min={1}
                max={20}
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Check-in">
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Check-out">
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-bold text-[#0B1B4D]">Your contact info</h3>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wide px-2 py-1 rounded-full">
                15% OFF
              </span>
            </div>
            <p className="text-[11px] text-slate-500 -mt-1">
              Your free Zeniva account is created automatically — set your
              password after submitting to <strong>save 15%</strong> on this
              trip and unlock member rates.
            </p>
            <Field label="Full name *">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Email *">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className={inputCls}
                />
              </Field>
              <Field label="Phone">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 555-5555"
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Additional notes (optional)">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Special requests, dietary restrictions, accessibility needs…"
                className={inputCls + " resize-none"}
              />
            </Field>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-full bg-gradient-to-r from-[#E6B85A] to-[#C9941F] text-[#0B1B4D] font-black text-base hover:opacity-95 transition disabled:opacity-50 shadow-lg"
          >
            {submitting
              ? "Preparing your payment link…"
              : basePrice > 0
              ? `🔒 Continue to ZeniPay — $${basePrice.toLocaleString()}`
              : "🔒 Continue to ZeniPay"}
          </button>

          <p className="text-center text-[11px] text-slate-400">
            Secured by ZeniPay · You'll see the final amount before paying.
          </p>
        </form>
      </section>
    </main>
  );
}

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:border-[#0F6CF5] focus:ring-2 focus:ring-[#0F6CF5]/20 transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
