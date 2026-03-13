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

// City name → IATA code mapping
const IATA_MAP: Record<string, string> = {
  "montreal": "YUL", "montréal": "YUL",
  "quebec": "YQB", "québec": "YQB", "quebec city": "YQB",
  "toronto": "YYZ",
  "vancouver": "YVR",
  "calgary": "YYC",
  "ottawa": "YOW",
  "edmonton": "YEG",
  "winnipeg": "YWG",
  "halifax": "YHZ",
  "miami": "MIA",
  "new york": "JFK", "newyork": "JFK", "nyc": "JFK",
  "los angeles": "LAX", "la": "LAX",
  "chicago": "ORD",
  "dallas": "DFW",
  "houston": "IAH",
  "boston": "BOS",
  "washington": "DCA",
  "atlanta": "ATL",
  "san francisco": "SFO",
  "seattle": "SEA",
  "orlando": "MCO",
  "las vegas": "LAS",
  "denver": "DEN",
  "phoenix": "PHX",
  "paris": "CDG",
  "london": "LHR",
  "amsterdam": "AMS",
  "madrid": "MAD",
  "barcelona": "BCN",
  "rome": "FCO",
  "milan": "MXP",
  "frankfurt": "FRA",
  "zurich": "ZRH",
  "lisbon": "LIS",
  "brussels": "BRU",
  "vienna": "VIE",
  "istanbul": "IST",
  "dubai": "DXB",
  "tokyo": "NRT",
  "osaka": "KIX",
  "singapore": "SIN",
  "bangkok": "BKK",
  "hong kong": "HKG",
  "sydney": "SYD",
  "melbourne": "MEL",
  "cancun": "CUN", "cancún": "CUN",
  "punta cana": "PUJ",
  "mexico city": "MEX",
  "bogota": "BOG", "bogotá": "BOG",
  "lima": "LIM",
  "buenos aires": "EZE",
  "sao paulo": "GRU",
  "rio de janeiro": "GIG",
  "cairo": "CAI",
  "johannesburg": "JNB",
  "nairobi": "NBO",
};

function resolveIATA(val: string): string {
  const s = val.trim();
  if (/^[A-Za-z]{3}$/.test(s)) return s.toUpperCase();
  const lower = s.toLowerCase();
  for (const [k, v] of Object.entries(IATA_MAP)) {
    if (lower === k || lower.includes(k)) return v;
  }
  return s.toUpperCase().slice(0, 3);
}

