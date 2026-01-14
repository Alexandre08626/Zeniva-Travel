"use client";
import { useSyncExternalStore } from "react";

export type DocumentRecord = {
  id: string;
  tripId: string;
  userId: string;
  type: string;
  title: string;
  url: string;
  provider?: string;
  confirmationNumber?: string;
  updatedAt?: string;
  details?: string;
};

type DocumentState = {
  documents: Record<string, Record<string, DocumentRecord[]>>; // userId -> tripId -> docs
};

const STORAGE_KEY = "zeniva_documents_store_v1";

const defaultState: DocumentState = {
  documents: {},
};

let state: DocumentState = { ...defaultState };

function persist(next: DocumentState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (_) {
    // ignore storage errors
  }
}

(function hydrate() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = { ...defaultState, ...parsed };
    }
  } catch (_) {
    // ignore parse errors
  }
})();

const listeners = new Set<() => void>();

function setState(updater: DocumentState | ((s: DocumentState) => DocumentState)) {
  const next = typeof updater === "function" ? (updater as (s: DocumentState) => DocumentState)(state) : updater;
  state = next;
  persist(state);
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useDocumentsStore<T = DocumentState>(selector: (s: DocumentState) => T = (s) => s as unknown as T) {
  const snapshot = useSyncExternalStore(subscribe, () => state, () => state);
  return selector(snapshot);
}

export function getDocumentsForUser(userId?: string) {
  if (!userId) return {} as Record<string, DocumentRecord[]>;
  return state.documents[userId] || {};
}

export function setDocumentsForUser(userId: string, docsByTrip: Record<string, DocumentRecord[]>) {
  if (!userId) return;
  setState((s) => ({
    ...s,
    documents: { ...s.documents, [userId]: docsByTrip },
  }));
}

export function upsertDocuments(userId: string, tripId: string, docs: DocumentRecord[]) {
  if (!userId || !tripId) return;
  setState((s) => ({
    ...s,
    documents: {
      ...s.documents,
      [userId]: {
        ...(s.documents[userId] || {}),
        [tripId]: docs,
      },
    },
  }));
}

export function seedDocuments(userId: string, tripId: string) {
  if (!userId || !tripId) return;
  const existing = state.documents[userId]?.[tripId];
  if (existing && existing.length > 0) return;
  const now = new Date().toISOString();
  const sampleDocs: DocumentRecord[] = [
    {
      id: `${tripId}-pnr`,
      tripId,
      userId,
      type: "confirmation",
      title: "Airline confirmation (PNR)",
      provider: "Zeniva Air Desk",
      confirmationNumber: "ZNV123",
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      updatedAt: now,
      details: "Issued and ticketed. Check-in opens 24h before departure.",
    },
    {
      id: `${tripId}-hotel`,
      tripId,
      userId,
      type: "hotel",
      title: "Hotel voucher",
      provider: "Azure Bay Resort",
      confirmationNumber: "H-45821",
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      updatedAt: now,
      details: "Prepaid via Zeniva. Present ID at check-in.",
    },
    {
      id: `${tripId}-transfer`,
      tripId,
      userId,
      type: "transfer",
      title: "Airport transfer",
      provider: "BlueCar",
      confirmationNumber: "TR-9920",
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      updatedAt: now,
      details: "Pickup at arrivals hall with name sign. Driver: +33 6 12 34 56 78.",
    },
    {
      id: `${tripId}-excursion`,
      tripId,
      userId,
      type: "excursion",
      title: "Excursion tickets",
      provider: "Med Coast Tours",
      confirmationNumber: "EX-7715",
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      updatedAt: now,
      details: "Includes museum entry and guide. Meet 09:00 at main square.",
    },
    {
      id: `${tripId}-invoice`,
      tripId,
      userId,
      type: "invoice",
      title: "Invoice / receipt",
      provider: "Zeniva",
      confirmationNumber: "INV-2044",
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      updatedAt: now,
      details: "Paid in full. Includes flights, hotel, transfers, excursions.",
    },
  ];
  upsertDocuments(userId, tripId, sampleDocs);
}
