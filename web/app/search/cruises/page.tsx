"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

type HolidayResult = {
  ref: string;
  name: string;
  operator: string;
  detail_url: string;
};

type SearchResponse = {
  total: number;
  count: number;
  page: number;
  holidays: HolidayResult[];
};

type CabinPrice = {
  from_inside?: string;
  from_outside?: string;
  from_balcony?: string;
  from_suite?: string;
};

type DateEntry = {
  date_ref: string;
  date_from: string;
  date_to: string;
  availability_string: string;
  ship_title: string;
  itinerary_code: string;
  starts_at: { name: string; country: string };
  ends_at: { name: string; country: string };
  headline_prices: {
    cruise: {
      double?: CabinPrice;
      single?: CabinPrice;
      triple?: CabinPrice;
    };
  };
  pricing: Array<{
    name: string;
    taxes_fees: string;
    deal_code: string;
    prices: Array<{
      grade_name: string;
      room_type: string;
      grade_code: string;
      double_price_pp: string;
      single_price_pp?: string;
      triple_price_pp?: string;
      non_comm_charges: string;
      availability: string;
    }>;
  }>;
};

type HolidayDetail = {
  ref: string;
  name: string;
  operator: string;
  duration_days: number;
  cruise_nights: number;
  regions: string[];
  countries: string[];
  themes: string[];
  rating: string;
  images: Array<{ href: string; name: string }>;
  best_prices: { from: string; from_balcony: string; from_suite: string; currency: string };
  operating_seasons: Array<{
    operating_season: string;
    season_headline_prices: CabinPrice & { is_transport_inclusive: boolean };
    dates: DateEntry[];
  }>;
};

type BookingStep = "select-date" | "select-cabin" | "passenger-info" | "confirm" | "done";

// ─── Region Map ──────────────────────────────────────────────────────────────

const REGION_TO_WIDGETY: Record<string, string> = {
  Caribbean: "caribbean",
  Mediterranean: "mediterranean",
  Bahamas: "caribbean",
  Alaska: "alaska",
  Europe: "europe",
  Asia: "asia",
  "Pacific": "pacific",
};

const CABIN_LABELS: Record<string, { label: string; icon: string; desc: string }> = {
  Inside:    { label: "Interior",  icon: "🛏",  desc: "No window. Most affordable." },
  Outside:   { label: "Oceanview", icon: "🌊",  desc: "Fixed window or porthole." },
  Balcony:   { label: "Balcony",   icon: "🏖",  desc: "Private balcony with sea views." },
  Suite:     { label: "Suite",     icon: "👑",  desc: "Premium space & exclusive perks." },
};

const OPERATOR_IMAGES: Record<string, string> = {
  "MSC Cruises":    "https://images.unsplash.com/photo-1548032885-b5e38734eca5?auto=format&fit=crop&w=900&q=80",
  "Virgin Voyages": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
};

function fallbackImage(operator: string) {
  return OPERATOR_IMAGES[operator] || "https://images.unsplash.com/photo-1548032885-b5e38734eca5?auto=format&fit=crop&w=900&q=80";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(date: string) {
  try {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return date; }
}

function fmtPrice(p?: string) {
  if (!p) return null;
  const n = parseFloat(p);
  if (isNaN(n)) return null;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CruisesSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f0f4fa] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🚢</div>
          <p className="text-slate-500 font-semibold">Loading cruises…</p>
        </div>
      </div>
    }>
      <CruisesContent />
    </Suspense>
  );
}

function CruisesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const region       = searchParams.get("region") || "";
  const depMonth     = searchParams.get("departureMonth") || "";
  const duration     = searchParams.get("duration") || "";
  const guests       = parseInt(searchParams.get("guests") || "2", 10);

  // Search state
  const [results,    setResults]    = useState<HolidayResult[]>([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [loadMore,   setLoadMore]   = useState(false);
  const [operator,   setOperator]   = useState<"all" | "msc-cruises" | "virgin-voyages">("all");
  const [sortBy,     setSortBy]     = useState<"default" | "price_asc" | "price_desc">("default");

  // Detail & booking state
  const [selected,   setSelected]   = useState<HolidayResult | null>(null);
  const [detail,     setDetail]     = useState<HolidayDetail | null>(null);
  const [detailLoad, setDetailLoad] = useState(false);

  // Booking flow
  const [bookStep,   setBookStep]   = useState<BookingStep>("select-date");
  const [selDate,    setSelDate]    = useState<DateEntry | null>(null);
  const [selCabin,   setSelCabin]   = useState<string>("");
  const [selCabinPrice, setSelCabinPrice] = useState<string>("");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", specialRequests: "" });
  const [booking,    setBooking]    = useState(false);
  const [bookResult, setBookResult] = useState<{ bookingRef: string } | null>(null);
  const [bookError,  setBookError]  = useState("");

  // ── Build search params ──────────────────────────────────────────────────
  const buildQuery = useCallback((pg = 1, op = operator) => {
    const p = new URLSearchParams({ market: "us", page: String(pg), limit: "24" });
    if (op !== "all") p.set("operators", op);
    // Map region to Widgety
    const wRegion = REGION_TO_WIDGETY[region];
    if (wRegion) p.set("regions", wRegion);
    // Duration filter
    if (duration) {
      const d = parseInt(duration, 10);
      if (!isNaN(d)) {
        p.set("duration_min", String(d - 1 > 0 ? d - 1 : d));
        p.set("duration_max", String(d + 2));
      }
    }
    // Date from departureMonth (MM/DD/YYYY → YYYY-MM-DD)
    if (depMonth) {
      try {
        const d = new Date(depMonth);
        if (!isNaN(d.getTime())) {
          p.set("date_from", d.toISOString().split("T")[0]);
          const end = new Date(d);
          end.setMonth(end.getMonth() + 1);
          p.set("date_to", end.toISOString().split("T")[0]);
        }
      } catch (_) {}
    }
    return p;
  }, [region, duration, depMonth, operator]);

  // ── Fetch results ────────────────────────────────────────────────────────
  const fetchResults = useCallback(async (pg = 1, replace = true, op = operator) => {
    if (pg === 1) setLoading(true); else setLoadMore(true);
    try {
      const q = buildQuery(pg, op);
      const r = await fetch(`/api/cruises/search?${q}`);
      const data: SearchResponse = await r.json();
      let list = data.holidays || [];
      if (sortBy === "price_asc" || sortBy === "price_desc") {
        // We can't sort by price from API directly — apply client sort by name as proxy
        list = [...list];
      }
      setTotal(data.total || 0);
      if (replace) setResults(list);
      else setResults(prev => [...prev, ...list]);
      setPage(pg);
    } catch { } finally {
      setLoading(false);
      setLoadMore(false);
    }
  }, [buildQuery, sortBy, operator]);

  useEffect(() => { fetchResults(1, true); }, [operator]);

  // ── Fetch holiday detail ─────────────────────────────────────────────────
  const fetchDetail = useCallback(async (h: HolidayResult) => {
    setSelected(h);
    setDetail(null);
    setDetailLoad(true);
    setBookStep("select-date");
    setSelDate(null);
    setSelCabin("");
    setSelCabinPrice("");
    setBookResult(null);
    setBookError("");
    try {
      const r = await fetch(`/api/cruises/detail?ref=${h.ref}&market=us`);
      const d: HolidayDetail = await r.json();
      setDetail(d);
    } catch { } finally {
      setDetailLoad(false);
    }
  }, []);

  // ── Submit booking ───────────────────────────────────────────────────────
  const submitBooking = async () => {
    setBooking(true);
    setBookError("");
    try {
      const r = await fetch("/api/cruises/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          cruiseRef: detail?.ref,
          cruiseName: detail?.name,
          operator: detail?.operator,
          cabinType: selCabin,
          cabinPrice: selCabinPrice,
          dateFrom: selDate?.date_from,
          dateTo: selDate?.date_to,
          duration: detail?.duration_days,
          ship: selDate?.ship_title,
          region,
          guests,
        }),
      });
      const data = await r.json();
      if (data.success) {
        setBookResult(data);
        setBookStep("done");
      } else {
        setBookError(data.error || "Something went wrong. Please try again.");
      }
    } catch (e: any) {
      setBookError(e.message || "Network error.");
    } finally {
      setBooking(false);
    }
  };

  // ── Date section for booking ─────────────────────────────────────────────
  const allDates: DateEntry[] = detail?.operating_seasons?.flatMap(s => s.dates) || [];
  const visibleDates = allDates.slice(0, 8);

  // Cabin types from selected date
  const cabinTypes: Array<{ type: string; priceDouble?: string; priceSingle?: string; available: boolean }> = (() => {
    if (!selDate) return [];
    const h = selDate.headline_prices?.cruise;
    if (!h) return [];
    const types: Array<{ type: string; priceDouble?: string; priceSingle?: string; available: boolean }> = [];
    if (h.double?.from_inside)  types.push({ type: "Inside",  priceDouble: h.double.from_inside,  priceSingle: h.single?.from_inside,  available: true });
    if (h.double?.from_outside) types.push({ type: "Outside", priceDouble: h.double.from_outside, priceSingle: h.single?.from_outside, available: true });
    if (h.double?.from_balcony) types.push({ type: "Balcony", priceDouble: h.double.from_balcony, priceSingle: h.single?.from_balcony, available: true });
    if (h.double?.from_suite)   types.push({ type: "Suite",   priceDouble: h.double.from_suite,   priceSingle: h.single?.from_suite,   available: true });
    return types;
  })();

  const isFormValid = form.firstName && form.lastName && form.email.includes("@") && form.phone;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f0f4fa]">

      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-[#0a1628] via-[#0f2a5e] to-[#1a3d8f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-blue-200 text-sm mb-5 hover:text-white transition">
            ← Back to home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🚢</span>
            <div>
              <p className="text-blue-300 text-xs font-bold uppercase tracking-widest">Zeniva Travel</p>
              <h1 className="text-3xl sm:text-4xl font-black">
                {region ? `${region} Cruises` : "Cruise Search"}
              </h1>
            </div>
          </div>
          <p className="text-blue-200 text-sm mb-5">
            {depMonth && `Departing ${depMonth} · `}{duration && `${duration} nights · `}{guests} guest{guests !== 1 ? "s" : ""}
            {total > 0 && ` · ${total.toLocaleString()} cruises found`}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-bold">🔒 Secure booking</span>
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-bold">✈️ MSC Cruises</span>
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-bold">🌊 Virgin Voyages</span>
            <span className="bg-emerald-500/30 border border-emerald-400/30 rounded-full px-3 py-1 text-xs font-bold">💬 Lina follows up in 2h</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* ── Filters ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { label: "All Lines", value: "all" },
              { label: "MSC Cruises", value: "msc-cruises" },
              { label: "Virgin Voyages", value: "virgin-voyages" },
            ].map(op => (
              <button key={op.value}
                onClick={() => { setOperator(op.value as any); }}
                className={`text-xs font-bold px-4 py-2 rounded-full border transition ${operator === op.value ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700"}`}>
                {op.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">{total.toLocaleString()} results</span>
          </div>
        </div>

        {/* ── Main layout ── */}
        <div className={`grid gap-6 ${selected ? "grid-cols-1 lg:grid-cols-[1fr_440px]" : "grid-cols-1"}`}>

          {/* ── Results grid ── */}
          <div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
                    <div className="h-44 bg-slate-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-1/3" />
                      <div className="h-5 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                      <div className="h-8 bg-slate-100 rounded-xl mt-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                <div className="text-5xl mb-4">🚢</div>
                <p className="text-slate-600 font-semibold text-lg">No cruises found for these filters</p>
                <p className="text-slate-400 text-sm mt-1">Try changing the operator or removing the date filter</p>
                <button onClick={() => { setOperator("all"); fetchResults(1, true, "all"); }}
                  className="mt-5 bg-blue-600 text-white font-bold rounded-xl px-6 py-2.5 text-sm hover:bg-blue-700 transition">
                  Show all cruises
                </button>
              </div>
            ) : (
              <>
                <div className={`grid gap-4 ${selected ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"}`}>
                  {results.map(h => {
                    const isActive = selected?.ref === h.ref;
                    const img = fallbackImage(h.operator);
                    return (
                      <div key={h.ref}
                        className={`bg-white rounded-2xl overflow-hidden border-2 shadow-sm hover:shadow-lg transition-all cursor-pointer group
                          ${isActive ? "border-blue-500 shadow-blue-100" : "border-slate-100 hover:border-blue-200"}`}
                        onClick={() => fetchDetail(h)}>
                        <div className="relative h-44 overflow-hidden bg-slate-100">
                          <img src={img} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          {isActive && (
                            <div className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-black rounded-full px-3 py-1">
                              ✓ Selected
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-90">{h.operator}</span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-black text-slate-900 text-sm leading-snug line-clamp-2 min-h-[2.5rem]">{h.name}</h3>
                          <p className="text-xs text-slate-400 mt-1 font-mono truncate">{h.ref}</p>
                          <button
                            className={`mt-3 w-full py-2.5 rounded-xl text-xs font-black transition
                              ${isActive
                                ? "bg-blue-600 text-white"
                                : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"}`}>
                            {isActive ? "✓ Viewing details" : "View & Book →"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Load more */}
                {results.length < total && (
                  <div className="text-center mt-8">
                    <button
                      disabled={loadMore}
                      onClick={() => fetchResults(page + 1, false)}
                      className="bg-white border-2 border-blue-200 text-blue-700 font-black rounded-xl px-8 py-3 text-sm hover:bg-blue-50 transition disabled:opacity-50">
                      {loadMore ? "Loading…" : `Load more (${(total - results.length).toLocaleString()} remaining)`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Booking panel ── */}
          {selected && (
            <div className="lg:sticky lg:top-6 h-fit">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">

                {/* Panel header */}
                <div className="relative bg-gradient-to-br from-[#0f2a5e] to-[#1a3d8f] text-white p-5">
                  <button onClick={() => { setSelected(null); setDetail(null); }}
                    className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold text-sm transition">
                    ✕
                  </button>
                  <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest mb-1">{selected.operator}</p>
                  <h2 className="font-black text-lg leading-snug pr-8">{selected.name}</h2>
                  {detail && (
                    <div className="flex gap-3 mt-2 text-xs text-blue-200">
                      <span>🗓 {detail.duration_days} days</span>
                      <span>🌊 {detail.cruise_nights} nights</span>
                      {detail.regions?.length > 0 && <span>📍 {detail.regions[0]}</span>}
                    </div>
                  )}
                </div>

                {/* Progress steps */}
                {bookStep !== "done" && (
                  <div className="flex border-b border-slate-100">
                    {(["select-date", "select-cabin", "passenger-info", "confirm"] as BookingStep[]).map((step, i) => {
                      const steps = ["select-date", "select-cabin", "passenger-info", "confirm"];
                      const cur = steps.indexOf(bookStep);
                      const isDone = i < cur;
                      const isActive = i === cur;
                      const labels = ["1 Date", "2 Cabin", "3 Info", "4 Review"];
                      return (
                        <button key={step}
                          onClick={() => isDone ? setBookStep(step) : undefined}
                          className={`flex-1 py-2.5 text-[10px] font-black transition border-b-2
                            ${isActive ? "border-blue-500 text-blue-600" : isDone ? "border-emerald-400 text-emerald-600 cursor-pointer" : "border-transparent text-slate-300"}`}>
                          {isDone ? "✓ " : ""}{labels[i]}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="p-5 max-h-[70vh] overflow-y-auto">

                  {detailLoad && (
                    <div className="space-y-3 animate-pulse">
                      {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl" />)}
                    </div>
                  )}

                  {/* ── STEP 1: Select Date ── */}
                  {!detailLoad && bookStep === "select-date" && (
                    <div className="space-y-3">
                      <p className="text-sm font-black text-slate-800 mb-3">Choose a departure date</p>
                      {visibleDates.length === 0 && <p className="text-sm text-slate-400">No available dates found.</p>}
                      {visibleDates.map(d => {
                        const isAvail = d.availability_string === "available";
                        const isSelected = selDate?.date_ref === d.date_ref;
                        const headline = d.headline_prices?.cruise?.double;
                        const fromPrice = headline?.from_inside || headline?.from_balcony;
                        return (
                          <button key={d.date_ref}
                            disabled={!isAvail}
                            onClick={() => setSelDate(d)}
                            className={`w-full rounded-xl border-2 p-3 text-left transition
                              ${isSelected ? "border-blue-500 bg-blue-50" : isAvail ? "border-slate-200 hover:border-blue-300 hover:bg-slate-50" : "border-slate-100 opacity-40 cursor-not-allowed"}`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-black text-slate-900">
                                  {fmt(d.date_from)} → {fmt(d.date_to)}
                                </p>
                                <p className="text-[10px] text-slate-500 mt-0.5">🚢 {d.ship_title}</p>
                                <p className="text-[10px] text-slate-400">
                                  {d.starts_at?.name} → {d.ends_at?.name}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0 ml-2">
                                {fromPrice && (
                                  <p className="text-sm font-black text-blue-700">from {fmtPrice(fromPrice)}</p>
                                )}
                                <p className="text-[10px] text-slate-400">/ person</p>
                                <span className={`text-[9px] font-bold rounded-full px-2 py-0.5 ${isAvail ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                                  {isAvail ? "Available" : "Unavailable"}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                      <button
                        disabled={!selDate}
                        onClick={() => setBookStep("select-cabin")}
                        className="w-full mt-2 bg-blue-600 text-white font-black rounded-xl py-3 text-sm hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed">
                        Continue → Choose Cabin
                      </button>
                    </div>
                  )}

                  {/* ── STEP 2: Select Cabin ── */}
                  {!detailLoad && bookStep === "select-cabin" && selDate && (
                    <div className="space-y-3">
                      <p className="text-sm font-black text-slate-800 mb-1">Select your cabin type</p>
                      <div className="bg-slate-50 rounded-xl p-3 mb-3">
                        <p className="text-xs font-bold text-slate-600">📅 {fmt(selDate.date_from)} · {detail?.duration_days} days · {selDate.ship_title}</p>
                        <p className="text-[10px] text-slate-400">{selDate.starts_at?.name} → {selDate.ends_at?.name}</p>
                      </div>
                      {cabinTypes.length === 0 && <p className="text-sm text-slate-400">No cabin pricing available for this date.</p>}
                      {cabinTypes.map(ct => {
                        const meta = CABIN_LABELS[ct.type] || { label: ct.type, icon: "🛏", desc: "" };
                        const isSelected = selCabin === ct.type;
                        return (
                          <button key={ct.type}
                            onClick={() => {
                              setSelCabin(ct.type);
                              setSelCabinPrice(ct.priceDouble || "");
                            }}
                            className={`w-full rounded-xl border-2 p-4 text-left transition
                              ${isSelected ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300"}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{meta.icon}</span>
                                <div>
                                  <p className="text-sm font-black text-slate-900">{meta.label}</p>
                                  <p className="text-[10px] text-slate-500">{meta.desc}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-base font-black text-blue-700">{fmtPrice(ct.priceDouble)}</p>
                                <p className="text-[10px] text-slate-400">per person</p>
                                {guests === 1 && ct.priceSingle && (
                                  <p className="text-[10px] text-slate-500">Solo: {fmtPrice(ct.priceSingle)}</p>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                      <button
                        disabled={!selCabin}
                        onClick={() => setBookStep("passenger-info")}
                        className="w-full mt-2 bg-blue-600 text-white font-black rounded-xl py-3 text-sm hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed">
                        Continue → Passenger Info
                      </button>
                    </div>
                  )}

                  {/* ── STEP 3: Passenger Info ── */}
                  {bookStep === "passenger-info" && (
                    <div className="space-y-3">
                      <p className="text-sm font-black text-slate-800 mb-1">Your contact information</p>
                      <div className="bg-slate-50 rounded-xl p-3 mb-2 space-y-1">
                        <p className="text-[10px] font-bold text-slate-500">📅 {fmt(selDate!.date_from)}</p>
                        <p className="text-[10px] font-bold text-slate-500">🛏 {selCabin} cabin · {fmtPrice(selCabinPrice)}/person</p>
                        <p className="text-[10px] font-bold text-slate-500">👥 {guests} guest{guests !== 1 ? "s" : ""}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-wide">First Name *</label>
                          <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                            className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                            placeholder="John" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-wide">Last Name *</label>
                          <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                            className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                            placeholder="Smith" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-wide">Email *</label>
                        <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                          placeholder="john@example.com" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-wide">Phone *</label>
                        <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                          className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                          placeholder="+1 (555) 000-0000" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-wide">Special Requests</label>
                        <textarea value={form.specialRequests} onChange={e => setForm(f => ({ ...f, specialRequests: e.target.value }))}
                          rows={2}
                          className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none"
                          placeholder="Accessibility needs, dietary, anniversary, etc." />
                      </div>
                      <button
                        disabled={!isFormValid}
                        onClick={() => setBookStep("confirm")}
                        className="w-full mt-1 bg-blue-600 text-white font-black rounded-xl py-3 text-sm hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed">
                        Review Booking →
                      </button>
                    </div>
                  )}

                  {/* ── STEP 4: Confirm ── */}
                  {bookStep === "confirm" && (
                    <div className="space-y-4">
                      <p className="text-sm font-black text-slate-800">Review your booking request</p>

                      <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl border border-blue-100 p-4 space-y-2.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 font-medium">Cruise</span>
                          <span className="font-black text-slate-900 text-right max-w-[60%]">{detail?.name}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 font-medium">Operator</span>
                          <span className="font-bold text-slate-700">{detail?.operator}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 font-medium">Ship</span>
                          <span className="font-bold text-slate-700">{selDate?.ship_title}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 font-medium">Dates</span>
                          <span className="font-bold text-slate-700">{fmt(selDate!.date_from)} → {fmt(selDate!.date_to)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 font-medium">Cabin</span>
                          <span className="font-bold text-slate-700">{selCabin}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 font-medium">Guests</span>
                          <span className="font-bold text-slate-700">{guests} person{guests !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="border-t border-blue-100 pt-2 flex justify-between text-sm">
                          <span className="font-black text-slate-800">Est. Price</span>
                          <span className="font-black text-blue-700">
                            {fmtPrice(selCabinPrice)}/pp
                            {guests > 1 && selCabinPrice && (
                              <span className="text-xs text-slate-400 ml-1">(×{guests} = {fmtPrice(String(parseFloat(selCabinPrice) * guests))})</span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3 space-y-1 text-xs">
                        <p className="font-black text-slate-700">{form.firstName} {form.lastName}</p>
                        <p className="text-slate-500">{form.email}</p>
                        <p className="text-slate-500">{form.phone}</p>
                        {form.specialRequests && <p className="text-slate-500 italic">"{form.specialRequests}"</p>}
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <p className="text-xs text-amber-800 font-bold">📋 What happens next?</p>
                        <p className="text-[11px] text-amber-700 mt-1">
                          Lina, your AI concierge, will contact you within 2 hours to confirm availability, finalize pricing, and complete the booking with the cruise line.
                        </p>
                      </div>

                      {bookError && (
                        <p className="text-xs text-red-600 bg-red-50 rounded-xl p-3 font-medium">{bookError}</p>
                      )}

                      <button
                        disabled={booking}
                        onClick={submitBooking}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black rounded-xl py-4 text-sm hover:opacity-90 transition shadow-lg shadow-blue-200 disabled:opacity-60">
                        {booking ? "Submitting…" : "🚢 Confirm Booking Request"}
                      </button>
                      <p className="text-[10px] text-slate-400 text-center">No payment required now. Lina will finalize with you.</p>
                    </div>
                  )}

                  {/* ── STEP 5: Done ── */}
                  {bookStep === "done" && bookResult && (
                    <div className="text-center py-4 space-y-4">
                      <div className="text-5xl">🎉</div>
                      <div>
                        <p className="text-lg font-black text-slate-900">Booking request sent!</p>
                        <p className="text-sm text-slate-500 mt-1">Lina will contact you within 2 hours.</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Your Reference</p>
                        <p className="text-lg font-black text-blue-700 font-mono mt-1">{bookResult.bookingRef}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Confirmation sent to {form.email}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-slate-600 font-bold">While you wait, chat with Lina:</p>
                        <button
                          onClick={() => {
                            const prompt = encodeURIComponent(`I just submitted a cruise booking request for ${detail?.name}. My reference is ${bookResult.bookingRef}. Can you help me prepare for my trip?`);
                            router.push(`/chat?prompt=${prompt}`);
                          }}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black rounded-xl py-3 text-sm hover:opacity-90 transition">
                          💬 Chat with Lina
                        </button>
                        <button onClick={() => { setSelected(null); setDetail(null); setBookStep("select-date"); }}
                          className="w-full border border-slate-200 text-slate-600 font-bold rounded-xl py-2.5 text-sm hover:bg-slate-50 transition">
                          Search more cruises
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom CTA ── */}
        {!selected && (
          <div className="mt-12 rounded-2xl bg-gradient-to-br from-[#0a1628] to-[#1a3d8f] text-white p-8 text-center">
            <h3 className="text-2xl font-black mb-2">Not sure which cruise is right for you?</h3>
            <p className="text-blue-200 mb-5 text-sm">Lina compares itineraries, cabins, and prices for your budget.</p>
            <button
              onClick={() => {
                const prompt = encodeURIComponent(`I'm looking for a ${duration || "7"}-night ${region || "Caribbean"} cruise for ${guests} people departing around ${depMonth || "this year"}. Can you help me choose the best option?`);
                router.push(`/chat?prompt=${prompt}`);
              }}
              className="bg-white text-blue-700 font-black rounded-xl px-8 py-3 hover:bg-blue-50 transition">
              💬 Ask Lina for recommendations
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
