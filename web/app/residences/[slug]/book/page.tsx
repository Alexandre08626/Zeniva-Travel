"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";

const VPS = "https://vmi3097009.contaboserver.net";
const HDR = { "Content-Type": "application/json" };

function BookingForm() {
  const params = useSearchParams();
  const router = useRouter();

  const property = params.get("property") || "";
  const slug = params.get("slug") || "";
  const checkin = params.get("checkin") || "";
  const checkout = params.get("checkout") || "";
  const nights = parseInt(params.get("nights") || "1", 10);
  const pricePerNight = parseFloat(params.get("price") || "0");
  const total = parseFloat(params.get("total") || "0");
  const image = params.get("image") || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState("1");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [confNum] = useState(() => `ZNV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);

  const CLEANING_FEE = 285;
  const CONCIERGE_FEE = 120;
  const TAX_RATE = 0.06;
  const subtotal = nights * pricePerNight;
  const taxes = Math.round(subtotal * TAX_RATE);
  const displayTotal = total || subtotal + CLEANING_FEE + CONCIERGE_FEE + taxes;

  const submit = async () => {
    if (!name.trim() || !email.trim()) { setError("Name and email are required."); return; }
    setLoading(true); setError("");
    try {
      await fetch(`${VPS}/admin/leads`, {
        method: "POST",
        headers: { ...HDR, Authorization: "Bearer zeniva-secret-2025" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          destination: property,
          message: `ZeniStay Reservation Request\nProperty: ${property}\nCheck-in: ${checkin || "TBD"}\nCheck-out: ${checkout || "TBD"}\nNights: ${nights}\nGuests: ${guests}\nTotal: $${displayTotal.toLocaleString()}\n\n${message}`.trim(),
          source: "ZeniStay",
          budget: String(Math.round(displayTotal)),
          travel_dates: checkin && checkout ? `${checkin} → ${checkout}` : undefined,
          status: "new",
          metadata: JSON.stringify({ property, slug, checkin, checkout, nights, guests, total: displayTotal, pricePerNight, confirmation: confNum }),
        }),
      });
      setDone(true);
    } catch {
      setError("Connection error — please try again or email us at info@zeniva.ca");
    }
    setLoading(false);
  };

  if (done) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 text-4xl">✅</div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Reservation Requested!</h1>
        <p className="text-slate-500 mb-6">We received your request for <strong>{property}</strong>. Our team will confirm within a few hours.</p>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left mb-6 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Confirmation</span><span className="font-bold text-blue-700">{confNum}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Property</span><span className="font-semibold">🏡 {property}</span></div>
          {checkin && <div className="flex justify-between"><span className="text-slate-500">Check-in</span><span className="font-semibold">{checkin}</span></div>}
          {checkout && <div className="flex justify-between"><span className="text-slate-500">Check-out</span><span className="font-semibold">{checkout}</span></div>}
          <div className="flex justify-between"><span className="text-slate-500">Guests</span><span className="font-semibold">{guests}</span></div>
          <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900 text-base"><span>Estimated Total</span><span>${displayTotal.toLocaleString()}</span></div>
        </div>
        <p className="text-xs text-slate-400 mb-6">A Zeniva agent will contact you at <strong>{email}</strong> to confirm payment and finalize your stay.</p>
        <div className="flex gap-3">
          <button onClick={() => router.push("/residences")} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition">
            ← Browse more
          </button>
          <a href={`mailto:info@zeniva.ca?subject=Reservation ${confNum} — ${property}`} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm text-center hover:bg-blue-700 transition">
            ✉️ Email us
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition">
          ←
        </button>
        <span className="font-bold text-slate-900 text-sm truncate">Reserve · {property}</span>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Property summary */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          {image && (
            <div className="relative h-40 w-full">
              <Image src={image} alt={property} fill className="object-cover" />
            </div>
          )}
          <div className="p-4">
            <div className="font-bold text-slate-900 text-base">🏡 {property}</div>
            {checkin && checkout && (
              <div className="text-sm text-slate-500 mt-1">{checkin} → {checkout} · {nights} night{nights > 1 ? "s" : ""}</div>
            )}
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-sm">
              {pricePerNight > 0 && <div className="flex justify-between text-slate-600"><span>{nights} night{nights > 1 ? "s" : ""} × ${pricePerNight.toLocaleString()}/night</span><span>${subtotal.toLocaleString()}</span></div>}
              <div className="flex justify-between text-slate-500 text-xs"><span>Cleaning fee</span><span>${CLEANING_FEE}</span></div>
              <div className="flex justify-between text-slate-500 text-xs"><span>Zeniva concierge</span><span>${CONCIERGE_FEE}</span></div>
              <div className="flex justify-between text-slate-500 text-xs"><span>Taxes (6%)</span><span>${taxes}</span></div>
              <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100 text-base"><span>Total</span><span>${displayTotal.toLocaleString()}</span></div>
            </div>
          </div>
        </div>

        {/* Guest info form */}
        <div className="space-y-4">
          <h2 className="font-black text-slate-900 text-lg">Your details</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Full name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Phone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 514 000 0000"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Number of guests</label>
              <select value={guests} onChange={e => setGuests(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Special requests</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
                placeholder="Early check-in, dietary requirements, airport transfer…"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <strong>No payment required now.</strong> A Zeniva agent will contact you within a few hours to confirm availability and process your payment securely.
        </div>

        <button onClick={submit} disabled={loading || !name.trim() || !email.trim()}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 text-white font-black text-base shadow-lg hover:opacity-90 transition disabled:opacity-50">
          {loading ? "Sending reservation…" : `🏡 Request Reservation — $${displayTotal.toLocaleString()}`}
        </button>

        <p className="text-center text-xs text-slate-400">
          🔒 Secure · No credit card now · Zeniva concierge service
        </p>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Loading…</div>}>
      <BookingForm />
    </Suspense>
  );
}
