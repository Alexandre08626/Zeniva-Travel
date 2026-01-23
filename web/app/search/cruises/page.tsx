"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useI18n } from "../../../src/lib/i18n/I18nProvider";
import { expandMonthAbbrev, normalizePriceLabel } from "../../../src/lib/format";

type Params = {
  region?: string;
  departureMonth?: string;
  duration?: string;
  guests?: string;
};

type CruiseOption = {
  id: string;
  name: string;
  line: string;
  route: string;
  dates: string;
  duration: string;
  price: string;
  cabin: string;
  perks: string[];
  badge?: string;
  image: string;
};

const sampleCruises: CruiseOption[] = [
  { id: "cru-1", name: "Caribbean Escape", line: "Celebrity", route: "Miami → St. Maarten → St. Lucia → Barbados", dates: "Mar 12 - Mar 19", duration: "7 nights", price: "$1,350 / person", cabin: "Veranda stateroom", perks: ["Drinks & Wi-Fi", "Onboard credit", "Flexible fare"], badge: "Best value", image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-2", name: "Mediterranean Icons", line: "Oceania", route: "Rome → Amalfi → Santorini → Athens", dates: "May 4 - May 11", duration: "7 nights", price: "$2,480 / person", cabin: "Concierge veranda", perks: ["Fine dining", "Air credit", "Excursion credit"], badge: "Luxury pick", image: "https://images.unsplash.com/photo-1501119993999-7f44553b3f8d?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-3", name: "Alaska Fjords", line: "Holland America", route: "Vancouver → Juneau → Skagway → Ketchikan", dates: "Jul 8 - Jul 15", duration: "7 nights", price: "$1,180 / person", cabin: "Oceanview", perks: ["Excursion credit", "Kids promo", "Flexible cancel"], badge: "Family friendly", image: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-4", name: "Greek Isles Discovery", line: "Azamara", route: "Athens → Mykonos → Paros → Rhodes", dates: "Jun 2 - Jun 9", duration: "7 nights", price: "$1,620 / person", cabin: "Veranda", perks: ["Gratuities", "Wi-Fi", "Boutique size"], badge: "Small ship", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-5", name: "Baltic Capitals", line: "Norwegian", route: "Copenhagen → Tallinn → Helsinki → Stockholm", dates: "Aug 14 - Aug 21", duration: "7 nights", price: "$1,050 / person", cabin: "Balcony", perks: ["Drinks", "Wi-Fi", "Specialty dining"], badge: "Great value", image: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-6", name: "Norway Fjords", line: "Princess", route: "Southampton → Bergen → Geiranger → Stavanger", dates: "May 18 - May 25", duration: "7 nights", price: "$1,290 / person", cabin: "Balcony", perks: ["Medallion tech", "Flex fare"], badge: "Scenic", image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-7", name: "Iceland Loop", line: "Windstar", route: "Reykjavik → Isafjordur → Seydisfjordur → Reykjavik", dates: "Jul 3 - Jul 10", duration: "7 nights", price: "$2,250 / person", cabin: "Oceanview", perks: ["Small ship", "Excursion credit"], badge: "Expedition feel", image: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-8", name: "Galapagos Journey", line: "Celebrity Flora", route: "Baltra → Genovesa → Santa Cruz", dates: "Oct 6 - Oct 13", duration: "7 nights", price: "$5,400 / person", cabin: "Suite", perks: ["All-inclusive", "Excursions", "Naturalists"], badge: "Bucket list", image: "https://images.unsplash.com/photo-1501119993999-7f44553b3f8d?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-9", name: "Danube Castles", line: "AMA Waterways", route: "Budapest → Vienna → Melk → Passau", dates: "Sep 10 - Sep 17", duration: "7 nights", price: "$3,050 / person", cabin: "French balcony", perks: ["Excursions", "Wine & beer", "Wi-Fi"], badge: "River cruise", image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-10", name: "Seine Gourmet", line: "Uniworld", route: "Paris → Rouen → Honfleur → Paris", dates: "Apr 14 - Apr 21", duration: "7 nights", price: "$3,280 / person", cabin: "Deluxe", perks: ["All-inclusive", "Butler", "Small ship"], badge: "Culinary", image: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-11", name: "Dubai to Mumbai", line: "Oceania", route: "Dubai → Abu Dhabi → Muscat → Mumbai", dates: "Jan 18 - Jan 28", duration: "10 nights", price: "$2,980 / person", cabin: "Veranda", perks: ["Fine dining", "Wi-Fi", "Shore credit"], image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-12", name: "Australia Explorer", line: "Royal Caribbean", route: "Sydney → Hobart → Adelaide → Sydney", dates: "Feb 3 - Feb 13", duration: "10 nights", price: "$1,450 / person", cabin: "Balcony", perks: ["Drinks package", "Wi-Fi"], badge: "Popular", image: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-13", name: "Antarctic Peninsula", line: "Lindblad", route: "Ushuaia → Antarctic Peninsula → Ushuaia", dates: "Dec 5 - Dec 15", duration: "10 nights", price: "$8,900 / person", cabin: "Suite", perks: ["Expedition team", "Zodiacs", "Parkas"], badge: "Expedition", image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-14", name: "Hawaii Islands", line: "NCL Pride of America", route: "Honolulu → Maui → Kona → Kauai", dates: "Nov 2 - Nov 9", duration: "7 nights", price: "$1,640 / person", cabin: "Balcony", perks: ["US-flagged", "Ports daily"], badge: "Island hopper", image: "https://images.unsplash.com/photo-1501119993999-7f44553b3f8d?auto=format&fit=crop&w=900&q=80" },
  { id: "cru-15", name: "Panama Canal", line: "Princess", route: "Ft Lauderdale → Cartagena → Panama → Costa Rica", dates: "Jan 6 - Jan 16", duration: "10 nights", price: "$1,780 / person", cabin: "Balcony", perks: ["Canal transit", "Wi-Fi"], badge: "Classic route", image: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=900&q=80" },
];

export default function CruisesSearchPage({ searchParams }: { searchParams: Params }) {
  const { region = "", departureMonth = "", duration = "", guests = "2" } = searchParams || {};
  const { locale } = useI18n();
  const [selectedId, setSelectedId] = useState(sampleCruises[0]?.id ?? "");

  const summary = useMemo(() => {
    const when = departureMonth || "Choose departure month";
    const dur = duration || "Duration";
    const pax = `${guests} guest${guests === "1" ? "" : "s"}`;
    return { when, dur, pax };
  }, [departureMonth, duration, guests]);

  const askPrompt = `Shortlist cruises${region ? ` in ${region}` : ""} departing ${summary.when} for ${summary.pax}, duration ${summary.dur}. Show value and luxury picks. Keep ${selectedId} selected and compare 2 alternatives.`;

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="rounded-2xl bg-white px-5 py-4 shadow-sm border border-slate-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Cruises search</p>
            <h1 className="text-2xl font-black text-slate-900">{region || "Choose region"}</h1>
            <p className="text-sm text-slate-600">{summary.when} · {summary.dur} · {summary.pax}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">{sampleCruises.length} options</span>
            {region && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">Region {region}</span>}
          </div>
        </header>

        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-800">Sort: Recommended</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-800">Filters: Wi-Fi, Drinks, Family</span>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/chat?prompt=${encodeURIComponent(askPrompt)}`}
                className="rounded-full bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-95"
              >
                Ask Lina
              </Link>
              <Link
                href="/"
                className="rounded-full border px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                New search
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            {sampleCruises.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full rounded-xl border bg-slate-50 p-3 shadow-sm flex flex-col gap-3 text-left md:flex-row md:items-center md:justify-between ${selectedId === c.id ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"}`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-16 w-20 overflow-hidden rounded-lg bg-white border border-slate-200">
                    <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-600">{c.line}</p>
                    <p className="text-xs text-slate-600">{c.route}</p>
                    <p className="text-xs text-slate-600">{expandMonthAbbrev(c.dates, locale)} · {c.duration} · {c.cabin}</p>
                    <div className="flex flex-wrap gap-1 text-[11px] text-slate-700">
                      {c.perks.map((p) => (
                        <span key={p} className="rounded-full bg-white border px-2 py-[3px]">{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:flex-col md:items-end">
                  <span className="text-lg font-black text-slate-900">{normalizePriceLabel(c.price, locale)}</span>
                  <div className="flex items-center gap-2">
                    {c.badge && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">{c.badge}</span>}
                  </div>
                  <span className="text-xs text-slate-500">Click to select</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Selected cruise</p>
              <p className="text-xs text-slate-600">Ask Lina to hold, compare, or send to client.</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/chat?prompt=${encodeURIComponent(`Proceed with ${selectedId} and prepare hold + client message.`)}`}
                className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-900"
              >
                Hold / Send
              </Link>
              <Link
                href={`/chat?prompt=${encodeURIComponent(`Compare ${selectedId} with 2 alternatives in same dates/region.`)}`}
                className="rounded-full border px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Compare 3
              </Link>
            </div>
          </div>
          <pre className="text-xs bg-slate-50 p-3 rounded border border-slate-100 overflow-x-auto">{JSON.stringify(searchParams, null, 2)}</pre>
        </section>
      </div>
    </main>
  );
}
