"use client";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BRAND_BLUE, PREMIUM_BLUE } from "../design/tokens";
import LinaAvatar from "./LinaAvatar";

<style>{`
  @media (max-width: 640px) {
    .hero-mobile {
      background: linear-gradient(180deg, #0B57FF 0%, #4DA1FF 100%);
      color: white;
      margin-top: 0;
      border-radius: 0;
      box-shadow: none;
    }
    .hero-mobile h2, .hero-mobile p {
      color: white;
    }
    .hero-mobile input, .hero-mobile select, .hero-mobile button {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    .hero-mobile input::placeholder, .hero-mobile select {
      color: rgba(255, 255, 255, 0.7);
    }
    .hero-mobile .tab-button {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }
    .hero-mobile .tab-button.active {
      background: rgba(255, 255, 255, 0.2);
    }
    .hero-mobile .ask-lina {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }
    .hero-mobile .search-button {
      background: white;
      color: #0B57FF;
    }
  }

  @media (min-width: 1024px) and (max-width: 1535px) {
    .search-tabs {
      gap: 6px;
      flex-wrap: nowrap;
      overflow-x: auto;
      justify-content: flex-start;
      -webkit-overflow-scrolling: touch;
    }
    .search-tab-item {
      white-space: nowrap;
      font-size: 10px;
      padding: 4px 6px;
      word-break: keep-all;
      hyphens: none;
    }
  }
`}</style>

type Tab = "flights" | "hotels" | "cruises" | "experiences" | "transfers" | "cars" | "yachts" | "airbnbs";

