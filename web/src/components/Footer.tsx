import Link from "next/link";
import React from "react";
import { PREMIUM_BLUE, MUTED_TEXT } from "../design/tokens";
import AutoTranslate from "./AutoTranslate";

const FOOTER_USA = [
  { l: "From New York", h: "/packages" },
  { l: "From Los Angeles", h: "/packages/from-los-angeles" },
  { l: "From Miami", h: "/packages/from-miami" },
  { l: "From Chicago", h: "/packages/from-chicago" },
  { l: "From Boston", h: "/packages/from-boston" },
  { l: "From Houston", h: "/packages/from-houston" },
  { l: "From Dallas", h: "/packages/from-dallas" },
  { l: "From Atlanta", h: "/packages/from-atlanta" },
  { l: "From Seattle", h: "/packages/from-seattle" },
  { l: "From SF", h: "/packages/from-san-francisco" },
  { l: "From Denver", h: "/packages/from-denver" },
  { l: "From Phoenix", h: "/packages/from-phoenix" },
  { l: "From DC", h: "/packages/from-washington-dc" },
  { l: "From Orlando", h: "/packages/from-orlando" },
  { l: "From Vegas", h: "/packages/from-las-vegas" },
];
const FOOTER_CA = [
  { l: "From Toronto", h: "/packages/from-toronto" },
  { l: "From Vancouver", h: "/packages/from-vancouver" },
  { l: "From Montreal", h: "/packages/from-montreal" },
  { l: "From Calgary", h: "/packages/from-calgary" },
  { l: "From Ottawa", h: "/packages/from-ottawa" },
  { l: "From Québec", h: "/packages/from-quebec-city" },
];
const FOOTER_DESTS = [
  { l: "Cancun", h: "/destinations/cancun" },
  { l: "Punta Cana", h: "/destinations/punta-cana" },
  { l: "Bora Bora", h: "/destinations/bora-bora" },
  { l: "Mexico", h: "/destinations/mexico" },
  { l: "Caribbean", h: "/destinations/caribbean" },
  { l: "Europe", h: "/destinations/europe" },
  { l: "Florida Villas", h: "/florida-villas" },
];
const FOOTER_SERVICES = [
  { l: "AI Travel Agent", h: "/services/ai-travel-agent" },
  { l: "Luxury Travel", h: "/services/luxury-travel" },
  { l: "Yacht Charter", h: "/services/yacht-charter" },
  { l: "Villa Rental", h: "/services/villa-rental" },
  { l: "Cruises", h: "/services/cruises" },
  { l: "Honeymoon", h: "/services/honeymoon" },
  { l: "Group Travel", h: "/services/group-travel" },
  { l: "Destination Weddings", h: "/services/destination-weddings" },
  { l: "All-Inclusive", h: "/services/all-inclusive" },
  { l: "Family Vacations", h: "/services/family-vacations" },
  { l: "Adults-Only Resorts", h: "/services/adults-only-resorts" },
  { l: "Business Travel", h: "/services/business-travel" },
];
const FOOTER_COMPARE = [
  { l: "vs Layla", h: "/compare/zeniva-vs-layla" },
  { l: "vs Mindtrip", h: "/compare/zeniva-vs-mindtrip" },
  { l: "vs Booked.ai", h: "/compare/zeniva-vs-booked-ai" },
  { l: "vs Zenvoya", h: "/compare/zeniva-vs-zenvoya" },
  { l: "vs Penny", h: "/compare/zeniva-vs-penny" },
  { l: "vs ChatGPT", h: "/compare/zeniva-vs-chatgpt-for-travel" },
];

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-100 pt-8 pb-24">
      {/* Mega-menu — sitewide internal linking for SEO + UX */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-8 text-xs">
        <div>
          <div className="font-black mb-2 text-[11px] uppercase tracking-wide" style={{ color: PREMIUM_BLUE }}>From USA</div>
          <ul className="space-y-1.5">
            {FOOTER_USA.map((it) => (
              <li key={it.h}><Link href={it.h} className="font-semibold hover:underline" style={{ color: MUTED_TEXT }}>{it.l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-black mb-2 text-[11px] uppercase tracking-wide" style={{ color: PREMIUM_BLUE }}>From Canada</div>
          <ul className="space-y-1.5">
            {FOOTER_CA.map((it) => (
              <li key={it.h}><Link href={it.h} className="font-semibold hover:underline" style={{ color: MUTED_TEXT }}>{it.l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-black mb-2 text-[11px] uppercase tracking-wide" style={{ color: PREMIUM_BLUE }}>Destinations</div>
          <ul className="space-y-1.5">
            {FOOTER_DESTS.map((it) => (
              <li key={it.h}><Link href={it.h} className="font-semibold hover:underline" style={{ color: MUTED_TEXT }}>{it.l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-black mb-2 text-[11px] uppercase tracking-wide" style={{ color: PREMIUM_BLUE }}>Services</div>
          <ul className="space-y-1.5">
            {FOOTER_SERVICES.map((it) => (
              <li key={it.h}><Link href={it.h} className="font-semibold hover:underline" style={{ color: MUTED_TEXT }}>{it.l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-black mb-2 text-[11px] uppercase tracking-wide" style={{ color: PREMIUM_BLUE }}>Compare</div>
          <ul className="space-y-1.5">
            {FOOTER_COMPARE.map((it) => (
              <li key={it.h}><Link href={it.h} className="font-semibold hover:underline" style={{ color: MUTED_TEXT }}>{it.l}</Link></li>
            ))}
          </ul>
          <div className="font-black mt-4 mb-2 text-[11px] uppercase tracking-wide" style={{ color: PREMIUM_BLUE }}>Languages</div>
          <ul className="space-y-1.5">
            <li><Link href="/" className="font-semibold hover:underline" style={{ color: MUTED_TEXT }}>English</Link></li>
            <li><Link href="/fr" className="font-semibold hover:underline" style={{ color: MUTED_TEXT }}>Français</Link></li>
            <li><Link href="/es" className="font-semibold hover:underline" style={{ color: MUTED_TEXT }}>Español</Link></li>
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>
          {process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Zeniva'} — <AutoTranslate text="AI Travel Concierge" className="inline" />
        </div>
        <div className="flex items-center gap-2">
          <Link href="/partner" className="text-xs font-extrabold underline" style={{ color: PREMIUM_BLUE }}>
            <AutoTranslate text="Partner with us" className="inline" />
          </Link>
          <span className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>
            ·
          </span>
          <Link href="/chat" className="text-xs font-extrabold underline" style={{ color: PREMIUM_BLUE }}>
            <AutoTranslate text="Talk to Lina" className="inline" />
          </Link>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold" style={{ color: MUTED_TEXT }}>Legal:</span>
        <Link href="/privacy-policy" className="text-[11px] font-extrabold underline" style={{ color: PREMIUM_BLUE }}>
          <AutoTranslate text="Privacy" className="inline" />
        </Link>
        <Link href="/privacy-agents" className="text-[11px] font-extrabold underline" style={{ color: PREMIUM_BLUE }}>
          <AutoTranslate text="Privacy Agents" className="inline" />
        </Link>
        <Link href="/privacy-partners" className="text-[11px] font-extrabold underline" style={{ color: PREMIUM_BLUE }}>
          <AutoTranslate text="Privacy Partners" className="inline" />
        </Link>
        <Link href="/cookie-policy" className="text-[11px] font-extrabold underline" style={{ color: PREMIUM_BLUE }}>
          <AutoTranslate text="Cookies" className="inline" />
        </Link>
        <Link href="/terms" className="text-[11px] font-extrabold underline" style={{ color: PREMIUM_BLUE }}>
          <AutoTranslate text="Terms" className="inline" />
        </Link>
        <Link href="/ai-terms" className="text-[11px] font-extrabold underline" style={{ color: PREMIUM_BLUE }}>
          <AutoTranslate text="AI Terms" className="inline" />
        </Link>
        <Link href="/data-requests" className="text-[11px] font-extrabold underline" style={{ color: PREMIUM_BLUE }}>
          <AutoTranslate text="Data Requests" className="inline" />
        </Link>
      </div>
      <div className="mt-4 text-[11px] font-semibold" style={{ color: MUTED_TEXT }}>
        ZeniStay is a curated collection of vacation rentals and private homes managed by Zeniva.
      </div>
    </footer>
  );
}
