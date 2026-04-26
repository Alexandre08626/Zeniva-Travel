"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  email: string;
  name: string;
  phone?: string;
  /** Source tag stored in user metadata. */
  origin?: string;
  /** Called when the user completes signup OR dismisses. Always continue the booking flow. */
  onClose: (created: boolean) => void;
};

export default function FinishAccountModal({
  open,
  email,
  name,
  phone,
  origin = "proposal_review",
  onClose,
}: Props) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setPassword("");
      setBusy(false);
      setDone(false);
      setError("");
    }
  }, [open]);

  // Lock body scroll + ESC to dismiss
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          space: "traveler",
          role: "traveler",
          name,
          email,
          password,
          phone: phone || "",
          travelerProfile: { origin },
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j?.ok === false) {
        // If account already exists, treat as success — they're a returning client
        const msg = String(j?.message || "");
        if (/already exists|duplicate|registered/i.test(msg)) {
          setDone(true);
          setTimeout(() => onClose(true), 1600);
          return;
        }
        throw new Error(msg || "Could not create account");
      }
      setDone(true);
      setTimeout(() => onClose(true), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10001] bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center animate-[fadeIn_180ms_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-label="Finish creating your free Zeniva account"
      onClick={() => !busy && onClose(false)}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-[slideUp_220ms_ease-out]"
      >
        {/* Skip / close (44px touch target) */}
        <button
          onClick={() => !busy && onClose(false)}
          aria-label="Skip — continue without account"
          className="absolute top-3 right-3 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/95 hover:bg-white text-slate-600 hover:text-slate-900 shadow-md transition"
          disabled={busy}
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
                  ✨ One last step
                </div>
                <h3 className="text-xl sm:text-2xl font-black leading-tight">Create your free Zeniva account</h3>
                <p className="text-xs sm:text-sm text-blue-100 mt-2 leading-relaxed">
                  Save your trip, view your bookings 24/7, and chat with Lina anytime. Just pick a password — your details are already filled in.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="p-5 sm:p-6 space-y-3">
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Account email</div>
                <div className="text-sm font-semibold text-slate-900 break-all">{email}</div>
                {name && <div className="text-xs text-slate-500">{name}</div>}
              </div>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password (min. 8 characters)"
                autoComplete="new-password"
                minLength={8}
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
                {busy ? "Creating your account…" : "Finish my free account →"}
              </button>
              <button
                type="button"
                onClick={() => !busy && onClose(false)}
                disabled={busy}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-700 font-medium transition"
              >
                Skip — continue as guest
              </button>
              <p className="text-[11px] text-slate-400 text-center pt-1">By continuing you agree to Zeniva's terms. No credit card required.</p>
            </form>
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="text-5xl mb-3">✅</div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Account ready!</h3>
            <p className="text-sm text-slate-600">Welcome aboard. Returning to your trip…</p>
          </div>
        )}
      </div>
    </div>
  );
}
