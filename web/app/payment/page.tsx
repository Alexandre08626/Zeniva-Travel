"use client";
import React, { Suspense } from "react";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import { LIGHT_BG, TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE } from "../../src/design/tokens";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "../../src/lib/authStore";
import { getDocumentsForUser, upsertDocuments } from "../../src/lib/documentsStore";
import { useTripsStore, createTrip } from "../../lib/store/tripsStore";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("type");
  const isFlight = mode === "flight";
  const yachtParam = searchParams.get("yacht") || "Yacht charter";
  const hoursParam = searchParams.get("hours");
  const priceParam = searchParams.get("price");
  const noteParam = searchParams.get("note");

  const flightCarrier = searchParams.get("carrier") || "Airline";
  const flightCode = searchParams.get("code") || "Flight";
  const flightDepart = searchParams.get("depart") || "";
  const flightArrive = searchParams.get("arrive") || "";
  const flightDuration = searchParams.get("duration") || "";
  const flightStops = searchParams.get("stops") || "";
  const flightCabin = searchParams.get("cabin") || "";
  const flightPrice = searchParams.get("price") || "Price on request";
  const flightFrom = searchParams.get("from") || "";
  const flightTo = searchParams.get("to") || "";
  const flightDepartDate = searchParams.get("departDate") || "";
  const flightReturnDate = searchParams.get("returnDate") || "";
  const flightPassengers = searchParams.get("passengers") || "";

  const flightRoute = [flightFrom || "Origin", flightTo || "Destination"].join(" → ");
  const flightDates = flightReturnDate ? `${flightDepartDate || "Date"} → ${flightReturnDate}` : flightDepartDate || "Date";

  const hours = hoursParam ? Number.parseInt(hoursParam, 10) : NaN;
  const price = priceParam ? Number.parseInt(priceParam, 10) : NaN;
  const hasCustomPrice = Number.isFinite(price);

  const baseRate = hasCustomPrice ? (price as number) : 1700;
  const gratuity = hasCustomPrice ? 0 : 255;
  const taxes = hasCustomPrice ? 0 : 68;
  const totalDue = hasCustomPrice ? baseRate : baseRate + gratuity + taxes;

  const formatMoney = (value: number) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

  const user = useAuthStore((s) => s.user);
  const userId = user?.email || "";
  const { trips } = useTripsStore((s) => ({ trips: s.trips }));

  const handlePayment = () => {
    const now = new Date().toISOString();
    const docId = `payment-${Date.now()}`;
    const confirmationNumber = `ZNV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const tripId = trips[0]?.id || createTrip({
      title: isFlight ? "Flight booking" : "Booking",
      destination: flightTo || "",
      dates: flightDates || "",
      travelers: flightPassengers || "",
    });

    if (userId) {
      const existing = (getDocumentsForUser(userId) || {})[tripId] || [];
      upsertDocuments(userId, tripId, [{
        id: docId,
        tripId,
        userId,
        type: "confirmation",
        title: isFlight ? `Flight confirmation (${flightCarrier} ${flightCode})` : "Payment confirmation",
        provider: "Duffel",
        confirmationNumber,
        url: `/test/duffel-stays/confirmation?docId=${encodeURIComponent(docId)}`,
        updatedAt: now,
        details: JSON.stringify({ booking_reference: confirmationNumber, status: "confirmed" }),
      }, ...existing]);
    }

    router.push(`/test/duffel-stays/confirmation?docId=${encodeURIComponent(docId)}`);
  };

  return (
    <div className="rounded-[20px] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: TITLE_TEXT }}>{isFlight ? "Flight checkout" : "Checkout"}</h1>
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
            <button
              className="w-full rounded-full px-6 py-3 font-extrabold text-white"
              style={{ backgroundColor: PREMIUM_BLUE }}
              onClick={handlePayment}
            >
              Pay securely
            </button>
            <p className="text-xs text-slate-500">You will receive an email confirmation with invoice and charter details.</p>
          </div>
        </section>

        <aside className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50">
          <h2 className="text-sm font-semibold text-slate-700">Booking summary</h2>
          {isFlight ? (
            <>
              <div className="text-base font-bold" style={{ color: TITLE_TEXT }}>{flightRoute}</div>
              <div className="text-sm text-slate-600">{flightDates}{flightPassengers ? ` · ${flightPassengers} pax` : ""}{flightCabin ? ` · ${flightCabin}` : ""}</div>
              <div className="rounded-lg bg-white border border-slate-200 p-3 text-sm text-slate-700 space-y-1">
                <div className="font-semibold">{flightCarrier} · {flightCode}</div>
                <div>{flightDepart} → {flightArrive}</div>
                <div>{flightDuration}{flightStops ? ` · ${flightStops}` : ""}</div>
              </div>
              <div className="border-t border-slate-200 pt-3 space-y-2 text-sm text-slate-700">
                <div className="flex justify-between"><span>Fare</span><span>{flightPrice}</span></div>
                <div className="flex justify-between font-bold text-slate-900"><span>Total due</span><span>{flightPrice}</span></div>
              </div>
            </>
          ) : (
            <>
              <div className="text-base font-bold" style={{ color: TITLE_TEXT }}>{yachtParam}</div>
              <div className="text-sm text-slate-600">
                {Number.isFinite(hours) ? `${hours}h` : "Duration"}
                {noteParam ? ` · ${noteParam}` : ""}
              </div>
              <div className="border-t border-slate-200 pt-3 space-y-2 text-sm text-slate-700">
                <div className="flex justify-between"><span>Base rate</span><span>{formatMoney(baseRate)}</span></div>
                <div className="flex justify-between"><span>Gratuity</span><span>{formatMoney(gratuity)}</span></div>
                <div className="flex justify-between"><span>Taxes & fees</span><span>{formatMoney(taxes)}</span></div>
                <div className="flex justify-between font-bold text-slate-900"><span>Total due</span><span>{formatMoney(totalDue)}</span></div>
              </div>
              <div className="rounded-lg bg-white border border-slate-200 p-3 text-xs text-slate-600">
                Need changes? Contact concierge before paying. Funds are held until charter confirmation.
              </div>
            </>
          )}
        </aside>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
        {isFlight ? (
          <Link
            href={`/search/flights?${new URLSearchParams({
              from: flightFrom,
              to: flightTo,
              depart: flightDepartDate,
              ret: flightReturnDate,
              passengers: flightPassengers,
              cabin: flightCabin,
            }).toString()}`}
            className="underline"
          >
            Back to flights
          </Link>
        ) : (
          <Link href="/yachts" className="underline">Back to yachts</Link>
        )}
        <span>Payments secured by your provider (Stripe recommended).</span>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      <div className="mx-auto max-w-[900px] px-5 pb-12 pt-6">
        <Header isLoggedIn={false} />
        <Suspense fallback={<div className="rounded-[20px] border border-slate-100 bg-white p-6 shadow-sm">Loading checkout...</div>}>
          <PaymentContent />
        </Suspense>
        <Footer />
      </div>
    </main>
  );
}
