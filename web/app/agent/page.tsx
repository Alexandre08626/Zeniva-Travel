"use client";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PREMIUM_BLUE, TITLE_TEXT, MUTED_TEXT, ACCENT_GOLD } from "../../src/design/tokens";
import { useAuthStore, isHQ, logout } from "../../src/lib/authStore";

interface HelpTicket {
  ticket: string;
  title: string;
  status: 'open' | 'read';
  messages: { role: string; text: string; ts: string }[];
}

const modules = [
  { id: "clients", title: "Clients", desc: "Traveler profiles, preferences, history", href: "#clients" },
  { id: "proposals", title: "Proposals Builder", desc: "Create, edit, resume", href: "#proposals" },
  { id: "bookings", title: "Bookings", desc: "Flights, hotels, excursions", href: "#bookings" },
  { id: "crm", title: "Light CRM", desc: "Pipeline and statuses", href: "#crm" },
  { id: "performance", title: "Performance", desc: "Active files, conversions", href: "#performance" },
];

export default function AgentDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);
  const [unreadCount, setUnreadCount] = useState(0);
  const navLinks = useMemo(
    () => [
      { label: "Dashboard", href: "/agent" },
      { label: "Clients", href: "/agent/clients" },
      { label: "Proposals", href: "/agent/proposals" },
      { label: "Purchase Orders", href: "/agent/purchase-orders" },
      { label: "Bookings", href: "/agent/bookings" },
      { label: "Commissions", href: "/agent/commissions" },
      { label: "Yachts", href: "/agent/yachts" },
      { label: "Chat", href: "/agent/chat" },
      ...(hq
        ? [
            { label: "Control Tower", href: "/agent/control-tower" },
            { label: "Finance", href: "/agent/finance" },
            { label: "Agent Command", href: "/agent/agents" },
          ]
        : []),
      { label: "Settings", href: "/agent/settings" },
    ],
    [hq]
  );

  const [query, setQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState("Unassigned");
  const [scopes, setScopes] = useState<string[]>(["flights", "hotels", "resorts", "excursions", "transfers", "cars", "yachts"]);
  const [auditTrail, setAuditTrail] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels' | 'transfers'>('flights');
  const [flightFields, setFlightFields] = useState({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    passengers: 1,
    cabin: 'economy'
  });
  const [hotelFields, setHotelFields] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    rooms: 1
  });
  const [transferFields, setTransferFields] = useState({
    pickup: '',
    dropoff: '',
    date: '',
    time: '',
    passengers: 1
  });

  useEffect(() => {
    const checkUnread = () => {
      const helpTickets: HelpTicket[] = JSON.parse(localStorage.getItem('helpTickets') || '[]');
      const unread = helpTickets.filter((ticket) => ticket.status === 'open').length;
      setUnreadCount(unread);
    };

    checkUnread();
    const interval = setInterval(checkUnread, 5000);
    return () => clearInterval(interval);
  }, []);

  const scopeOptions = [
    { key: "flights", label: "Flights" },
    { key: "hotels", label: "Hotels" },
    { key: "resorts", label: "Resorts" },
    { key: "excursions", label: "Excursions" },
    { key: "transfers", label: "Transfers" },
    { key: "cars", label: "Cars" },
    { key: "yachts", label: "Yachts" },
  ];

  const clients = ["Unassigned", "Martin Dupuis", "HQ – Escapes", "VIP – Lavoie", "Corporate – NovaTech"];

  const toggleScope = (key: string) => {
    setScopes((prev) => (prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]));
  };

  const handlePrimarySubmit = () => {
    let q = '';
    if (activeTab === 'flights') {
      q = `Flight search: from ${flightFields.from} to ${flightFields.to}, depart ${flightFields.departDate}, return ${flightFields.returnDate}, ${flightFields.passengers} passengers, ${flightFields.cabin} class`;
    } else if (activeTab === 'hotels') {
      q = `Hotel search: ${hotelFields.destination}, check-in ${hotelFields.checkIn}, check-out ${hotelFields.checkOut}, ${hotelFields.guests} guests, ${hotelFields.rooms} rooms`;
    } else if (activeTab === 'transfers') {
      q = `Transfer search: pickup ${transferFields.pickup}, dropoff ${transferFields.dropoff}, date ${transferFields.date}, time ${transferFields.time}, ${transferFields.passengers} passengers`;
    }
    if (!q.trim()) return;
    const entry = `${new Date().toLocaleTimeString()} · PRIMARY · Client: ${selectedClient} · Scope: ${scopes.join("/")} · ${q.trim()}`;
    setAuditTrail((prev) => [entry, ...prev].slice(0, 6));
    router.push(`/agent/proposals?q=${encodeURIComponent(q.trim())}`);
  };

  const submitHybrid = () => {
    if (!query.trim()) return;
    const entry = `${new Date().toLocaleTimeString()} · HYBRID · Client: ${selectedClient} · Scope: ${scopes.join("/")} · ${query.trim()}`;
    setAuditTrail((prev) => [entry, ...prev].slice(0, 6));
    setQuery(query.trim());
    router.push(`/agent/proposals${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
  };

  const handleHybridSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitHybrid();
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F3F6FB" }}>
      <div className="mx-auto max-w-6xl px-5 py-8 space-y-8">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Agent Portal</p>
            <h1 className="text-3xl md:text-4xl font-black" style={{ color: TITLE_TEXT }}>
              Zeniva production workspace
            </h1>
            <p className="text-sm md:text-base" style={{ color: MUTED_TEXT }}>
              Reserved for Zeniva agents. Lina runs in production mode to create, compare, and finalize files.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/agent/lina" className="rounded-full px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: PREMIUM_BLUE }}>
              Open Lina (Agent)
            </Link>
            <Link href="/agent/settings" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              Settings
            </Link>
            <button
              onClick={() => logout("/")}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold hover:border-slate-400"
              style={{ color: TITLE_TEXT }}
              type="button"
            >
              Logout
            </button>
          </div>
        </header>

        <nav className="flex flex-wrap gap-2 text-sm">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className="relative rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-800 hover:border-slate-400">
              {item.label}
              {item.label === "Chat" && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <section className="grid gap-6">
          <div
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl p-[1px] md:sticky md:top-4"
          >
            <div className="rounded-[14px] bg-white/90 backdrop-blur-sm p-6">
              <div className="absolute inset-0 -z-10 opacity-40" style={{ background: "radial-gradient(circle at 30% 20%, rgba(59,130,246,0.35), transparent 45%), radial-gradient(circle at 80% 0%, rgba(16,185,129,0.2), transparent 40%)" }}></div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-slate-100 shadow-lg">
                    <img src="/branding/lina-avatar.png" alt="Lina" className="h-full w-full object-cover" />
                    <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border border-white" style={{ backgroundColor: PREMIUM_BLUE }}></span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Lina Agent Command Bar</p>
                    <h2 className="text-2xl font-black" style={{ color: TITLE_TEXT }}>Production-grade control</h2>
                    <p className="text-sm" style={{ color: MUTED_TEXT }}>
                      Hybrid bar for manual provider search + Lina AI. No auto-booking—every action audited and tied to a dossier.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
                  <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: PREMIUM_BLUE }}></span>
                  Hybrid default · Agent production
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-700">
                {["Compare best nonstop flights", "Draft proposal", "Audit-logged", "Attach to client", "No auto-book", "Voice-ready"].map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 shadow-inner"
                  >
                    {pill}
                  </span>
                ))}
              </div>

            <form onSubmit={handleHybridSubmit} className="mt-6 space-y-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Primary Search Bar — Classic</p>
                    <div className="flex gap-1 mb-4">
                      {['flights', 'hotels', 'transfers'].map(tab => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveTab(tab as 'flights' | 'hotels' | 'transfers')}
                          className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>
                    {activeTab === 'flights' && (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-500">From</label>
                          <input
                            type="text"
                            value={flightFields.from}
                            onChange={e => setFlightFields({...flightFields, from: e.target.value})}
                            placeholder="Departure city"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500">To</label>
                          <input
                            type="text"
                            value={flightFields.to}
                            onChange={e => setFlightFields({...flightFields, to: e.target.value})}
                            placeholder="Arrival city"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500">Depart Date</label>
                          <input
                            type="date"
                            value={flightFields.departDate}
                            onChange={e => setFlightFields({...flightFields, departDate: e.target.value})}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500">Return Date</label>
                          <input
                            type="date"
                            value={flightFields.returnDate}
                            onChange={e => setFlightFields({...flightFields, returnDate: e.target.value})}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500">Passengers</label>
                          <input
                            type="number"
                            value={flightFields.passengers}
                            onChange={e => setFlightFields({...flightFields, passengers: parseInt(e.target.value) || 1})}
                            min="1"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500">Cabin Class</label>
                          <select
                            value={flightFields.cabin}
                            onChange={e => setFlightFields({...flightFields, cabin: e.target.value})}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          >
                            <option value="economy">Economy</option>
                            <option value="premium">Premium Economy</option>
                            <option value="business">Business</option>
                            <option value="first">First</option>
                          </select>
                        </div>
                      </div>
                    )}
                    {activeTab === 'hotels' && (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-500">Destination</label>
                          <input
                            type="text"
                            value={hotelFields.destination}
                            onChange={e => setHotelFields({...hotelFields, destination: e.target.value})}
                            placeholder="City or hotel name"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500">Check-in</label>
                          <input
                            type="date"
                            value={hotelFields.checkIn}
                            onChange={e => setHotelFields({...hotelFields, checkIn: e.target.value})}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500">Check-out</label>
                          <input
                            type="date"
                            value={hotelFields.checkOut}
                            onChange={e => setHotelFields({...hotelFields, checkOut: e.target.value})}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500">Guests</label>
                          <input
                            type="number"
                            value={hotelFields.guests}
                            onChange={e => setHotelFields({...hotelFields, guests: parseInt(e.target.value) || 1})}
                            min="1"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500">Rooms</label>
                          <input
                            type="number"
                            value={hotelFields.rooms}
                            onChange={e => setHotelFields({...hotelFields, rooms: parseInt(e.target.value) || 1})}
                            min="1"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    )}
                    {activeTab === 'transfers' && (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-500">Pickup Location</label>
                          <input
                            type="text"
                            value={transferFields.pickup}
                            onChange={e => setTransferFields({...transferFields, pickup: e.target.value})}
                            placeholder="Pickup address"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500">Dropoff Location</label>
                          <input
                            type="text"
                            value={transferFields.dropoff}
                            onChange={e => setTransferFields({...transferFields, dropoff: e.target.value})}
                            placeholder="Dropoff address"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500">Date</label>
                          <input
                            type="date"
                            value={transferFields.date}
                            onChange={e => setTransferFields({...transferFields, date: e.target.value})}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500">Time</label>
                          <input
                            type="time"
                            value={transferFields.time}
                            onChange={e => setTransferFields({...transferFields, time: e.target.value})}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500">Passengers</label>
                          <input
                            type="number"
                            value={transferFields.passengers}
                            onChange={e => setTransferFields({...transferFields, passengers: parseInt(e.target.value) || 1})}
                            min="1"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    )}
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={handlePrimarySubmit}
                        className="rounded-full px-6 py-3 text-sm font-bold text-white shadow-lg"
                        style={{ background: "linear-gradient(90deg, #2563eb, #0ea5e9)" }}
                      >
                        Start Classic Search
                      </button>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Hybrid Search — AI-Assisted</p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 mt-2">
                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-inner sm:flex-1">
                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">/</span>
                        <input
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Build a 7-day Cancun luxury trip for 2 adults, budget 5k"
                          className="w-full text-sm outline-none"
                          aria-label="Hybrid search command"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={submitHybrid}
                        className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold text-white shadow-lg sm:self-stretch"
                        style={{ background: "linear-gradient(90deg, #2563eb, #0ea5e9)" }}
                      >
                        Start Hybrid Search
                      </button>
                    </div>
                    <p className="text-xs mt-2" style={{ color: MUTED_TEXT }}>
                      Hybrid = Human control + Lina intelligence. Assists with ideas and speeds up manual work.
                    </p>
                  </div>
                </div>

                <div className="md:w-[320px] space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Lina Chat</p>
                  <Link href="/agent/chat" className="block w-fit">
                    <img
                      src="/branding/lina-avatar.png"
                      alt="Lina avatar"
                      className="h-16 w-16 rounded-full border border-slate-200 shadow-sm"
                    />
                  </Link>
                  <p className="text-xs" style={{ color: MUTED_TEXT }}>
                    Click to open Lina Chat Mode for conversation, planning, and voice call option.
                  </p>
                </div>
              </div>







              <div className="rounded-xl border border-slate-100 bg-slate-900/80 text-slate-50 p-3 shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-200">Live audit trail</p>
                <div className="mt-2 space-y-1 text-xs font-semibold">
                  {auditTrail.length === 0 ? (
                    <p className="text-slate-300">Ready. Every command is logged and linked to the selected client.</p>
                  ) : (
                    auditTrail.map((entry, idx) => (
                      <p key={idx} className="truncate">• {entry}</p>
                    ))
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <div className="grid gap-4 md:grid-cols-3">
              {modules.map((m) => (
                <div key={m.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 flex flex-col gap-2 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{m.id}</p>
                  <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>{m.title}</h3>
                  <p className="text-sm" style={{ color: MUTED_TEXT }}>{m.desc}</p>
                  <Link href={m.href} className="text-xs font-bold" style={{ color: PREMIUM_BLUE }}>
                    Open →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Production view</p>
              <h2 className="text-2xl font-black" style={{ color: TITLE_TEXT }}>Pipeline</h2>
              <p className="text-sm" style={{ color: MUTED_TEXT }}>Active files, conversions, revenue (placeholder).</p>
            </div>
            <Link href="#performance" className="rounded-full px-4 py-2 text-sm font-bold text-slate-900" style={{ backgroundColor: ACCENT_GOLD }}>
              Update
            </Link>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Active files</p>
              <p className="text-2xl font-black" style={{ color: TITLE_TEXT }}>12</p>
              <p className="text-xs" style={{ color: MUTED_TEXT }}>Clients in progress.</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Conversions</p>
              <p className="text-2xl font-black" style={{ color: TITLE_TEXT }}>38%</p>
              <p className="text-xs" style={{ color: MUTED_TEXT }}>Last 30 days.</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Forecasted revenue</p>
              <p className="text-2xl font-black" style={{ color: TITLE_TEXT }}>$126k</p>
              <p className="text-xs" style={{ color: MUTED_TEXT }}>To be detailed.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
