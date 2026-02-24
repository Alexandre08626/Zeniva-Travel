"use client";
import "../globals.css";
import Link from "next/link";

export default function AIAgentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <div className="sticky top-0 z-30 border-b border-white/10 bg-[#0a0e1a]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-black tracking-tight text-white hover:text-blue-400 transition">
              ✈️ Zeniva Travel
            </Link>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full">AI AGENTS</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/agent" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-semibold hover:bg-white/10 transition">
              ← Agent Portal
            </Link>
            <Link href="/agent/lina" className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-semibold text-emerald-400 hover:bg-emerald-500/20 transition">
              💬 Lina AI Desk
            </Link>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
