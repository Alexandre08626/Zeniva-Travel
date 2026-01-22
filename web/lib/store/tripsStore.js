"use client";
export function deleteTrip(tripId) {
  setState((s) => {
    const trips = s.trips.filter((t) => t.id !== tripId);
    const { [tripId]: _, ...messages } = s.messages;
    const { [tripId]: __, ...snapshots } = s.snapshots;
    const { [tripId]: ___, ...proposals } = s.proposals;
    const { [tripId]: ____, ...selections } = s.selections;
    return { ...s, trips, messages, snapshots, proposals, selections };
  });
}
import { useEffect, useSyncExternalStore } from "react";

const BASE_STORAGE_KEY = "zeniva_trips_store_v1";
let activeStorageKey = BASE_STORAGE_KEY;
const hydratedKeys = new Set();

const defaultState = {
  trips: [],
  messages: {}, // { [tripId]: [{ id, role, content, createdAt }] }
  snapshots: {}, // { [tripId]: { departure, destination, dates, travelers, budget, style, accommodationType, transportationType } }
  tripDrafts: {}, // { [tripId]: { departureCity, destination, checkIn, checkOut, adults, childrenAges, budget, currency, accommodationType, transportationType, style, notes, status, lastPatch } }
  proposals: {}, // { [tripId]: { tripId, title, sections, priceEstimate, images, notes, updatedAt } }
  selections: {}, // { [tripId]: { flight, hotel, activities: [], transfers: [] } }
};

let state = { ...defaultState };
let activeUserEmail = "";
let syncTimer = null;

function storageKeyFor(userId) {
  const trimmed = (userId || "guest").trim().toLowerCase();
  return `${BASE_STORAGE_KEY}__${trimmed || "guest"}`;
}

function loadFromStorage(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

let hasHydrated = false;

function persist(nextState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(activeStorageKey, JSON.stringify(nextState));
  } catch (e) {
    // ignore storage failures
  }
}

function getTripsStateSnapshot() {
  return {
    trips: state.trips,
    messages: state.messages,
    snapshots: state.snapshots,
    tripDrafts: state.tripDrafts,
    proposals: state.proposals,
    selections: state.selections,
  };
}

async function pushTripsToServer(email) {
  if (typeof window === "undefined" || !email) return;
  try {
    await fetch("/api/user-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, tripsState: getTripsStateSnapshot() }),
    });
  } catch (_) {
    // ignore
  }
}

function scheduleServerSync() {
  if (!activeUserEmail || typeof window === "undefined") return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    pushTripsToServer(activeUserEmail);
  }, 800);
}

function hydrate(key = activeStorageKey) {
  if (typeof window === "undefined" || hydratedKeys.has(key)) return;
  hydratedKeys.add(key);
  const parsed = loadFromStorage(key);
  if (parsed) {
    setState((s) => ({ ...s, ...defaultState, ...parsed }));
    hasHydrated = true;
  } else {
    // ensure we still notify subscribers so UI doesn't wait forever
    setState((s) => ({ ...defaultState, ...s }));
  }
}

const listeners = new Set();

function setState(updater) {
  const next = typeof updater === "function" ? updater(state) : updater;
  state = next;
  persist(state);
  scheduleServerSync();
  listeners.forEach((l) => l());
}

export function setTripUserScope(userId) {
  const nextKey = storageKeyFor(userId);
  if (nextKey === activeStorageKey) return;
  activeUserEmail = userId ? String(userId).trim().toLowerCase() : "";
  activeStorageKey = nextKey;
  const parsed = loadFromStorage(activeStorageKey);
  state = { ...defaultState, ...(parsed || {}) };
  // notify subscribers of scope change
  listeners.forEach((l) => l());
}

