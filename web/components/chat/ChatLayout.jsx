"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ChatLayout({ sidebar, chat, snapshot, tripId, backHref = "/", backLabel = "Back" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #0B1B4D 0%, #0F3A8A 50%, #1a4fad 100%)" }}>
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href={backHref} className="text-white/70 hover:text-white text-sm font-semibold flex items-center gap-1 transition-colors">
            <span>←</span> <span className="hidden sm:inline">{backLabel}</span>
          </Link>
          <div className="h-4 w-px bg-white/20 hidden sm:block" />
          <div className="flex items-center gap-2">
            <Image src="/branding/lina-avatar.png" alt="Lina" width={28} height={28} className="rounded-full ring-2 ring-yellow-400/40" />
            <span className="text-white font-black text-sm">Lina <span className="text-yellow-400">AI</span></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Trip details toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-white border border-white/20 bg-white/10 hover:bg-white/20 transition-all"
          >
            <span>✈️</span>
            <span className="hidden sm:inline">Trip Details</span>
            <span className={`transition-transform duration-200 ${sidebarOpen ? "rotate-180" : ""}`}>▾</span>
          </button>

          <Link
            href={`/call/${tripId || ""}`}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black text-[#0B1B4D]"
            style={{ background: "linear-gradient(90deg, #E6B85A, #f0c96b)" }}
          >
            <span>📞</span>
            <span className="hidden sm:inline">Call Lina</span>
          </Link>
        </div>
      </header>

      {/* Trip details drawer */}
      {sidebarOpen && (
        <div className="border-b border-white/10 bg-white/5 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-4 py-4">
            {snapshot}
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-4">
        {chat}
      </div>
    </div>
  );
}
