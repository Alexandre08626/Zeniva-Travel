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
    </footer>
  );
}
