import Link from "next/link";
import { searchDuffelOffers } from "../../../src/lib/duffelClient";

type Params = {
  from?: string;
  to?: string;
  depart?: string;
  ret?: string;
  passengers?: string;
  cabin?: string;
};

type OfferCard = {
  id: string;
  carrier: string;
  code: string;
  duration: string;
  depart: string;
  arrive: string;
  price: string;
  cabin: string;
  stops: string;
  badge?: string;
};

function formatDuration(minutes?: number) {
  if (!minutes && minutes !== 0) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

function mapDuffelOffers(result: any): OfferCard[] {
  const offers = result?.data?.offers || result?.offers || [];
  return offers.map((offer: any, idx: number) => {
    const firstSlice = offer?.slices?.[0];
    const firstSeg = firstSlice?.segments?.[0];
    const lastSeg = firstSlice?.segments?.[firstSlice?.segments?.length - 1];

    const carrier = firstSeg?.marketing_carrier?.name || firstSeg?.operating_carrier?.name || "Airline";
    const code = firstSeg?.marketing_carrier_flight_number || offer?.id || `flight-${idx + 1}`;

    const departTime = firstSeg?.departing_at ? new Date(firstSeg.departing_at).toISOString().slice(11, 16) : "";
    const arriveTime = lastSeg?.arriving_at ? new Date(lastSeg.arriving_at).toISOString().slice(11, 16) : "";

    const duration = formatDuration(firstSlice?.duration_in_minutes) || formatDuration(offer?.total_duration?.minutes);
    const stops = (firstSlice?.segments?.length || 1) === 1 ? "Nonstop" : `${(firstSlice?.segments?.length || 2) - 1} stop`;
    const price = offer?.total_amount && offer?.total_currency ? `${offer.total_currency} ${offer.total_amount}` : "Price on request";

    return {
      id: offer?.id || `offer-${idx}`,
      carrier,
      code,
      duration: duration || "",
      depart: departTime || "",
      arrive: arriveTime || "",
      price,
      cabin: offer?.cabin || offer?.cabin_class || "",
      stops,
      badge: offer?.owner_booking_allowed === false ? "Request" : undefined,
    } as OfferCard;
  });
}

async function loadOffers(params: Params) {
  const { from, to, depart, passengers = "1" } = params;

  if (!from || !to || !depart) {
    return { offers: [], message: "Veuillez saisir origine, destination et date de départ." };
  }

  const body = {
    passengers: Array.from({ length: Number(passengers) || 1 }).map(() => ({ type: "adult" })),
    slices: [
      {
        origin: String(from).toUpperCase(),
        destination: String(to).toUpperCase(),
        departure_date: depart,
      },
    ],
  };

  try {
    const result = await searchDuffelOffers(body);
    const offers = mapDuffelOffers(result);
    const message = offers.length === 0 ? "Aucune offre trouvée (Duffel)." : undefined;
    return { offers, message };
  } catch (err: any) {
    return { offers: [], message: `Erreur Duffel: ${err?.message || String(err)}` };
  }
}

export default async function FlightsSearchPage({ searchParams }: { searchParams: Params | Promise<Params> }) {
  const resolved = searchParams && typeof (searchParams as any)?.then === "function" ? await searchParams : (searchParams as Params) || {};

  const { from = "", to = "", depart = "", ret = "", passengers = "2", cabin = "Economy" } = resolved;
  const routeLabel = [from || "Origin", to || "Destination"].join(" → ");
  const paxLabel = `${passengers} pax${cabin ? ` · ${cabin}` : ""}`;
  const datesLabel = ret ? `${depart || "Date"} → ${ret}` : depart || "Select dates";
  const askPrompt = `Find me the best flight options ${from ? `from ${from} ` : ""}${to ? `to ${to} ` : ""}${depart ? `departing ${depart} ` : ""}${ret ? `returning ${ret} ` : ""}for ${passengers} pax${cabin ? ` in ${cabin}` : ""}. Give nonstop first, then best value.`.trim();

  const { offers, message } = await loadOffers(resolved || {});

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="rounded-2xl bg-white px-5 py-4 shadow-sm border border-slate-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Flights search</p>
            <h1 className="text-2xl font-black text-slate-900">{routeLabel}</h1>
            <p className="text-sm text-slate-600">{datesLabel} · {paxLabel}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ret === "" && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">One-way</span>}
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Showing {offers.length} options</span>
          </div>
        </header>

        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-800">Sort: Best</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-800">Filters: Nonstop, Carry-on</span>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/chat?prompt=${encodeURIComponent(askPrompt)}`}
                className="rounded-full bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-95"
              >
                Ask Lina
              </Link>
              <Link
                href="/"
                className="rounded-full border px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                New search
              </Link>
            </div>
          </div>

          {message && <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">{message}</div>}

          <div className="space-y-3">
            {offers.map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-800">
                    {r.carrier[0] || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{r.carrier} · {r.code}</p>
                    <p className="text-xl font-black text-slate-900">{r.depart} → {r.arrive}</p>
                    <p className="text-sm text-slate-600">{r.duration} · {r.stops} · {r.cabin}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:flex-col md:items-end">
                  <span className="text-lg font-black text-slate-900">{r.price}</span>
                  <div className="flex items-center gap-2">
                    {r.badge && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">{r.badge}</span>}
                    <button className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-900">Hold / Book</button>
                  </div>
                </div>
              </div>
            ))}

            {offers.length === 0 && !message && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">No offers returned.</div>
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Search context</p>
            <span className="text-xs text-slate-500">Visible to agents only</span>
          </div>
          <pre className="text-xs bg-slate-50 p-3 rounded border border-slate-100 overflow-x-auto">{JSON.stringify(searchParams, null, 2)}</pre>
        </section>
      </div>
    </main>
  );
}
