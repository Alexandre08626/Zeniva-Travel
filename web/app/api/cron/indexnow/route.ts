import { NextResponse } from "next/server";
import sitemap from "../../../sitemap";

const HOST = "www.zenivatravel.com";
const KEY = "7a18ecfe3cc234030928190b5dbbefd4";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const ENDPOINTS = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
  "https://yandex.com/indexnow",
];

export async function GET() {
  const urlList = sitemap().map((entry) => entry.url);
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

  return NextResponse.json({
    submittedAt: new Date().toISOString(),
    submitted: urlList.length,
    results,
  });
}
