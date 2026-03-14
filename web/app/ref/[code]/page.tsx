export const dynamic = "force-dynamic";
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

export default function RefLandingPage() {
  const params = useParams<{ code: string | string[] }>();
  const refCode = Array.isArray(params?.code) ? params.code[0] : params?.code || "";

  const [agentName, setAgentName] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelers, setTravelers] = useState("2");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");

  // Track click
  useEffect(() => {
    if (!refCode) return;
    fetch("/api/influencer/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: refCode, slug: "direct", path: window.location.pathname }),
    }).catch(() => undefined);
  }, [refCode]);

  // Try to get agent name from ref_code via API proxy
  useEffect(() => {
    if (!refCode) return;
    fetch(`/api/agents-proxy?path=admin/agent-by-ref/${encodeURIComponent(refCode)}`)
      .then((r) => r.json())
      .then((d) => { if (d?.name) setAgentName(d.name); })
      .catch(() => undefined);
  }, [refCode]);

  const handleSubmit = async () => {
    setError(null);
    if (!name || !email || !destination) {
      setError("Please fill in your name, email and destination.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ref/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refCode, name, email, phone, destination, startDate, endDate, travelers, budget, notes }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Unable to submit");
      setSubmitted(true);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Unable to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0B1B4D] via-[#0F2060] to-[#0B1B4D]">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Image src="/branding/logo.png" alt="Zeniva Travel" width={120} height={32} className="h-8 w-auto" />
          {agentName && (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
              via {agentName}
            </span>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 py-10">
        {/* Hero */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <Image
              src="/branding/lina-avatar.png?v=4"
              alt="Lina"
              width={80}
              height={80}
              className="rounded-full border-4 border-white/20 shadow-2xl"
            />
          </div>
          <h1 className="text-3xl font-black text-white md:text-4xl">
            Plan Your Dream Trip ✈️
          </h1>
          <p className="mt-2 text-lg text-white/70">
            Tell Lina where you want to go — she'll craft your perfect travel experience.
          </p>
          {agentName && (
            <p className="mt-2 text-sm text-blue-300">
              You've been referred by <strong className="text-white">{agentName}</strong>
            </p>
          )}
        </div>

        {submitted ? (
          <div className="rounded-3xl bg-emerald-500/20 border border-emerald-400/30 p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-black text-white">Request Received!</h2>
            <p className="mt-2 text-white/70">
              Lina will reach out within 24 hours with your personalized travel proposal.
            </p>
            <p className="mt-4 text-sm text-white/50">
              Check your inbox at <strong className="text-white">{email}</strong>
            </p>
          </div>
        ) : (
          <div className="rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 p-6 md:p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">🗺️ Your Travel Request</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-white/80">Full Name *</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
                  placeholder="Your name"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-white/80">Email *</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
                  placeholder="your@email.com"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-white/80">Phone</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
                  placeholder="+1 (555) 000-0000"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-white/80">Destination *</span>
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
                  placeholder="Paris, Cancún, Bali…"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-white/80">Departure Date</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-white/80">Return Date</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-white/80">Travelers</span>
                <select
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-[#0B1B4D] border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? "traveler" : "travelers"}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-white/80">Budget</span>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-[#0B1B4D] border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="">Select a range</option>
                  <option value="Under $2,000">Under $2,000</option>
                  <option value="$2,000 – $5,000">$2,000 – $5,000</option>
                  <option value="$5,000 – $10,000">$5,000 – $10,000</option>
                  <option value="$10,000 – $20,000">$10,000 – $20,000</option>
                  <option value="$20,000+">$20,000+</option>
                  <option value="Flexible">Flexible / Surprise me</option>
                </select>
              </label>
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-semibold text-white/80">Tell Lina more about your dream trip</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 resize-none"
                placeholder="Honeymoon? Family trip? All-inclusive? Any preferences? Tell us everything!"
              />
            </label>

            {error && (
              <p className="mt-3 rounded-xl bg-red-500/20 border border-red-400/30 px-4 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-[#0F6CF5] hover:bg-blue-500 disabled:opacity-50 px-6 py-4 text-base font-black text-white shadow-lg shadow-blue-500/30 transition-all"
            >
              {loading ? "Sending…" : "🚀 Send My Request to Lina"}
            </button>

            <p className="mt-3 text-center text-xs text-white/40">
              🔒 Your info is private and only used to plan your trip.
            </p>
          </div>
        )}

        {/* Trust badges */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: "🤖", label: "AI-Powered", sub: "Lina crafts your proposal" },
            { icon: "⚡", label: "24h Response", sub: "We reply fast" },
            { icon: "🌍", label: "Worldwide", sub: "Any destination" },
          ].map((b) => (
            <div key={b.label} className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <div className="text-2xl">{b.icon}</div>
              <p className="mt-1 text-xs font-bold text-white">{b.label}</p>
              <p className="text-xs text-white/50">{b.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
