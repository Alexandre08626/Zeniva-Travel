"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Source tag stored on the lead row (e.g. "packages_popup_nyc"). */
  source?: string;
  /** localStorage key — bump if you want returning visitors to see it again. */
  storageKey?: string;
  /** Seconds before the popup is allowed to fire. */
  delaySeconds?: number;
  /** Scroll % (0–100) that also triggers the popup. */
  scrollPct?: number;
};

export default function LeadCapturePopup({
  source = "packages_popup",
  storageKey = "zeniva_lead_popup_v1",
  delaySeconds = 20,
  scrollPct = 60,
}: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const fired = useRef(false);

  // Schedule the trigger: 20s timer OR 60% scroll, whichever comes first. Once.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(storageKey)) return; // already seen / submitted
    } catch { /* private mode — fall through */ }

    const fire = () => {
      if (fired.current) return;
      fired.current = true;
      setOpen(true);
    };

    const timer = window.setTimeout(fire, delaySeconds * 1000);
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop + window.innerHeight) / h.scrollHeight;
      if (scrolled * 100 >= scrollPct) fire();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [delaySeconds, scrollPct, storageKey]);

  // Lock body scroll while open + close on ESC
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const persistSeen = () => {
    try {
      localStorage.setItem(storageKey, String(Date.now()));
    } catch { /* ignore */ }
  };

  const dismiss = () => {
    persistSeen();
    setOpen(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError("");
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, source }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Could not save");
      }
      persistSeen();
      setDone(true);
      setTimeout(() => setOpen(false), 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center animate-[fadeIn_180ms_ease-out]"
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-label="Get $50 off your first trip"
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-[slideUp_220ms_ease-out]"
      >
        {/* Close — 44px touch target, top right */}
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 shadow-md transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="6" y1="18" x2="18" y2="6" />
          </svg>
        </button>

        {!done ? (
          <>
            {/* Hero band */}
            <div className="relative px-6 pt-8 pb-6 text-center text-white" style={{ background: "linear-gradient(135deg, #0B1B4D 0%, #0F6CF5 100%)" }}>
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-30" style={{ background: "radial-gradient(circle, #E6B85A, transparent)", filter: "blur(40px)" }} />
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest mb-3">
                  ✨ NYC Exclusive
                </div>
                <div className="text-5xl sm:text-6xl font-black mb-1" style={{ background: "linear-gradient(90deg, #E6B85A, #f7d98a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  $50 OFF
                </div>
                <div className="text-base sm:text-lg font-bold leading-tight">your first vacation with Lina</div>
                <p className="text-xs sm:text-sm text-blue-100 mt-2">Drop your email — Lina sends one curated NYC deal per week. Unsubscribe anytime.</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="p-5 sm:p-6 space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First name (optional)"
                autoComplete="given-name"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-base text-slate-900 placeholder:text-slate-400"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
                inputMode="email"
                required
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-base text-slate-900 placeholder:text-slate-400"
              />
              {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className="w-full py-3.5 rounded-xl text-white text-base font-bold shadow-md transition-all active:scale-[0.99] disabled:opacity-60 min-h-[48px]"
                style={{ background: "linear-gradient(90deg, #0F6CF5, #0B1B4D)" }}
              >
                {busy ? "Saving…" : "Claim my $50 off →"}
              </button>
              <p className="text-[11px] text-slate-400 text-center pt-1">No spam. One email per week. Cancel anytime.</p>
            </form>
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-xl font-black text-slate-900 mb-2">You're in!</h3>
            <p className="text-sm text-slate-600">Lina just sent your $50-off code to <span className="font-semibold text-slate-900">{email}</span>. Check your inbox.</p>
          </div>
        )}
      </div>
    </div>
  );
}
