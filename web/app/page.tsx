// src/app/page.tsx — ZENIVA TRAVEL — REDESIGN ULTRA PREMIUM
import type { Metadata } from "next";
import Link from "next/link";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import TravelSearchWidget from "../src/components/TravelSearchWidget";
import LinaAvatar from "../src/components/LinaAvatar";
import AutoTranslate from "../src/components/AutoTranslate";
import FeaturedTripsSection from "../src/components/FeaturedTripsSection";
import AppHomeGate from "../src/components/AppHomeGate.client";
import MobilePromoBadge from "../src/components/MobilePromoBadge.client";

export const metadata: Metadata = {
  title: "#1 AI Travel Concierge USA — Luxury Trips & Custom Vacations",
  description: "Zeniva Travel — America's AI travel agency. Plan luxury vacations, custom trips & group travel with Lina AI, available 24/7. Incorporated in Delaware. Start planning in seconds.",
  alternates: {
    canonical: "https://zenivatravel.com",
    languages: { "en-US": "https://zenivatravel.com", "fr-CA": "https://zenivatravel.com/fr" },
  },
  openGraph: {
    title: "AI Travel Concierge USA",
    description: "America's AI travel agency. Luxury vacations, custom trips, yacht charters — planned by Lina AI in seconds.",
    url: "https://zenivatravel.com",
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630 }],
  },
};

