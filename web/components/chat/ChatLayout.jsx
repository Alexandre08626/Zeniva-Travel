"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ChatLayout({ sidebar, chat, snapshot, tripId, backHref = "/", backLabel = "Back" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto px-4 py-4">
        {chat}
      </div>
    </div>
  );
}
