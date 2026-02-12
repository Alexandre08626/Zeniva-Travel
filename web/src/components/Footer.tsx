import Link from "next/link";
import React from "react";
import { PREMIUM_BLUE, MUTED_TEXT } from "../design/tokens";
import AutoTranslate from "./AutoTranslate";

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-100 pt-6 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-semibold" style={{ color: MUTED_TEXT }}>
          {process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Zeniva Travel'} — <AutoTranslate text="Web UI v1" className="inline" />
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
        Zeniva Travel is not affiliated with, associated with, or endorsed by Airbnb, Inc. Airbnb is a registered trademark of Airbnb, Inc.
      </div>
    </footer>
  );
}
