"use client";
import "../globals.css";
import React from "react";
import Link from "next/link";

export default function AgentLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-sm font-semibold text-slate-800">
          <a href="/" className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm hover:border-slate-300">
            <span className="text-lg">←</span>
            <span>Back to main site</span>
          </a>
          <div className="flex items-center gap-4">
            <Link href="/agent/chat" className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm hover:border-slate-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Agent Chat</span>
            </Link>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Agent mode</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
