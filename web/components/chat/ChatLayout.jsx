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
      <div className="mx-auto max-w-[1700px] px-4 py-4 sm:py-6">
        <header className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href={backHref} className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              ← {backLabel}
            </Link>
            <Pill>{pillLabel}</Pill>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={resolvedCallHref}
              className="rounded-full px-4 py-2 text-sm font-extrabold text-white w-full sm:w-auto text-center"
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

        <div className="grid grid-cols-12 gap-4">
          <section className="col-span-12 lg:col-span-8 order-1">{chat}</section>
          <section className="col-span-12 lg:col-span-2 order-2 lg:order-none">{sidebar}</section>
          <section className="col-span-12 lg:col-span-2 order-3 lg:order-none">{snapshot}</section>
        </div>
      </div>
    </main>
  );
}
