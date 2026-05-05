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
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || (!email.trim() && !phone.trim())) {
      setError("Please fill in your name and either email or phone.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const destination = initial.hotelLocation || initial.hotelName;
      const res = await fetch("/api/forms/submit", {
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
          notes: notes.trim(),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Failed to submit booking request");
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
        <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-black text-[#0B1B4D]">Booking request sent!</h1>
          <p className="mt-3 text-slate-600">
            Thanks {name.split(" ")[0]} — a Zeniva Travel agent will email you within 1 hour at <strong>{email || phone}</strong> with the final quote and a secure ZeniPay link to confirm your stay at <strong>{initial.hotelName}</strong>.
          </p>
          <a
            href="/"
            className="inline-block mt-6 px-7 py-3 rounded-full bg-[#0B1B4D] text-white font-bold text-sm hover:opacity-90 transition"
          >
            Back to Zeniva Travel
          </a>
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
            <h3 className="text-sm font-bold text-[#0B1B4D]">Your contact info</h3>
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
              <Field label="Email">
                <input
                  type="email"
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
            {submitting ? "Sending…" : "🔒 Request booking & get ZeniPay link"}
          </button>

          <p className="text-center text-[11px] text-slate-400">
            No payment yet — an agent will email you with the final quote first.
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
