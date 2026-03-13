"use client";
import { useEffect, useState } from "react";

export default function MobilePromoBadge() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show promo only when NOT logged in
    const hasToken = !!localStorage.getItem("zeniva_token") || document.cookie.includes("zeniva_token");
    setShow(!hasToken);
  }, []);

  if (!show) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 border border-amber-200" style={{ background: "linear-gradient(90deg, #FFF8E6, #FFF3CC)" }}>
      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
      <span className="text-[11px] font-black text-amber-700 uppercase tracking-widest">🔥 15% OFF — Code WELCOME15</span>
    </div>
  );
}