export async function syncTripsFromServer(email) {
  if (typeof window === "undefined" || !email) return;
  activeUserEmail = String(email).trim().toLowerCase();
  try {
    const res = await fetch("/api/user-data");
    if (!res.ok) return;
    const payload = await res.json();
    const tripsState = payload?.tripsState;
    if (tripsState && typeof tripsState === "object") {
      setState((s) => ({
        ...s,
        trips: tripsState.trips || s.trips,
        messages: tripsState.messages || s.messages,
        snapshots: tripsState.snapshots || s.snapshots,
        tripDrafts: tripsState.tripDrafts || s.tripDrafts,
        proposals: tripsState.proposals || s.proposals,
        selections: tripsState.selections || s.selections,
      }));
    }
  } catch (_) {
    // ignore
  }
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getState() {
  return state;
}

export function useTripsStore(selector = (s) => s) {
  // Hydrate client-side after first render to avoid SSR/CSR mismatches.
  useEffect(() => {
    hydrate();
  }, []);

  // Keep getSnapshot stable by returning the raw state object; apply selector after.
  const snapshot = useSyncExternalStore(subscribe, () => state, () => state);
  return selector(snapshot);
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function ensureTrip(tripId) {
  const exists = state.trips.find((t) => t.id === tripId);
  if (exists) return exists.id;
  const title = "New Trip";
  const id = tripId || uid();
  const createdAt = new Date().toISOString();
  const trip = { id, title, status: "Draft", lastMessage: "", updatedAt: createdAt };
  setState((s) => ({
    ...s,
    trips: [trip, ...s.trips],
    messages: { ...s.messages, [id]: s.messages[id] || [] },
    snapshots: {
      ...s.snapshots,
      [id]: s.snapshots[id] || {
        departure: "",
        destination: "",
        dates: "",
        travelers: "",
        budget: "",
        style: "",
      },
    },
  }));
  return id;
}

export function createTrip(initial = {}) {
  const id = uid();
  const title = initial.title || "New Trip";
  const createdAt = new Date().toISOString();
  const trip = { id, title, status: initial.status || "Draft", lastMessage: "", updatedAt: createdAt };
  setState((s) => ({
    ...s,
    trips: [trip, ...s.trips],
    messages: { ...s.messages, [id]: [] },
    snapshots: {
      ...s.snapshots,
      [id]: {
        departure: initial.departure || "",
        destination: initial.destination || "",
        dates: initial.dates || "",
        travelers: initial.travelers || "",
        budget: initial.budget || "",
        style: initial.style || "",
      },
    },
    selections: { ...s.selections, [id]: s.selections[id] || { flight: null, hotel: null } },
  }));
  return id;
}

export function addMessage(tripId, role, content) {
  const ensuredId = ensureTrip(tripId);
  const message = { id: uid(), role, content, createdAt: new Date().toISOString() };
  setState((s) => {
    const msgs = [...(s.messages[ensuredId] || []), message];
    const trips = s.trips.map((t) =>
      t.id === ensuredId
        ? { ...t, lastMessage: content.slice(0, 120), updatedAt: message.createdAt }
        : t
    );
    return { ...s, messages: { ...s.messages, [ensuredId]: msgs }, trips };
  });
  return message;
}

export function setTripTitle(tripId, title) {
  ensureTrip(tripId);
  setState((s) => ({
    ...s,
    trips: s.trips.map((t) => (t.id === tripId ? { ...t, title } : t)),
  }));
}

export function setTripStatus(tripId, status) {
  ensureTrip(tripId);
  setState((s) => ({
    ...s,
    trips: s.trips.map((t) => (t.id === tripId ? { ...t, status } : t)),
  }));
}

export function updateSnapshot(tripId, patch) {
  const ensuredId = ensureTrip(tripId);
  setState((s) => ({
    ...s,
    snapshots: {
      ...s.snapshots,
      [ensuredId]: { ...s.snapshots[ensuredId], ...patch },
    },
  }));
}

export function updateTrip(tripId, patch) {
  setState((s) => {
    const trips = s.trips.map((t) => t.id === tripId ? { ...t, ...patch } : t);
    return { ...s, trips };
  });
}

export function applyTripPatch(tripId, patch) {
  const ensuredId = ensureTrip(tripId);
  setState((s) => ({
    ...s,
    tripDrafts: {
      ...s.tripDrafts,
      [ensuredId]: { ...s.tripDrafts[ensuredId], ...patch, lastPatch: { ...patch, timestamp: new Date().toISOString() } },
    },
  }));
}

export function getTripDraft(tripId) {
  return state.tripDrafts[tripId] || {};
}

export function setTripDraftStatus(tripId, status) {
  applyTripPatch(tripId, { status });
}

export async function generateProposal(tripId) {
  const ensuredId = ensureTrip(tripId);
  const tripDraft = state.tripDrafts[ensuredId] || {};
  const trip = state.trips.find((t) => t.id === ensuredId) || { title: "Trip" };
  const sections = [];

  if (tripDraft.transportationType === "Flights") {
    sections.push({
      title: "Flights",
      items: [
        `${tripDraft.departureCity || "Origin"} → ${tripDraft.destination || "Destination"}`,
        tripDraft.checkIn && tripDraft.checkOut ? `${tripDraft.checkIn} → ${tripDraft.checkOut}` : "Flexible dates",
      ],
    });
  }

  const accommodationTitle = tripDraft.accommodationType === "Yacht" ? "Yachts" :
                             tripDraft.accommodationType === "Airbnb" ? "Airbnbs" :
                             tripDraft.accommodationType === "Resort" ? "Resorts" : "Hotels";
  sections.push({
    title: accommodationTitle,
    items: [tripDraft.style || "Curated stays", tripDraft.budget ? `Budget: ${tripDraft.currency || 'USD'} ${tripDraft.budget}` : "Mid-luxury"],
  });

  // Add Activities and Transfers sections if requested
  if (tripDraft.includeActivities) {
    sections.push({
      title: "Activities",
      items: ["Loading activities..."],
    });
  }

  if (tripDraft.includeTransfers) {
    sections.push({
      title: "Transfers",
      items: ["Loading transfers..."],
    });
  }

  sections.push({
    title: "Experiences",
    items: ["Guided city highlights", "Local food tour", "Free day for leisure"],
  });

  const proposal = {
    tripId: ensuredId,
    title: trip.title || "Trip Proposal",
    sections,
    priceEstimate: tripDraft.budget ? `${tripDraft.currency || 'USD'} ${tripDraft.budget}` : "On request",
    images: [
      "https://images.unsplash.com/photo-1502920917128-1aa500764b5d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=900&q=80",
    ],
    notes: "Draft generated from conversation and snapshot.",
    updatedAt: new Date().toISOString(),
  };

  setState((s) => ({
    ...s,
    proposals: { ...s.proposals, [ensuredId]: proposal },
    trips: s.trips.map((t) => (t.id === ensuredId ? { ...t, status: "Ready" } : t)),
    selections: { ...s.selections, [ensuredId]: s.selections[ensuredId] || { flight: null, hotel: null, activities: [], transfers: [] } },
  }));

  // Trigger automatic searches for activities and transfers
  if (tripDraft.includeActivities && tripDraft.destination && tripDraft.checkIn && tripDraft.checkOut) {
    try {
      console.log(`🔄 Auto-searching activities for ${tripDraft.destination}`);
      const activitiesResponse = await fetch('/api/partners/hotelbeds/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: tripDraft.destination,
          from: tripDraft.checkIn,
          to: tripDraft.checkOut,
          adults: tripDraft.adults || 2,
          children: 0,
          language: "en"
        })
      });

      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setState((s) => ({
          ...s,
          selections: {
            ...s.selections,
            [ensuredId]: {
              ...s.selections[ensuredId],
              activities: activitiesData.activities || []
            }
          }
        }));
        console.log(`✅ Found ${activitiesData.activities?.length || 0} activities`);
      }
    } catch (error) {
      console.error('Failed to auto-search activities:', error);
    }
  }

  if (tripDraft.includeTransfers && tripDraft.destination && tripDraft.checkIn) {
    try {
      console.log(`🔄 Auto-searching transfers for ${tripDraft.destination}`);
      const transfersResponse = await fetch('/api/partners/hotelbeds/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupLocation: `${tripDraft.destination} Airport`,
          dropoffLocation: `${tripDraft.destination} City Center`,
          pickupDate: tripDraft.checkIn,
          pickupTime: "10:00",
          adults: tripDraft.adults || 2,
          children: 0,
          transferType: "PRIVATE",
          direction: "ONE_WAY"
        })
      });

      if (transfersResponse.ok) {
        const transfersData = await transfersResponse.json();
        setState((s) => ({
          ...s,
          selections: {
            ...s.selections,
            [ensuredId]: {
              ...s.selections[ensuredId],
              transfers: transfersData.transfers || []
            }
          }
        }));
        console.log(`✅ Found ${transfersData.transfers?.length || 0} transfers`);
      }
    } catch (error) {
      console.error('Failed to auto-search transfers:', error);
    }
  }

  return proposal;
}

export function getProposal(tripId) {
  return state.proposals[tripId];
}

export function setProposalSelection(tripId, { flight, hotel, activity, transfer } = {}) {
  const ensuredId = ensureTrip(tripId);
  setState((s) => ({
    ...s,
    selections: {
      ...s.selections,
      [ensuredId]: {
        flight: flight ?? s.selections[ensuredId]?.flight ?? null,
        hotel: hotel ?? s.selections[ensuredId]?.hotel ?? null,
        activity: activity ?? s.selections[ensuredId]?.activity ?? null,
        transfer: transfer ?? s.selections[ensuredId]?.transfer ?? null,
      },
    },
  }));
}

export function getProposalSelection(tripId) {
  return state.selections[tripId] || { flight: null, hotel: null, activity: null, transfer: null };
}

export function ensureSeedTrip() {
  if (state.trips.length > 0) return state.trips[0].id;
  return createTrip({ title: "Mediterranean Escape", destination: "Mallorca", style: "Boutique" });
}

export function clearStore() {
  setState({ ...defaultState });
}
