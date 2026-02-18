import { NextResponse } from "next/server";

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
  };

  const provider = await checkProvider();

  return NextResponse.json({
    ok: env.OPENAI_API_KEY && provider.ok,
    env,
    provider,
    timestamp: new Date().toISOString(),
  });
}

export const runtime = "nodejs";
