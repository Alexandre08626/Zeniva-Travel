"use client";

import { useState } from "react";

type Dir = {
  name: string;
  url: string;
  region: string;
  cost: string;
  notes: string;
  blurbKey: "fr-quebec" | "en-nyc" | "en-virginia" | "en-yacht" | "en-general";
};

const BLURBS: Record<Dir["blurbKey"], { name: string; short: string; long: string; categoryHint: string; phone: string; email: string; website: string; address: string }> = {
  "en-general": {
    name: "Zeniva Travel",
    short: "AI-powered travel agency. Lina AI plans and books luxury vacations, all-inclusive packages, yacht charters and custom trips. Available 24/7. Zero booking fees.",
    long: "Zeniva is an AI-powered travel agency incorporated in Delaware (USA). Our concierge Lina AI is available 24/7 in 7 languages and books real flights (Duffel, 300+ airlines), 1.5M+ hotels (LiteAPI), private yachts (36-boat South Florida fleet), short-term rentals (chalets, villas, condos), cruises and full all-inclusive packages. Real human advisors back every AI booking. ZeniPay 0% installment plans. Serving the USA, Canada, the Caribbean and Europe.",
    categoryHint: "Travel Agency / Online Travel Agency / Concierge Service",
    phone: "+1 (332) 290-0021",
    email: "info@zeniva.ca",
    website: "https://www.zenivatravel.com",
    address: "Wilmington, Delaware, USA",
  },
  "fr-quebec": {
    name: "Zeniva Travel — Québec",
    short: "Agence de voyage AI 24/7 en français. Forfaits tout inclus, croisières, chalets ZeniStay. Prix en CAD, vols directs depuis YUL et YQB.",
    long: "Zeniva est une agence de voyage AI nord-américaine qui sert le Québec en français. Lina AI parle français 24/7 (chat ou voix), prix en dollars canadiens, vols directs depuis Montréal (YUL) et Québec (YQB) vers Cuba, Cancún, Punta Cana, Varadero. Tous les forfaits tout-inclus avec vols, hôtel et transferts. Chalets ZeniStay au Lac-Beauport, Charlevoix et Mont-Tremblant. Aucuns frais de réservation, ZeniPay paiements en versements 0% intérêt. Support humain 24/7 pour les imprévus de voyage.",
    categoryHint: "Agence de voyage / Voyage tout inclus / Voyages Québec",
    phone: "+1 (332) 290-0021",
    email: "info@zeniva.ca",
    website: "https://www.zenivatravel.com/agence-voyage-quebec",
    address: "Wilmington, Delaware, USA — service au Québec",
  },
  "en-nyc": {
    name: "Zeniva Travel — New York",
    short: "AI travel agency for New York. Direct flights from JFK/LGA/EWR, Hamptons yacht charters, honeymoons, all-inclusive Caribbean packages.",
    long: "Zeniva is an AI-powered travel agency serving New York 24/7. Lina AI books direct flights from JFK, LaGuardia (LGA), Newark (EWR), White Plains (HPN) and Stewart (SWF) to the Caribbean, Mexico, Europe, Hawaii and Asia. Specialty: Hamptons yacht charters (East End and Newport summer), honeymoons (Maldives, Bora Bora, Santorini, Amalfi Coast), and Caribbean all-inclusive packages from $1,099. Real Zeniva advisor 24/7 for in-trip support. ZeniPay 0% installments.",
    categoryHint: "Travel Agency / NYC Concierge / Honeymoon Specialist",
    phone: "+1 (332) 290-0021",
    email: "info@zeniva.ca",
    website: "https://www.zenivatravel.com/travel-agency-new-york",
    address: "Wilmington, Delaware, USA — serves all NY",
  },
  "en-virginia": {
    name: "Zeniva Travel — Virginia",
    short: "AI travel agency for Virginia. Direct flights from IAD/DCA/RIC/ORF, Norfolk cruises, Williamsburg getaways, government-rate corporate travel.",
    long: "Zeniva is an AI-powered travel agency serving Virginia 24/7. Lina AI books direct flights from Washington Dulles (IAD), Reagan National (DCA), Richmond (RIC), Norfolk (ORF), Charlottesville (CHO) and Roanoke (ROA). Specialties: Norfolk cruise terminal departures (Royal Caribbean, Carnival, Norwegian), Williamsburg/Virginia Beach family getaways, and per-diem-compliant corporate travel for DC-area government and contractor staff. ZeniPay 0% installments. Real Zeniva advisor 24/7 for in-trip support.",
    categoryHint: "Travel Agency / Virginia Concierge / Corporate Travel",
    phone: "+1 (332) 290-0021",
    email: "info@zeniva.ca",
    website: "https://www.zenivatravel.com/travel-agency-virginia",
    address: "Wilmington, Delaware, USA — serves all VA",
  },
  "en-yacht": {
    name: "ZeniYacht by Zeniva",
    short: "Private yacht charters in South Florida. 36-boat fleet — Sunreef, Azimut, Lagoon, Princess, Leopard. Half-day, full-day, multi-day.",
    long: "ZeniYacht is the private yacht charter division of Zeniva Travel. Our 36-boat South Florida fleet operates out of Miami Beach Marina, Bayside, Coconut Grove (Dinner Key), Key Biscayne, Haulover Marina, Miami River, N. Bay Village, Island Gardens (Watson Island), Fort Lauderdale, and Key West. Repositioning to Palm Beach (Sailfish Marina, Riviera Beach, Singer Island, Jupiter) on request. Brands include Sunreef, Azimut, Lagoon, Princess, Leopard. Captain, stew, gratuity, fuel and marina included where applicable. 24/7 Lina AI concierge, real human backup.",
    categoryHint: "Yacht Charter / Boat Rental / Luxury Concierge",
    phone: "+1 (332) 290-0021",
    email: "info@zeniva.ca",
    website: "https://www.zenivatravel.com/yacht-charters/miami",
    address: "Miami, FL — fleet across South Florida",
  },
};

