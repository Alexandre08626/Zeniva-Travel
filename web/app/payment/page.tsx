"use client";
import React, { Suspense, useState } from "react";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import { LIGHT_BG, TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE } from "../../src/design/tokens";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "../../src/lib/authStore";
import { getDocumentsForUser, upsertDocuments } from "../../src/lib/documentsStore";
import { useTripsStore, createTrip } from "../../lib/store/tripsStore";
import { getStoredReferral } from "../../src/lib/influencer";
import ZeniPayButton from "../../src/components/ZeniPayButton.client";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("type");
  const isFlight = mode === "flight";
  const isResidence = mode === "residence";
  const residenceName = searchParams.get("residence") || "ZeniStay Property";
  const residenceNights = parseInt(searchParams.get("nights") || "7", 10);
  const residenceTotal = parseFloat(searchParams.get("total") || "0");
  const residenceCheckin = searchParams.get("checkin") || "";
  const residenceCheckout = searchParams.get("checkout") || "";
  const residencePricePerNight = parseFloat(searchParams.get("price") || "0");
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

  const baseRate = isResidence ? residenceTotal : (hasCustomPrice ? (price as number) : 1700);
  const gratuity = (isResidence || hasCustomPrice) ? 0 : 255;
  const taxes = (isResidence || hasCustomPrice) ? 0 : 68;
  const rawTotal = isResidence ? residenceTotal : (hasCustomPrice ? baseRate : baseRate + gratuity + taxes);

  // ── Promo code ──────────────────────────────────────────────────────────
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const VALID_PROMOS: Record<string, number> = { "WELCOME15": 0.15, "ZENIVA15": 0.15, "LINA15": 0.15 };
  const discount = promoApplied && VALID_PROMOS[promoCode.toUpperCase()] ? rawTotal * VALID_PROMOS[promoCode.toUpperCase()] : 0;
  const totalDue = rawTotal - discount;

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (VALID_PROMOS[code]) {
      setPromoApplied(true);
      setPromoError("");
    } else {
      setPromoError("Invalid promo code. Try WELCOME15.");
      setPromoApplied(false);
    }
  };

  const bookingType = isFlight ? "zeniva_managed" : isResidence ? "residence" : "yacht";

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

    const referral = getStoredReferral();
    if (referral && userId) {
      fetch("/api/influencer/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: tripId,
          travelerEmail: userId,
          amount: totalDue,
          currency: "USD",
          bookingDate: new Date().toISOString(),
          bookingType,
        }),
      }).catch(() => undefined);
    }

    router.push(`/test/duffel-stays/confirmation?docId=${encodeURIComponent(docId)}`);
  };

  return (
    <div className="rounded-[20px] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: TITLE_TEXT }}>{isFlight ? "Flight checkout" : isResidence ? `🏡 ${residenceName}` : "Checkout"}</h1>
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

          <div className="rounded-xl border border-slate-200 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">Payment method</h2>
              <span className="text-xs font-semibold text-slate-500">🔒 Secured by ZeniPay</span>
            </div>
            <p className="text-sm text-slate-600">
              Click below to proceed to our secure payment page. You can pay by Visa, Mastercard, Amex, or Apple Pay.
            </p>
            <ZeniPayButton amount={totalDue} />
            <p className="text-xs text-slate-400 text-center">
              After payment, you will receive an email confirmation with your booking details.
            </p>
          </div>
        </section>

        <aside className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50">
          <h2 className="text-sm font-semibold text-slate-700">Booking summary</h2>
          {isResidence ? (
            <>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl">🏡</span>
                <div className="text-base font-bold" style={{ color: TITLE_TEXT }}>{residenceName}</div>
              </div>
              <div className="text-sm text-slate-600 mt-1">
                {residenceCheckin && residenceCheckout ? `${residenceCheckin} → ${residenceCheckout}` : `${residenceNights} nights`}
              </div>
              <div className="rounded-lg bg-white border border-slate-200 p-3 text-sm text-slate-700 space-y-1 mt-3">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">ZeniStay · Zeniva Travel</div>
                {residencePricePerNight > 0 && (
                  <div className="flex justify-between"><span>{residenceNights} nights × ${residencePricePerNight.toLocaleString()}/night</span><span>${(residenceNights * residencePricePerNight).toLocaleString()}</span></div>
                )}
                <div className="flex justify-between"><span>Cleaning fee</span><span>$285</span></div>
                <div className="flex justify-between"><span>Zeniva concierge</span><span>$120</span></div>
                <div className="flex justify-between"><span>Taxes (6%)</span><span>${Math.round(residenceNights * residencePricePerNight * 0.06).toLocaleString()}</span></div>
              </div>
              <div className="border-t border-slate-200 pt-3 space-y-2 text-sm text-slate-700 mt-2">
                {discount > 0 && <div className="flex justify-between font-semibold" style={{ color: "#10b981" }}><span>🎁 Promo ({promoCode.toUpperCase()})</span><span>-{formatMoney(discount)}</span></div>}
                <div className="flex justify-between font-bold text-slate-900 text-base"><span>Total due</span><span>{formatMoney(totalDue)}</span></div>
              </div>
              {/* Promo code */}
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed #e2e8f0" }}>
                {!promoApplied ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="text" value={promoCode} onChange={e => { setPromoCode(e.target.value); setPromoError(""); }}
                      placeholder="Promo code (ex: WELCOME15)"
                      style={{ flex: 1, border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "8px 12px", fontSize: 13, outline: "none", color: "#0B1B4D" }} />
                    <button onClick={applyPromo}
                      style={{ background: "#0F6CF5", color: "white", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                      Apply
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#10b981", fontSize: 13, fontWeight: 700 }}>
                    <span>✅ 15% discount applied!</span>
                    <button onClick={() => { setPromoApplied(false); setPromoCode(""); }}
                      style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 12 }}>Remove</button>
                  </div>
                )}
                {promoError && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{promoError}</div>}
              </div>
            </>
          ) : isFlight ? (
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
                {discount > 0 && <div className="flex justify-between font-semibold" style={{ color: "#10b981" }}><span>🎁 Promo ({promoCode.toUpperCase()})</span><span>-{formatMoney(discount)}</span></div>}
                <div className="flex justify-between font-bold text-slate-900"><span>Total due</span><span>{formatMoney(totalDue)}</span></div>
                {/* Promo code field */}
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed #e2e8f0" }}>
                  {!promoApplied ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="text" value={promoCode} onChange={e => { setPromoCode(e.target.value); setPromoError(""); }}
                        placeholder="Promo code (ex: WELCOME15)"
                        style={{ flex: 1, border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "8px 12px", fontSize: 13, outline: "none", color: "#0B1B4D" }} />
                      <button onClick={applyPromo}
                        style={{ background: "#0F6CF5", color: "white", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                        Apply
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#10b981", fontSize: 13, fontWeight: 700 }}>
                      <span>✅ 15% discount applied!</span>
                      <button onClick={() => { setPromoApplied(false); setPromoCode(""); }}
                        style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 12 }}>Remove</button>
                    </div>
                  )}
                  {promoError && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{promoError}</div>}
                </div>
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
