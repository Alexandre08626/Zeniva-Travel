import Link from "next/link";
import { searchDuffelOffers } from "../../../src/lib/duffelClient";
import FlightOffers from '../../../src/components/FlightOffers.client';
import { applyFlightMarkupLabel } from "../../../src/lib/partnerMarkup";

type Params = {
  trip?: string;
  from?: string;
  to?: string;
  depart?: string;
  ret?: string;
  passengers?: string;
  cabin?: string;
  direct?: string;
  minPrice?: string;
  maxStops?: string;
  maxPrice?: string;
  airline?: string;
  airlines?: string | string[];
  depWindow?: string | string[];
  arrWindow?: string | string[];
  maxDuration?: string;
  departAfter?: string;
  departBefore?: string;
  sort?: string;
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
  carrierCode?: string;
  carrierLogo?: string;
  badge?: string;
  slices?: Array<{
    origin?: { code?: string; name?: string };
    destination?: { code?: string; name?: string };
    departingAt?: string;
    arrivingAt?: string;
    durationMinutes?: number;
    segments: Array<{
      marketingCarrier?: string;
      operatingCarrier?: string;
      marketingCarrierCode?: string;
      operatingCarrierCode?: string;
      marketingFlightNumber?: string;
      operatingFlightNumber?: string;
      departingAt?: string;
      arrivingAt?: string;
      origin?: { code?: string; name?: string };
      destination?: { code?: string; name?: string };
      aircraft?: string;
      cabin?: string;
      distanceKm?: number;
      amenities?: string[];
    }>;
  }>;
};

function getAirlineLogo(code?: string) {
  if (!code) return "";
  return `https://images.kiwi.com/airlines/64/${code.toUpperCase()}.png`;
}

function normalizeAirlines(value?: string | string[]) {
  if (!value) return [] as string[];
  const raw = Array.isArray(value) ? value : [value];
  return raw
    .flatMap((entry) => String(entry).split(","))
    .map((entry) => entry.trim().toUpperCase())
    .filter(Boolean);
}

