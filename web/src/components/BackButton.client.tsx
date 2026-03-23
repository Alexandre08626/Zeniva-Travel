"use client";

import { usePathname, useRouter } from "next/navigation";

const EXCLUDED_PATHS = new Set(["/", "/agent", "/partner/dashboard", "/forms/travel", "/set-password"]);

export default function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (EXCLUDED_PATHS.has(pathname)) {
    return null;
  }

  // Pages with a tall hero (Lina face) — push button lower
  const lowPages = new Set(["/packages", "/destinations", "/zeniyacht", "/yachts", "/zenistay", "/residences"]);
  const topClass = lowPages.has(pathname) || pathname.startsWith("/destinations/") ? "top-20" : "top-4";

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={`fixed left-4 ${topClass} z-50 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50`}
      aria-label="Go back"
    >
      <span aria-hidden>←</span>
      Back
    </button>
  );
}
