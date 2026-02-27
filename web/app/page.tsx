// src/app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { PREMIUM_BLUE, BRAND_BLUE, ACCENT_GOLD, LIGHT_BG, TITLE_TEXT, GRADIENT_START, GRADIENT_END } from "../src/design/tokens";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import TravelSearchWidget from "../src/components/TravelSearchWidget";
import LinaWidget from "../src/components/LinaWidget";
import LinaHero from "../src/components/LinaHero";
import AutoTranslate from "../src/components/AutoTranslate";
import LinaAvatar from "../src/components/LinaAvatar";
import dynamic from "next/dynamic";
import FeaturedTripsSection from "../src/components/FeaturedTripsSection";

const COLLECTIONS = [
  { id: "c7", title: "Yacht Charters", description: "YCN partner fleet", icon: "yacht", href: "/yachts" },
  { id: "c4", title: "Partner Resorts", description: "All-inclusive resorts", icon: "resort", href: "/partners/resorts" },
  { id: "c6", title: "Group Trips", description: "Friends & family", icon: "group", href: "/collections/group" },
  { id: "c8", title: "Short-term rentals", description: "Private stays curated by Zeniva, bookable with concierge support.", icon: "home", href: "/residences" },
];

export const metadata: Metadata = {
  title: "AI Travel Concierge",
  description:
    "Zeniva Travel is an AI travel company. Lina AI discovers intent, builds intelligent proposals, and concierge experts finalize the trip.",
  alternates: {
    canonical: "https://zenivatravel.com",
    languages: {
      "en-CA": "https://zenivatravel.com",
      "fr-CA": "https://zenivatravel.com/fr",
    },
  },
  openGraph: {
    title: "Zeniva Travel AI | AI Travel Concierge",
    description:
      "AI trip planning with Lina AI: intent discovery, intelligent proposals, and concierge validation.",
    url: "https://zenivatravel.com",
    siteName: "Zeniva Travel",
    type: "website",
    images: [
      {
        url: "/branding/lina-avatar.png",
        width: 1200,
        height: 630,
        alt: "Lina AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zeniva Travel AI | AI Travel Concierge",
    description:
      "AI trip planning with Lina AI: intent discovery, intelligent proposals, and concierge validation.",
    images: ["/branding/lina-avatar.png"],
  },
};

function Icon({ name }: { name: string }) {
  switch (name) {
    case "beach":
      return (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8 2 5 5 5 9c0 2.5 1.4 4.7 3.5 5.8L12 22l3.5-7.2C17.6 13.7 19 11.5 19 9c0-4-3-7-7-7z" fill="#FFD166" />
        </svg>
      );
    case "city":
      return (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="6" width="6" height="12" rx="1" fill="#8EA7FF" />
          <rect x="15" y="4" width="6" height="14" rx="1" fill="#4D6CFF" />
        </svg>
      );
    case "mountain":
      return (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 20h20L12 4 2 20z" fill="#A0E9D9" />
        </svg>
      );
    case "resort":
      return (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke={TITLE_TEXT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 18.5h15" />
          <path d="M7 18.5V9.8c0-.5.4-.8.8-.9l8.4-1.5c.5-.1.8.3.8.8v10.3" />
          <path d="M9 13h6" />
          <path d="M10 10.5V7.8c0-1.6 1.3-2.8 2.8-2.8h.4C14.8 5 16 6.2 16 7.8V10" />
          <path d="M10 15.5h2M14 15.5h1.5" />
        </svg>
      );
    case "heart":
      return (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21s-7-4.35-9-7.05C-0.25 9.3 3 4 8 6.5 10 7.8 12 9 12 9s2-1.2 4-2.5C21 4 24.25 9.3 21 13.95 19 16.65 12 21 12 21z" fill="#FF8AA1" />
        </svg>
      );
    case "group":
      return (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="2.5" fill="#B7C9FF" />
          <circle cx="16" cy="8" r="2.5" fill="#8EA7FF" />
          <path d="M2 18c2-4 8-4 10-4s8 0 10 4v2H2v-2z" fill="#CFE0FF" />
        </svg>
      );
    case "home":
      return (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5V15h-5v6H5a1 1 0 0 1-1-1v-8.5Z" fill="#8EA7FF" />
        </svg>
      );
    case "yacht":
      return (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke={TITLE_TEXT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 15.2h5.8l2.2-6.8 4.5 2.2V15h3.5" />
          <path d="M3 17.5c1 .6 2.3 1 3.8 1 2.6 0 3.8-1.5 6.4-1.5s3.8 1.5 6.4 1.5c1.2 0 2.1-.3 2.8-.7" />
          <path d="M14 6 10.5 8.5" />
        </svg>
      );
    default:
      return null;
  }
}

const FEATURED_TRIPS = [
  { id: "t1", title: "Bali Bliss", price: "$4,850", dates: "Mar 15 - Mar 22", destination: "Indonesia", image: "https://images.unsplash.com/photo-1505765052191-2b9d2c4b9a46?auto=format&fit=crop&w=1200&q=60" },
  { id: "t2", title: "Parisian Romance", price: "$3,200", dates: "Apr 1 - Apr 8", destination: "France", image: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=1200&q=60" },
  { id: "t3", title: "Cancun All-Inclusive", price: "$2,500", dates: "May 10 - May 17", destination: "Mexico", image: "https://images.unsplash.com/photo-1501117170019-8782a8e5f9b8?auto=format&fit=crop&w=1200&q=60" },
  { id: "t4", title: "Tokyo Culture", price: "$5,100", dates: "Jun 1 - Jun 10", destination: "Japan", image: "https://images.unsplash.com/photo-1549692520-acc6669e2f0c?auto=format&fit=crop&w=1200&q=60" },
  { id: "t5", title: "Santorini Escape", price: "$3,800", dates: "Jul 5 - Jul 12", destination: "Greece", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=60" },
  { id: "t6", title: "Dubai Luxe", price: "$4,200", dates: "Aug 1 - Aug 8", destination: "UAE", image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=60" },
];

// UI-only (auth plus tard)
const isLoggedIn = false;
const userEmail = "user@email.com";

// Components moved to `src/components/*` for reuse (Pill, Label)

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Zeniva Travel",
        url: "https://zenivatravel.com",
        logo: "https://zenivatravel.com/branding/logo.png",
        sameAs: ["https://zenivatravel.com"],
      },
      {
        "@type": "TravelAgency",
        name: "Zeniva Travel AI",
        url: "https://zenivatravel.com",
        logo: "https://zenivatravel.com/branding/logo.png",
        image: "https://zenivatravel.com/branding/lina-avatar.png",
        description:
          "Zeniva Travel AI is powered by Lina AI. Discover intent, build intelligent proposals, and finalize with concierge experts.",
        brand: {
          "@type": "Brand",
          name: "Lina AI",
        },
      },
      {
        "@type": "Product",
        name: "Lina AI Travel Concierge",
        description:
          "AI travel concierge—intent discovery, intelligent proposals, and human finalization.",
        brand: {
          "@type": "Brand",
          name: "Zeniva Travel",
        },
        url: "https://zenivatravel.com/ai-travel-concierge",
        image: "https://zenivatravel.com/branding/lina-avatar.png",
      },
      {
        "@type": "WebSite",
        name: "Zeniva Travel AI",
        url: "https://zenivatravel.com",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://zenivatravel.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      {/* Mobile: override bg to dark */}
      <style>{`@media(max-width:639px){main{background:#0A1628!important}}`}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="w-screen left-1/2 right-1/2 -translate-x-1/2 relative">
        <div className="mx-auto w-full px-6 pt-5 hidden sm:block">
          <Header isLoggedIn={isLoggedIn} userEmail={userEmail} />
        </div>
      </div>

      {/* ========== MOBILE — FULL REDESIGN ========== */}
      <section className="sm:hidden">
        <div className="relative w-screen left-1/2 right-1/2 -translate-x-1/2 overflow-hidden" style={{ background: `linear-gradient(160deg, ${GRADIENT_START} 0%, ${GRADIENT_END} 100%)` }}>
          {/* Glow orbs */}
          <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full blur-3xl" style={{ background: "rgba(99,102,241,0.25)" }} />
          <div className="absolute top-40 -left-20 h-48 w-48 rounded-full blur-3xl" style={{ background: "rgba(43,107,255,0.2)" }} />

          <div className="relative z-10 px-5 pt-6 pb-8 flex flex-col" style={{ minHeight: "100dvh" }}>
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/branding/lina-hero.png" alt="Lina" className="h-8 w-8 rounded-full object-cover object-top" />
                <span className="text-white font-bold text-sm">Zeniva Travel</span>
              </div>
              <div className="flex gap-2">
                <Link href="/signup" className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80">Sign up</Link>
                <Link href="/login" className="rounded-full bg-white px-3 py-1.5 text-xs font-bold" style={{ color: PREMIUM_BLUE }}>Log in</Link>
              </div>
            </div>

            {/* Lina big avatar */}
            <div className="flex flex-col items-center mt-8">
              <div className="relative">
                <div className="absolute inset-0 rounded-full" style={{ margin: "-8px", background: "linear-gradient(135deg, rgba(99,102,241,0.4), rgba(43,107,255,0.2))", filter: "blur(20px)" }} />
                <img
                  src="/branding/lina-hero.png"
                  alt="Lina AI"
                  className="relative h-52 w-52 rounded-full object-cover object-top shadow-2xl"
                  style={{ border: "3px solid rgba(255,255,255,0.15)" }}
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white/15 backdrop-blur-md rounded-full px-4 py-1 border border-white/20">
                  <span className="text-white font-bold text-xs">Lina AI ✨</span>
                </div>
              </div>

              <h1 className="mt-6 text-3xl font-black text-center text-white leading-tight tracking-tight">
                Your AI Travel<br/>Concierge
              </h1>
              <p className="mt-2 text-sm text-white/70 text-center max-w-xs">
                Tell Lina where you want to go. She&apos;ll plan everything.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 space-y-3">
              <Link href="/chat" className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-xl active:scale-[0.98] transition-transform">
                <div className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${GRADIENT_START}, ${GRADIENT_END})` }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 5h14v9H8l-3 3V5z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div className="flex-1">
                  <div className="text-base font-bold" style={{ color: TITLE_TEXT }}>Chat with Lina</div>
                  <div className="text-xs text-slate-500">Plan your trip by text</div>
                </div>
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </Link>

              <Link href="/call" className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 active:scale-[0.98] transition-transform">
                <div className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 bg-white/15">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div className="flex-1">
                  <div className="text-base font-bold text-white">Call Lina</div>
                  <div className="text-xs text-white/50">Voice call with AI concierge</div>
                </div>
                <svg className="h-5 w-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </Link>
            </div>

            {/* Quick prompts */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                { emoji: "🏖️", label: "Beach trip", prompt: "Beach vacation, 7 nights" },
                { emoji: "💑", label: "Romantic", prompt: "Romantic getaway for two" },
                { emoji: "👨‍👩‍👧‍👦", label: "Family", prompt: "Family vacation with kids" },
                { emoji: "⛷️", label: "Adventure", prompt: "Adventure trip" },
              ].map((q) => (
                <Link
                  key={q.label}
                  href={`/chat?prompt=${encodeURIComponent(q.prompt)}`}
                  className="rounded-full bg-white/10 border border-white/10 px-3 py-1.5 text-xs font-medium text-white/80 active:bg-white/20 transition-colors"
                >
                  {q.emoji} {q.label}
                </Link>
              ))}
            </div>

            {/* Bottom section */}
            <div className="mt-auto pt-10">
              {/* Collections strip */}
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                {COLLECTIONS.map((c) => (
                  <Link key={c.id} href={c.href} className="flex-shrink-0 w-28 rounded-2xl bg-white/10 border border-white/10 p-3 active:bg-white/15 transition-colors">
                    <div className="text-2xl mb-1"><Icon name={c.icon} /></div>
                    <div className="text-xs font-bold text-white truncate">{c.title}</div>
                    <div className="text-[10px] text-white/50 truncate">{c.description}</div>
                  </Link>
                ))}
              </div>

              {/* Trust bar */}
              <div className="mt-6 flex items-center justify-center gap-4 text-white/40 text-[10px] font-medium">
                <span>✈️ 24/7 AI Concierge</span>
                <span>•</span>
                <span>🌍 200+ Destinations</span>
                <span>•</span>
                <span>⚡ Instant Proposals</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HERO SECTION (Compact) - full-bleed banner */}
      <section className="mt-4 mb-8 sm:mt-8 sm:mb-12 hidden sm:block">
        <div className="relative w-screen left-1/2 right-1/2 -translate-x-1/2">
          <div className="relative rounded-3xl overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(110deg, ${GRADIENT_START} 0%, ${GRADIENT_END} 60%)`,
                opacity: 0.98,
              }}
            />

            <div className="relative z-10 w-full mx-auto px-6 py-8 sm:py-12">
              <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
                <div className="flex-1 text-center md:text-left">
                  <div className="mb-3 flex items-center justify-center md:justify-start gap-4">
                    <img src="/branding/logo.png" alt="Zeniva logo" className="w-auto rounded-lg shadow-sm" style={{ height: "clamp(2.5rem, 6.5vw, 4.25rem)" }} />
                    <div>
                      <div
                        className="font-extrabold tracking-tight text-white"
                        style={{
                          fontSize: "clamp(2.5rem, 6.5vw, 4.25rem)",
                          lineHeight: 0.95,
                          background: "linear-gradient(90deg,#ffffff 60%, #E6B85A 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          textShadow: "0 8px 24px rgba(11,27,77,0.28)",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        Zeniva Travel AI
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-md text-white/90 max-w-xl md:max-w-2xl">
                    <AutoTranslate
                      text="Plan a trip in minutes with Lina AI—intent discovery, intelligent proposals, and concierge validation."
                      className="inline"
                    />
                  </p>

                  {/* Prominent Search Card */}
                  <div className="mt-6 mx-auto md:mx-0 w-full max-w-[820px] lg:max-w-[1040px] xl:max-w-[1040px] 2xl:max-w-[820px]">
                    <div className="bg-white rounded-2xl shadow-lg p-4">
                      <TravelSearchWidget />
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[
                          { id: 'q1', label: 'Family trip', prompt: 'Family beach trip, 7 nights' },
                          { id: 'q2', label: 'Romantic', prompt: 'Honeymoon Santorini, 5 nights' },
                          { id: 'q3', label: 'Budget', prompt: 'Sunny destinations under $1500' },
                        ].map((q) => (
                          <Link
                            key={q.id}
                            href={`/chat?prompt=${encodeURIComponent(q.prompt)}`}
                            className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
                          >
                            {q.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* action cards removed from hero - placed below as separate section */}
                </div>

                <LinaHero />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== MOBILE SECTIONS (below hero) ========== */}
      <div className="sm:hidden px-5 pb-12" style={{ background: `linear-gradient(180deg, ${GRADIENT_END} 0%, #0A1628 8%, #0A1628 100%)` }}>

        {/* How Lina works */}
        <section className="pt-10 pb-8">
          <h2 className="text-xl font-black text-white mb-5 text-center">How it works</h2>
          <div className="flex gap-3">
            {[
              { step: "1", icon: "💬", title: "Tell Lina", desc: "Your dream trip" },
              { step: "2", icon: "✨", title: "She Plans", desc: "Flights + Hotels" },
              { step: "3", icon: "✅", title: "You Book", desc: "Ready to go" },
            ].map((s) => (
              <div key={s.step} className="flex-1 bg-white/8 rounded-2xl p-3 border border-white/8 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-xs font-bold text-white">{s.title}</div>
                <div className="text-[10px] text-white/45">{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick actions grid */}
        <section className="pb-8">
          <h2 className="text-xl font-black text-white mb-4">Quick access</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/proposals" className="bg-white/8 border border-white/8 rounded-2xl p-4 active:bg-white/12 transition-colors">
              <div className="text-2xl mb-2">📋</div>
              <div className="text-sm font-bold text-white">My Proposals</div>
              <div className="text-[11px] text-white/45 mt-1">View your trips</div>
            </Link>
            <Link href="/yachts" className="bg-white/8 border border-white/8 rounded-2xl p-4 active:bg-white/12 transition-colors">
              <div className="text-2xl mb-2">🛥️</div>
              <div className="text-sm font-bold text-white">Yachts</div>
              <div className="text-[11px] text-white/45 mt-1">Luxury charters</div>
            </Link>
            <Link href="/partners/resorts" className="bg-white/8 border border-white/8 rounded-2xl p-4 active:bg-white/12 transition-colors">
              <div className="text-2xl mb-2">🏨</div>
              <div className="text-sm font-bold text-white">Resorts</div>
              <div className="text-[11px] text-white/45 mt-1">Partner stays</div>
            </Link>
            <Link href="/residences" className="bg-white/8 border border-white/8 rounded-2xl p-4 active:bg-white/12 transition-colors">
              <div className="text-2xl mb-2">🏠</div>
              <div className="text-sm font-bold text-white">Rentals</div>
              <div className="text-[11px] text-white/45 mt-1">Short-term stays</div>
            </Link>
            <Link href="/collections/group" className="bg-white/8 border border-white/8 rounded-2xl p-4 active:bg-white/12 transition-colors">
              <div className="text-2xl mb-2">👥</div>
              <div className="text-sm font-bold text-white">Group Trips</div>
              <div className="text-[11px] text-white/45 mt-1">Travel together</div>
            </Link>
            <Link href="/packages" className="bg-white/8 border border-white/8 rounded-2xl p-4 active:bg-white/12 transition-colors">
              <div className="text-2xl mb-2">🔥</div>
              <div className="text-sm font-bold text-white">Deals</div>
              <div className="text-[11px] text-white/45 mt-1">Hot packages</div>
            </Link>
          </div>
        </section>

        {/* Featured Trips */}
        <section className="pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-white">Featured Trips</h2>
            <Link href="/packages" className="text-xs font-bold text-indigo-400">View all →</Link>
          </div>
          <FeaturedTripsSection />
        </section>

        {/* Lina CTA */}
        <section className="pb-8">
          <div className="rounded-2xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${GRADIENT_START}, ${GRADIENT_END})` }}>
            <div className="p-5 flex items-center gap-4">
              <img src="/branding/lina-hero.png" alt="Lina" className="h-16 w-16 rounded-full object-cover object-top border-2 border-white/20 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-white font-bold text-base">Ready to plan?</div>
                <div className="text-white/60 text-xs mt-0.5">Lina is available 24/7</div>
              </div>
              <Link href="/chat" className="bg-white rounded-full px-4 py-2 text-xs font-bold flex-shrink-0" style={{ color: PREMIUM_BLUE }}>
                Start →
              </Link>
            </div>
          </div>
        </section>

        {/* Footer mini */}
        <div className="pt-6 border-t border-white/8 flex items-center justify-center gap-4 text-white/25 text-[10px]">
          <span>© Zeniva Travel</span>
          <Link href="/privacy" className="hover:text-white/40">Privacy</Link>
          <Link href="/terms" className="hover:text-white/40">Terms</Link>
        </div>
      </div>

      {/* ========== DESKTOP SECTIONS ========== */}
      <div className="hidden sm:block mx-auto w-full max-w-none px-6 pb-16">

        {/* 3 large tiles */}
        <section className="mt-6 mb-12">
          <div className="w-full">
            <div className="grid grid-cols-3 gap-4">
              <Link href="/chat" className="rounded-2xl overflow-hidden shadow-xl group">
                <div className="relative h-44 md:h-56 lg:h-64 bg-slate-50 flex flex-col items-center justify-center gap-3 p-4">
                  <div className="w-16 h-16 rounded-full bg-slate-900/5 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 5h14v9H8l-3 3V5z" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="text-lg font-extrabold text-slate-900"><AutoTranslate text="Chat Lina" className="inline" /></div>
                  <div className="text-sm text-slate-500"><AutoTranslate text="Start a conversation" className="inline" /></div>
                </div>
              </Link>
              <Link href="/call" className="rounded-2xl overflow-hidden shadow-xl group">
                <div className="relative h-44 md:h-56 lg:h-64 bg-slate-50 flex flex-col items-center justify-center gap-3 p-4">
                  <div className="w-16 h-16 rounded-full bg-slate-900/5 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92V20a1 1 0 0 1-1 1 19 19 0 0 1-8.63-2.21A19 19 0 0 1 3 8a1 1 0 0 1 1-1h3.09a1 1 0 0 1 1 .75c.14.7.48 1.9 1.2 3.04a1 1 0 0 1-.24 1.26l-1.2 1.2a12 12 0 0 0 6.6 6.6l1.2-1.2a1 1 0 0 1 1.26-.24c1.14.72 2.34 1.06 3.04 1.2a1 1 0 0 1 .75 1V20z"/></svg>
                  </div>
                  <div className="text-lg font-extrabold text-slate-900"><AutoTranslate text="Call Lina" className="inline" /></div>
                  <div className="text-sm text-slate-500"><AutoTranslate text="Speak with concierge" className="inline" /></div>
                </div>
              </Link>
              <Link href="/proposals" className="rounded-2xl overflow-hidden shadow-xl group">
                <div className="relative h-44 md:h-56 lg:h-64 bg-slate-50 flex flex-col items-center justify-center gap-3 p-4">
                  <div className="w-16 h-16 rounded-full bg-slate-900/5 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 5h12v14H6z" stroke="#0F172A" strokeWidth="1.5" strokeLinejoin="round"/><path d="M9 9h6M9 12h6M9 15h4" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                  <div className="text-lg font-extrabold text-slate-900"><AutoTranslate text="Proposals" className="inline" /></div>
                  <div className="text-sm text-slate-500"><AutoTranslate text="View curated proposals" className="inline" /></div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* COLLECTIONS */}
        <section className="mt-20 mb-20">
          <div className="mb-8 flex flex-col items-center text-center gap-2">
            <h2 className="text-4xl font-black" style={{ color: TITLE_TEXT }}><AutoTranslate text="Collection & Themes" className="inline" /></h2>
            <p className="text-slate-600"><AutoTranslate text="Browse curated travel collections tailored by Lina." className="inline" /></p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {COLLECTIONS.map((c) => (
              <Link key={c.id} href={c.href || `/collections/${c.title.toLowerCase().replace(/\s+/g,'-')}`} className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg transition w-full cursor-pointer">
                <div className="text-4xl mb-3"><Icon name={c.icon} /></div>
                <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}><AutoTranslate text={c.title} className="inline" /></h3>
                <p className="text-sm text-slate-500 mt-1"><AutoTranslate text={c.description} className="inline" /></p>
              </Link>
            ))}
          </div>
        </section>

        {/* FEATURED TRIPS */}
        <section className="mt-20 mb-20">
          <div className="relative mb-8">
            <div className="flex flex-col items-center text-center gap-2">
              <h2 className="text-4xl font-black" style={{ color: TITLE_TEXT }}><AutoTranslate text="Featured Trips by Lina" className="inline" /></h2>
              <p className="text-slate-600"><AutoTranslate text="Hand-picked proposals ready to book." className="inline" /></p>
            </div>
            <Link href="/packages" className="text-sm font-bold underline hidden md:block absolute right-0 top-1/2 -translate-y-1/2" style={{ color: PREMIUM_BLUE }}>View all →</Link>
          </div>
          <FeaturedTripsSection />
        </section>

        {/* WHY LINA */}
        <section className="mt-20 mb-20 rounded-3xl p-10 md:p-16 text-white relative overflow-hidden" style={{ backgroundColor: PREMIUM_BLUE }}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-3xl"></div>
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center overflow-hidden"><LinaAvatar size="md" className="h-full w-full" /></div>
              <div>
                <h3 className="text-2xl font-black"><AutoTranslate text="Lina AI, Your Travel Genius" className="inline" /></h3>
                <p className="text-sm text-white/80 mt-1"><AutoTranslate text="Powered by Zeniva Intelligence" className="inline" /></p>
              </div>
            </div>
            <p className="text-lg font-semibold leading-8 mb-8"><AutoTranslate text="Lina asks clarifying questions about your preferences, budget, and dates — then generates hand-picked proposals combining flights, hotels, and experiences. No cookie-cutter packages. Just travel tailored to you." className="inline" /></p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div><div className="mb-2"><svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14h-2v-2h2v2zm0-4h-2V6h2v6z" fill="#FFF"/></svg></div><h4 className="font-bold mb-2"><AutoTranslate text="She Asks" className="inline"/></h4><p className="text-sm text-white/80"><AutoTranslate text="Departure city, dates, budget & vibe" className="inline"/></p></div>
              <div><div className="mb-2"><svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M12 3l2 5 5 .5-4 3 1.2 5L12 15l-4.2 2.5L9 11 5 8l5-.5L12 3z" fill="#FFF"/></svg></div><h4 className="font-bold mb-2"><AutoTranslate text="She Curates" className="inline"/></h4><p className="text-sm text-white/80"><AutoTranslate text="Optimized flight + hotel combos" className="inline"/></p></div>
              <div><div className="mb-2"><svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke="#FFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div><h4 className="font-bold mb-2"><AutoTranslate text="You Book" className="inline"/></h4><p className="text-sm text-white/80"><AutoTranslate text="Ready-to-checkout itineraries" className="inline"/></p></div>
            </div>
            <div className="mt-10"><Link href="/chat" className="inline-block rounded-full px-8 py-3 text-sm font-extrabold bg-white" style={{ color: PREMIUM_BLUE }}><AutoTranslate text="Start Planning Now →" className="inline" /></Link></div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
