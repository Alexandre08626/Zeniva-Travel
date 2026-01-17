/* eslint-disable @next/next/no-img-element */
// src/app/page.tsx
import Link from "next/link";
import { PREMIUM_BLUE, LIGHT_BG, TITLE_TEXT, GRADIENT_START, GRADIENT_END } from "../src/design/tokens";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import TravelSearchWidget from "../src/components/TravelSearchWidget";
import LinaWidget from "../src/components/LinaWidget";
import AutoTranslate from "../src/components/AutoTranslate";
import LinaAvatar from "../src/components/LinaAvatar";
import dynamic from "next/dynamic";
import FeaturedTripsSection from "../src/components/FeaturedTripsSection";

const COLLECTIONS = [
  { id: "c7", title: "Yacht Charters", description: "YCN partner fleet", icon: "yacht", href: "/yachts" },
  { id: "c4", title: "Partner Resorts", description: "5-star all-inclusive", icon: "resort", href: "/partners/resorts" },
  { id: "c6", title: "Group Trips", description: "Friends & family", icon: "group", href: "/collections/group" },
  { id: "c8", title: "Partner Airbnbs", description: "Curated villa stays", icon: "home", href: "/airbnbs" },
];

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
  return (
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      {/* Header aligned with hero left edge (full-bleed alignment) */}
      <div style={{ position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw', width: '100vw' }}>
        <div style={{ width: '90%', marginLeft: '5vw' }}>
          <Header isLoggedIn={isLoggedIn} userEmail={userEmail} />
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-5 pb-16 pt-5">

        {/* HERO SECTION (Compact Premium) - full-bleed banner */}
        <section
          className="mt-8 mb-12"
          style={{
            position: 'relative',
            left: '50%',
            right: '50%',
            marginLeft: '-50vw',
            marginRight: '-50vw',
            width: '100vw',
          }}
        >
          <div className="relative rounded-3xl overflow-hidden mx-auto" style={{ width: '90%', maxWidth: 'none' }}>
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(110deg, ${GRADIENT_START} 0%, ${GRADIENT_END} 60%)`,
                opacity: 0.98,
              }}
            />

            <div className="relative z-10 w-full mx-auto px-5 py-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
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
                      text="Tailor-made journeys, expert recommendations, and ready-to-book itineraries."
                      className="inline"
                    />
                  </p>

                  {/* Prominent Search Card */}
                  <div className="mt-6 mx-auto md:mx-0" style={{ width: 'min(760px, 100%)' }}>
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

                <div className="flex-1 hidden md:flex items-center justify-center pr-12">
                  <div className="flex flex-col items-center gap-3">
                    <span
                      className="font-extrabold tracking-tight"
                      style={{
                        fontSize: "clamp(1.25rem, 2.6vw, 1.75rem)",
                        lineHeight: 1,
                        background: "linear-gradient(90deg,#ffffff 60%, #E6B85A 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        textShadow: "0 6px 18px rgba(11,27,77,0.22)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Lina AI
                    </span>
                    <LinaWidget size={Math.min(336, Math.max(192, 21 * 16))} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 large tiles BELOW the hero (aligned with page content) */}
        <section className="mt-6 mb-12">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/chat" className="block rounded-2xl overflow-hidden shadow-xl group">
                <div className="relative h-44 md:h-56 lg:h-64 bg-slate-50 flex flex-col items-center justify-center gap-3 p-4">
                  <div className="w-16 h-16 rounded-full bg-slate-900/5 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 5h14v9H8l-3 3V5z" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="text-lg font-extrabold text-slate-900">Chat Lina</div>
                  <div className="text-sm text-slate-500">Start a conversation</div>
                </div>
              </Link>

              <Link href="/call" className="block rounded-2xl overflow-hidden shadow-xl group">
                <div className="relative h-44 md:h-56 lg:h-64 bg-slate-50 flex flex-col items-center justify-center gap-3 p-4">
                  <div className="w-16 h-16 rounded-full bg-slate-900/5 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92V20a1 1 0 0 1-1 1 19 19 0 0 1-8.63-2.21A19 19 0 0 1 3 8a1 1 0 0 1 1-1h3.09a1 1 0 0 1 1 .75c.14.7.48 1.9 1.2 3.04a1 1 0 0 1-.24 1.26l-1.2 1.2a12 12 0 0 0 6.6 6.6l1.2-1.2a1 1 0 0 1 1.26-.24c1.14.72 2.34 1.06 3.04 1.2a1 1 0 0 1 .75 1V20z" />
                    </svg>
                  </div>
                  <div className="text-lg font-extrabold text-slate-900">Call Lina</div>
                  <div className="text-sm text-slate-500">Speak with concierge</div>
                </div>
              </Link>

              <Link href="/proposals" className="block rounded-2xl overflow-hidden shadow-xl group">
                <div className="relative h-44 md:h-56 lg:h-64 bg-slate-50 flex flex-col items-center justify-center gap-3 p-4">
                  <div className="w-16 h-16 rounded-full bg-slate-900/5 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 5h12v14H6z" stroke="#0F172A" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M9 9h6M9 12h6M9 15h4" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="text-lg font-extrabold text-slate-900">Proposals</div>
                  <div className="text-sm text-slate-500">View curated proposals</div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* COLLECTIONS CAROUSEL */}
        <section className="mt-20 mb-20">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-4xl font-black mb-2" style={{ color: TITLE_TEXT }}>
                Collection & Themes
              </h2>
              <p className="text-slate-600">Browse curated travel collections tailored by Lina.</p>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
            {COLLECTIONS.map((c) => (
              <Link
                key={c.id}
                href={c.href || `/collections/${c.title.toLowerCase().replace(/\s+/g,'-')}`}
                className="flex-shrink-0 rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg transition min-w-[280px] cursor-pointer snap-start"
              >
                <div className="text-4xl mb-3">
                  <Icon name={c.icon} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>{c.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{c.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* FEATURED TRIPS */}
        <section className="mt-20 mb-20">
            <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-black" style={{ color: TITLE_TEXT }}>
                Featured Trips by Lina
              </h2>
              <p className="text-slate-600 mt-2">Hand-picked proposals ready to book.</p>
            </div>
              <Link href="/packages" className="text-sm font-bold underline hidden md:block" style={{ color: PREMIUM_BLUE }}>
              View all →
            </Link>
          </div>
          <FeaturedTripsSection />
        </section>

        {/* WHY LINA SECTION */}
        <section className="mt-20 mb-20 rounded-3xl p-10 md:p-16 text-white relative overflow-hidden" style={{ backgroundColor: PREMIUM_BLUE }}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-3xl"></div>
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                <LinaAvatar size="md" className="h-full w-full" />
              </div>
              <div>
                <h3 className="text-2xl font-black">Lina AI, Your Travel Genius</h3>
                <p className="text-sm text-slate-200 mt-1">Powered by Zeniva Intelligence</p>
              </div>
            </div>

            <p className="text-lg font-semibold leading-8 mb-8">
              Lina asks clarifying questions about your preferences, budget, and dates — then generates hand-picked proposals combining flights, hotels, and experiences. No cookie-cutter packages. Just travel tailored to you.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="mb-2">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14h-2v-2h2v2zm0-4h-2V6h2v6z" fill="#FFF"/></svg>
                </div>
                <h4 className="font-bold mb-2">She Asks</h4>
                <p className="text-sm text-slate-200">Departure city, dates, budget & vibe</p>
              </div>
              <div>
                <div className="mb-2">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3l2 5 5 .5-4 3 1.2 5L12 15l-4.2 2.5L9 11 5 8l5-.5L12 3z" fill="#FFF"/></svg>
                </div>
                <h4 className="font-bold mb-2">She Curates</h4>
                <p className="text-sm text-slate-200">Optimized flight + hotel combos</p>
              </div>
              <div>
                <div className="mb-2">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12l2 2 4-4" stroke="#FFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h4 className="font-bold mb-2">You Book</h4>
                <p className="text-sm text-slate-200">Ready-to-checkout itineraries</p>
              </div>
            </div>

            <div className="mt-10">
              <Link
                href="/chat"
                className="inline-block rounded-full px-8 py-3 text-sm font-extrabold bg-white"
                style={{ color: PREMIUM_BLUE }}
              >
                Start Planning Now →
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
