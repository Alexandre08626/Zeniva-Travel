"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const MODES = [
  {
    key: "chat",
    title: "Chat with Lina",
    description: "Text-based search. Describe your client's trip and Lina finds flights, hotels, activities. Select the best options to build a proposal.",
    icon: "/agents/lina.png",
    gradient: "from-teal-500 to-cyan-600",
    cta: "Start Chat Search",
  },
  {
    key: "call",
    title: "Voice Call with Lina",
    description: "Talk to Lina by voice. Describe the trip verbally while she searches in real-time. Faster for complex multi-destination trips.",
    icon: "/agents/lina.png",
    gradient: "from-violet-500 to-purple-600",
    cta: "Start Voice Search",
  },
  {
    key: "hybrid",
    title: "Hybrid Mode",
    description: "Chat + Voice combined. Type details, switch to voice anytime. Best of both worlds for detailed trip planning.",
    icon: "/agents/lina.png",
    gradient: "from-pink-500 to-rose-600",
    cta: "Start Hybrid Search",
  },
];

export default function TripSearchPage() {
  const router = useRouter();
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [quickNotes, setQuickNotes] = useState("");

  const launchMode = (mode: string) => {
    const id = generateId();
    const params = new URLSearchParams();
    if (clientName) params.set("client", clientName);
    if (clientEmail) params.set("email", clientEmail);
    if (quickNotes) params.set("notes", quickNotes);
    const qs = params.toString() ? `?${params.toString()}` : "";

    if (mode === "chat") router.push(`/agent/trip-search/chat/${id}${qs}`);
    else if (mode === "call") router.push(`/agent/trip-search/call/${id}${qs}`);
    else router.push(`/agent/trip-search/chat/${id}${qs}&hybrid=1`);
  };

  return (
    <main className="min-h-screen bg-[#F3F6FB]">
      <div className="mx-auto max-w-5xl px-5 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-slate-900">Trip Search</h1>
          <p className="text-sm text-slate-500 mt-1">Search flights, hotels, and activities with Lina AI. Build proposals for your clients.</p>
        </div>

        {/* Client Info (optional) */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Client Info (optional)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Client Name</label>
              <input className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="John Smith" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Client Email</label>
              <input className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="john@email.com" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Quick Notes</label>
              <input className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400" value={quickNotes} onChange={(e) => setQuickNotes(e.target.value)} placeholder="Honeymoon, 2 weeks, June..." />
            </div>
          </div>
        </div>

        {/* 3 Modes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MODES.map((mode) => (
            <div key={mode.key} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow group">
              <div className={`bg-gradient-to-br ${mode.gradient} p-6 flex items-center justify-center h-44`}>
                <Image src={mode.icon} alt={mode.title} width={120} height={120} className="object-contain drop-shadow-lg group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-black text-slate-900">{mode.title}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{mode.description}</p>
                <button onClick={() => launchMode(mode.key)} className={`mt-4 w-full py-3 rounded-xl bg-gradient-to-r ${mode.gradient} text-white text-sm font-bold hover:opacity-90 transition-opacity`}>
                  {mode.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Searches */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Recent Searches</h2>
          <p className="text-sm text-slate-400 text-center py-4">Your recent trip searches will appear here.</p>
        </div>
      </div>
    </main>
  );
}
