"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

function useTrips() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const load = () => {
      try {
        // Try all zeniva trip store keys
        const keys = Object.keys(localStorage).filter(
          (k) => k.startsWith("zeniva_trips_store_v1")
        );
        let allTrips = [];
        keys.forEach((key) => {
          try {
            const raw = localStorage.getItem(key);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed?.trips)) {
              allTrips = [...allTrips, ...parsed.trips];
            }
          } catch (_) {}
        });
        // Deduplicate by id
        const seen = new Set();
        allTrips = allTrips.filter((t) => {
          if (seen.has(t.id)) return false;
          seen.add(t.id);
          return true;
        });
        // Sort by updatedAt desc, max 10
        allTrips.sort((a, b) => {
          const da = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const db = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return db - da;
        });
        setTrips(allTrips.slice(0, 10));
      } catch (_) {}
    };

    load();
    window.addEventListener("storage", load);
    // Also poll every 3s for same-tab updates
    const interval = setInterval(load, 3000);
    return () => {
      window.removeEventListener("storage", load);
      clearInterval(interval);
    };
  }, []);

  return trips;
}

function createNewTrip() {
  try {
    const keys = Object.keys(localStorage).filter(
      (k) => k.startsWith("zeniva_trips_store_v1")
    );
    const key = keys[0] || "zeniva_trips_store_v1";
    const raw = localStorage.getItem(key);
    const store = raw ? JSON.parse(raw) : { trips: [], messages: {}, snapshots: {}, proposals: {}, selections: {} };

    const id = `trip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newTrip = {
      id,
      title: "New Trip",
      status: "planning",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = {
      ...store,
      trips: [newTrip, ...(store.trips || [])].slice(0, 10),
    };
    localStorage.setItem(key, JSON.stringify(updated));
    return id;
  } catch (_) {
    return `trip-${Date.now()}`;
  }
}

export default function ChatLayout({ sidebar, chat, snapshot, tripId, backHref = "/", backLabel = "Back" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tripsOpen, setTripsOpen] = useState(false);
  const trips = useTrips();
  const router = useRouter();
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setTripsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNewTrip = () => {
    const id = createNewTrip();
    setTripsOpen(false);
    router.push(`/chat/${id}`);
  };

  const getTripLabel = (trip) => {
    if (trip.title && trip.title !== "New Trip") return trip.title;
    const snap = (() => {
      try {
        const keys = Object.keys(localStorage).filter((k) => k.startsWith("zeniva_trips_store_v1"));
        for (const key of keys) {
          const store = JSON.parse(localStorage.getItem(key) || "{}");
          const snap = store.snapshots?.[trip.id];
          if (snap?.destination) return snap;
        }
      } catch (_) {}
      return null;
    })();
    if (snap?.destination) return snap.destination;
    return `Trip ${trip.id.slice(-4)}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top bar — white */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href={backHref} className="text-slate-500 hover:text-slate-800 text-sm font-semibold flex items-center gap-1 transition-colors">
            <span>←</span> <span className="hidden sm:inline">{backLabel}</span>
          </Link>
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-2">
            <Image src="/branding/lina-avatar.png" alt="Lina" width={30} height={30} className="rounded-full ring-2 ring-blue-100" />
            <div>
              <span className="text-slate-900 font-black text-sm">Lina</span>
              <span className="text-blue-600 font-black text-sm"> AI</span>
            </div>
            <div className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-700 text-xs font-bold">Online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* My Trips dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setTripsOpen(!tripsOpen)}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border transition-all"
              style={tripsOpen
                ? { background: "#E6B85A", color: "white", borderColor: "#E6B85A" }
                : { background: "white", color: "#E6B85A", borderColor: "#E6B85A" }
              }
            >
              <span>💬</span>
              <span className="hidden sm:inline">My Trips</span>
              {trips.length > 0 && (
                <span className="bg-blue-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {trips.length}
                </span>
              )}
              <span className={`transition-transform duration-200 ${tripsOpen ? "rotate-180" : ""}`}>▾</span>
            </button>

            {/* Dropdown */}
            {tripsOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">My Conversations</span>
                  <span className="text-xs text-slate-400">{trips.length}/10</span>
                </div>

                {/* Trip list */}
                <div className="max-h-64 overflow-y-auto">
                  {trips.length === 0 && (
                    <div className="px-4 py-6 text-center text-sm text-slate-400">
                      No trips yet — start a new one!
                    </div>
                  )}
                  {trips.map((trip) => {
                    const isActive = trip.id === tripId;
                    const label = getTripLabel(trip);
                    const date = trip.updatedAt || trip.createdAt;
                    const dateStr = date ? new Date(date).toLocaleDateString([], { month: "short", day: "numeric" }) : "";
                    return (
                      <Link
                        key={trip.id}
                        href={`/chat/${trip.id}`}
                        onClick={() => setTripsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition ${isActive ? "bg-blue-50" : ""}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${isActive ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-600"}`}>
                          ✈️
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${isActive ? "text-blue-700" : "text-slate-900"}`}>
                            {label}
                          </p>
                          <p className="text-xs text-slate-400">{dateStr}</p>
                        </div>
                        {isActive && (
                          <span className="text-blue-500 text-xs font-bold flex-shrink-0">Active</span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* New trip button */}
                <div className="p-3 border-t border-slate-100">
                  <button
                    onClick={handleNewTrip}
                    disabled={trips.length >= 10}
                    className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-40"
                    style={{ background: "linear-gradient(90deg, #0F3A8A, #1a4fad)" }}
                  >
                    {trips.length >= 10 ? "Max 10 trips reached" : "+ New Trip Conversation"}
                  </button>
                  {trips.length >= 10 && (
                    <p className="text-center text-xs text-slate-400 mt-1">Delete a trip to add a new one</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Trip details */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border transition-all"
            style={sidebarOpen
              ? { background: "#0F3A8A", color: "white", borderColor: "#0F3A8A" }
              : { background: "white", color: "#0F3A8A", borderColor: "#0F3A8A" }
            }
          >
            <span>✈️</span>
            <span className="hidden sm:inline">Trip Details</span>
            <span className={`transition-transform duration-200 ${sidebarOpen ? "rotate-180" : ""}`}>▾</span>
          </button>

          <Link
            href={`/call/${tripId || ""}`}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black text-white"
            style={{ background: "linear-gradient(90deg, #0F3A8A, #1a4fad)" }}
          >
            <span>📞</span>
            <span className="hidden sm:inline">Call Lina</span>
          </Link>
        </div>
      </header>

      {/* Trip details drawer */}
      {sidebarOpen && (
        <div className="border-b border-slate-200 bg-white shadow-sm">
          <div className="max-w-5xl mx-auto px-6 py-5">
            {snapshot}
          </div>
        </div>
      )}

      {/* Main chat — full width */}
      <div className="flex-1 flex flex-col w-[90%] mx-auto py-4">
        {chat}
      </div>
    </div>
  );
}