export default function TravelSearchWidget() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("flights");
  const [menuOpen, setMenuOpen] = useState(false);

  // Flights
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [depart, setDepart] = useState("");
  const [ret, setRet] = useState("");
  const [oneWay, setOneWay] = useState(false);
  const [passengers, setPassengers] = useState(2);
  const [cabin, setCabin] = useState("Economy");

  // Hotels
  const [hotelDestination, setHotelDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [budget, setBudget] = useState("");

  // Cruises
  const [region, setRegion] = useState("");
  const [departureMonth, setDepartureMonth] = useState("");
  const [duration, setDuration] = useState("");
  const [cruiseGuests, setCruiseGuests] = useState(2);

  // Experiences
  const [expDestination, setExpDestination] = useState("");
  const [expDate, setExpDate] = useState("");
  const [expTravelers, setExpTravelers] = useState(2);
  const [category, setCategory] = useState("");

  // Transfers
  const [transferPickup, setTransferPickup] = useState("");
  const [transferDropoff, setTransferDropoff] = useState("");
  const [transferDate, setTransferDate] = useState("");
  const [transferPassengers, setTransferPassengers] = useState(2);

  // Rental cars
  const [carPickup, setCarPickup] = useState("");
  const [carPickupDate, setCarPickupDate] = useState("");
  const [carDropoffDate, setCarDropoffDate] = useState("");
  const [carDrivers, setCarDrivers] = useState(1);

  // Yachts & Airbnbs
  const [yachtCountry, setYachtCountry] = useState("");
  const [airbnbCountry, setAirbnbCountry] = useState("");

  const searchFlights = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!from || !to || !depart) return;
    const params = new URLSearchParams({ from, to, depart, ret: oneWay ? "" : ret, passengers: String(passengers), cabin });
    router.push(`/search/flights?${params.toString()}`);
  };

  const searchHotels = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams({ destination: hotelDestination, checkIn, checkOut, guests: String(guests), rooms: String(rooms), budget });
    router.push(`/search/hotels?${params.toString()}`);
  };

  const searchCruises = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams({ region, departureMonth, duration, guests: String(cruiseGuests) });
    router.push(`/search/cruises?${params.toString()}`);
  };

  const searchExperiences = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams({ destination: expDestination, date: expDate, travelers: String(expTravelers), category });
    router.push(`/search/experiences?${params.toString()}`);
  };

  const searchTransfers = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams({ pickup: transferPickup, dropoff: transferDropoff, date: transferDate, passengers: String(transferPassengers) });
    router.push(`/search/transfers?${params.toString()}`);
  };

  const searchCars = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams({ pickup: carPickup, pickupDate: carPickupDate, dropoffDate: carDropoffDate, drivers: String(carDrivers) });
    router.push(`/search/cars?${params.toString()}`);
  };

  const searchYachts = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (yachtCountry) params.set("country", yachtCountry);
    router.push(`/yachts${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const searchAirbnbs = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (airbnbCountry) params.set("country", airbnbCountry);
    router.push(`/airbnbs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const askLina = (prompt?: string) => {
    const derived = prompt || (from && to
      ? `Find flights ${from} to ${to} for ${passengers} pax${depart ? ` around ${depart}` : ""}${cabin ? ` in ${cabin}` : ""}${oneWay ? ", one-way" : ret ? `, return ${ret}` : ""}`
      : "I want a premium trip suggestion for 2 adults, flexible dates.");
    router.push(`/chat?prompt=${encodeURIComponent(derived)}`);
  };

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const returnMin = depart || today;
  const countryOptions = [
    "Canada",
    "United States",
    "Mexico",
    "Dominican Republic",
    "France",
    "French Polynesia",
    "Greece",
    "Italy",
    "Spain",
    "UAE",
  ];

  return (

    <div className="mt-4 sm:mt-6 rounded-2xl bg-white p-4 sm:p-6 shadow-lg hero-mobile" data-nosnippet>
      {/* Mobile: Lina géante centrée, titre Lina AI centré */}
      <div className="sm:hidden flex w-full flex-col items-center justify-center py-8">
        <div className="text-2xl font-extrabold mb-2 text-center" style={{ color: '#FFD700' }}>Lina AI</div>
        <p className="text-sm text-white/90 text-center mb-5 max-w-[280px]">Tap Lina’s face to start your trip with Lina AI</p>
        <button
          type="button"
          onClick={() => askLina()}
          aria-label="Start planning with Lina"
          className="rounded-full p-2 bg-white/10 ring-2 ring-white/30"
        >
          <LinaAvatar size="lg" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} />
        </button>
        <button
          type="button"
          onClick={() => askLina()}
          className="mt-6 w-full max-w-[320px] px-6 py-3 rounded-full font-bold text-white text-base shadow-lg"
          style={{ background: 'linear-gradient(90deg,#0B57FF 0%, #4DA1FF 100%)' }}
        >
          Tap Lina to build my trip now
        </button>
      </div>

      {/* Desktop: formulaire de recherche classique et tabs */}
      <div className="hidden sm:block">
        <div className="mb-4 text-center">
          <h2 className="text-xl font-bold text-slate-900">Plan your perfect trip with Lina AI</h2>
          <p className="text-base text-slate-600 mt-1">Your personal travel concierge powered by AI</p>
        </div>

        {/* Tabs (desktop) */}
        <div className="search-tabs mb-4 flex items-center justify-center gap-3">
          {[
            { key: 'flights', label: 'Flights' },
            { key: 'hotels', label: 'Hotels' },
            { key: 'transfers', label: 'Transfers' },
            { key: 'cars', label: 'Rental Car' },
            { key: 'experiences', label: 'Experience' },
            { key: 'cruises', label: 'Cruise' },
            { key: 'yachts', label: 'Yacht' },
            { key: 'airbnbs', label: 'Airbnb' },
          ].map((t: any) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`search-tab-item tab-button ${tab === t.key ? 'active' : ''} rounded-full px-4 py-2 font-semibold text-sm whitespace-nowrap`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ...existing code desktop... */}
      </div>

      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setMenuOpen(false)}>
          <div className="fixed bottom-0 left-0 right-0 bg-white p-6 rounded-t-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-4">
              <Link href="/partner" className="text-center py-3 bg-slate-100 rounded-lg font-semibold" onClick={() => setMenuOpen(false)}>
                Partner with us
              </Link>
              <Link href="/signup" className="text-center py-3 bg-blue-500 text-white rounded-lg font-semibold" onClick={() => setMenuOpen(false)}>
                Sign up
              </Link>
              <Link href="/login" className="text-center py-3 border border-slate-300 rounded-lg font-semibold" onClick={() => setMenuOpen(false)}>
                Log in
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="hidden sm:block">
        {tab === "flights" && (
          <form onSubmit={searchFlights} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="From (airport/city)" required className="w-full rounded-2xl bg-slate-50 px-4 py-3" />
            <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="To (airport/city)" required className="w-full rounded-2xl bg-slate-50 px-4 py-3" />
            <input
              type="date"
              value={depart}
              onChange={(e) => {
                setDepart(e.target.value);
                if (ret && e.target.value && ret < e.target.value) setRet("");
              }}
              min={today}
              placeholder="Departure date"
              required
              className="w-full rounded-2xl bg-slate-50 px-4 py-3"
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={ret}
                onChange={(e) => setRet(e.target.value)}
                placeholder="Return date"
                min={returnMin}
                className="flex-1 rounded-2xl bg-slate-50 px-4 py-3"
                disabled={oneWay}
              />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={oneWay} onChange={(e) => { setOneWay(e.target.checked); if (e.target.checked) setRet(""); }} /> One-way</label>
            </div>
            <select value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} className="w-full rounded-2xl bg-slate-50 px-4 py-3" aria-label="Passengers" data-nosnippet>
              {[1,2,3,4,5,6].map(n=>(<option key={n} value={n}>{n}</option>))}
            </select>
            <select value={cabin} onChange={(e)=>setCabin(e.target.value)} className="w-full rounded-2xl bg-slate-50 px-4 py-3">
              {['Economy','Premium Economy','Business','First'].map(c=>(<option key={c} value={c}>{c}</option>))}
            </select>

            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="rounded-2xl px-6 py-3 text-sm font-extrabold text-white" style={{ background: `linear-gradient(90deg, ${BRAND_BLUE} 0%, ${PREMIUM_BLUE} 100%)` }}>Search flights</button>
            </div>
          </form>
        )}

        {tab === "hotels" && (
          <form onSubmit={searchHotels} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={hotelDestination} onChange={(e)=>setHotelDestination(e.target.value)} placeholder="Destination" className="w-full rounded-2xl bg-slate-50 px-4 py-3" />
            <input value={checkIn} onChange={(e)=>setCheckIn(e.target.value)} placeholder="Check-in" className="w-full rounded-2xl bg-slate-50 px-4 py-3" />
            <input value={checkOut} onChange={(e)=>setCheckOut(e.target.value)} placeholder="Check-out" className="w-full rounded-2xl bg-slate-50 px-4 py-3" />
            <div className="flex gap-2">
              <input value={guests} onChange={(e)=>setGuests(Number(e.target.value))} placeholder="Guests" className="w-24 rounded-2xl bg-slate-50 px-4 py-3" type="number" data-nosnippet />
              <input value={rooms} onChange={(e)=>setRooms(Number(e.target.value))} placeholder="Rooms" className="w-24 rounded-2xl bg-slate-50 px-4 py-3" type="number" data-nosnippet />
            </div>
            <input value={budget} onChange={(e)=>setBudget(e.target.value)} placeholder="Budget (optional)" className="w-full rounded-2xl bg-slate-50 px-4 py-3" />

            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="rounded-2xl px-6 py-3 text-sm font-extrabold text-white" style={{ background: `linear-gradient(90deg, ${BRAND_BLUE} 0%, ${PREMIUM_BLUE} 100%)` }}>Search hotels</button>
            </div>
          </form>
        )}

        {tab === "cruises" && (
          <form onSubmit={searchCruises} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select value={region} onChange={(e)=>setRegion(e.target.value)} className="w-full rounded-2xl bg-slate-50 px-4 py-3">
              <option value="">Region</option>
              <option>Caribbean</option>
              <option>Mediterranean</option>
              <option>Alaska</option>
            </select>
            <input value={departureMonth} onChange={(e)=>setDepartureMonth(e.target.value)} placeholder="Departure month" className="w-full rounded-2xl bg-slate-50 px-4 py-3" />
            <input value={duration} onChange={(e)=>setDuration(e.target.value)} placeholder="Duration (nights)" className="w-full rounded-2xl bg-slate-50 px-4 py-3" />
            <input value={cruiseGuests} onChange={(e)=>setCruiseGuests(Number(e.target.value))} placeholder="Guests" className="w-full rounded-2xl bg-slate-50 px-4 py-3" type="number" data-nosnippet />

            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="rounded-2xl px-6 py-3 text-sm font-extrabold text-white" style={{ background: `linear-gradient(90deg, ${BRAND_BLUE} 0%, ${PREMIUM_BLUE} 100%)` }}>Search cruises</button>
            </div>
          </form>
        )}

        {tab === "experiences" && (
          <form onSubmit={searchExperiences} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={expDestination} onChange={(e)=>setExpDestination(e.target.value)} placeholder="City / Destination" className="w-full rounded-2xl bg-slate-50 px-4 py-3" />
            <input value={expDate} onChange={(e)=>setExpDate(e.target.value)} placeholder="Date" className="w-full rounded-2xl bg-slate-50 px-4 py-3" />
            <input value={expTravelers} onChange={(e)=>setExpTravelers(Number(e.target.value))} placeholder="Travelers" className="w-full rounded-2xl bg-slate-50 px-4 py-3" type="number" data-nosnippet />
            <select value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full rounded-2xl bg-slate-50 px-4 py-3">
              <option value="">Category</option>
              <option>Adventure</option>
              <option>Relax</option>
              <option>Food</option>
              <option>Family</option>
            </select>

            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="rounded-2xl px-6 py-3 text-sm font-extrabold text-white" style={{ background: `linear-gradient(90deg, ${BRAND_BLUE} 0%, ${PREMIUM_BLUE} 100%)` }}>Search experiences</button>
            </div>
          </form>
        )}

        {tab === "transfers" && (
          <form onSubmit={searchTransfers} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={transferPickup} onChange={(e)=>setTransferPickup(e.target.value)} placeholder="Pickup location" className="w-full rounded-2xl bg-slate-50 px-4 py-3" />
            <input value={transferDropoff} onChange={(e)=>setTransferDropoff(e.target.value)} placeholder="Drop-off location" className="w-full rounded-2xl bg-slate-50 px-4 py-3" />
            <input value={transferDate} onChange={(e)=>setTransferDate(e.target.value)} placeholder="Date" className="w-full rounded-2xl bg-slate-50 px-4 py-3" type="date" />
            <input value={transferPassengers} onChange={(e)=>setTransferPassengers(Number(e.target.value))} placeholder="Passengers" className="w-full rounded-2xl bg-slate-50 px-4 py-3" type="number" data-nosnippet />

            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="rounded-2xl px-6 py-3 text-sm font-extrabold text-white" style={{ background: `linear-gradient(90deg, ${BRAND_BLUE} 0%, ${PREMIUM_BLUE} 100%)` }}>Search transfers</button>
            </div>
          </form>
        )}

        {tab === "cars" && (
          <form onSubmit={searchCars} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={carPickup} onChange={(e)=>setCarPickup(e.target.value)} placeholder="Pickup location" className="w-full rounded-2xl bg-slate-50 px-4 py-3" />
            <input value={carPickupDate} onChange={(e)=>setCarPickupDate(e.target.value)} placeholder="Pickup date" className="w-full rounded-2xl bg-slate-50 px-4 py-3" type="date" />
            <input value={carDropoffDate} onChange={(e)=>setCarDropoffDate(e.target.value)} placeholder="Dropoff date" className="w-full rounded-2xl bg-slate-50 px-4 py-3" type="date" />
            <input value={carDrivers} onChange={(e)=>setCarDrivers(Number(e.target.value))} placeholder="Drivers" className="w-full rounded-2xl bg-slate-50 px-4 py-3" type="number" data-nosnippet />

            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="rounded-2xl px-6 py-3 text-sm font-extrabold text-white" style={{ background: `linear-gradient(90deg, ${BRAND_BLUE} 0%, ${PREMIUM_BLUE} 100%)` }}>Search cars</button>
            </div>
          </form>
        )}

        {tab === "yachts" && (
          <form onSubmit={searchYachts} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={yachtCountry}
              onChange={(e) => setYachtCountry(e.target.value)}
              className="w-full rounded-2xl bg-slate-50 px-4 py-3"
            >
              <option value="">Country</option>
              {countryOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="rounded-2xl px-6 py-3 text-sm font-extrabold text-white" style={{ background: `linear-gradient(90deg, ${BRAND_BLUE} 0%, ${PREMIUM_BLUE} 100%)` }}>
                Search yachts
              </button>
            </div>
          </form>
        )}

        {tab === "airbnbs" && (
          <form onSubmit={searchAirbnbs} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={airbnbCountry}
              onChange={(e) => setAirbnbCountry(e.target.value)}
              className="w-full rounded-2xl bg-slate-50 px-4 py-3"
            >
              <option value="">Country</option>
              {countryOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="rounded-2xl px-6 py-3 text-sm font-extrabold text-white" style={{ background: `linear-gradient(90deg, ${BRAND_BLUE} 0%, ${PREMIUM_BLUE} 100%)` }}>
                Search Airbnbs
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