const DIRS: Dir[] = [
  // Tier 1 — Travel-specific, high authority
  { name: "TripAdvisor Business Listings", url: "https://www.tripadvisor.com/Owners", region: "Worldwide", cost: "Free + paid tiers", notes: "Free 'business listing' for travel agencies. Backlink + reviews.", blurbKey: "en-general" },
  { name: "Yelp for Business", url: "https://biz.yelp.com/", region: "USA / CA", cost: "Free", notes: "Create profile in NYC, Richmond, Miami, Quebec. NAP consistency.", blurbKey: "en-general" },
  { name: "Google Business Profile", url: "https://www.google.com/business/", region: "Worldwide", cost: "Free", notes: "MOST IMPORTANT. Verify a profile per service area: Wilmington, NYC, Virginia.", blurbKey: "en-general" },
  { name: "Bing Places for Business", url: "https://www.bingplaces.com/", region: "Worldwide", cost: "Free", notes: "Equivalent of GBP for Bing. Same NAP.", blurbKey: "en-general" },
  { name: "Apple Maps Connect", url: "https://mapsconnect.apple.com/", region: "Worldwide", cost: "Free", notes: "Apple users see this in Maps + Siri.", blurbKey: "en-general" },

  // Quebec / French-Canadian
  { name: "Pages Jaunes Canada", url: "https://www.pagesjaunes.ca/", region: "Quebec / CA", cost: "Free", notes: "Annuaire principal québécois. Use the FR blurb.", blurbKey: "fr-quebec" },
  { name: "411.ca", url: "https://411.ca/business", region: "Canada", cost: "Free", notes: "Backlink + listing. Submit FR + EN versions.", blurbKey: "fr-quebec" },
  { name: "Cylex Canada", url: "https://www.cylex-canada.ca/", region: "Canada", cost: "Free", notes: "Quick free listing.", blurbKey: "fr-quebec" },
  { name: "Annuaire des entreprises du Québec", url: "https://www.entreprises.gouv.qc.ca/", region: "Quebec", cost: "Free", notes: "Government registry. NAP must match LLC docs.", blurbKey: "fr-quebec" },
  { name: "OPC Office de la protection du consommateur", url: "https://www.opc.gouv.qc.ca/", region: "Quebec", cost: "Required for sales in QC", notes: "REGULATORY: travel agencies operating in QC need a permis OPC. Check first.", blurbKey: "fr-quebec" },

  // NY-specific
  { name: "NYC Small Business Services", url: "https://www.nyc.gov/site/sbs/index.page", region: "NYC", cost: "Free", notes: "Register as a NYC small biz vendor.", blurbKey: "en-nyc" },
  { name: "Manhattan Chamber of Commerce", url: "https://www.manhattancc.org/", region: "NYC", cost: "Membership ~$295/yr", notes: "Listed in member directory + backlink.", blurbKey: "en-nyc" },
  { name: "Brooklyn Chamber of Commerce", url: "https://ibrooklyn.com/", region: "Brooklyn", cost: "Membership", notes: "Same structure as Manhattan.", blurbKey: "en-nyc" },

  // VA-specific
  { name: "Virginia Tourism Corporation Partner", url: "https://www.vatc.org/", region: "Virginia", cost: "Free / $", notes: "Industry partner directory + co-op marketing.", blurbKey: "en-virginia" },
  { name: "Virginia is for Lovers — Industry Partner", url: "https://www.virginia.org/industry/", region: "Virginia", cost: "Free", notes: "Listed on the official VA tourism site.", blurbKey: "en-virginia" },
  { name: "Northern Virginia Chamber of Commerce", url: "https://www.novachamber.org/", region: "NoVA", cost: "Membership", notes: "Member directory listing + backlink.", blurbKey: "en-virginia" },
  { name: "Hampton Roads Chamber", url: "https://www.hrchamber.com/", region: "Hampton Roads", cost: "Membership", notes: "Norfolk cruise terminal area.", blurbKey: "en-virginia" },

  // Yacht-specific
  { name: "BoatCharter.com directory", url: "https://www.boatcharter.com/", region: "USA", cost: "Free listing", notes: "Yacht-specific. Use the yacht blurb.", blurbKey: "en-yacht" },
  { name: "Charterworld", url: "https://www.charterworld.com/", region: "Worldwide", cost: "Paid tiers", notes: "Premium yacht directory. Justify the cost only if doing high-end luxury.", blurbKey: "en-yacht" },
  { name: "YachtCharterFleet", url: "https://www.yachtcharterfleet.com/", region: "Worldwide", cost: "Paid", notes: "Industry-leading. Each boat = its own listing.", blurbKey: "en-yacht" },
  { name: "Greater Miami Convention & Visitors Bureau", url: "https://www.miamiandbeaches.com/partners", region: "Miami", cost: "Membership", notes: "Tourism partner — solid local backlink.", blurbKey: "en-yacht" },

  // General travel
  { name: "ASTA — American Society of Travel Advisors", url: "https://www.asta.org/", region: "USA", cost: "Membership ~$575/yr", notes: "Industry credential + member directory backlink.", blurbKey: "en-general" },
  { name: "ARC — Airlines Reporting Corporation", url: "https://www.arccorp.com/", region: "USA", cost: "Application required", notes: "Required to issue airline tickets directly. Big credibility signal.", blurbKey: "en-general" },
  { name: "Travel Weekly Travel Industry Directory", url: "https://www.travelweekly.com/", region: "USA", cost: "Submit press releases", notes: "Industry publication. Free directory listings + paid press releases.", blurbKey: "en-general" },
  { name: "Cruise Critic Member", url: "https://www.cruisecritic.com/", region: "Worldwide", cost: "Free", notes: "Profile + earn backlink by writing helpful answers in the forums.", blurbKey: "en-general" },
  { name: "Trustpilot Business", url: "https://business.trustpilot.com/", region: "Worldwide", cost: "Free + paid", notes: "Reviews aggregator. Backlink + trust signals to Google.", blurbKey: "en-general" },
  { name: "Sitejabber", url: "https://www.sitejabber.com/", region: "Worldwide", cost: "Free + paid", notes: "Same as Trustpilot. Two-for-one backlink.", blurbKey: "en-general" },

  // AI-search specific (since llms.txt is set)
  { name: "Perplexity Sources for Travel", url: "https://www.perplexity.ai/", region: "AI search", cost: "Free", notes: "Submit Zeniva blog posts as Perplexity-citable sources.", blurbKey: "en-general" },
  { name: "Common Crawl seed list (via partner)", url: "https://commoncrawl.org/", region: "AI search", cost: "Free", notes: "Already crawled if linked from medium-authority site.", blurbKey: "en-general" },
];

