import "../globals.css";
import React from "react";

export const metadata = {
  title: "Zeniva Agent Portal",
  description: "Espace de travail pour les agents Zeniva",
};

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-sm font-semibold text-slate-800">
          <a href="/" className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm hover:border-slate-300">
            <span className="text-lg">←</span>
            <span>Back to main site</span>
          </a>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Agent mode</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
