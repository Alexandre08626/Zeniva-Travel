// Home page — extended sections (shared by the mobile and desktop layouts of app/page.tsx).
// Server component: no hooks, CSS-only motion, every link points to an existing route.
import Link from "next/link";
import AutoTranslate from "./AutoTranslate";

/** Teaser shape for the optional guides section (pass GUIDES from app/guides/guides-data once published). */
export type GuideTeaser = { slug: string; title: string; readingMinutes: number; tags: string[]; shortAnswer: string };

const NAVY = "#0B1B4D";
const BLUE = "#0F6CF5";
const GOLD = "#E6B85A";

const u = (id: string, w = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

/** Single source of truth for the visible FAQ and the FAQPage JSON-LD in app/page.tsx. */
export const HOME_FAQ: { q: string; a: string }[] = [
  {
    q: "What is Zeniva?",
    a: "Zeniva is a US-based AI travel agency incorporated in Delaware. We use Lina AI, our 24/7 artificial intelligence concierge, to plan luxury vacations, custom trips, group travel, and yacht charters for clients across all 50 US states and Canada.",
  },
  {
    q: "How does Lina AI work?",
    a: "Lina is Zeniva's AI travel concierge. You simply describe your trip — destination, dates, budget, preferences — and Lina instantly builds a complete travel proposal including flights, hotels, transfers, and experiences. Available 24/7 via chat or voice call.",
  },
  {
    q: "Does Zeniva offer yacht charters?",
    a: "Yes. Zeniva offers private yacht charters and sailing trips worldwide. Our expert yacht brokers validate every booking. Visit zenivatravel.com/zeniyacht for more information.",
  },
  {
    q: "What destinations does Zeniva serve?",
    a: "Zeniva serves 200+ destinations worldwide including Cancún, Maldives, Bali, Dubai, Paris, Miami, Tokyo, Santorini, Caribbean, and more. We specialize in luxury vacations and all-inclusive packages for US and Canadian travelers.",
  },
  {
    q: "Is Zeniva available in French?",
    a: "Yes. Zeniva is fully bilingual. Lina AI and all our services are available in English and French. Visit zenivatravel.com/fr for the French version of our website.",
  },
];

const MOODS = [
  { title: "Honeymoon & romance", desc: "Overwater villas, private dinners, sunset cruises.", img: u("1514282401047-d79a71a590e8"), tag: "Couples", prompt: "Plan a romantic honeymoon for two", color: "#ec4899" },
  { title: "Family vacations", desc: "Kids clubs, beachfront resorts, zero logistics for you.", img: u("1519046904884-53103b34b206"), tag: "Family", prompt: "Plan an all-inclusive family vacation with kids", color: "#06b6d4" },
  { title: "Luxury escapes", desc: "5★ resorts, suites, spa days and VIP transfers.", img: u("1566073771259-6a8506099945"), tag: "Luxury", prompt: "Plan a luxury 5-star escape", color: GOLD },
  { title: "Adventure & nature", desc: "Volcanoes, glaciers, rainforests and road trips.", img: u("1464822759023-fed622ff2c3b"), tag: "Adventure", prompt: "Plan an adventure trip with hiking and nature", color: "#10b981" },
  { title: "Groups & celebrations", desc: "Bachelorettes, birthdays, reunions — one plan for everyone.", img: u("1539635278303-d4002c07eae3"), tag: "Groups", prompt: "Plan a group trip for 8 friends", color: "#8b5cf6" },
  { title: "Cruises", desc: "Caribbean, Mediterranean, Alaska — cabin to shore excursions.", img: u("1548574505-5e239809ee19"), tag: "Cruise", prompt: "Find me a cruise", color: BLUE },
];

const PROMPTS = [
  "7 nights in Cancún for 2 adults in March, all-inclusive, under $3,000",
  "Family of 4 to Orlando during spring break with park tickets",
  "Honeymoon in the Maldives, overwater villa, 10 days",
  "Bachelorette weekend in Miami for 8 girls",
  "A week in Italy: Rome, Florence, Amalfi — no car",
  "Northern lights in Iceland, 5 nights, with the Blue Lagoon",
];

const TIMELINE = [
  { t: "0:00", title: "You tell Lina", desc: "Type it or say it — any language, any level of detail." },
  { t: "0:10", title: "She searches", desc: "Flights, hotels, transfers and experiences, all at once." },
  { t: "0:30", title: "Your proposal", desc: "A complete itinerary with real prices, ready to review." },
  { t: "1:00", title: "You book", desc: "Adjust anything, then confirm. One click, one payment." },
];

const COMPARE: { feature: string; diy: string; agency: string; zeniva: string }[] = [
  { feature: "Time to a complete itinerary", diy: "Hours of tabs", agency: "Days of back-and-forth", zeniva: "Under a minute" },
  { feature: "Available", diy: "Whenever you have time", agency: "Business hours", zeniva: "24/7, chat or voice" },
  { feature: "Booking fees", diy: "Hidden in each site", agency: "Often charged", zeniva: "$0" },
  { feature: "Revisions", diy: "Start over", agency: "Wait for a reply", zeniva: "Unlimited, instant" },
  { feature: "Languages", diy: "—", agency: "1–2", zeniva: "40+" },
  { feature: "Human expert when it matters", diy: "No", agency: "Yes", zeniva: "Yes — our agents & yacht brokers" },
];

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
);

