"use client";

import { useEffect, useState } from "react";
import type { Locale } from "../lib/i18n/config";
import { useI18n, useTranslate } from "../lib/i18n/I18nProvider";

/**
 * Client helper to translate a text string when the user switches locale.
 * Falls back to the source text if translation fails.
 */
export default function AutoTranslate({
  text,
  source = "en",
  className,
}: {
  text: string;
  source?: Locale | "auto";
  className?: string;
}) {
  const { locale } = useI18n();
  const translate = useTranslate();
  const [value, setValue] = useState<string>(text);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (locale === source) {
        setValue(text);
        return;
      }
      setIsLoading(true);
      try {
        const result = await translate(text, source);
        if (!cancelled) setValue(result);
      } catch {
        if (!cancelled) setValue(text);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [locale, source, text, translate]);

  return <span className={className}>{isLoading ? text : value}</span>;
}
