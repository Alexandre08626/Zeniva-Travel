"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "../lib/i18n/I18nProvider";

const CACHE_KEY = "zeniva_translations_v2";
const BATCH_SIZE = 40;
const MIN_TEXT_LENGTH = 2;
const MAX_TEXT_LENGTH = 500;

// Texts that should never be translated (code, emails, URLs, etc.)
const SKIP_PATTERNS = /^[\d\s$€£%+\-.,/:@#!?()[\]{}<>|&=*^~`"'\\]+$|^https?:|^mailto:|@[a-z]|^\d+(\.\d+)?$/i;
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "CODE", "PRE", "TEXTAREA", "INPUT", "SVG", "NOSCRIPT", "IFRAME"]);

function getCacheMap(): Record<string, Record<string, string>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveCacheMap(map: Record<string, Record<string, string>>) {
  if (typeof window === "undefined") return;
  try {
    // Keep cache under 500KB
    const str = JSON.stringify(map);
    if (str.length < 500_000) localStorage.setItem(CACHE_KEY, str);
  } catch { /* ignore */ }
}

function getTextNodes(root: Node): Text[] {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.closest("[data-no-translate]")) return NodeFilter.FILTER_REJECT;
      if (parent.isContentEditable) return NodeFilter.FILTER_REJECT;
      const text = (node.textContent || "").trim();
      if (text.length < MIN_TEXT_LENGTH || text.length > MAX_TEXT_LENGTH) return NodeFilter.FILTER_REJECT;
      if (SKIP_PATTERNS.test(text)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  return nodes;
}

async function translateBatch(texts: string[], target: string): Promise<string[]> {
  const joined = texts.join("\n---SPLIT---\n");
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: joined, target, source: "en" }),
    });
    if (!res.ok) return texts;
    const { translated } = await res.json();
    if (!translated) return texts;
    const parts = translated.split(/\n?---SPLIT---\n?/);
    return texts.map((t, i) => (parts[i] || "").trim() || t);
  } catch { return texts; }
}

export default function GlobalTranslator() {
  const { locale } = useI18n();
  const prevLocale = useRef(locale);
  const originals = useRef(new Map<Text, string>());
  const translating = useRef(false);

  useEffect(() => {
    if (locale === "en") {
      // Restore originals
      originals.current.forEach((orig, node) => {
        if (node.parentElement && node.textContent !== orig) {
          node.textContent = orig;
        }
      });
      originals.current.clear();
      prevLocale.current = locale;
      return;
    }

    async function run() {
      if (translating.current) return;
      translating.current = true;

      // Restore to English first if switching between non-EN locales
      if (prevLocale.current !== "en" && prevLocale.current !== locale) {
        originals.current.forEach((orig, node) => {
          if (node.parentElement) node.textContent = orig;
        });
        originals.current.clear();
      }

      const cache = getCacheMap();
      if (!cache[locale]) cache[locale] = {};
      const langCache = cache[locale];

      const nodes = getTextNodes(document.body);
      const toTranslate: { node: Text; text: string }[] = [];

      // Apply cached translations first
      for (const node of nodes) {
        const text = (node.textContent || "").trim();
        if (!originals.current.has(node)) {
          originals.current.set(node, node.textContent || "");
        }
        if (langCache[text]) {
          node.textContent = (node.textContent || "").replace(text, langCache[text]);
        } else {
          toTranslate.push({ node, text });
        }
      }

      // Batch translate the rest
      for (let i = 0; i < toTranslate.length; i += BATCH_SIZE) {
        const batch = toTranslate.slice(i, i + BATCH_SIZE);
        const texts = batch.map((b) => b.text);
        const translated = await translateBatch(texts, locale);
        for (let j = 0; j < batch.length; j++) {
          const { node, text } = batch[j];
          const result = translated[j];
          if (result && result !== text) {
            langCache[text] = result;
            if (node.parentElement) {
              node.textContent = (node.textContent || "").replace(text, result);
            }
          }
        }
      }

      saveCacheMap(cache);
      prevLocale.current = locale;
      translating.current = false;
    }

    // Run after a short delay to let the page render
    const timer = setTimeout(run, 300);

    // Re-run on DOM mutations (new content loaded)
    const observer = new MutationObserver(() => {
      if (!translating.current && locale !== "en") {
        clearTimeout(rerunTimer);
        rerunTimer = setTimeout(run, 500);
      }
    });
    let rerunTimer: ReturnType<typeof setTimeout>;
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      clearTimeout(rerunTimer);
      observer.disconnect();
    };
  }, [locale]);

  return null;
}
