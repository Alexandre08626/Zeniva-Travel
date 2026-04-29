export const locales = ["en", "fr", "es", "pt", "de", "it", "ja", "zh", "ko", "ar", "nl"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "EN 🇺🇸",
  fr: "FR 🇫🇷",
  es: "ES 🇲🇽",
  pt: "PT 🇧🇷",
  de: "DE 🇩🇪",
  it: "IT 🇮🇹",
  ja: "JA 🇯🇵",
  zh: "ZH 🇨🇳",
  ko: "KO 🇰🇷",
  ar: "AR 🇦🇪",
  nl: "NL 🇳🇱",
};

// URL path prefix per locale (defaultLocale = no prefix on URLs)
export const localePathPrefix: Record<Locale, string> = {
  en: "",
  fr: "/fr",
  es: "/es",
  pt: "/pt",
  de: "/de",
  it: "/it",
  ja: "/ja",
  zh: "/zh",
  ko: "/ko",
  ar: "/ar",
  nl: "/nl",
};
