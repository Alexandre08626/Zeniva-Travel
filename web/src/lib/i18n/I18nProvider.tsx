"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { defaultLocale, type Locale, locales } from "./config";
import { getDictionary, type Messages } from "./dictionaries";
import { translateText } from "./translate";

const STORAGE_KEY = "zeniva_locale";

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved && locales.includes(saved as Locale)) return saved as Locale;
  const nav = navigator.language?.slice(0, 2).toLowerCase();
  if (locales.includes(nav as Locale)) return nav as Locale;
  return defaultLocale;
}

export const I18nContext = createContext<{
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
  translate: (text: string, source?: Locale | "auto") => Promise<string>;
} | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    setLocale(getInitialLocale());
  }, []);

  const messages = useMemo(() => getDictionary(locale), [locale]);

  const translate = useCallback(
    async (text: string, source: Locale | "auto" = "auto") => {
      return translateText({ text, target: locale, source });
    },
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      messages,
      translate,
      setLocale: (loc: Locale) => {
        if (!locales.includes(loc)) return;
        setLocale(loc);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, loc);
          document.documentElement.lang = loc;
        }
      },
    }),
    [locale, messages, translate]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function useT() {
  const { messages } = useI18n();
  return function t(path: string): string {
    const segments = path.split(".");
    let node: any = messages;
    for (const seg of segments) {
      if (node && typeof node === "object" && seg in node) {
        node = node[seg];
      } else {
        return path;
      }
    }
    return typeof node === "string" ? node : path;
  };
}

export function useTranslate() {
  const { translate } = useI18n();
  return translate;
}