export default function HomeExtraSections({ guides = [] }: { guides?: GuideTeaser[] } = {}) {
  const guideList = guides.slice(0, 3);

  return (
    <>
      {/* ── TRIPS BY MOOD ── */}
      <section className="w-full px-5 sm:px-8 xl:px-16 py-14 sm:py-20 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-end justify-between gap-4 mb-6 sm:mb-10">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">✨ Trips by mood</p>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900"><AutoTranslate text="What kind of trip are you dreaming of?" className="inline" /></h2>
              <p className="text-slate-500 mt-2 text-sm sm:text-base"><AutoTranslate text="Pick a style — Lina turns it into a real, bookable plan." className="inline" /></p>
            </div>
            <Link href="/packages" className="hidden sm:flex text-sm font-bold text-blue-600 hover:text-blue-800 items-center gap-1">View packages <Arrow /></Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {MOODS.map((m) => (
              <Link key={m.title} href={`/chat?prompt=${encodeURIComponent(m.prompt)}`} className="group relative h-44 sm:h-64 rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <img src={m.img} alt={m.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(5,12,40,0.85) 0%, rgba(5,12,40,0.15) 55%, transparent 100%)" }} />
                <span className="absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur" style={{ backgroundColor: m.color + "B3" }}>{m.tag}</span>
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5">
                  <div className="text-base sm:text-xl font-black text-white leading-tight">{m.title}</div>
                  <div className="hidden sm:block text-xs text-white/80 mt-1">{m.desc}</div>
                  <div className="mt-1 sm:mt-2 text-[11px] font-bold text-yellow-300">Plan with Lina →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── ASK LINA ANYTHING + 60-SECOND TIMELINE ── */}
      <section className="w-full px-5 sm:px-8 xl:px-16 py-14 sm:py-20" style={{ backgroundColor: "#F8FAFF" }}>
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">💬 Ask Lina anything</p>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-3"><AutoTranslate text="Real requests. Real answers. Try one." className="inline" /></h2>
            <p className="text-slate-500 text-sm sm:text-base mb-6"><AutoTranslate text="These are the kinds of things travelers ask Lina every day. Tap one and she starts on it right away — free, no account needed." className="inline" /></p>
            <div className="flex flex-col gap-2.5">
              {PROMPTS.map((p) => (
                <Link key={p} href={`/chat?prompt=${encodeURIComponent(p)}`} className="group flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-4 py-3 hover:border-blue-200 hover:shadow-md transition-all">
                  <img src="/branding/lina-avatar.png" alt="" className="w-7 h-7 rounded-full flex-shrink-0 border border-slate-100" />
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">“{p}”</span>
                  <span className="ml-auto text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"><Arrow /></span>
                </Link>
              ))}
            </div>
          </div>

          <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden text-white" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0a2260 55%, ${BLUE} 100%)` }}>
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-25" style={{ background: `radial-gradient(circle, ${GOLD}, transparent 65%)`, filter: "blur(40px)" }} />
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-white/70">From idea to booking</div>
                  <div className="text-2xl sm:text-3xl font-black">Your trip in <span style={{ color: GOLD }}>60 seconds</span></div>
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-white/15 rounded-full px-3 py-1.5 text-xs font-bold"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />Lina online</div>
              </div>
              <div className="relative pl-3">
                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-white/15" />
                <div className="absolute left-[19px] top-2 w-0.5 bg-yellow-300" style={{ height: "calc(100% - 16px)", animation: "zenivaFill 6s ease-in-out infinite" }} />
                <div className="space-y-5">
                  {TIMELINE.map((s, i) => (
                    <div key={s.t} className="relative flex gap-4 items-start">
                      <div className="w-4 h-4 mt-1 rounded-full border-2 border-yellow-300 bg-[#0B1B4D] flex-shrink-0 relative z-10" style={{ boxShadow: `0 0 0 4px rgba(230,184,90,${0.12 + i * 0.05})` }} />
                      <div>
                        <div className="text-[11px] font-mono font-bold text-yellow-300">{s.t}</div>
                        <div className="font-black">{s.title}</div>
                        <div className="text-sm text-white/80">{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/chat" className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-black text-slate-900" style={{ background: `linear-gradient(90deg, ${GOLD}, #f7d98a)` }}>Start my 60 seconds <Arrow /></Link>
                <Link href="/call" className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-black text-white border border-white/25 hover:bg-white/10 transition-colors">📞 Or call Lina</Link>
              </div>
            </div>
            <style>{`@keyframes zenivaFill{0%{transform:scaleY(0);transform-origin:top}70%{transform:scaleY(1);transform-origin:top}100%{transform:scaleY(1);transform-origin:top}}`}</style>
          </div>
        </div>
      </section>

      {/* ── ZENIYACHT + ZENISTAY SPOTLIGHT ── */}
      <section className="w-full px-5 sm:px-8 xl:px-16 py-14 sm:py-20 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-6 sm:mb-10">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">🛥️ Beyond the hotel</p>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900"><AutoTranslate text="Private yachts and whole homes, handled end to end" className="inline" /></h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {[
              { href: "/zeniyacht", img: u("1567899378494-47b22a2ae96a", 1200), kicker: "ZeniYacht", title: "Crewed yacht charters, validated by real brokers", desc: "Bahamas, BVI, Mediterranean. Lina shortlists the yachts, our brokers confirm availability, crew and pricing — no surprises on the dock.", cta: "Explore yacht charters" },
              { href: "/zenistay", img: u("1512917774080-9991f1c4c750", 1200), kicker: "ZeniStay", title: "Villas and homes for families and groups", desc: "Pool villas, beach houses, city penthouses — with transfers, chef and activities added to the same proposal.", cta: "Browse homes & villas" },
            ].map((c) => (
              <Link key={c.href} href={c.href} className="group relative h-72 sm:h-96 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all">
                <img src={c.img} alt={c.kicker} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(5,12,40,0.9) 0%, rgba(5,12,40,0.25) 60%, transparent 100%)" }} />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                  <div className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: GOLD }}>{c.kicker}</div>
                  <div className="text-xl sm:text-3xl font-black text-white leading-tight mb-2">{c.title}</div>
                  <p className="hidden sm:block text-sm text-white/80 max-w-lg mb-4">{c.desc}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-white">{c.cta} <Arrow /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section className="w-full px-5 sm:px-8 xl:px-16 py-14 sm:py-20" style={{ backgroundColor: "#F8FAFF" }}>
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">⚖️ Why travelers switch</p>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900"><AutoTranslate text="Zeniva vs. doing it yourself vs. a traditional agency" className="inline" /></h2>
          </div>
          {/* Mobile: stacked cards (the table below is desktop-only) */}
          <div className="md:hidden space-y-3">
            {COMPARE.map((r) => (
              <div key={r.feature} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="font-black text-slate-900 mb-3">{r.feature}</div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="rounded-xl bg-slate-50 p-2"><div className="text-slate-400 font-bold mb-1">Booking sites</div><div className="text-slate-600">{r.diy}</div></div>
                  <div className="rounded-xl bg-slate-50 p-2"><div className="text-slate-400 font-bold mb-1">Agency</div><div className="text-slate-600">{r.agency}</div></div>
                  <div className="rounded-xl p-2 text-white" style={{ background: `linear-gradient(135deg, ${NAVY}, ${BLUE})` }}><div className="text-yellow-300 font-bold mb-1">Zeniva</div><div className="font-black">✓ {r.zeniva}</div></div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block overflow-x-auto rounded-3xl border border-slate-100 bg-white shadow-sm">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left p-4 sm:p-5 font-bold text-slate-500">&nbsp;</th>
                  <th className="p-4 sm:p-5 font-black text-slate-500">Booking sites</th>
                  <th className="p-4 sm:p-5 font-black text-slate-500">Traditional agency</th>
                  <th className="p-4 sm:p-5 font-black text-white rounded-t-2xl" style={{ background: `linear-gradient(135deg, ${NAVY}, ${BLUE})` }}>
                    <span className="inline-flex items-center gap-2"><img src="/branding/lina-avatar.png" alt="" className="w-6 h-6 rounded-full border border-white/40" />Zeniva + Lina</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((r, i) => (
                  <tr key={r.feature} className={i % 2 ? "bg-slate-50/60" : ""}>
                    <td className="p-4 sm:p-5 font-bold text-slate-800">{r.feature}</td>
                    <td className="p-4 sm:p-5 text-center text-slate-500">{r.diy}</td>
                    <td className="p-4 sm:p-5 text-center text-slate-500">{r.agency}</td>
                    <td className="p-4 sm:p-5 text-center font-black text-slate-900 bg-blue-50/60">✓ {r.zeniva}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── GUIDES ── */}
      {guideList.length > 0 && (
        <section className="w-full px-5 sm:px-8 xl:px-16 py-14 sm:py-20 bg-white">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-end justify-between gap-4 mb-6 sm:mb-10">
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">📖 Before you book</p>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900"><AutoTranslate text="Straight answers, real numbers" className="inline" /></h2>
                <p className="text-slate-500 mt-2 text-sm sm:text-base"><AutoTranslate text="Guides written by our team — the prices, rules and trade-offs nobody tells you." className="inline" /></p>
              </div>
              <Link href="/guides" className="hidden sm:flex text-sm font-bold text-blue-600 hover:text-blue-800 items-center gap-1">All guides <Arrow /></Link>
            </div>
            <div className={`grid md:grid-cols-2 ${guideList.length >= 3 ? "lg:grid-cols-3" : ""} gap-4 sm:gap-6`}>
              {guideList.map((g) => (
                <Link key={g.slug} href={`/guides/${g.slug}`} className="group bg-[#F8FAFF] rounded-3xl p-6 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 mb-3"><span>{g.readingMinutes} min read</span><span>·</span><span>{g.tags[0]}</span></div>
                  <h3 className="text-lg font-black text-slate-900 leading-snug mb-3 group-hover:text-blue-700">{g.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed flex-1">{g.shortAnswer.length > 180 ? g.shortAnswer.slice(0, 177).trimEnd() + "…" : g.shortAnswer}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-blue-600">Read the guide <Arrow /></span>
                </Link>
              ))}
            </div>
            <Link href="/guides" className="sm:hidden mt-5 inline-flex text-sm font-bold text-blue-600 items-center gap-1">All guides <Arrow /></Link>
          </div>
        </section>
      )}

      {/* ── FOR TRAVEL PROFESSIONALS + ZENIPAY ── */}
      <section className="w-full px-5 sm:px-8 xl:px-16 py-14 sm:py-20" style={{ backgroundColor: "#F8FAFF" }}>
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">🤝 Zeniva for professionals</p>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900"><AutoTranslate text="Agents, agencies and partners grow with Lina too" className="inline" /></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {[
              { href: "/agents", icon: "🧑‍💼", title: "Become a Zeniva agent", desc: "Sell with Lina doing the heavy lifting and keep 70% commission on every booking you close.", cta: "See the agent program" },
              { href: "/for-agencies", icon: "🏢", title: "Bring AI to your agency", desc: "Give your whole team an AI concierge, a CRM and automated follow-ups — under your brand.", cta: "For agencies" },
              { href: "/partner", icon: "🏨", title: "Resorts, yachts & suppliers", desc: "Get your inventory in front of Lina's travelers with secure payouts powered by ZeniPay.", cta: "Partner with us" },
            ].map((c) => (
              <Link key={c.href} href={c.href} className="group bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5" style={{ backgroundColor: BLUE + "12" }}>{c.icon}</div>
                <h3 className="text-lg font-black text-slate-900 mb-2">{c.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{c.desc}</p>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-600">{c.cta} <Arrow /></span>
              </Link>
            ))}
          </div>
          <div className="mt-6 sm:mt-8 rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "linear-gradient(135deg,#FF7A1A,#B04CFF)" }}>💳</div>
            <div className="flex-1 text-center sm:text-left">
              <div className="font-black text-slate-900">Payments secured by ZeniPay</div>
              <div className="text-sm text-slate-500">Every booking is processed on ZeniPay, our own payment platform — encrypted, PCI-compliant, with clear receipts and no hidden fees.</div>
            </div>
            <a href="https://zenipay.ca" target="_blank" rel="noopener" className="text-sm font-bold text-blue-600 inline-flex items-center gap-1 whitespace-nowrap">zenipay.ca ↗</a>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="w-full px-5 sm:px-8 xl:px-16 py-14 sm:py-20 bg-white">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">❓ Questions</p>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900"><AutoTranslate text="Everything people ask before their first trip with Lina" className="inline" /></h2>
          </div>
          <div className="space-y-3">
            {HOME_FAQ.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-slate-100 bg-[#F8FAFF] open:bg-white open:shadow-md transition-all">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-5 font-black text-slate-900 text-base sm:text-lg [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="px-5 pb-5 text-slate-600 text-sm sm:text-base leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/help" className="text-sm font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">More questions? Visit the help center <Arrow /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