function normalizeMulti(value?: string | string[]) {
  if (!value) return [] as string[];
  const raw = Array.isArray(value) ? value : [value];
  return raw
    .flatMap((entry) => String(entry).split(","))
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

function parsePriceToNumber(price: string) {
  const raw = String(price || "").trim();
  if (!raw) return Number.NaN;
  const normalized = raw.replace(/[^0-9.,]/g, "").replace(/,/g, "");
  if (!normalized) return Number.NaN;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function getStopsCount(stops: string) {
  if (!stops) return 0;
  if (/nonstop/i.test(stops)) return 0;
  const match = stops.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function toMinutes(time: string) {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function durationToMinutes(duration: string) {
  if (!duration) return Number.POSITIVE_INFINITY;
  const h = Number((duration.match(/(\d+)h/) || [])[1] || 0);
  const m = Number((duration.match(/(\d+)m/) || [])[1] || 0);
  return h * 60 + m;
}

function getTimeWindow(minutes: number | null) {
  if (minutes === null) return "";
  if (minutes < 6 * 60) return "night";
  if (minutes < 12 * 60) return "morning";
  if (minutes < 18 * 60) return "afternoon";
  return "evening";
}

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
    const carrierCode = firstSeg?.marketing_carrier?.iata_code || firstSeg?.operating_carrier?.iata_code || "";
    const code = firstSeg?.marketing_carrier_flight_number || offer?.id || `flight-${idx + 1}`;

    const departTime = firstSeg?.departing_at ? new Date(firstSeg.departing_at).toISOString().slice(11, 16) : "";
    const arriveTime = lastSeg?.arriving_at ? new Date(lastSeg.arriving_at).toISOString().slice(11, 16) : "";

    const duration = formatDuration(firstSlice?.duration_in_minutes) || formatDuration(offer?.total_duration?.minutes);
    const stops = (firstSlice?.segments?.length || 1) === 1 ? "Nonstop" : `${(firstSlice?.segments?.length || 2) - 1} stop`;
    const rawPrice = offer?.total_amount ? `USD ${offer.total_amount}` : "Price on request";
    const price = rawPrice === "Price on request" ? rawPrice : applyFlightMarkupLabel(rawPrice);

    const slices = Array.isArray(offer?.slices)
      ? offer.slices.map((slice: any) => {
          const segmentsRaw = Array.isArray(slice?.segments) ? slice.segments : [];
          const sliceFirstSeg = segmentsRaw[0];
          const sliceLastSeg = segmentsRaw[segmentsRaw.length - 1];
          return {
            origin: {
              code: sliceFirstSeg?.origin?.iata_code || slice?.origin?.iata_code,
              name: sliceFirstSeg?.origin?.iata_city_name || sliceFirstSeg?.origin?.name || sliceFirstSeg?.origin?.iata_code,
            },
            destination: {
              code: sliceLastSeg?.destination?.iata_code || slice?.destination?.iata_code,
              name: sliceLastSeg?.destination?.iata_city_name || sliceLastSeg?.destination?.name || sliceLastSeg?.destination?.iata_code,
            },
            departingAt: sliceFirstSeg?.departing_at,
            arrivingAt: sliceLastSeg?.arriving_at,
            durationMinutes: typeof slice?.duration_in_minutes === "number" ? slice.duration_in_minutes : undefined,
            segments: segmentsRaw.map((seg: any) => ({
              marketingCarrier: seg?.marketing_carrier?.name,
              operatingCarrier: seg?.operating_carrier?.name,
              marketingCarrierCode: seg?.marketing_carrier?.iata_code,
              operatingCarrierCode: seg?.operating_carrier?.iata_code,
              marketingFlightNumber: seg?.marketing_carrier_flight_number,
              operatingFlightNumber: seg?.operating_carrier_flight_number,
              departingAt: seg?.departing_at,
              arrivingAt: seg?.arriving_at,
              origin: {
                code: seg?.origin?.iata_code,
                name: seg?.origin?.iata_city_name || seg?.origin?.name || seg?.origin?.iata_code,
              },
              destination: {
                code: seg?.destination?.iata_code,
                name: seg?.destination?.iata_city_name || seg?.destination?.name || seg?.destination?.iata_code,
              },
              aircraft: seg?.aircraft?.name || seg?.aircraft?.iata_code,
              cabin: offer?.cabin || offer?.cabin_class || seg?.cabin_class,
              distanceKm: typeof seg?.distance_in_kilometers === "number" ? seg.distance_in_kilometers : undefined,
              amenities: Array.isArray(seg?.passenger_amenities)
                ? seg.passenger_amenities
                    .map((a: any) => a?.type || a?.name)
                    .filter((x: any) => typeof x === "string" && x.trim())
                : undefined,
            })),
          };
        })
      : undefined;

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
      carrierCode,
      carrierLogo: getAirlineLogo(carrierCode),
      badge: offer?.owner_booking_allowed === false ? "Request" : undefined,
      slices,
    } as OfferCard;
  });
}