const DESTINATIONS = [
  { name: "Santorini", country: "Greece", emoji: "🇬🇷", img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80", tag: "Romantic", color: "#0F6CF5" },
  { name: "Bali", country: "Indonesia", emoji: "🇮🇩", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80", tag: "Adventure", color: "#10b981" },
  { name: "Dubai", country: "UAE", emoji: "🇦🇪", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80", tag: "Luxury", color: "#E6B85A" },
  { name: "Cancún", country: "Mexico", emoji: "🇲🇽", img: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=800&q=80", tag: "Beach", color: "#06b6d4" },
  { name: "Tokyo", country: "Japan", emoji: "🇯🇵", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80", tag: "Culture", color: "#ec4899" },
  { name: "Maldives", country: "Indian Ocean", emoji: "🏝️", img: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=800&q=80", tag: "Paradise", color: "#8b5cf6" },
];

const SERVICES = [
  { icon: "✈️", title: "Flights", desc: "Best fares worldwide", href: "/search/flights", color: "#0F6CF5" },
  { icon: "🏨", title: "ZeniHotel", desc: "Curated luxury stays", href: "/partners/resorts", color: "#10b981" },
  { icon: "🛥️", title: "ZeniYacht", desc: "Private charters", href: "/yachts", color: "#E6B85A" },
  { icon: "🚗", title: "Transfers", desc: "Door-to-door service", href: "/chat?prompt=I+need+a+transfer", color: "#ec4899" },
  { icon: "🏖️", title: "Packages", desc: "All-inclusive deals", href: "/packages", color: "#8b5cf6" },
  { icon: "🏠", title: "ZeniStay", desc: "Homes & villas", href: "/residences", color: "#f59e0b" },
];

const STATS = [
  { value: "200+", label: "Destinations" },
  { value: "24/7", label: "AI Concierge" },
  { value: "4.9★", label: "Client Rating" },
  { value: "$0", label: "Booking Fees" },
];

const isLoggedIn = false;
const userEmail = "user@email.com";

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Zeniva Travel",
    url: "https://zenivatravel.com",
    logo: "https://zenivatravel.com/branding/logo.png",
    description: "AI-powered travel agency with Lina AI concierge",
  };

  return (
    <AppHomeGate>
    <main className="min-h-screen m-0 p-0" style={{ backgroundColor: "#F8FAFF" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* ── HEADER ── */}
      <div className="w-full px-4 sm:px-6 bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50" data-fullbleed="true">
        <Header isLoggedIn={isLoggedIn} userEmail={userEmail} />
      </div>

      {/* ══════════════════════════════════════════
          MOBILE VERSION
      ══════════════════════════════════════════ */}
      <section className="sm:hidden" style={{ marginLeft: "calc(-1 * max(0px, (100vw - 100%) / 2))", marginRight: "calc(-1 * max(0px, (100vw - 100%) / 2))", width: "100vw", maxWidth: "100vw", background: "#ffffff" }}>

        {/* ── MOBILE HERO — white lead capture ── */}
        <div className="relative min-h-screen flex flex-col overflow-hidden bg-white">
          {/* Soft orbs on white */}
          <div className="absolute top-[-60px] right-[-40px] w-64 h-64 rounded-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #0F6CF5, transparent)", filter: "blur(50px)" }} />
          <div className="absolute top-[35%] left-[-50px] w-52 h-52 rounded-full opacity-8 pointer-events-none" style={{ background: "radial-gradient(circle, #E6B85A, transparent)", filter: "blur(60px)" }} />

          {/* Top nav */}
          <div className="flex items-center justify-between px-5 pt-5">
            <div className="flex items-center gap-2">
              <img src="/branding/lina-avatar.png" alt="Lina" className="w-8 h-8 rounded-full border-2 border-blue-100" />
              <span className="font-black text-sm text-[#0B1B4D] tracking-tight">Zeniva Travel</span>
            </div>
            <div className="flex gap-2">
              <Link href="/login" className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">Log in</Link>
              <Link href="/signup" className="rounded-full px-3 py-1.5 text-xs font-black text-white" style={{ background: "linear-gradient(90deg, #0F6CF5, #0B1B4D)" }}>Sign up</Link>
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-col items-center px-5 pt-8 flex-1">

            {/* Lina avatar */}
            <div className="relative mb-5">
              <div className="absolute inset-0 rounded-full" style={{ margin: "-10px", background: "radial-gradient(circle, rgba(15,108,245,0.15) 0%, transparent 70%)", filter: "blur(12px)" }} />
              <div className="absolute inset-0 rounded-full border-2 border-blue-200/60 animate-ping" style={{ margin: "-4px", animationDuration: "3s" }} />
              <Link href="/call">
                <img src="/branding/lina-avatar.png" alt="Lina AI" className="relative w-32 h-32 rounded-full object-cover border-4 border-blue-100 shadow-xl cursor-pointer" />
              </Link>
            </div>

            {/* Promo badge — anonymous only */}
            <MobilePromoBadge />

            {/* Headline */}
            <h1 className="text-[2.4rem] font-black text-[#0B1B4D] leading-none tracking-tight text-center mb-3">
              Your dream trip,<br />
              <span style={{ background: "linear-gradient(90deg, #0F6CF5, #0B1B4D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                planned in 60 sec
              </span>
            </h1>
            <p className="text-slate-500 text-sm text-center leading-relaxed max-w-xs mb-6">
              Tell Lina where you want to go — she handles flights, hotels &amp; experiences instantly. No fees, no hassle.
            </p>

            {/* CTAs */}
            <div className="w-full space-y-3">
              <Link href="/chat" className="flex items-center justify-between rounded-2xl p-4 shadow-lg active:scale-[0.98] transition-transform" style={{ background: "linear-gradient(135deg, #0F6CF5, #0B1B4D)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-lg">💬</div>
                  <div>
                    <div className="text-sm font-black text-white">🎁 Claim my 15% discount</div>
                    <div className="text-xs text-blue-200 font-semibold">Free · Instant · No credit card</div>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                </div>
              </Link>

              <Link href="/call" className="flex items-center justify-between rounded-2xl p-4 active:scale-[0.98] transition-transform border-2 border-slate-100 bg-white shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-slate-50">📞</div>
                  <div>
                    <div className="text-sm font-black text-[#0B1B4D]">Talk to Lina — Right Now</div>
                    <div className="text-xs text-slate-500 font-semibold">Live AI agent · Answers in seconds · Free</div>
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F6CF5" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
              </Link>
            </div>

            {/* Social proof */}
            <p className="mt-4 text-center text-[11px] text-slate-500 font-semibold">✅ 500+ trips planned this month · Trusted by travelers worldwide</p>

            {/* Quick tags */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {["🏖️ Beach", "💑 Couples", "👨‍👩‍👧 Family", "🏔️ Adventure", "🛥️ ZeniYacht"].map((t) => (
                <Link key={t} href={`/chat?prompt=${encodeURIComponent(t.split(" ")[1] + " trip")}`}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 active:bg-slate-100">
                  {t}
                </Link>
              ))}
            </div>

            {/* Stats bar */}
            <div className="mt-6 w-full grid grid-cols-4 gap-2 rounded-2xl p-4 border border-slate-100 bg-slate-50">
              {STATS.map((s) => (
                <div key={s.value} className="text-center">
                  <div className="text-base font-black text-[#0B1B4D]">{s.value}</div>
                  <div className="text-[9px] text-slate-500 font-semibold mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <p className="text-center text-[10px] text-slate-400 font-medium mt-3 mb-6">🔒 Secure · No booking fees · Cancel anytime</p>
          </div>
        </div>

        {/* Mobile destinations — white */}
        <div className="bg-white px-5 py-8 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-[#0B1B4D]">Top Destinations</h2>
            <Link href="/destinations" className="text-xs font-bold text-blue-600 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100">View All →</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {DESTINATIONS.map((d) => (
              <Link key={d.name} href={`/chat?prompt=I want to go to ${d.name}`} className="flex-shrink-0 w-36 rounded-2xl overflow-hidden relative active:scale-95 transition-transform shadow-md">
                <img src={d.img} alt={d.name} className="w-full h-44 object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 60%)" }} />
                <div className="absolute bottom-0 left-0 p-3">
                  <div className="text-xs font-bold text-white opacity-95">{d.country}</div>
                  <div className="text-sm font-black text-white">{d.name}</div>
                  <span className="inline-block mt-1 rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor: d.color + "90" }}>{d.tag}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile search — white */}
        <div className="bg-slate-50 px-5 pb-8 pt-6 border-t border-slate-100">
          <h2 className="text-xl font-black text-[#0B1B4D] mb-4">Search &amp; Plan</h2>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <TravelSearchWidget />
          </div>
        </div>

        {/* Mobile footer — white */}
        <div className="bg-white px-5 py-8 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <img src="/branding/lina-avatar.png" alt="Lina" className="w-8 h-8 rounded-full border border-slate-200" />
            <span className="font-black text-[#0B1B4D]">Zeniva Travel</span>
          </div>
          <div className="flex flex-wrap gap-4 text-slate-500 text-xs mb-4 font-semibold">
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/agent">Agents</Link>
          </div>
          <p className="text-slate-400 text-[10px]">© 2026 Zeniva Travel Inc. · Delaware, USA</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          DESKTOP VERSION
      ══════════════════════════════════════════ */}
      <div className="hidden sm:block">

        {/* ── HERO — full width, compact ── */}
        <section data-fullbleed="true" className="relative w-full overflow-hidden" style={{ minHeight: "auto" }}>
          {/* Background full width */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0B1B4D 0%, #0F3A8A 45%, #1a4fad 100%)" }} />

          {/* Animated gradient orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-[600px] h-[600px] rounded-full opacity-20" style={{ top: "-150px", right: "-100px", background: "radial-gradient(circle, #E6B85A 0%, transparent 65%)", filter: "blur(60px)" }} />
            <div className="absolute w-[400px] h-[400px] rounded-full opacity-15" style={{ bottom: "-50px", left: "-80px", background: "radial-gradient(circle, #0F6CF5 0%, transparent 70%)", filter: "blur(60px)" }} />
          </div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

          <div className="relative z-10 w-full px-12 xl:px-20 pt-12 pb-12">
            <div className="w-full grid grid-cols-2 gap-12 items-center">

              {/* Left: Text + Search */}
              <div className="space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/25 backdrop-blur px-4 py-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-bold text-white/90 tracking-wider uppercase">Lina AI · Available 24/7</span>
                </div>

                {/* Headline + subtitle on same line */}
                <div>
                  <div className="flex items-baseline gap-4 flex-wrap">
                    <h1 className="text-5xl xl:text-6xl font-black leading-none tracking-tight text-white whitespace-nowrap">
                      <span style={{ background: "linear-gradient(90deg, #E6B85A 0%, #f7d98a 50%, #E6B85A 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        Zeniva
                      </span>{" "}
                      Travel AI
                    </h1>
                    <p className="text-base text-white/90 font-medium">
                      <AutoTranslate text="Tell Lina where you want to go and she instantly builds your flights, hotels, and experiences." className="inline" />
                    </p>
                  </div>
                </div>

                {/* Search Widget — contained */}
                <div className="bg-white rounded-3xl shadow-2xl p-5 overflow-hidden" style={{ boxShadow: "0 25px 80px rgba(0,0,0,0.4)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <img src="/branding/lina-avatar.png" alt="Lina" className="w-6 h-6 rounded-full border-2 border-yellow-400/40" />
                    <span className="text-sm font-bold text-slate-700"><AutoTranslate text="Plan your entire trip in seconds with AI" className="inline" /></span>
                    <span className="ml-auto text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex-shrink-0">LIVE</span>
                  </div>
                  <div className="w-full overflow-hidden">
                    <TravelSearchWidget />
                  </div>
                  {/* Quick prompts */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      { label: "🏖️ Beach escape", p: "Beach vacation 7 nights" },
                      { label: "💑 Honeymoon", p: "Romantic honeymoon" },
                      { label: "👨‍👩‍👧 Family trip", p: "Family vacation with kids" },
                      { label: "🛥️ ZeniYacht", p: "ZeniYacht luxury charter" },
                    ].map((q) => (
                      <Link key={q.label} href={`/chat?prompt=${encodeURIComponent(q.p)}`} className="rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors">
                        {q.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex gap-8">
                  {STATS.map((s) => (
                    <div key={s.value}>
                      <div className="text-xl font-black text-white">{s.value}</div>
                      <div className="text-xs text-white/85 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Lina visual + floating cards */}
              <div className="relative flex items-center justify-center" style={{ minHeight: "520px" }}>
                {/* Main Lina image */}
                <div className="relative z-10">
                  <div className="absolute inset-0 rounded-full" style={{ margin: "-20px", background: "radial-gradient(circle, rgba(230,184,90,0.3) 0%, transparent 70%)", filter: "blur(20px)" }} />
                  <div className="absolute inset-0 rounded-full border border-yellow-400/20 animate-spin" style={{ margin: "-30px", animationDuration: "20s" }} />

                  {/* Speech bubble desktop */}
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap z-20" style={{ animation: "speechBubble 4s ease-in-out 2" }}>
                    <div className="bg-white rounded-2xl px-5 py-2.5 shadow-2xl border border-slate-100">
                      <p className="text-[#0B1B4D] text-sm font-bold">👆 Click on me to start!</p>
                    </div>
                    <div className="w-4 h-4 bg-white border-l border-b border-slate-100 mx-auto mt-[-1px]" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
                  </div>
                  <Link href="/call">
                    <img
                      src="/branding/lina-avatar.png"
                      alt="Lina AI"
                      className="relative rounded-full object-cover border-4 shadow-2xl cursor-pointer hover:scale-105 transition-transform duration-300"
                      style={{ width: "320px", height: "320px", borderColor: "rgba(230,184,90,0.4)", boxShadow: "0 0 100px rgba(230,184,90,0.25), 0 30px 80px rgba(0,0,0,0.5)" }}
                    />
                  </Link>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-xl border border-yellow-100">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-black text-slate-800">Lina AI · Online now</span>
                  </div>
                </div>

                {/* Floating cards */}
                <div className="absolute top-0 left-0 bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex items-center gap-3 shadow-xl" style={{ maxWidth: "170px" }}>
                  <img src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=100&q=80" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" alt="Santorini" />
                  <div><div className="text-xs font-black text-white">Santorini</div><div className="text-[10px] text-white/90">From $2,800</div></div>
                </div>
                <div className="absolute top-12 right-0 bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex items-center gap-3 shadow-xl" style={{ maxWidth: "170px" }}>
                  <img src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=100&q=80" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" alt="Dubai" />
                  <div><div className="text-xs font-black text-white">Dubai</div><div className="text-[10px] text-white/90">From $3,500</div></div>
                </div>
                <div className="absolute bottom-16 left-0 bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex items-center gap-3 shadow-xl" style={{ maxWidth: "170px" }}>
                  <img src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=100&q=80" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" alt="Bali" />
                  <div><div className="text-xs font-black text-white">Bali</div><div className="text-[10px] text-white/90">From $1,950</div></div>
                </div>
                <div className="absolute bottom-8 right-0 bg-white rounded-2xl p-3 shadow-2xl border border-slate-100" style={{ maxWidth: "210px" }}>
                  <div className="flex items-start gap-2">
                    <img src="/branding/lina-avatar.png" alt="Lina" className="w-6 h-6 rounded-full flex-shrink-0" />
                    <div className="text-[11px] text-slate-700 font-medium leading-relaxed">"Found 3 perfect Cancún options for July! 🌴"</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom wave */}
          <div className="absolute bottom-0 left-0 w-full">
            <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-12">
              <path d="M0 30 Q360 60 720 30 Q1080 0 1440 30 V60 H0 Z" fill="#F8FAFF" />
            </svg>
          </div>
        </section>

        {/* ── SERVICES STRIP ── */}
        <section className="w-full px-8 xl:px-16 py-12">
          <div className="max-w-[1400px] mx-auto">

            {/* CTA Buttons — above the title */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <Link href="/call" className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-white shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 text-base" style={{ background: "linear-gradient(135deg, #0B1B4D, #0F6CF5)" }}>
                <span className="text-xl">📞</span>
                Call Lina
              </Link>
              <Link href="/chat" className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-white shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 text-base" style={{ background: "linear-gradient(135deg, #0F3A8A, #1a4fad)" }}>
                <img src="/branding/lina-avatar.png" alt="Lina" className="w-7 h-7 rounded-full border-2 border-white/40" />
                Start planning my trip
              </Link>
            </div>
            <p className="text-center text-xs text-slate-400 mt-2">Free to start • No account required • 15% off your first booking</p>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-slate-900">
                <AutoTranslate text="Everything you need for the perfect trip" className="inline" />
              </h2>
              <p className="text-slate-500 mt-2"><AutoTranslate text="Lina handles it all — you just enjoy the journey." className="inline" /></p>
            </div>
            <div className="grid grid-cols-6 gap-4">
              {SERVICES.map((s) => (
                <Link key={s.title} href={s.href} className="group bg-white rounded-2xl p-5 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border border-slate-100">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 group-hover:scale-110 transition-transform" style={{ backgroundColor: s.color + "15" }}>
                    {s.icon}
                  </div>
                  <div className="text-sm font-black text-slate-900">{s.title}</div>
                  <div className="text-xs text-slate-400 mt-1">{s.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURED TRIPS ── */}
        <section className="w-full px-8 xl:px-16 py-20">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">🔥 Hot Deals</p>
                <h2 className="text-4xl font-black text-slate-900"><AutoTranslate text="Featured Trips by Lina" className="inline" /></h2>
              </div>
              <Link href="/packages" className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                View all <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
              </Link>
            </div>
            <FeaturedTripsSection />
          </div>
        </section>

        {/* ── LINA SHOWCASE ── */}
        <section className="w-full px-8 xl:px-16 py-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0B1B4D 0%, #0a2260 50%, #0F6CF5 100%)" }}>
          {/* Decorative orbs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #E6B85A, transparent)", filter: "blur(80px)" }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #6366f1, transparent)", filter: "blur(60px)" }} />

          <div className="max-w-[1400px] mx-auto relative z-10">
            <div className="grid grid-cols-2 gap-20 items-center">
              {/* Left */}
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 border border-white/20 rounded-full px-4 py-2 mb-6">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-white/90 uppercase tracking-widest">AI Technology</span>
                </div>
                <h2 className="text-5xl font-black text-white leading-tight mb-6">
                  Meet <span style={{ background: "linear-gradient(90deg, #E6B85A, #f7d98a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Lina</span>,<br/>
                  Your AI Travel<br/>Concierge
                </h2>
                <p className="text-white/90 text-lg leading-relaxed mb-8">
                  <AutoTranslate text="Lina is your AI travel concierge that plans your entire trip in seconds. She understands your destination, budget, and travel style to instantly create the perfect itinerary." className="inline" />
                </p>

                {/* Features */}
                <div className="space-y-4">
                  {[
                    { icon: "🌍", title: "Speaks 40+ languages", desc: "EN, FR, ES, AR and more" },
                    { icon: "⚡", title: "Instant proposals", desc: "Full trip in under 30 seconds" },
                    { icon: "💰", title: "Best price guarantee", desc: "We always find the best deals" },
                    { icon: "🔄", title: "Unlimited revisions", desc: "Adjust until it's perfect" },
                  ].map((f) => (
                    <div key={f.title} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-lg flex-shrink-0">{f.icon}</div>
                      <div>
                        <div className="text-white font-bold text-sm">{f.title}</div>
                        <div className="text-white/85 text-xs">{f.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 flex gap-4">
                  <Link href="/chat" className="inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-sm font-black text-slate-900 hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(90deg, #E6B85A, #f7d98a)" }}>
                    <span>Build my trip with Lina</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                  </Link>
                  <Link href="/call" className="inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-sm font-black text-white border border-white/20 hover:bg-white/20 transition-colors">
                    📞 Call Lina
                  </Link>
                </div>
              </div>

              {/* Right: Lina with chat interface */}
              <div className="relative flex items-center justify-center">
                <div className="relative">
                  {/* Glow */}
                  <div className="absolute inset-0 rounded-3xl" style={{ margin: "-20px", background: "radial-gradient(circle, rgba(230,184,90,0.2) 0%, transparent 70%)", filter: "blur(20px)" }} />

                  {/* Chat card */}
                  <div className="bg-white/20 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-96" style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.4)" }}>
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                      <img src="/branding/lina-avatar.png" alt="Lina" className="w-10 h-10 rounded-full border-2 border-yellow-400/40" />
                      <div>
                        <div className="text-white font-black text-sm">Lina AI</div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-green-400 text-xs font-semibold">Online now</span>
                        </div>
                      </div>
                      <div className="ml-auto bg-white/20 rounded-full p-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0z"/></svg>
                      </div>
                    </div>

                    {/* Chat messages */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start gap-2">
                        <img src="/branding/lina-avatar.png" alt="Lina" className="w-7 h-7 rounded-full flex-shrink-0" />
                        <div className="bg-white/25 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                          <p className="text-white text-sm">Hi! Where are you dreaming of traveling? 🌍</p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="px-4 py-3 rounded-2xl rounded-tr-sm max-w-[80%]" style={{ background: "linear-gradient(135deg, #0F6CF5, #0B1B4D)" }}>
                          <p className="text-white text-sm">Santorini for our anniversary 💑</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <img src="/branding/lina-avatar.png" alt="Lina" className="w-7 h-7 rounded-full flex-shrink-0" />
                        <div className="bg-white/25 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                          <p className="text-white text-sm">Perfect choice! 🏛️ I found a 7-night package with cave villa + sunset cruise from $2,850/person. Want to see it?</p>
                        </div>
                      </div>
                    </div>

                    {/* Input */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/20 border border-white/15 rounded-2xl px-4 py-3">
                        <span className="text-white/85 text-sm">Message Lina...</span>
                      </div>
                      <Link href="/chat" className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-900 hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #E6B85A, #f7d98a)" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="w-full px-8 xl:px-16 py-20 bg-white">
          <div className="max-w-[1400px] mx-auto text-center">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="text-4xl font-black text-slate-900 mb-4"><AutoTranslate text="Book your dream trip in 3 steps" className="inline" /></h2>
            <p className="text-slate-500 max-w-xl mx-auto mb-14"><AutoTranslate text="No endless searching. Lina does all the work." className="inline" /></p>

            <div className="grid grid-cols-3 gap-8">
              {[
                { step: "01", icon: "💬", title: "Tell Lina", desc: "Describe your dream trip — destination, budget, travel style, dates. Any language works.", color: "#0F6CF5" },
                { step: "02", icon: "✨", title: "Lina Plans", desc: "She searches hundreds of options and builds a perfect custom itinerary just for you.", color: "#E6B85A" },
                { step: "03", icon: "✅", title: "You Book", desc: "Review your proposal, ask for changes, then confirm with one click. Done.", color: "#10b981" },
              ].map((s) => (
                <div key={s.step} className="relative group">
                  {/* Connector line */}
                  <div className="absolute top-16 left-full w-8 h-0.5 bg-slate-100 z-0" style={{ display: s.step === "03" ? "none" : "block" }} />
                  <div className="bg-[#F8FAFF] rounded-3xl p-8 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto" style={{ backgroundColor: s.color + "15" }}>{s.icon}</div>
                    <div className="text-xs font-black tracking-widest mb-3" style={{ color: s.color }}>STEP {s.step}</div>
                    <h3 className="text-xl font-black text-slate-900 mb-3">{s.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <Link href="/chat" className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-sm font-black text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #0B1B4D, #0F6CF5)" }}>
                <span>Start planning now</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ── TRUST SECTION ── */}
        <section className="w-full px-8 xl:px-16 py-20" style={{ backgroundColor: "#F8FAFF" }}>
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-4 gap-6">
              {[
                { icon: "🏛️", title: "Delaware Incorporated", desc: "Officially registered US company", badge: "Verified" },
                { icon: "🔒", title: "100% Secure", desc: "SSL encrypted, PCI compliant", badge: "Secure" },
                { icon: "💰", title: "No Hidden Fees", desc: "What Lina quotes is what you pay", badge: "Transparent" },
                { icon: "⭐", title: "4.9/5 Rating", desc: "From verified traveler reviews", badge: "Top Rated" },
              ].map((t) => (
                <div key={t.title} className="bg-white rounded-3xl p-6 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
                  <div className="text-3xl mb-4">{t.icon}</div>
                  <div className="inline-block text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 mb-3">{t.badge}</div>
                  <h3 className="text-base font-black text-slate-900 mb-2">{t.title}</h3>
                  <p className="text-slate-500 text-sm">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="w-full px-8 xl:px-16 py-24">
          <div className="max-w-[1400px] mx-auto">
            <div className="relative rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0B1B4D 0%, #0F6CF5 100%)" }}>
              <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #E6B85A, transparent)", filter: "blur(60px)" }} />
              <div className="relative z-10 text-center py-20 px-8">
                <img src="/branding/lina-avatar.png" alt="Lina" className="w-20 h-20 rounded-full border-4 mx-auto mb-6 shadow-2xl" style={{ borderColor: "rgba(230,184,90,0.5)" }} />
                <h2 className="text-5xl font-black text-white mb-4">
                  <AutoTranslate text="Start planning your trip with AI" className="inline" />
                </h2>
                <p className="text-white/90 text-lg max-w-xl mx-auto mb-10">
                  <AutoTranslate text="Tell Lina where you want to go and she will instantly create your perfect trip." className="inline" />
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Link href="/chat" className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-black text-slate-900 hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(90deg, #E6B85A, #f7d98a)" }}>
                    💬 Start planning my trip
                  </Link>
                  <Link href="/call" className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-black text-white border-2 border-white/20 hover:bg-white/20 transition-colors">
                    📞 Call Lina
                  </Link>
                </div>
                <p className="text-white/60 text-xs mt-4">Free to start • No credit card required • 15% off your first booking</p>
              </div>
            </div>
          </div>
        </section>

        <div className="px-8 xl:px-16">
          <Footer />
        </div>
      </div>
    </main>
    </AppHomeGate>
  );
}
