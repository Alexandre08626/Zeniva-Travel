"use client";

import { useRouter, usePathname } from "next/navigation";
import { locales, localeLabels, localePathPrefix, type Locale } from "../lib/i18n/config";
import { useI18n } from "../lib/i18n/I18nProvider";

type Props = {
  floating?: boolean;
  className?: string;
  orientation?: "horizontal" | "vertical";
  compact?: boolean;
};

// Locales with full UI dictionaries — safe to keep current path when switching.
// Other locales only have native /<loc> and /<loc>/lina pages, so switching
// to them must land on the locale root to avoid 404s.
const FULL_DICT_LOCALES: Locale[] = ["en", "fr", "es"];

function stripExistingLocalePrefix(pathname: string): string {
  for (const loc of locales) {
    const prefix = localePathPrefix[loc];
    if (!prefix) continue;
    if (pathname === prefix) return "/";
    if (pathname.startsWith(prefix + "/")) return pathname.slice(prefix.length);
  }
  return pathname || "/";
}

function detectActiveLocale(pathname: string, currentLocale: Locale): Locale {
  for (const loc of locales) {
    const prefix = localePathPrefix[loc];
    if (!prefix) continue;
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return loc;
  }
  return currentLocale;
}

export default function LocaleSwitcher({ floating = false, className, orientation = "vertical", compact = false }: Props) {
  const { locale, setLocale } = useI18n();
  const router = useRouter();
  const pathname = usePathname() || "/";
  const activeLocale = detectActiveLocale(pathname, locale);

  const handleSelect = (loc: Locale) => {
    const basePath = stripExistingLocalePrefix(pathname);
    const prefix = localePathPrefix[loc];
    const keepPath = FULL_DICT_LOCALES.includes(loc);
    const target = keepPath
      ? ((prefix + (basePath === "/" ? "" : basePath)) || "/")
      : (prefix || "/");
    setLocale(loc);
    router.push(target);
  };

  const containerClass = [
    orientation === "vertical"
      ? "flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white px-2 py-2 shadow-sm max-h-[28rem] overflow-y-auto"
      : "flex flex-wrap items-center gap-1 rounded-2xl border border-slate-200 bg-white px-2 py-1 shadow-sm",
    floating ? "fixed right-4 top-4 z-50 bg-white/95 shadow-lg backdrop-blur-sm" : "",
    className || "",
  ].join(" ").trim();

  return (
    <div className={containerClass} role="group" aria-label="Language selector">
      {locales.map((loc) => {
        const active = loc === activeLocale;
        const label = localeLabels[loc];
        return (
          <button
            key={loc}
            onClick={() => handleSelect(loc)}
            title={`Switch to ${loc.toUpperCase()}`}
            className={[
              "rounded-full font-bold transition-all text-[11px] tracking-wide",
              compact
                ? "px-2 py-1"
                : orientation === "vertical" ? "w-12 h-8 flex items-center justify-center" : "px-3 py-1.5",
              active
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            ].join(" ")}
          >
            {compact ? loc.toUpperCase() : label}
          </button>
        );
      })}
    </div>
  );
}
