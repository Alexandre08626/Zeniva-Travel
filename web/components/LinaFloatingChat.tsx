"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function LinaFloatingChat() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [bubbleOpen, setBubbleOpen] = useState(false);

  useEffect(() => {
    // Don't show on chat/call/agent/payment/forms pages
    const path = window.location.pathname;
    if (/^\/(chat|call|agent|payment|forms|set-password|login|signup)/.test(path)) return;
    // Don't show if dismissed this session
    if (sessionStorage.getItem("lina_bubble_dismissed")) return;
    // Appear after 8 seconds
    const t = setTimeout(() => setVisible(true), 8000);
    // Auto-open bubble after 10 seconds
    const t2 = setTimeout(() => setBubbleOpen(true), 10000);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  const dismiss = () => {
    setDismissed(true);
    setBubbleOpen(false);
    sessionStorage.setItem("lina_bubble_dismissed", "1");
  };

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-24 right-4 z-[9980] flex flex-col items-end gap-2">
      {/* Speech bubble */}
      {bubbleOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 max-w-[220px] relative animate-fade-in-up">
          <button onClick={dismiss} className="absolute top-2 right-2 text-slate-300 hover:text-slate-500 text-sm leading-none">✕</button>
          <div className="flex items-center gap-2 mb-2">
            <img src="/branding/lina-avatar.png" alt="Lina" className="w-8 h-8 rounded-full border-2 border-yellow-400" />
            <span className="text-xs font-black text-slate-800">Lina</span>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-auto" />
          </div>
          <p className="text-xs text-slate-700 leading-relaxed mb-3">
            👋 Hi! I'm Lina, your AI travel concierge.<br/>
            Where would you like to go? ✈️
          </p>
          <Link
            href="/chat"
            onClick={dismiss}
            className="block w-full text-center rounded-xl py-2 text-xs font-black text-white"
            style={{ background: "linear-gradient(90deg, #0F3A8A, #1a4fad)" }}
          >
            Start planning my trip →
          </Link>
          {/* Triangle pointer */}
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-slate-200 rotate-45" />
        </div>
      )}

      {/* Lina avatar button */}
      <button
        onClick={() => setBubbleOpen((o) => !o)}
        className="relative w-14 h-14 rounded-full shadow-2xl border-4 border-yellow-400 overflow-hidden hover:scale-110 transition-transform"
        style={{ boxShadow: "0 0 0 4px rgba(230,184,90,0.3), 0 8px 30px rgba(15,58,138,0.4)" }}
        aria-label="Chat with Lina"
      >
        <img src="/branding/lina-avatar.png" alt="Lina" className="w-full h-full object-cover" />
        {/* Green dot */}
        <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
      </button>
    </div>
  );
}
