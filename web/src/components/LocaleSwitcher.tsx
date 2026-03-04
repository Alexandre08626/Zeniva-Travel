"use client";

import { locales, localeLabels } from "../lib/i18n/config";
import { useI18n } from "../lib/i18n/I18nProvider";

type Props = {
  floating?: boolean;
  className?: string;
  orientation?: "horizontal" | "vertical";
  compact?: boolean;
};

export default function LocaleSwitcher({ floating = false, className, orientation = "vertical", compact = false }: Props) {
  const { locale, setLocale } = useI18n();

  const containerClass = [
    orientation === "vertical"
      ? "flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white px-2 py-2 shadow-sm"
      : "flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm",
    floating ? "fixed right-4 top-4 z-50 bg-white/95 shadow-lg backdrop-blur-sm" : "",
    className || "",
  ].join(" ").trim();

  return (
    <div className={containerClass} role="group" aria-label="Language selector">
      {locales.map((loc) => {
        const active = loc === locale;
        const label = localeLabels[loc];
        return (
          <button
            key={loc}
            onClick={() => setLocale(loc)}
            title={`Switch to ${loc.toUpperCase()}`}
            className={[
              "rounded-full font-bold transition-all text-[11px] tracking-wide",
              compact
                ? "px-2 py-1"
                : orientation === "vertical" ? "w-10 h-8 flex items-center justify-center" : "px-3 py-1.5",
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
