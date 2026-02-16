"use client";
import Link from "next/link";
import Image from "next/image";
import { LIGHT_BG, PREMIUM_BLUE, TITLE_TEXT, MUTED_TEXT } from "../../src/design/tokens";
import Pill from "../../src/components/Pill";

export default function ChatLayout({
  sidebar,
  chat,
  snapshot,
  tripId,
  backHref = "/",
  backLabel = "Back",
  pillLabel = "Zeniva • AI Travel",
  callHref,
  callLabel = "Call AI Assistant",
}) {
  const resolvedCallHref = callHref ?? `/call/${tripId || ""}`;
  return (
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      <div className="mx-auto max-w-[1440px] px-4 py-4 sm:py-6">
        <header className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between max-sm:rounded-2xl max-sm:border max-sm:border-slate-200 max-sm:bg-white/90 max-sm:px-4 max-sm:py-3 max-sm:shadow-sm">
          <div className="flex items-center gap-3">
            <Link href={backHref} className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              ← {backLabel}
            </Link>
            <Pill>{pillLabel}</Pill>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={resolvedCallHref}
              className="rounded-full px-4 py-2 text-sm font-extrabold text-white w-full sm:w-auto text-center max-sm:shadow-sm"
              style={{ backgroundColor: PREMIUM_BLUE }}
            >
              {callLabel}
            </Link>
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: MUTED_TEXT }}>
              <Image
                src="/branding/lina-avatar.png"
                alt="Lina avatar"
                width={40}
                height={40}
                className="rounded-full shadow-sm"
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-4 lg:grid-cols-[300px_minmax(0,1fr)_300px] xl:grid-cols-[320px_minmax(0,1fr)_320px] lg:h-[calc(100vh-10.5rem)] lg:overflow-hidden">
          <section className="col-span-12 lg:col-span-1 order-2 lg:order-1 min-h-0 lg:overflow-y-auto">{snapshot}</section>
          <section className="col-span-12 lg:col-span-1 order-1 lg:order-2 min-h-0 h-full">{chat}</section>
          <section className="col-span-12 lg:col-span-1 order-3 lg:order-3 min-h-0 lg:overflow-y-auto">{sidebar}</section>
        </div>
      </div>
    </main>
  );
}
