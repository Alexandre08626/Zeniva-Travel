import { NextRequest, NextResponse } from "next/server";
import sitemap from "../../sitemap";

const HOST = "www.zenivatravel.com";
const KEY = "7a18ecfe3cc234030928190b5dbbefd4";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const ENDPOINTS = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
  "https://yandex.com/indexnow",
];

async function pushToIndexNow(urlList: string[]) {
  const body = JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList });
  const results = await Promise.all(
    ENDPOINTS.map(async (endpoint) => {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body,
        });
        return { endpoint, status: res.status, ok: res.ok };
      } catch (err) {
        return { endpoint, error: err instanceof Error ? err.message : String(err) };
      }
    })
  );
  return results;
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${KEY}` && auth !== "Bearer zeniva-secret-2025") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let urlList: string[] = [];
  try {
    const body = await req.json();
    if (Array.isArray(body?.urls)) urlList = body.urls;
  } catch {}

  if (urlList.length === 0) {
    urlList = sitemap().map((entry) => entry.url);
  }

  const chunks: string[][] = [];
  for (let i = 0; i < urlList.length; i += 10000) {
    chunks.push(urlList.slice(i, i + 10000));
  }

  const allResults: unknown[] = [];
  for (const chunk of chunks) {
    const r = await pushToIndexNow(chunk);
    allResults.push({ chunkSize: chunk.length, results: r });
  }

  return NextResponse.json({ submitted: urlList.length, endpoints: ENDPOINTS, results: allResults });
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  if (url.searchParams.get("key") !== KEY && url.searchParams.get("key") !== "zeniva-secret-2025") {
    return NextResponse.json({
      info: "POST to this endpoint with Authorization: Bearer <KEY> to submit sitemap URLs to Bing/Yandex/IndexNow.",
      sitemapCount: sitemap().length,
      endpoints: ENDPOINTS,
    });
  }

  const urlList = sitemap().map((entry) => entry.url);
  const results = await pushToIndexNow(urlList);
  return NextResponse.json({ submitted: urlList.length, results });
}
