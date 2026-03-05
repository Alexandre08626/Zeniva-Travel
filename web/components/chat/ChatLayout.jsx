"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

// ── helpers ──────────────────────────────────────────────────────────────────

function getCurrentUserEmail() {
  if (typeof window === "undefined") return "";
  try {
    // 1. authStore in localStorage
    const raw = localStorage.getItem("zeniva_auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.user?.email) return parsed.user.email.trim().toLowerCase();
    }
    // 2. cookie fallback
    const match = document.cookie.match(/zeniva_email=([^;]+)/);
    if (match) return decodeURIComponent(match[1]).trim().toLowerCase();
  } catch (_) {}
  return "";
}

function getActiveStoreKey(email) {
  const base = "zeniva_trips_store_v1";
  if (!email) return base;
  return `${base}__${email}`;
}

function readAllTrips(email) {
  try {
    const key = getActiveStoreKey(email);
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.trips)) return { key, trips: parsed.trips, store: parsed };
    }
    // fallback: scan all keys
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("zeniva_trips_store_v1"));
    let all = [];
    let foundKey = key;
    for (const k of keys) {
      try {
        const s = JSON.parse(localStorage.getItem(k) || "{}");
        if (Array.isArray(s?.trips) && s.trips.length > 0) {
          all = [...all, ...s.trips];
          foundKey = k;
        }
      } catch (_) {}
    }
    return { key: foundKey, trips: all, store: null };
  } catch (_) {
    return { key: "zeniva_trips_store_v1", trips: [], store: null };
  }
}

function deleteTripFromStorage(tripId, email) {
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("zeniva_trips_store_v1"));
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const store = JSON.parse(raw);
      if (!Array.isArray(store?.trips)) continue;
      const hadIt = store.trips.some((t) => t.id === tripId);
      if (!hadIt) continue;
      store.trips = store.trips.filter((t) => t.id !== tripId);
      // also remove messages/snapshots/proposals/selections
      if (store.messages) delete store.messages[tripId];
      if (store.snapshots) delete store.snapshots[tripId];
      if (store.proposals) delete store.proposals[tripId];
      if (store.selections) delete store.selections[tripId];
      if (store.tripDrafts) delete store.tripDrafts[tripId];
      localStorage.setItem(key, JSON.stringify(store));
    }
    window.dispatchEvent(new Event("storage"));
    // push delete to server too
    if (email) {
      pushTripsToServer(email).catch(() => {});
    }
  } catch (_) {}
}

async function pushTripsToServer(email) {
  if (!email) return;
  try {
    const key = getActiveStoreKey(email);
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const store = JSON.parse(raw);
    await fetch("/api/user-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, tripsState: store }),
    });
  } catch (_) {}
}

async function pullTripsFromServer(email) {
  if (!email) return;
  try {
    const res = await fetch("/api/user-data");
    if (!res.ok) return;
    const payload = await res.json();
    const tripsState = payload?.tripsState;
    if (!tripsState || typeof tripsState !== "object") return;
    const serverTrips = tripsState.trips;
    if (!Array.isArray(serverTrips) || serverTrips.length === 0) return;

    // Merge: server wins over empty local, local wins over empty server
    const key = getActiveStoreKey(email);
    const raw = localStorage.getItem(key);
    const localStore = raw ? JSON.parse(raw) : {};
    const localTrips = Array.isArray(localStore?.trips) ? localStore.trips : [];

    // Merge trips by id: server + local, deduplicated
    const byId = new Map();
    [...serverTrips, ...localTrips].forEach((t) => {
      if (!t?.id) return;
      const existing = byId.get(t.id);
      if (!existing) { byId.set(t.id, t); return; }
      // Keep newer
      const da = new Date(t.updatedAt || 0).getTime();
      const db = new Date(existing.updatedAt || 0).getTime();
      if (da > db) byId.set(t.id, t);
    });

    const mergedStore = {
      ...localStore,
      ...tripsState,
      trips: Array.from(byId.values()),
      messages: { ...(tripsState.messages || {}), ...(localStore.messages || {}) },
      snapshots: { ...(tripsState.snapshots || {}), ...(localStore.snapshots || {}) },
      proposals: { ...(tripsState.proposals || {}), ...(localStore.proposals || {}) },
      selections: { ...(tripsState.selections || {}), ...(localStore.selections || {}) },
      tripDrafts: { ...(tripsState.tripDrafts || {}), ...(localStore.tripDrafts || {}) },
    };
    localStorage.setItem(key, JSON.stringify(mergedStore));
    window.dispatchEvent(new Event("storage"));
  } catch (_) {}
}

function useTrips() {
  const [trips, setTrips] = useState([]);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const email = getCurrentUserEmail();
    setUserEmail(email);

    const load = () => {
      const { trips: all } = readAllTrips(email);
      const seen = new Set();
      const deduped = all.filter((t) => {
        if (!t?.id || seen.has(t.id)) return false;
        seen.add(t.id);
        return true;
      });
      deduped.sort((a, b) => {
        const da = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const db = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return db - da;
      });
      setTrips(deduped.slice(0, 10));
    };

    load();

    // Pull from Supabase once if user is logged in
    if (email) {
      pullTripsFromServer(email).then(load).catch(() => {});
    }

    window.addEventListener("storage", load);
    const interval = setInterval(load, 3000);
    return () => {
      window.removeEventListener("storage", load);
      clearInterval(interval);
    };
  }, []);

  return { trips, userEmail };
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
  const { trips, userEmail } = useTrips();
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

  const handleDeleteTrip = (e, deletedTripId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this trip conversation? This cannot be undone.")) return;
    deleteTripFromStorage(deletedTripId, userEmail);
    // If deleting active trip, go to new trip
    if (deletedTripId === tripId) {
      const id = createNewTrip();
      router.push(`/chat/${id}`);
    }
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
                      <div key={trip.id} className={`flex items-center gap-0 border-b border-slate-50 group ${isActive ? "bg-blue-50" : "hover:bg-slate-50"} transition`}>
                        <Link
                          href={`/chat/${trip.id}`}
                          onClick={() => setTripsOpen(false)}
                          className="flex items-center gap-3 flex-1 min-w-0 px-4 py-3"
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
                            <span className="text-blue-500 text-xs font-bold flex-shrink-0 mr-1">Active</span>
                          )}
                        </Link>
                        {/* Delete button */}
                        <button
                          onClick={(e) => handleDeleteTrip(e, trip.id)}
                          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition opacity-0 group-hover:opacity-100 mr-2"
                          title="Delete this trip"
                        >
                          ×
                        </button>
                      </div>
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
