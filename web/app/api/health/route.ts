import { NextResponse } from "next/server";
import { getAmadeusConfig } from "@/services/amadeus/amadeusConfig";
import { getAmadeusAccessToken, clearAmadeusTokenCache } from "@/services/amadeus/amadeusAuth";

const API_BASE = process.env.OPENAI_API_BASE || "https://api.openai.com/v1";

async function checkProvider() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) return { ok: false, status: 500, detail: "OPENAI_API_KEY missing" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const resp = await fetch(`${API_BASE}/models`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return { ok: resp.ok, status: resp.status };
  } catch (err: any) {
    clearTimeout(timeout);
    return { ok: false, status: 503, detail: err?.message || String(err) };
  }
}

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  const env = {
    OPENAI_API_KEY: !!apiKey,
    OPENAI_API_BASE: !!process.env.OPENAI_API_BASE,
    OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4o-mini",
    LITEAPI_API_BASE_URL: !!process.env.LITEAPI_API_BASE_URL,
    LITEAPI_API_KEY: !!process.env.LITEAPI_API_KEY,
    EXPEDIA_API_BASE_URL: !!process.env.EXPEDIA_API_BASE_URL,
    EXPEDIA_API_KEY: !!process.env.EXPEDIA_API_KEY,
    AMADEUS_ENV: process.env.AMADEUS_ENV || process.env.AMADEUS_MODE || "(default:test)",
    AMADEUS_BASE_URL: !!process.env.AMADEUS_BASE_URL,
    AMADEUS_CLIENT_ID: !!process.env.AMADEUS_CLIENT_ID || !!process.env.AMADEUS_API_KEY,
    AMADEUS_CLIENT_SECRET: !!process.env.AMADEUS_CLIENT_SECRET || !!process.env.AMADEUS_API_SECRET,
    AMADEUS_TEST_CLIENT_ID: !!process.env.AMADEUS_TEST_CLIENT_ID || !!process.env.AMADEUS_TEST_API_KEY,
    AMADEUS_TEST_CLIENT_SECRET: !!process.env.AMADEUS_TEST_CLIENT_SECRET || !!process.env.AMADEUS_TEST_API_SECRET,
    AMADEUS_PROD_CLIENT_ID: !!process.env.AMADEUS_PROD_CLIENT_ID || !!process.env.AMADEUS_PROD_API_KEY,
    AMADEUS_PROD_CLIENT_SECRET: !!process.env.AMADEUS_PROD_CLIENT_SECRET || !!process.env.AMADEUS_PROD_API_SECRET,
  };

  const provider = await checkProvider();

  const requestId = (globalThis.crypto && "randomUUID" in globalThis.crypto)
    ? globalThis.crypto.randomUUID().slice(0, 12)
    : `${Date.now()}`;

  const amadeus = await (async () => {
    try {
      const cfg = getAmadeusConfig();

      // Ensure we're actually testing live connectivity (not just cached token).
      clearAmadeusTokenCache();
      try {
        const token = await Promise.race([
          getAmadeusAccessToken(requestId),
          new Promise<string>((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000)),
        ]);
        return {
          ok: Boolean(token),
          baseUrl: cfg.baseUrl,
          hasCredentials: true,
        };
      } finally {
      }
    } catch (err: any) {
      return {
        ok: false,
        error: err?.message || String(err),
      };
    }
  })();

  return NextResponse.json({
    ok: (env.OPENAI_API_KEY && provider.ok) || amadeus.ok,
    env,
    provider,
    amadeus,
    timestamp: new Date().toISOString(),
  });
}

export const runtime = "nodejs";