async function loadOffers(params: Params) {
  const { from, to, depart, ret, passengers = "1", trip = "roundtrip", cabin = "Economy" } = params;

  if (!from || !to || !depart) {
    return { offers: [], message: "Veuillez saisir origine, destination et date de départ." };
  }

  const originCode = resolveIATA(String(from));
  const destCode = resolveIATA(String(to));

  const slices: any[] = [
    {
      origin: originCode,
      destination: destCode,
      departure_date: depart,
    },
  ];

  // Add return slice for round-trip searches
  if (trip !== "oneway" && ret) {
    slices.push({
      origin: destCode,
      destination: originCode,
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

    const inputCls = "mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 bg-white text-slate-800 placeholder:text-slate-400";
  const labelCls = "block text-[10px] font-bold uppercase tracking-wider text-slate-500";

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero header */}
      <div style={{ background: "linear-gradient(135deg, #0B1B4D 0%, #0F6CF5 100%)" }} className="px-4 py-6 sm:py-10">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-1">Zeniva Travel</p>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl sm:text-4xl">✈️</span>
              <h1 className="text-3xl sm:text-4xl font-black">ZeniFlights</h1>
            </div>
            <p className="text-blue-200 text-sm mt-0.5">{routeLabel} · {datesLabel} · {paxLabel}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!isRoundTrip && <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-3 py-1 text-xs font-bold text-amber-300">One-way</span>}
            <span className="rounded-full bg-emerald-400/20 border border-emerald-400/40 px-3 py-1 text-xs font-bold text-emerald-300">
              {filteredOffers.length} options · {nonstopCount} direct
            </span>
            {minVisiblePrice !== null && (
              <span className="rounded-full bg-white/15 border border-white/25 px-3 py-1 text-xs font-bold text-white">
                From USD {minVisiblePrice.toFixed(0)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-5 grid grid-cols-1 md:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)] gap-5 items-start">
        {/* Filters sidebar */}
        <aside className="md:sticky md:top-4 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4">
            <h2 className="font-black text-white text-base">🔍 Search & Filters</h2>
            <p className="text-slate-400 text-xs mt-0.5">{filteredOffers.length} results · {nonstopCount} nonstop</p>
          </div>
          <div className="p-4 max-h-[80vh] overflow-y-auto">
            <form action="/search/flights" method="GET" className="space-y-4">
              {/* Trip type */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: "oneway", label: "One-way" },
                  { val: "roundtrip", label: "Round-trip" },
                ].map(({ val, label }) => (
                  <label key={val} className={`rounded-xl border-2 px-3 py-2 text-xs font-bold cursor-pointer text-center transition ${(val === "oneway" ? trip === "oneway" : trip !== "oneway") ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                    <input type="radio" name="trip" value={val} defaultChecked={val === "oneway" ? trip === "oneway" : trip !== "oneway"} className="sr-only" />
                    {label}
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>From</label><input name="from" defaultValue={from} required className={inputCls} placeholder="YUL" /></div>
                <div><label className={labelCls}>To</label><input name="to" defaultValue={to} required className={inputCls} placeholder="MIA" /></div>
                <div><label className={labelCls}>Depart</label><input name="depart" type="date" defaultValue={depart} required className={inputCls} /></div>
                <div><label className={labelCls}>Return</label><input name="ret" type="date" defaultValue={ret} className={inputCls} /></div>
                <div>
                  <label className={labelCls}>Passengers</label>
                  <select name="passengers" defaultValue={passengers} className={inputCls}>
                    {Array.from({ length: 9 }).map((_, idx) => { const v = String(idx + 1); return <option key={v} value={v}>{v}</option>; })}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Cabin</label>
                  <select name="cabin" defaultValue={cabin} className={inputCls}>
                    {["Economy", "Premium Economy", "Business", "First"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>Min price (USD)</label><input name="minPrice" type="number" min="1" step="1" defaultValue={minPrice} className={inputCls} placeholder="200" /></div>
                <div>
                  <label className={labelCls}>Max stops</label>
                  <select name="maxStops" defaultValue={maxStops} className={inputCls}>
                    <option value="">Any</option>
                    <option value="0">Nonstop only</option>
                    <option value="1">Up to 1 stop</option>
                    <option value="2">Up to 2 stops</option>
                  </select>
                </div>
                <div><label className={labelCls}>Max price (USD)</label><input name="maxPrice" type="number" min="1" step="1" defaultValue={maxPrice} className={inputCls} placeholder="700" /></div>
                <div><label className={labelCls}>Max duration (h)</label><input name="maxDuration" type="number" min="1" step="1" defaultValue={maxDuration} className={inputCls} placeholder="12" /></div>
              </div>

              <div>
                <label className={labelCls}>Airline</label>
                <input name="airline" list="airline-options" defaultValue={airline} className={inputCls} placeholder="Air Canada" />
                <datalist id="airline-options">{carrierSuggestions.map(c => <option key={c} value={c} />)}</datalist>
              </div>

              {carrierOptions.length > 0 && (
                <div>
                  <p className={labelCls + " mb-2"}>Airlines</p>
                  <div className="max-h-40 overflow-auto rounded-xl border border-slate-200 p-2 space-y-1">
                    {carrierOptions.map((c) => (
                      <label key={c.code} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:bg-slate-50 rounded px-1 py-0.5">
                        <input type="checkbox" name="airlines" value={c.code} defaultChecked={selectedAirlines.includes(c.code)} />
                        <img src={c.logo} alt={c.name} className="h-5 w-5 rounded border border-slate-200 object-contain bg-white" loading="lazy" />
                        <span className="truncate">{c.name} ({c.code})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className={labelCls + " mb-2"}>Departure window</p>
                <div className="grid grid-cols-2 gap-1">
                  {["morning", "afternoon", "evening", "night"].map(w => (
                    <label key={w} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input type="checkbox" name="depWindow" value={w} defaultChecked={selectedDepartureWindows.includes(w)} className="rounded" />
                      <span className="capitalize">{w}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className={labelCls + " mb-2"}>Arrival window</p>
                <div className="grid grid-cols-2 gap-1">
                  {["morning", "afternoon", "evening", "night"].map(w => (
                    <label key={w} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input type="checkbox" name="arrWindow" value={w} defaultChecked={selectedArrivalWindows.includes(w)} className="rounded" />
                      <span className="capitalize">{w}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Depart after</label><input name="departAfter" type="time" defaultValue={departAfter} className={inputCls} /></div>
                <div><label className={labelCls}>Depart before</label><input name="departBefore" type="time" defaultValue={departBefore} className={inputCls} /></div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer">
                  <input type="checkbox" name="direct" value="1" defaultChecked={direct === "1"} className="rounded" />
                  Direct flights only
                </label>
                <div>
                  <label className={labelCls + " inline"}>Sort: </label>
                  <select name="sort" defaultValue={sort} className="ml-1 text-xs rounded-lg border border-slate-200 px-2 py-1">
                    <option value="best">Best</option>
                    <option value="price">Price ↑</option>
                    <option value="duration">Duration ↑</option>
                    <option value="depart">Depart ↑</option>
                    <option value="arrive">Arrive ↑</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 rounded-xl py-2.5 text-sm font-black text-white transition" style={{ background: "linear-gradient(135deg, #0B1B4D, #0F6CF5)" }}>
                  ✈️ Search flights
                </button>
                <Link href="/search/flights" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  Reset
                </Link>
              </div>
            </form>
          </div>
        </aside>

        {/* Results */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              <span className="font-black text-slate-900">{filteredOffers.length} flights</span> found · click to book instantly
            </p>
            <div className="flex gap-2">
              <Link href={`/chat?prompt=${encodeURIComponent(askPrompt)}`}
                className="rounded-xl px-4 py-2 text-xs font-black text-white shadow transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #0B1B4D, #0F6CF5)" }}>
                💬 Ask Lina
              </Link>
              <Link href="/" className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                New search
              </Link>
            </div>
          </div>

          {message && <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">{message}</div>}
          {!message && filteredOffers.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
              <div className="text-5xl mb-3">✈️</div>
              <p className="font-black text-slate-900">No flights found</p>
              <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or dates.</p>
            </div>
          )}

          {/* @ts-ignore */}
          <FlightOffers
            offers={filteredOffers}
            roundTrip={!!ret}
            searchContext={{ from, to, depart, ret, passengers, cabin }}
          />
        </div>
      </div>
    </main>
  );
}
