"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const AGENT_STORE_KEY = "zeniva_agent_chat_v1";

/* ─── Agent search history from own localStorage ─── */
function loadSearches() {
  try {
    const raw = localStorage.getItem(AGENT_STORE_KEY);
    const store = raw ? JSON.parse(raw) : {};
    return Object.entries(store)
      .map(([id, data]) => ({ id, ...data }))
      .filter(s => s.messages?.length > 0)
      .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
      .slice(0, 10);
  } catch { return []; }
}

function deleteSearch(id) {
  try {
    const raw = localStorage.getItem(AGENT_STORE_KEY);
    const store = raw ? JSON.parse(raw) : {};
    delete store[id];
    localStorage.setItem(AGENT_STORE_KEY, JSON.stringify(store));
    window.dispatchEvent(new Event("storage"));
  } catch {}
}

function getSearchLabel(search) {
  if (search.snapshot?.destination) return search.snapshot.destination;
  const firstUser = search.messages?.find(m => m.role === "user");
  if (firstUser?.content) return firstUser.content.slice(0, 40) + (firstUser.content.length > 40 ? "…" : "");
  return `Search ${search.id?.slice(-4) || ""}`;
}

export default function AgentChatLayout({ sidebar, chat, snapshot, tripId, backHref = "/agent/trip-search", backLabel = "Trip Search" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchesOpen, setSearchesOpen] = useState(false);
  const [searches, setSearches] = useState([]);
  const router = useRouter();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const load = () => setSearches(loadSearches());
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setSearchesOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNewSearch = () => {
    const id = `agent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setSearchesOpen(false);
    router.push(`/agent/trip-search/chat/${id}`);
  };

  const handleDeleteSearch = (e, searchId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this search?")) return;
    deleteSearch(searchId);
    setSearches(loadSearches());
    if (searchId === tripId) {
      const remaining = loadSearches();
      if (remaining.length > 0) router.push(`/agent/trip-search/chat/${remaining[0].id}`);
      else router.push("/agent/trip-search");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href={backHref} className="text-slate-500 hover:text-slate-800 text-sm font-semibold flex items-center gap-1 transition-colors">
            <span>←</span> <span className="hidden sm:inline">{backLabel}</span>
          </Link>
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-2">
            <Image src="/agents/lina.png" alt="Lina" width={30} height={30} className="rounded-full ring-2 ring-teal-100" />
            <div>
              <span className="text-slate-900 font-black text-sm">Lina</span>
              <span className="text-teal-600 font-black text-sm"> AI</span>
            </div>
            <div className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-700 text-xs font-bold">Online</span>
            </div>
            <span className="hidden sm:inline text-xs bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-2 py-0.5 font-semibold">Agent Mode</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* My Searches dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setSearchesOpen(!searchesOpen)}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border transition-all"
              style={searchesOpen
                ? { background: "#0D9488", color: "white", borderColor: "#0D9488" }
                : { background: "white", color: "#0D9488", borderColor: "#0D9488" }
              }
            >
              <span>🔍</span>
              <span className="hidden sm:inline">My Searches</span>
              {searches.length > 0 && (
                <span className="bg-teal-600 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {searches.length}
                </span>
              )}
              <span className={`transition-transform duration-200 ${searchesOpen ? "rotate-180" : ""}`}>▾</span>
            </button>

            {searchesOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Agent Searches</span>
                  <span className="text-xs text-slate-400">{searches.length} searches</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {searches.length === 0 && (
                    <div className="px-4 py-6 text-center text-sm text-slate-400">No searches yet</div>
                  )}
                  {searches.map((search) => {
                    const isActive = search.id === tripId;
                    const label = getSearchLabel(search);
                    const date = search.updatedAt ? new Date(search.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" }) : "";
                    return (
                      <div key={search.id} className={`flex items-center gap-0 border-b border-slate-50 group ${isActive ? "bg-teal-50" : "hover:bg-slate-50"} transition`}>
                        <Link
                          href={`/agent/trip-search/chat/${search.id}`}
                          onClick={() => setSearchesOpen(false)}
                          className="flex items-center gap-3 flex-1 min-w-0 px-4 py-3"
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${isActive ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-600"}`}>
                            🔍
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${isActive ? "text-teal-700" : "text-slate-900"}`}>{label}</p>
                            <p className="text-xs text-slate-400">{date}</p>
                          </div>
                          {isActive && <span className="text-teal-500 text-xs font-bold flex-shrink-0 mr-1">Active</span>}
                        </Link>
                        <button
                          onClick={(e) => handleDeleteSearch(e, search.id)}
                          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition mr-2"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="p-3 border-t border-slate-100">
                  <button
                    onClick={handleNewSearch}
                    className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-violet-600 transition hover:opacity-90"
                  >
                    + New Search
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Trip details toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border transition-all"
            style={sidebarOpen
              ? { background: "#0D9488", color: "white", borderColor: "#0D9488" }
              : { background: "white", color: "#0D9488", borderColor: "#0D9488" }
            }
          >
            <span>✈️</span>
            <span className="hidden sm:inline">Trip Details</span>
          </button>

          {/* Call Lina */}
          <Link
            href={`/agent/trip-search/call/${tripId || ""}`}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black text-white bg-gradient-to-r from-teal-600 to-violet-600"
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

      {/* Chat area */}
      <div className="flex-1 flex flex-col w-[90%] mx-auto py-4">
        {chat}
      </div>
    </div>
  );
}
