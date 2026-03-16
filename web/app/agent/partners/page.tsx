"use client";
import { useState } from "react";
import { useAuthStore } from "@/src/lib/authStore";

const PREMIUM_BLUE = "#0B1B4D";
const BRAND_BLUE = "#0F6CF5";
const ACCENT_GOLD = "#E6B85A";

type PartnerStatus = "active" | "pending";
type PartnerCategory = "Airlines" | "Hotels" | "Car Rentals" | "Insurance" | "Experiences";

interface Partner {
  id: string;
  name: string;
  category: PartnerCategory;
  commission_rate: string;
  status: PartnerStatus;
  description: string;
  logo_color: string;
  logo_letter: string;
  website?: string;
}

const DEMO_PARTNERS: Partner[] = [
  { id: "p1", name: "Duffel Airlines API", category: "Airlines", commission_rate: "3%", status: "active", description: "Book flights from 300+ airlines worldwide via Duffel API. Real-time pricing and availability.", logo_color: "#0F6CF5", logo_letter: "D" },
  { id: "p2", name: "Emirates",            category: "Airlines", commission_rate: "4%", status: "active", description: "Premium airline partner. Business and first class booking access.", logo_color: "#C8102E", logo_letter: "E" },
  { id: "p3", name: "Air France",          category: "Airlines", commission_rate: "3.5%", status: "active", description: "European and international routes. GDS access included.", logo_color: "#002395", logo_letter: "AF" },
  { id: "p4", name: "Hotels.com",          category: "Hotels",   commission_rate: "6%", status: "active", description: "Over 500,000 hotel properties globally. Instant booking confirmation.", logo_color: "#CC0000", logo_letter: "H" },
  { id: "p5", name: "Marriott International", category: "Hotels", commission_rate: "8%", status: "active", description: "30 brands, 8,000+ hotels worldwide. Exclusive Zeniva agent rates.", logo_color: "#8B1A1A", logo_letter: "M" },
  { id: "p6", name: "Hyatt",              category: "Hotels",   commission_rate: "7%", status: "active", description: "Luxury and lifestyle brands. Park Hyatt, Andaz, Grand Hyatt.", logo_color: "#00308F", logo_letter: "H" },
  { id: "p7", name: "Hertz",             category: "Car Rentals", commission_rate: "5%", status: "active", description: "Global car rental leader. 10,000+ locations worldwide.", logo_color: "#FFD100", logo_letter: "H" },
  { id: "p8", name: "Avis",              category: "Car Rentals", commission_rate: "4.5%", status: "active", description: "Premium car rental services in 165+ countries.", logo_color: "#CC0000", logo_letter: "A" },
  { id: "p9", name: "Allianz Travel",    category: "Insurance", commission_rate: "10%", status: "active", description: "Comprehensive travel insurance. Medical, cancellation, baggage coverage.", logo_color: "#003781", logo_letter: "Al" },
  { id: "p10", name: "AXA Assistance",  category: "Insurance", commission_rate: "9%", status: "pending", description: "Global insurance partner. Emergency assistance in 200+ countries.", logo_color: "#00008F", logo_letter: "AX" },
  { id: "p11", name: "Viator",           category: "Experiences", commission_rate: "8%", status: "active", description: "300,000+ tours, activities, and experiences worldwide.", logo_color: "#27AE60", logo_letter: "V" },
  { id: "p12", name: "GetYourGuide",    category: "Experiences", commission_rate: "7%", status: "active", description: "Unforgettable travel experiences. Activities, day trips, skip-the-line tickets.", logo_color: "#FF5533", logo_letter: "G" },
];

const CATEGORIES: PartnerCategory[] = ["Airlines", "Hotels", "Car Rentals", "Insurance", "Experiences"];

const CATEGORY_ICONS: Record<PartnerCategory, string> = {
  "Airlines":     "✈️",
  "Hotels":       "🏨",
  "Car Rentals":  "🚗",
  "Insurance":    "🛡️",
  "Experiences":  "🎯",
};

export default function PartnersPage() {
  const user = useAuthStore((s) => s.user);
  const [activeCategory, setActiveCategory] = useState<PartnerCategory | "All">("All");

  const filtered = activeCategory === "All"
    ? DEMO_PARTNERS
    : DEMO_PARTNERS.filter((p) => p.category === activeCategory);

  const grouped: Record<PartnerCategory, Partner[]> = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = filtered.filter((p) => p.category === cat);
    return acc;
  }, {} as Record<PartnerCategory, Partner[]>);

  return (
    <div className="min-h-screen p-6" style={{ background: PREMIUM_BLUE }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-white">🤝 Partners</h1>
          <p className="text-slate-400 text-sm mt-1">Your partner network and commission rates</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {(["All", ...CATEGORIES] as (PartnerCategory | "All")[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
              activeCategory === cat ? "bg-white text-slate-900" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {cat !== "All" ? `${CATEGORY_ICONS[cat as PartnerCategory]} ` : ""}{cat}
          </button>
        ))}
      </div>

      {/* Partners by category */}
      {(activeCategory === "All" ? CATEGORIES : [activeCategory as PartnerCategory]).map((cat) => {
        const catPartners = grouped[cat];
        if (catPartners.length === 0) return null;
        return (
          <div key={cat} className="mb-8">
            <h2 className="text-white font-bold text-lg mb-3">
              {CATEGORY_ICONS[cat]} {cat}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {catPartners.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-start gap-4">
                    {/* Logo */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-sm shrink-0"
                      style={{ background: p.logo_color }}
                    >
                      {p.logo_letter}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900">{p.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {p.status === "active" ? "Active" : "Pending"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-400 font-semibold">Commission Rate</p>
                      <p className="font-black text-slate-900">{p.commission_rate}</p>
                    </div>
                    <button
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90"
                      style={{ background: BRAND_BLUE }}
                    >
                      Contact
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Become a Partner CTA */}
      <div
        className="rounded-2xl p-8 mt-4 flex flex-col md:flex-row items-center justify-between gap-6"
        style={{ background: `linear-gradient(135deg, ${ACCENT_GOLD}22, ${ACCENT_GOLD}44)`, border: `1.5px solid ${ACCENT_GOLD}66` }}
      >
        <div>
          <h3 className="text-2xl font-black text-white">🌟 Become a Partner</h3>
          <p className="text-white/70 mt-1 max-w-md">
            Are you a hotel, airline, or experience provider? Join the Zeniva Travel network and reach premium clients worldwide.
          </p>
        </div>
        <button
          className="shrink-0 px-6 py-3 rounded-xl font-bold text-slate-900 text-sm shadow-lg transition hover:opacity-90 whitespace-nowrap"
          style={{ background: ACCENT_GOLD }}
        >
          Apply to Partner →
        </button>
      </div>
    </div>
  );
}
