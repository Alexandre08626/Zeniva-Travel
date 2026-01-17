import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug') || '';
  if (!slug) return NextResponse.json({ ok: false, error: 'slug required' }, { status: 400 });

  const partnerUrl = `https://ycn.miami/${slug}`;
  try {
    const resp = await fetch(partnerUrl, { method: 'GET' });
    if (!resp.ok) return NextResponse.json({ ok: false, error: `Partner returned ${resp.status}` }, { status: 502 });
    const html = await resp.text();
    const matches = Array.from(html.matchAll(/<img[^>]+src=['"]([^'"\s>]+)['"]/gi)).map((m) => m[1]);
    const unique = Array.from(new Set(matches));
    const normalized = unique
      .map((src) => {
        try {
          return new URL(src, partnerUrl).toString();
        } catch (e) {
          return null;
        }
      })
      .filter((s) => Boolean(s)) as string[];
    const images = normalized.filter((s) => /\.(jpe?g|png|webp|avif)(\?|$)/i.test(s)).slice(0, 12);
    return NextResponse.json({ ok: true, images });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'fetch failed' }, { status: 500 });
  }
}
