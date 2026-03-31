"use client";
import { useEffect, useState } from "react";

const AGENT_STORE_KEY = "zeniva_agent_chat_v1";

function loadSnapshot(tripId) {
  try {
    const raw = localStorage.getItem(AGENT_STORE_KEY);
    const store = raw ? JSON.parse(raw) : {};
    return store[tripId]?.snapshot || {};
  } catch { return {}; }
}

export default function AgentTripSnapshotPanel({ tripId }) {
  const [snap, setSnap] = useState({});

  useEffect(() => {
    if (!tripId) return;
    const load = () => setSnap(loadSnapshot(tripId));
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [tripId]);

  const fields = [
    { label: "Destination", value: snap.destination, icon: "📍" },
    { label: "Dates", value: snap.dates, icon: "📅" },
    { label: "Travelers", value: snap.travelers, icon: "👥" },
    { label: "Budget", value: snap.budget, icon: "💰" },
    { label: "Departure", value: snap.departure, icon: "✈️" },
  ];

  const filled = fields.filter(f => f.value);

  if (filled.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-slate-400">
        Trip details will appear here as you chat with Lina.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
      {filled.map((f) => (
        <div key={f.label}>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
            <span>{f.icon}</span> {f.label}
          </div>
          <p className="text-sm font-bold text-slate-800 mt-0.5">{f.value}</p>
        </div>
      ))}
    </div>
  );
}
