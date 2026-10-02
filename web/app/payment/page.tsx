"use client";
import React, { Suspense, useState } from "react";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import { LIGHT_BG, TITLE_TEXT, MUTED_TEXT } from "../../src/design/tokens";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "../../src/lib/authStore";
import ZeniPayButton from "../../src/components/ZeniPayButton.client";

// "USD 492.50", "$1,234", "2345.28" → number (NaN when there is no price).
const parseAmount = (v: string | null) => {
  const n = parseFloat(String(v || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : NaN;
};

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("type");
  const isFlight = mode === "flight";
  // /rentals/[id] sends type=villa: same summary as a ZeniStay residence.
  const isResidence = mode === "residence" || mode === "villa";
  const residenceName = searchParams.get("residence") || searchParams.get("name") || "ZeniStay Property";
  const residenceNights = parseInt(searchParams.get("nights") || "7", 10);
  const residenceTotal = parseAmount(searchParams.get("total"));
  const residenceCheckin = searchParams.get("checkin") || "";
  const residenceCheckout = searchParams.get("checkout") || "";
  const residencePricePerNight = parseAmount(searchParams.get("price"));
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
  // No invented default (it used to charge 1 700 $ + 255 $ + 68 $ when the price was missing or unparsable).
  const rawTotal = isResidence ? residenceTotal : isFlight ? parseAmount(flightPrice) : parseAmount(priceParam);
  const hasPrice = Number.isFinite(rawTotal) && rawTotal > 0;
  const baseRate = hasPrice ? rawTotal : 0;
  const residenceStay = isResidence && Number.isFinite(residencePricePerNight) ? residenceNights * residencePricePerNight : 0;
  const residenceFees = hasPrice && residenceStay > 0 && rawTotal > residenceStay ? rawTotal - residenceStay : 0;

  // ── Promo code ──────────────────────────────────────────────────────────
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const VALID_PROMOS: Record<string, number> = { "WELCOME15": 0.15, "ZENIVA15": 0.15, "LINA15": 0.15 };
  const discount = hasPrice && promoApplied && VALID_PROMOS[promoCode.toUpperCase()] ? rawTotal * VALID_PROMOS[promoCode.toUpperCase()] : 0;
  const totalDue = hasPrice ? Math.round((rawTotal - discount) * 100) / 100 : 0;

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (VALID_PROMOS[code]) {
      setPromoApplied(true);
      setPromoError("");
    } else {
      setPromoError("Invalid promo code.");
      setPromoApplied(false);
    }
  };

  const formatMoney = (value: number) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

  const user = useAuthStore((s) => s.user);
  const [traveler, setTraveler] = useState({ firstName: "", lastName: "", email: user?.email || "", phone: "" });
  const travelerName = `${traveler.firstName} ${traveler.lastName}`.trim();
  const travelerReady = Boolean(traveler.firstName.trim() && traveler.lastName.trim() && /\S+@\S+\.\S+/.test(traveler.email));

  const payDescription = isFlight
    ? `Zeniva flight · ${flightCarrier} ${flightCode} · ${flightRoute} · ${flightDates}`
    : isResidence
    ? `ZeniStay · ${residenceName} · ${residenceCheckin && residenceCheckout ? `${residenceCheckin} → ${residenceCheckout}` : `${residenceNights} nights`}`
    : `ZeniYacht · ${yachtParam}${Number.isFinite(hours) ? ` · ${hours}h` : ""}`;

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
              <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="First name" autoComplete="given-name" value={traveler.firstName} onChange={(e) => setTraveler((t) => ({ ...t, firstName: e.target.value }))} />
              <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Last name" autoComplete="family-name" value={traveler.lastName} onChange={(e) => setTraveler((t) => ({ ...t, lastName: e.target.value }))} />
              <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Email" type="email" autoComplete="email" value={traveler.email} onChange={(e) => setTraveler((t) => ({ ...t, email: e.target.value }))} />
              <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Phone" type="tel" autoComplete="tel" value={traveler.phone} onChange={(e) => setTraveler((t) => ({ ...t, phone: e.target.value }))} />
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
            {hasPrice ? (
              <ZeniPayButton
                amount={totalDue}
                description={payDescription}
                customerName={travelerName}
                customerEmail={traveler.email.trim()}
                customerPhone={traveler.phone.trim()}
                disabled={!travelerReady}
              />
            ) : (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                Price on request — contact our concierge at <a className="underline" href="mailto:info@zeniva.ca">info@zeniva.ca</a> and we will send you a secure payment link.
              </div>
            )}
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
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">ZeniStay · Zeniva</div>
                {residenceStay > 0 && (
                  <div className="flex justify-between"><span>{residenceNights} nights × {formatMoney(residencePricePerNight)}/night</span><span>{formatMoney(residenceStay)}</span></div>
                )}
                {residenceFees > 0 && (
                  <div className="flex justify-between"><span>Cleaning & service fees</span><span>{formatMoney(residenceFees)}</span></div>
                )}
              </div>
              <div className="border-t border-slate-200 pt-3 space-y-2 text-sm text-slate-700 mt-2">
                {discount > 0 && <div className="flex justify-between font-semibold" style={{ color: "#10b981" }}><span>🎁 Promo ({promoCode.toUpperCase()})</span><span>-{formatMoney(discount)}</span></div>}
                <div className="flex justify-between font-bold text-slate-900 text-base"><span>Total due</span><span>{hasPrice ? formatMoney(totalDue) : "On request"}</span></div>
              </div>
              {/* Promo code */}
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed #e2e8f0" }}>
                {!promoApplied ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="text" value={promoCode} onChange={e => { setPromoCode(e.target.value); setPromoError(""); }}
                      placeholder="Promo code"
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
                <div className="flex justify-between"><span>Fare (all passengers)</span><span>{flightPrice}</span></div>
                <div className="flex justify-between font-bold text-slate-900"><span>Total due</span><span>{hasPrice ? formatMoney(totalDue) : "On request"}</span></div>
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
                <div className="flex justify-between"><span>Charter rate</span><span>{hasPrice ? formatMoney(baseRate) : "On request"}</span></div>
                {discount > 0 && <div className="flex justify-between font-semibold" style={{ color: "#10b981" }}><span>🎁 Promo ({promoCode.toUpperCase()})</span><span>-{formatMoney(discount)}</span></div>}
                <div className="flex justify-between font-bold text-slate-900"><span>Total due</span><span>{hasPrice ? formatMoney(totalDue) : "On request"}</span></div>
                {/* Promo code field */}
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed #e2e8f0" }}>
                  {!promoApplied ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="text" value={promoCode} onChange={e => { setPromoCode(e.target.value); setPromoError(""); }}
                        placeholder="Promo code"
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
        ) : isResidence ? (
          <button type="button" onClick={() => router.back()} className="underline">Back</button>
        ) : (
          <Link href="/zeniyacht" className="underline">Back to yachts</Link>
        )}
        <span>Payments secured by ZeniPay.</span>
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
