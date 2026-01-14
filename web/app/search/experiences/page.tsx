"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Params = {
  destination?: string;
  date?: string;
  travelers?: string;
  category?: string;
};

type ExperienceOption = {
  id: string;
  title: string;
  location: string;
  date: string;
  duration: string;
  price: string;
  groupSize: string;
  perks: string[];
  badge?: string;
  image: string;
};

const sampleExperiences: ExperienceOption[] = [
  { id: "exp-1", title: "Private food tour", location: "Rome, Trastevere", date: "Daily", duration: "3h", price: "$180 / person", groupSize: "Up to 6", perks: ["Local guide", "All tastings", "Wine included"], badge: "Top pick", image: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=900&q=80" },
  { id: "exp-2", title: "Sunset catamaran", location: "Santorini", date: "Daily", duration: "5h", price: "$220 / person", groupSize: "Up to 12", perks: ["Dinner onboard", "Open bar", "Hotel transfers"], badge: "Most booked", image: "https://images.unsplash.com/photo-1501119993999-7f44553b3f8d?auto=format&fit=crop&w=900&q=80" },
  { id: "exp-3", title: "Hot air balloon", location: "Cappadocia", date: "Every morning", duration: "2h", price: "$260 / person", groupSize: "Shared basket", perks: ["Champagne toast", "Photos", "Transfers"], badge: "Bucket list", image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=900&q=80" },
  { id: "exp-4", title: "Street art e-bike", location: "Berlin", date: "Daily", duration: "3h", price: "$95 / person", groupSize: "Up to 10", perks: ["Guide", "E-bike", "Photos"], image: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=900&q=80" },
  { id: "exp-5", title: "Wine châteaux tour", location: "Bordeaux", date: "Tue/Thu/Sat", duration: "7h", price: "$210 / person", groupSize: "Up to 8", perks: ["Cellar visits", "Driver", "Tastings"], badge: "Gourmet", image: "https://images.unsplash.com/photo-1501119993999-7f44553b3f8d?auto=format&fit=crop&w=900&q=80" },
  { id: "exp-6", title: "Desert 4x4 sunrise", location: "Dubai", date: "Daily", duration: "4h", price: "$140 / person", groupSize: "Up to 10", perks: ["Driver", "Sandboard", "Breakfast"], badge: "Adventure", image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=900&q=80" },
  { id: "exp-7", title: "Heli over Manhattan", location: "New York", date: "Daily", duration: "20m", price: "$290 / person", groupSize: "Shared", perks: ["Heli seat", "Noise-cancel"], image: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=900&q=80" },
  { id: "exp-8", title: "Cooking with nonna", location: "Florence", date: "Mon-Fri", duration: "4h", price: "$170 / person", groupSize: "Up to 8", perks: ["Meal included", "Recipes", "Wine"], badge: "Hands-on", image: "https://images.unsplash.com/photo-1501119993999-7f44553b3f8d?auto=format&fit=crop&w=900&q=80" },
  { id: "exp-9", title: "Glacier hike", location: "Reykjavik", date: "Daily", duration: "6h", price: "$240 / person", groupSize: "Up to 12", perks: ["Guide", "Gear", "Transfers"], badge: "Cold weather", image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=900&q=80" },
  { id: "exp-10", title: "Whale watching", location: "Vancouver", date: "Daily", duration: "4h", price: "$150 / person", groupSize: "Up to 20", perks: ["Naturalist", "Tea/Coffee"], image: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=900&q=80" },
  { id: "exp-11", title: "Tango night", location: "Buenos Aires", date: "Thu-Sun", duration: "3h", price: "$130 / person", groupSize: "Up to 30", perks: ["Show", "Welcome drink", "Lesson"], badge: "Evening", image: "https://images.unsplash.com/photo-1501119993999-7f44553b3f8d?auto=format&fit=crop&w=900&q=80" },
  { id: "exp-12", title: "Surf coaching", location: "Bali", date: "Daily", duration: "2h", price: "$95 / person", groupSize: "Up to 6", perks: ["Board", "Coach", "Photos"], badge: "Beach", image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=900&q=80" },
  { id: "exp-13", title: "Snorkel cenotes", location: "Playa del Carmen", date: "Daily", duration: "5h", price: "$165 / person", groupSize: "Up to 10", perks: ["Gear", "Lunch", "Transfers"], image: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=900&q=80" },
  { id: "exp-14", title: "Private Louvre tour", location: "Paris", date: "Daily", duration: "2.5h", price: "$260 / person", groupSize: "Private", perks: ["Guide", "Skip-the-line"], badge: "Cultural", image: "https://images.unsplash.com/photo-1501119993999-7f44553b3f8d?auto=format&fit=crop&w=900&q=80" },
  { id: "exp-15", title: "Kayak bioluminescence", location: "Puerto Rico", date: "Nightly", duration: "2h", price: "$120 / person", groupSize: "Up to 12", perks: ["Guide", "Kayak", "Photos"], badge: "Night tour", image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=900&q=80" },
];

export default function ExperiencesSearchPage({ searchParams }: { searchParams: Params }) {
  const { destination = "", date = "", travelers = "2", category = "" } = searchParams || {};
  const [selectedId, setSelectedId] = useState(sampleExperiences[0]?.id ?? "");

  const summary = useMemo(() => {
    const when = date || "Choose date";
    const pax = `${travelers} traveler${travelers === "1" ? "" : "s"}`;
    return { when, pax };
  }, [date, travelers]);

  const askPrompt = `Shortlist experiences${destination ? ` in ${destination}` : ""}${category ? ` for ${category}` : ""} on ${summary.when} for ${summary.pax}. Keep ${selectedId} selected and propose 2 more with transfers included.`;

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="rounded-2xl bg-white px-5 py-4 shadow-sm border border-slate-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Experiences search</p>
            <h1 className="text-2xl font-black text-slate-900">{destination || "Choose destination"}</h1>
            <p className="text-sm text-slate-600">{summary.when} · {summary.pax}{category ? ` · ${category}` : ""}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">{sampleExperiences.length} options</span>
            {category && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">{category}</span>}
          </div>
        </header>

        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-800">Sort: Recommended</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-800">Filters: Small groups, Transfers</span>
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
            {sampleExperiences.map((x) => (
              <button
                key={x.id}
                onClick={() => setSelectedId(x.id)}
                className={`w-full rounded-xl border bg-slate-50 p-3 shadow-sm flex flex-col gap-3 text-left md:flex-row md:items-center md:justify-between ${selectedId === x.id ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"}`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-16 w-20 overflow-hidden rounded-lg bg-white border border-slate-200">
                    <img src={x.image} alt={x.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800">{x.title}</p>
                    <p className="text-xs text-slate-600">{x.location}</p>
                    <p className="text-xs text-slate-600">{x.date} · {x.duration} · {x.groupSize}</p>
                    <div className="flex flex-wrap gap-1 text-[11px] text-slate-700">
                      {x.perks.map((p) => (
                        <span key={p} className="rounded-full bg-white border px-2 py-[3px]">{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:flex-col md:items-end">
                  <span className="text-lg font-black text-slate-900">{x.price}</span>
                  <div className="flex items-center gap-2">
                    {x.badge && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">{x.badge}</span>}
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
              <p className="text-sm font-semibold text-slate-800">Selected experience</p>
              <p className="text-xs text-slate-600">Ask Lina to book, compare, or bundle with transfers.</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/chat?prompt=${encodeURIComponent(`Proceed with ${selectedId} for ${summary.pax} on ${summary.when}, include transfers.`)}`}
                className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-900"
              >
                Hold / Send
              </Link>
              <Link
                href={`/chat?prompt=${encodeURIComponent(`Compare ${selectedId} with 2 alternatives (same date/category), highlight private options.`)}`}
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