async function loadOffers(params: Params) {
  const { from, to, depart, ret, passengers = "1", trip = "roundtrip", cabin = "Economy" } = params;

  if (!from || !to || !depart) {
    return { offers: [], message: "Veuillez saisir origine, destination et date de départ." };
  }

  const slices: any[] = [
    {
      origin: String(from).toUpperCase(),
      destination: String(to).toUpperCase(),
      departure_date: depart,
    },
  ];

  // Add return slice for round-trip searches
  if (trip !== "oneway" && ret) {
    slices.push({
      origin: String(to).toUpperCase(),
      destination: String(from).toUpperCase(),
      departure_date: ret,
    });
  }

  const cabinMap: Record<string, string> = {
    "economy": "economy",
    "premium economy": "premium_economy",
    "business": "business",
    "first": "first",
  };
  const requestedCabin = cabinMap[String(cabin || "").toLowerCase()];

  const body = {
    passengers: Array.from({ length: Number(passengers) || 1 }).map(() => ({ type: "adult" })),
    slices,
    ...(requestedCabin ? { cabin_class: requestedCabin } : {}),
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

  const {
    trip = "roundtrip",
    from = "",
    to = "",
    depart = "",
    ret = "",
    passengers = "2",
    cabin = "Economy",
    direct = "",
    minPrice = "",
    maxStops = "",
    maxPrice = "",
    airline = "",
    airlines,
    depWindow,
    arrWindow,
    maxDuration = "",
    departAfter = "",
    departBefore = "",
    sort = "best",
  } = resolved;
  const selectedAirlines = normalizeAirlines(airlines);
  const selectedDepartureWindows = normalizeMulti(depWindow);
  const selectedArrivalWindows = normalizeMulti(arrWindow);
  const routeLabel = [from || "Origin", to || "Destination"].join(" → ");
  const paxLabel = `${passengers} pax${cabin ? ` · ${cabin}` : ""}`;
  const isRoundTrip = trip !== "oneway" && !!ret;
  const datesLabel = isRoundTrip ? `${depart || "Date"} → ${ret}` : depart || "Select dates";
  const askPrompt = `Find me the best flight options ${from ? `from ${from} ` : ""}${to ? `to ${to} ` : ""}${depart ? `departing ${depart} ` : ""}${ret ? `returning ${ret} ` : ""}for ${passengers} pax${cabin ? ` in ${cabin}` : ""}. Give nonstop first, then best value.`.trim();

  const { offers, message } = await loadOffers(resolved || {});

  const filteredOffers = offers
    .filter((offer) => {
      if (direct === "1" && getStopsCount(offer.stops) > 0) return false;
      if (maxStops && Number.isFinite(Number(maxStops)) && getStopsCount(offer.stops) > Number(maxStops)) return false;
      if (minPrice && Number.isFinite(Number(minPrice))) {
        const numericPrice = parsePriceToNumber(offer.price);
        if (Number.isFinite(numericPrice) && numericPrice < Number(minPrice)) return false;
      }
      if (maxPrice && Number.isFinite(Number(maxPrice))) {
        const numericPrice = parsePriceToNumber(offer.price);
        if (Number.isFinite(numericPrice) && numericPrice > Number(maxPrice)) return false;
      }
      if (maxDuration && Number.isFinite(Number(maxDuration))) {
        const durationMins = durationToMinutes(offer.duration);
        if (Number.isFinite(durationMins) && durationMins > Number(maxDuration) * 60) return false;
      }
      if (cabin && offer.cabin && String(offer.cabin).toLowerCase() !== String(cabin).toLowerCase()) return false;
      if (selectedAirlines.length > 0 && !selectedAirlines.includes((offer.carrierCode || "").toUpperCase())) return false;
      if (airline && !offer.carrier.toLowerCase().includes(airline.toLowerCase().trim())) return false;
      if (departAfter || departBefore) {
        const dep = toMinutes(offer.depart);
        const after = toMinutes(departAfter);
        const before = toMinutes(departBefore);
        if (dep !== null && after !== null && dep < after) return false;
        if (dep !== null && before !== null && dep > before) return false;
      }
      if (selectedDepartureWindows.length > 0) {
        const depWindow = getTimeWindow(toMinutes(offer.depart));
        if (!depWindow || !selectedDepartureWindows.includes(depWindow)) return false;
      }
      if (selectedArrivalWindows.length > 0) {
        const arrWindow = getTimeWindow(toMinutes(offer.arrive));
        if (!arrWindow || !selectedArrivalWindows.includes(arrWindow)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === "price") return parsePriceToNumber(a.price) - parsePriceToNumber(b.price);
      if (sort === "duration") return durationToMinutes(a.duration) - durationToMinutes(b.duration);
      if (sort === "depart") return (toMinutes(a.depart) ?? 0) - (toMinutes(b.depart) ?? 0);
      if (sort === "arrive") return (toMinutes(a.arrive) ?? 0) - (toMinutes(b.arrive) ?? 0);
      return 0;
    });

  const carrierSuggestions = Array.from(new Set(offers.map((offer) => offer.carrier).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  const carrierOptions = Array.from(
    new Map(
      offers
        .filter((offer) => offer.carrier && offer.carrierCode)
        .map((offer) => [offer.carrierCode as string, { code: offer.carrierCode as string, name: offer.carrier, logo: offer.carrierLogo || getAirlineLogo(offer.carrierCode) }])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));
  const numericPrices = filteredOffers
    .map((offer) => parsePriceToNumber(offer.price))
    .filter((price) => Number.isFinite(price));
  const minVisiblePrice = numericPrices.length ? Math.min(...numericPrices) : null;
  const maxVisiblePrice = numericPrices.length ? Math.max(...numericPrices) : null;
  const nonstopCount = filteredOffers.filter((offer) => getStopsCount(offer.stops) === 0).length;

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)] gap-4 items-start">
        <aside className="md:sticky md:top-6 rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Zeniva Travel</p>
            <h2 className="text-lg font-black text-slate-900">Flight filters</h2>
            <p className="text-xs text-slate-500 mt-1">{filteredOffers.length} results · {nonstopCount} nonstop</p>
            {minVisiblePrice !== null && maxVisiblePrice !== null && (
              <p className="text-xs text-slate-500">USD {minVisiblePrice.toFixed(0)} - USD {maxVisiblePrice.toFixed(0)}</p>
            )}
          </div>

          <form action="/search/flights" method="GET" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <label className={`rounded-lg border px-3 py-2 text-sm font-semibold cursor-pointer ${trip === "oneway" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-700"}`}>
                <input type="radio" name="trip" value="oneway" defaultChecked={trip === "oneway"} className="mr-2" />
                One-way
              </label>
              <label className={`rounded-lg border px-3 py-2 text-sm font-semibold cursor-pointer ${trip !== "oneway" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-700"}`}>
                <input type="radio" name="trip" value="roundtrip" defaultChecked={trip !== "oneway"} className="mr-2" />
                Round-trip
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600">From (IATA)</label>
                <input name="from" defaultValue={from} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" placeholder="YUL" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">To (IATA)</label>
                <input name="to" defaultValue={to} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" placeholder="MIA" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600">Depart</label>
                <input name="depart" type="date" defaultValue={depart} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Return</label>
                <input name="ret" type="date" defaultValue={ret} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600">Passengers</label>
                <select name="passengers" defaultValue={passengers} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm">
                  {Array.from({ length: 9 }).map((_, idx) => {
                    const value = String(idx + 1);
                    return <option key={value} value={value}>{value}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Cabin</label>
                <select name="cabin" defaultValue={cabin} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm">
                  <option value="Economy">Economy</option>
                  <option value="Premium Economy">Premium Economy</option>
                  <option value="Business">Business</option>
                  <option value="First">First</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600">Min price (USD)</label>
                <input name="minPrice" type="number" min="1" step="1" defaultValue={minPrice} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" placeholder="200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Max stops</label>
                <select name="maxStops" defaultValue={maxStops} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm">
                  <option value="">Any</option>
                  <option value="0">Nonstop only</option>
                  <option value="1">Up to 1 stop</option>
                  <option value="2">Up to 2 stops</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600">Max price (USD)</label>
                <input name="maxPrice" type="number" min="1" step="1" defaultValue={maxPrice} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" placeholder="700" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Max duration (hours)</label>
                <input name="maxDuration" type="number" min="1" step="1" defaultValue={maxDuration} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" placeholder="12" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600">Preferred airline</label>
              <input
                name="airline"
                list="airline-options"
                defaultValue={airline}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm"
                placeholder="Air Canada"
              />
              <datalist id="airline-options">
                {carrierSuggestions.map((carrier) => (
                  <option key={carrier} value={carrier} />
                ))}
              </datalist>
            </div>

            {carrierOptions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-600">Airlines</p>
                <div className="max-h-48 overflow-auto rounded-lg border border-slate-200 p-2 space-y-1">
                  {carrierOptions.map((carrier) => (
                    <label key={carrier.code} className="flex items-center gap-2 text-xs text-slate-700">
                      <input type="checkbox" name="airlines" value={carrier.code} defaultChecked={selectedAirlines.includes(carrier.code)} />
                      <img src={carrier.logo} alt={carrier.name} className="h-5 w-5 rounded-full border border-slate-200 bg-white" loading="lazy" />
                      <span className="truncate">{carrier.name} ({carrier.code})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600">Departure window</p>
              <div className="grid grid-cols-2 gap-1 text-xs text-slate-700">
                <label className="inline-flex items-center gap-2"><input type="checkbox" name="depWindow" value="morning" defaultChecked={selectedDepartureWindows.includes("morning")} /> Morning</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" name="depWindow" value="afternoon" defaultChecked={selectedDepartureWindows.includes("afternoon")} /> Afternoon</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" name="depWindow" value="evening" defaultChecked={selectedDepartureWindows.includes("evening")} /> Evening</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" name="depWindow" value="night" defaultChecked={selectedDepartureWindows.includes("night")} /> Night</label>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600">Arrival window</p>
              <div className="grid grid-cols-2 gap-1 text-xs text-slate-700">
                <label className="inline-flex items-center gap-2"><input type="checkbox" name="arrWindow" value="morning" defaultChecked={selectedArrivalWindows.includes("morning")} /> Morning</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" name="arrWindow" value="afternoon" defaultChecked={selectedArrivalWindows.includes("afternoon")} /> Afternoon</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" name="arrWindow" value="evening" defaultChecked={selectedArrivalWindows.includes("evening")} /> Evening</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" name="arrWindow" value="night" defaultChecked={selectedArrivalWindows.includes("night")} /> Night</label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600">Depart after</label>
                <input name="departAfter" type="time" defaultValue={departAfter} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Depart before</label>
                <input name="departBefore" type="time" defaultValue={departBefore} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                <input type="checkbox" name="direct" value="1" defaultChecked={direct === "1"} />
                Direct only
              </label>
              <div>
                <label className="block text-xs font-medium text-slate-600">Sort by</label>
                <select name="sort" defaultValue={sort} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm">
                  <option value="best">Best</option>
                  <option value="price">Lowest price</option>
                  <option value="duration">Shortest trip</option>
                  <option value="depart">Earliest departure</option>
                  <option value="arrive">Earliest arrival</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                Search flights
              </button>
              <Link href="/search/flights" className="rounded-full border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Reset
              </Link>
            </div>
          </form>
        </aside>

        <div className="space-y-4">
        <header className="rounded-2xl bg-white px-5 py-4 shadow-sm border border-slate-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Zeniva Travel · Flights</p>
            <h1 className="text-2xl font-black text-slate-900">{routeLabel}</h1>
            <p className="text-sm text-slate-600">{datesLabel} · {paxLabel}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!isRoundTrip && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">One-way</span>}
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Showing {filteredOffers.length} options</span>
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
          {!message && filteredOffers.length === 0 && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
              Aucun résultat ne correspond à vos filtres avancés. Modifiez les filtres à gauche.
            </div>
          )}

          <div className="space-y-3">
            {/* Use client component for interactive selection */}
            {/* @ts-ignore */}
            <FlightOffers
              offers={filteredOffers}
              roundTrip={!!ret}
              searchContext={{
                from,
                to,
                depart,
                ret,
                passengers,
                cabin,
              }}
            />
          </div>
        </section>

        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Search context</p>
            <span className="text-xs text-slate-500">Visible to agents only</span>
          </div>
          <pre className="text-xs bg-slate-50 p-3 rounded border border-slate-100 overflow-x-auto">{JSON.stringify(resolved, null, 2)}</pre>
        </section>
        </div>

      </div>
    </main>
  );
}
