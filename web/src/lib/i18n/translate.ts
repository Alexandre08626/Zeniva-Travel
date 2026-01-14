import type { Locale } from "./config";

type TranslateParams = {
  text: string;
  target: Locale;
  source?: Locale | "auto";
};

export async function translateText({ text, target, source = "auto" }: TranslateParams): Promise<string> {
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, target, source }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Translation failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  if (!data?.translated) {
    throw new Error("No translated text returned");
  }

  return data.translated as string;
}
