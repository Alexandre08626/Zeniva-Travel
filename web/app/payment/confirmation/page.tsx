"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const VPS = "https://vmi3097009.contaboserver.net";
const AUTH = "Bearer zeniva-secret-2025";

function ConfirmationContent() {
  const params = useSearchParams();
  const orderId = params.get("order_id") || params.get("orderId") || "";
  const notified = useRef(false);
  const [bookingRef, setBookingRef] = useState<string>("");

  useEffect(() => {
    if (notified.current) return;
    notified.current = true;

    // Read pending booking from localStorage (saved by payment page before redirect)
    let pending: Record<string, string> = {};
    try {
      const raw = localStorage.getItem("zeniva_pending_booking");
      if (raw) pending = JSON.parse(raw);
    } catch { /* noop */ }

    const clientEmail  = pending.clientEmail  || "";
    const clientName   = pending.clientName   || "";
    const destination  = pending.destination  || "Unknown destination";
    const totalPrice   = parseFloat(pending.totalPrice || "0");
    const travelers    = parseInt(pending.travelers || "1", 10);
    const departure    = pending.departure    || "";
    const returnDate   = pending.returnDate   || "";
    const description  = pending.description  || destination;

    const ref = `ZNV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setBookingRef(ref);

    // 1a — Create booking in Supabase (traveler dashboard)
    fetch("/api/my-bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientEmail: clientEmail,
        clientName: clientName || clientEmail,
        destination,
        departure,
        returnDate,
        travelers,
        totalPrice,
        notes: `ZeniPay payment: ${orderId || ref} | ${description}`,
      }),
    }).catch(() => undefined);

    // 1b — Create booking in VPS (agent dashboard)
    fetch(`${VPS}/admin/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: AUTH },
      body: JSON.stringify({
        client_name: clientName || clientEmail,
        client_email: clientEmail,
        destination,
        departure_date: departure || undefined,
        return_date: returnDate || undefined,
        travelers,
        total_price: totalPrice,
        status: "confirmed",
        notes: `ZeniPay payment: ${orderId || ref} | ${description}`,
      }),
    }).catch(() => undefined);

    // 2 — Push notification to HQ
    fetch("/api/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: AUTH },
      body: JSON.stringify({
        title: "💳 New Booking Confirmed!",
        body: `${clientName || clientEmail} — ${destination} · $${totalPrice.toLocaleString()}`,
        url: "/agent/bookings",
      }),
    }).catch(() => undefined);

    // 3 — Clean up localStorage
    try { localStorage.removeItem("zeniva_pending_booking"); } catch { /* noop */ }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1B4D] to-[#0F6CF5] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-10 text-center">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-[#0B1B4D] mb-2">Booking Confirmed! ✈️</h1>
        <p className="text-gray-500 mb-6">
          Your trip is booked. Lina will send your travel documents and confirmations to your email shortly.
        </p>

        {(orderId || bookingRef) && (
          <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-1">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Booking Reference</p>
            <p className="font-mono text-lg font-black text-[#0B1B4D]">{bookingRef || orderId}</p>
            {orderId && bookingRef && (
              <p className="text-xs text-gray-400">ZeniPay payment: {orderId}</p>
            )}
          </div>
        )}

        {/* Next steps */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left space-y-2">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">What happens next</p>
          {[
            "📧 Confirmation email sent to your inbox",
            "📄 Your documents will appear in My Documents",
            "💬 Chat with Lina if you need anything",
            "🧑‍💼 A Zeniva expert is notified and ready",
          ].map(s => (
            <div key={s} className="flex items-center gap-2 text-sm text-blue-800">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
              {s}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Link href="/documents"
            className="block w-full py-3 px-6 rounded-xl font-black text-white"
            style={{ background: "linear-gradient(135deg, #E6B85A, #C9941F)", color: "#0B1B4D" }}>
            📄 View My Documents →
          </Link>
          <Link href="/chat"
            className="block w-full bg-[#0F6CF5] hover:bg-[#0B5FD8] text-white font-semibold py-3 px-6 rounded-xl transition-colors">
            💬 Chat with Lina
          </Link>
          <Link href="/"
            className="block w-full bg-slate-100 hover:bg-slate-200 text-[#0B1B4D] font-semibold py-3 px-6 rounded-xl transition-colors">
            Back to Home
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Questions? Email us at{" "}
          <a href="mailto:info@zeniva.ca" className="text-[#0F6CF5]">info@zeniva.ca</a>
          {" "}or call{" "}
          <a href="tel:+13322900021" className="text-[#0F6CF5]">+1 (332) 290-0021</a>
        </p>
      </div>
    </div>
  );
}

export default function PaymentConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B1B4D] flex items-center justify-center"><div className="text-white text-xl">Loading…</div></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
