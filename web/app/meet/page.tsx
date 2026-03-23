"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function MeetLinaForm() {
  const router = useRouter();
  const params = useSearchParams();
  const dest = params.get("dest") || params.get("destination") || "";
  const ref = params.get("ref") || "marco";
  const prompt = params.get("prompt") || "";

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) { setError("Please enter your first name and email."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address."); return; }

    setLoading(true);
    setError("");

    try {
      // Save lead to pipeline with real email
      await fetch("/api/lina-social-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: firstName.trim(), email: email.trim(), destination: dest, ref }),
      });
    } catch {}

    // Redirect to Lina chat with context
    const chatPrompt = prompt || (dest
      ? `Hi! I'm ${firstName} and I'm planning a trip to ${dest}. Can you help me?`
      : `Hi! I'm ${firstName} and I'd love to plan my next trip with Zeniva!`);
    router.push(`/chat?prompt=${encodeURIComponent(chatPrompt)}&firstName=${encodeURIComponent(firstName)}&email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020b1a] via-[#0a1f4e] to-[#0f2a5e] flex flex-col items-center justify-center px-4 py-12">
      {/* Stars background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white animate-pulse"
            style={{ width: Math.random() * 2 + 1, height: Math.random() * 2 + 1, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, opacity: Math.random() * 0.5 + 0.1, animationDuration: `${Math.random() * 3 + 2}s`, animationDelay: `${Math.random() * 2}s` }} />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo + badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 text-blue-200 text-xs font-bold mb-6">
            ✈️ Zeniva
          </div>

          {/* Lina avatar */}
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-blue-400/40 shadow-2xl shadow-blue-500/30 mb-4">
            <img src="/agents/lina.png" alt="Lina" className="w-full h-full object-cover object-top" />
          </div>

          <h1 className="text-3xl font-black text-white mb-2">
            {dest ? `Planning a trip to ${dest}?` : "Let's plan your dream trip"}
          </h1>
          <p className="text-blue-200 text-sm">
            Meet Lina — your AI travel concierge. She'll build a personalized proposal in minutes, completely free.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <p className="text-xs font-black text-blue-300 uppercase tracking-widest mb-5 text-center">
            🎁 Free · No credit card required
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-blue-200 mb-1.5 block">First name</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Your first name"
                autoFocus
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-400 focus:bg-white/15 transition"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-blue-200 mb-1.5 block">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-400 focus:bg-white/15 transition"
              />
            </div>

            {error && <p className="text-red-300 text-xs font-semibold">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-black rounded-xl py-4 text-sm transition shadow-lg shadow-blue-500/30 disabled:opacity-60 mt-2">
              {loading ? "⏳ Starting your chat…" : `💬 Chat with Lina${dest ? ` about ${dest}` : ""} →`}
            </button>
          </form>

          {/* Trust signals */}
          <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-white font-black text-sm">Free</p>
              <p className="text-blue-300 text-[10px]">No commitment</p>
            </div>
            <div>
              <p className="text-white font-black text-sm">2 min</p>
              <p className="text-blue-300 text-[10px]">Get a proposal</p>
            </div>
            <div>
              <p className="text-white font-black text-sm">🔒 Secure</p>
              <p className="text-blue-300 text-[10px]">Private & safe</p>
            </div>
          </div>
        </div>

        {/* Social proof */}
        <div className="mt-6 text-center">
          <p className="text-blue-300/70 text-xs">Trusted by travelers from 40+ countries · ⭐️⭐️⭐️⭐️⭐️</p>
        </div>
      </div>
    </div>
  );
}

export default function MeetLinaPage() {
  return (
    <Suspense>
      <MeetLinaForm />
    </Suspense>
  );
}
