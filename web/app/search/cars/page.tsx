"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "../../../src/lib/i18n/I18nProvider";
import { normalizePriceLabel } from "../../../src/lib/format";

type Params = {
  pickup?: string;
  dropoff?: string;
  pickupDate?: string;
  dropoffDate?: string;
  age?: string;
};

type CarOffer = {
  id: string;
  provider: "amadeus";
  pickup: string;
  dropoff: string;
  startDate: string;
  endDate: string;
  vehicle?: {
    name?: string;
    category?: string;
    transmission?: string;
    fuel?: string;
    seats?: number;
    doors?: number;
  };
  price?: {
    amount: number;
    currency: string;
  };
};

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

export default function CarsSearchPage({ searchParams }: { searchParams: Params }) {
  const router = useRouter();
  const { locale } = useI18n();

  const today = useMemo(() => isoToday(), []);

  const [pickup, setPickup] = useState(String(searchParams?.pickup || "").trim().toUpperCase());
  const [dropoff, setDropoff] = useState(String(searchParams?.dropoff || "").trim().toUpperCase());
  const [pickupDate, setPickupDate] = useState(String(searchParams?.pickupDate || "").trim());
  const [dropoffDate, setDropoffDate] = useState(String(searchParams?.dropoffDate || "").trim());
  const [age, setAge] = useState(String(searchParams?.age || "30").trim());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offers, setOffers] = useState<CarOffer[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  const summary = useMemo(() => {
    const pickupLabel = pickup || "Pickup";
    const dropoffLabel = dropoff || pickupLabel;
    const datesLabel = pickupDate && dropoffDate ? `${pickupDate} → ${dropoffDate}` : "Choose dates";
    return { pickupLabel, dropoffLabel, datesLabel };
  }, [pickup, dropoff, pickupDate, dropoffDate]);

  const runSearch = async (next?: {
    pickup?: string;
    dropoff?: string;
    pickupDate?: string;
    dropoffDate?: string;
    age?: string;
  }) => {
    const resolvedPickup = String(next?.pickup ?? pickup).trim().toUpperCase();
    const resolvedDropoff = String(next?.dropoff ?? dropoff).trim().toUpperCase();
    const resolvedPickupDate = String(next?.pickupDate ?? pickupDate).trim();
    const resolvedDropoffDate = String(next?.dropoffDate ?? dropoffDate).trim();
    const resolvedAge = String(next?.age ?? age).trim();

    if (!resolvedPickup || resolvedPickup.length < 3 || !resolvedPickupDate || !resolvedDropoffDate) {
      setError("Enter pickup code (IATA/city), pickup date, and dropoff date.");
      setOffers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const qs = new URLSearchParams({
        pickup: resolvedPickup,
        dropoff: resolvedDropoff || resolvedPickup,
        startDate: resolvedPickupDate,
        endDate: resolvedDropoffDate,
      });
      if (resolvedAge) qs.set("age", resolvedAge);

      const res = await fetch(`/api/amadeus/cars/search?${qs.toString()}`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        const msg = String(json?.message || json?.error || "Car search failed");
        throw new Error(msg);
      }

      const nextOffers: CarOffer[] = Array.isArray(json?.offers) ? json.offers : [];
      setOffers(nextOffers);
      setSelectedId(nextOffers[0]?.id || "");
    } catch (e: any) {
      setOffers([]);
      setSelectedId("");
      setError(e?.message || "Car search failed");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (pickup) params.set("pickup", pickup);
    if (dropoff) params.set("dropoff", dropoff);
    if (pickupDate) params.set("pickupDate", pickupDate);
    if (dropoffDate) params.set("dropoffDate", dropoffDate);
    if (age) params.set("age", age);

    router.push(`/search/cars?${params.toString()}`);
    await runSearch();
  };

  const askPrompt = `Find rental cars ${summary.pickupLabel} → ${summary.dropoffLabel} from ${pickupDate || "(pickup date)"} to ${dropoffDate || "(dropoff date)"}. Keep ${selectedId || "the best value option"} selected and propose 2 alternatives.`;

  const selectedOffer = useMemo(() => offers.find((o) => o.id === selectedId) || null, [offers, selectedId]);

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="rounded-2xl bg-white px-5 py-4 shadow-sm border border-slate-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Rental car search</p>
            <h1 className="text-2xl font-black text-slate-900">{summary.pickupLabel} → {summary.dropoffLabel}</h1>
            <p className="text-sm text-slate-600">{summary.datesLabel} · Driver age {age || "30"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">{offers.length} options</span>
            {pickup ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">Pickup {pickup}</span> : null}
          </div>
        </header>

        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4">
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={pickup} onChange={(e) => setPickup(e.target.value.toUpperCase())} placeholder="Pickup code (IATA/city)" className="w-full rounded-2xl bg-slate-50 px-4 py-3" />
            <input value={dropoff} onChange={(e) => setDropoff(e.target.value.toUpperCase())} placeholder="Dropoff code (optional)" className="w-full rounded-2xl bg-slate-50 px-4 py-3" />
            <input value={pickupDate} onChange={(e) => { setPickupDate(e.target.value); if (dropoffDate && e.target.value && dropoffDate < e.target.value) setDropoffDate(""); }} placeholder="Pickup date" className="w-full rounded-2xl bg-slate-50 px-4 py-3" type="date" min={today} />
            <input value={dropoffDate} onChange={(e) => setDropoffDate(e.target.value)} placeholder="Dropoff date" className="w-full rounded-2xl bg-slate-50 px-4 py-3" type="date" min={pickupDate || today} />
            <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="Driver age" className="w-full rounded-2xl bg-slate-50 px-4 py-3" type="number" min={18} max={99} />

            <div className="md:col-span-2 flex flex-wrap justify-end gap-2">
              <Link
                href={`/chat?prompt=${encodeURIComponent(askPrompt)}`}
                className="rounded-full bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-95"
              >
                Ask Lina
              </Link>
              <button
                type="submit"
                className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-900"
              >
                Search cars
              </button>
              <Link
                href="/"
                className="rounded-full border px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                New search
              </Link>
            </div>
          </form>

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">Loading rental cars…</div>
          ) : null}
          {error ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</div>
          ) : null}

          {!loading && !error && offers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-sm text-slate-600">
              Enter your pickup code and dates to see rental car options.
            </div>
          ) : null}

          {offers.length > 0 ? (
            <div className="space-y-3">
              {offers.map((o) => {
                const active = o.id === selectedId;
                const vehicleName = o.vehicle?.name || "Car";
                const details = [o.vehicle?.category, o.vehicle?.transmission, o.vehicle?.fuel, o.vehicle?.seats ? `${o.vehicle.seats} seats` : ""]
                  .filter(Boolean)
                  .join(" • ");
                const priceLabel = o.price?.currency && Number.isFinite(o.price?.amount)
                  ? normalizePriceLabel(`${o.price.currency} ${o.price.amount}`, locale)
                  : "Price on request";

                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setSelectedId(o.id)}
                    className={`w-full rounded-xl border p-3 shadow-sm flex flex-col gap-2 text-left md:flex-row md:items-center md:justify-between ${active ? "border-blue-500 ring-2 ring-blue-100 bg-blue-50" : "border-slate-200 bg-white"}`}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900">{vehicleName}</p>
                      <p className="text-xs text-slate-600">{o.pickup} → {o.dropoff} · {o.startDate} → {o.endDate}</p>
                      {details ? <p className="text-xs text-slate-600">{details}</p> : null}
                    </div>
                    <div className="flex items-center gap-3 md:flex-col md:items-end">
                      <span className="text-lg font-black text-slate-900">{priceLabel}</span>
                      <span className="text-xs text-slate-500">Click to select</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}
        </section>

        {selectedOffer ? (
          <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">Selected car</p>
                <p className="text-xs text-slate-600">Ask Lina to confirm availability, coverage, and payment details.</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/chat?prompt=${encodeURIComponent(`Proceed with rental car ${selectedOffer.vehicle?.name || selectedOffer.id} (${selectedOffer.pickup} to ${selectedOffer.dropoff}, ${selectedOffer.startDate} to ${selectedOffer.endDate}). Confirm pricing, insurance, and booking steps.`)}`}
                  className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-900"
                >
                  Confirm / Book
                </Link>
                <Link
                  href={`/chat?prompt=${encodeURIComponent(askPrompt)}`}
                  className="rounded-full border px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Compare 3
                </Link>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
