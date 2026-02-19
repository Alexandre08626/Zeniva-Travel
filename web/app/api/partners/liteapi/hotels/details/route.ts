import { NextResponse } from "next/server";
import { z } from "zod";
import { liteApiFetchJson, liteApiIsConfigured } from "../../../../../../src/lib/liteapiClient";

const schema = z.object({
  hotelId: z.string().trim().min(1, "hotelId required"),
  language: z.string().trim().optional(),
});

function pickFirstObject(payload: any): any {
  const candidates = [payload?.data, payload];
  for (const c of candidates) {
    if (c && typeof c === "object" && !Array.isArray(c)) return c;
  }
  return null;
}

function getFirstString(...values: any[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function extractPhotoUrls(payload: any): string[] {
  const root = pickFirstObject(payload) || payload;

  const urls: string[] = [];
  const pushUrl = (value: any) => {
    const url = getFirstString(value);
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) return;
    urls.push(url);
  };

  const collectFromArray = (arr: any) => {
    if (!Array.isArray(arr)) return;
    for (const item of arr) {
      if (typeof item === "string") {
        pushUrl(item);
        continue;
      }
      if (item && typeof item === "object") {
        pushUrl(item.url);
        pushUrl(item.src);
        pushUrl(item.href);
        pushUrl(item.image);
        pushUrl(item.link);
        pushUrl(item.large);
        pushUrl(item.original);
      }
    }
  };

  // Common variants observed across hotel APIs
  pushUrl(root?.main_photo);
  pushUrl(root?.mainPhoto);

  collectFromArray(root?.images);
  collectFromArray(root?.photos);
  collectFromArray(root?.gallery);
  collectFromArray(root?.imageUrls);

  // Some payloads nest the details under hotel/property
  pushUrl(root?.hotel?.main_photo);
  pushUrl(root?.hotel?.mainPhoto);
  collectFromArray(root?.hotel?.images);
  collectFromArray(root?.hotel?.photos);
  collectFromArray(root?.property?.images);
  collectFromArray(root?.property?.photos);

  // LiteAPI /data/hotel can include extensive nested photo arrays (e.g. rooms[].photos[].hd_url).
  // Do a bounded recursive scan for URL-like fields commonly used for images.
  const looksLikeImageUrl = (s: string) => {
    const lower = s.toLowerCase();
    if (!/^https?:\/\//i.test(s)) return false;
    if (/(\.jpe?g|\.png|\.webp)(\?|$)/i.test(s)) return true;
    if (lower.includes("bstatic.com/xdata/images")) return true;
    if (lower.includes("static.cupid.travel")) return true;
    if (lower.includes("rooms-large-pictures") || lower.includes("hotels/")) return true;
    return false;
  };

  const shouldCollectKey = (key: string) => /(photo|photos|image|images|img|url|hd_url)/i.test(key);

  const walk = (node: any, depth: number) => {
    if (!node || depth > 7) return;
    if (typeof node === "string") return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item, depth + 1);
      return;
    }
    if (typeof node !== "object") return;

    for (const [key, value] of Object.entries(node)) {
      if (typeof value === "string" && shouldCollectKey(key) && looksLikeImageUrl(value)) {
        pushUrl(value);
      }
      if (value && typeof value === "object") {
        // Direct known keys inside objects
        if (shouldCollectKey(key) && !Array.isArray(value)) {
          // e.g. { photo: { url: ... } }
          const vAny: any = value;
          if (typeof vAny.url === "string" && looksLikeImageUrl(vAny.url)) pushUrl(vAny.url);
          if (typeof vAny.hd_url === "string" && looksLikeImageUrl(vAny.hd_url)) pushUrl(vAny.hd_url);
          if (typeof vAny.src === "string" && looksLikeImageUrl(vAny.src)) pushUrl(vAny.src);
          if (typeof vAny.href === "string" && looksLikeImageUrl(vAny.href)) pushUrl(vAny.href);
        }
        walk(value, depth + 1);
      }
    }
  };

  walk(root, 0);

  const unique = Array.from(new Set(urls));
  return unique;
}

export async function GET(req: Request) {
  if (!liteApiIsConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "LiteAPI env not configured",
      },
      { status: 500 },
    );
  }

  const url = new URL(req.url);
  const parsed = schema.safeParse({
    hotelId: url.searchParams.get("hotelId") || "",
    language: url.searchParams.get("language") || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid params", issues: parsed.error.issues }, { status: 400 });
  }

  const { hotelId, language } = parsed.data;

  try {
    const upstream = await liteApiFetchJson<any>({
      path: "/data/hotel",
      method: "GET",
      query: {
        hotelId,
        ...(language ? { language } : null),
      },
      timeoutMs: 20000,
    });

    if (!upstream.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `LiteAPI hotel details failed (HTTP ${upstream.status})`,
          status: upstream.status,
        },
        { status: upstream.status || 502 },
      );
    }

    const root = pickFirstObject(upstream.data) || {};
    const name = getFirstString(root?.name, root?.hotel?.name, root?.property?.name);
    const photos = extractPhotoUrls(upstream.data);

    return NextResponse.json({ ok: true, hotelId, name, photos });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 502 });
  }
}

export const runtime = "nodejs";
