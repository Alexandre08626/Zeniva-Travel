"use client";

import { locales } from "../lib/i18n/config";
import { useI18n, useT } from "../lib/i18n/I18nProvider";

type Props = {
  floating?: boolean;
  className?: string;
  orientation?: "horizontal" | "vertical";
};

export default function LocaleSwitcher({ floating = false, className, orientation = "vertical" }: Props) {
  const { locale, setLocale } = useI18n();
  const t = useT();

  const containerClass = [
    orientation === "vertical"
      ? "flex flex-col items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-2 text-[11px] font-semibold text-slate-800 shadow-sm"
      : "flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-800 shadow-sm",
    floating ? "fixed right-4 top-4 z-50 bg-white/90 shadow-md" : "",
    className || "",
  ].join(" ").trim();

  return (
    <div className={containerClass}>
      <span className="sr-only">{t("common.localeLabel")}</span>
      <div className={orientation === "vertical" ? "flex flex-col gap-1" : "flex gap-1"} role="group" aria-label={t("common.localeLabel")}>
        {locales.map((loc) => {
          const active = loc === locale;
          return (
            <button
              key={loc}
              onClick={() => setLocale(loc)}
              className={[
                "flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-semibold transition",
                active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-800 border-slate-200",
              ].join(" ")}
            >
              <span aria-hidden="true">{loc.toUpperCase()}</span>
              <span className="sr-only">{t("common.switchTo")} {loc.toUpperCase()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