export default function BacklinkChecklist() {
  const [filter, setFilter] = useState<string>("all");
  const [copied, setCopied] = useState<string>("");

  const filtered = filter === "all" ? DIRS : DIRS.filter((d) => d.region.toLowerCase().includes(filter.toLowerCase()) || d.blurbKey.includes(filter));

  const copy = (id: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(id);
        setTimeout(() => setCopied(""), 1500);
      });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <div className="text-xs font-bold uppercase tracking-widest text-blue-600">Internal · agent backlink workbook</div>
          <h1 className="mt-1 text-3xl font-black text-slate-900">Backlink submission checklist</h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            30 directories where Zeniva should be listed. Each row has a copy-paste-ready blurb that matches the
            target page (FR Quebec, NYC, Virginia, Miami yachts, or general). Most are free. Bring this page up,
            do 2-3 a day, and Zeniva's authority climbs fast.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: "all", label: "All" },
            { key: "fr-quebec", label: "FR Quebec" },
            { key: "en-nyc", label: "NYC" },
            { key: "en-virginia", label: "Virginia" },
            { key: "en-yacht", label: "Yachts" },
            { key: "en-general", label: "General travel" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={"rounded-full px-3 py-1.5 text-xs font-bold transition " + (filter === f.key ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100")}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map((d, i) => {
            const blurb = BLURBS[d.blurbKey];
            const id = `dir-${i}`;
            return (
              <div key={id} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">{d.region} · {d.cost}</div>
                    <a href={d.url} target="_blank" rel="noopener noreferrer" className="mt-0.5 block text-lg font-black text-slate-900 hover:underline">
                      {d.name} →
                    </a>
                    <p className="mt-1 text-xs text-slate-500">{d.notes}</p>
                  </div>
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-slate-900 text-white px-4 py-2 text-xs font-bold hover:bg-slate-700">Open submission form</a>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Short blurb (~140 chars)</div>
                      <button onClick={() => copy(id + "-short", blurb.short)} className={"text-[11px] font-bold " + (copied === id + "-short" ? "text-green-600" : "text-blue-600 hover:text-blue-800")}>
                        {copied === id + "-short" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="text-[12px] text-slate-700 whitespace-pre-wrap">{blurb.short}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Long blurb (~500 chars)</div>
                      <button onClick={() => copy(id + "-long", blurb.long)} className={"text-[11px] font-bold " + (copied === id + "-long" ? "text-green-600" : "text-blue-600 hover:text-blue-800")}>
                        {copied === id + "-long" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="text-[12px] text-slate-700 whitespace-pre-wrap">{blurb.long}</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2 text-[11px] text-slate-700">
                  <div className="flex items-center justify-between rounded bg-slate-50 border border-slate-200 px-2 py-1.5">
                    <span className="text-slate-400">Name</span>
                    <button onClick={() => copy(id + "-name", blurb.name)} className="font-bold truncate hover:text-blue-700">{blurb.name}</button>
                  </div>
                  <div className="flex items-center justify-between rounded bg-slate-50 border border-slate-200 px-2 py-1.5">
                    <span className="text-slate-400">Phone</span>
                    <button onClick={() => copy(id + "-phone", blurb.phone)} className="font-bold hover:text-blue-700">{blurb.phone}</button>
                  </div>
                  <div className="flex items-center justify-between rounded bg-slate-50 border border-slate-200 px-2 py-1.5">
                    <span className="text-slate-400">Email</span>
                    <button onClick={() => copy(id + "-email", blurb.email)} className="font-bold hover:text-blue-700">{blurb.email}</button>
                  </div>
                  <div className="flex items-center justify-between rounded bg-slate-50 border border-slate-200 px-2 py-1.5 col-span-2">
                    <span className="text-slate-400">Website</span>
                    <button onClick={() => copy(id + "-web", blurb.website)} className="font-bold truncate hover:text-blue-700">{blurb.website}</button>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">Category hint: {blurb.categoryHint}</p>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
