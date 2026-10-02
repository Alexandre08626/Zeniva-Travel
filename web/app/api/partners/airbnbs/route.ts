import { NextResponse } from 'next/server';
import airbnbsData from '@/src/data/airbnbs.json';

type Listing = { id: string; title?: string; location?: string; description?: string; [k: string]: unknown };

const norm = (s: unknown) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

// The scraped catalog has no clean location field ("Property Description" everywhere),
// so we blank that placeholder and match the search location against title + description.
function clean(l: Listing): Listing {
  return { ...l, location: l.location && l.location !== 'Property Description' ? l.location : '' };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = norm(url.searchParams.get('location') || url.searchParams.get('destination') || '').trim();
    const all = (airbnbsData as Listing[]).map(clean);
    if (!q) return NextResponse.json(all, { status: 200 });
    const words = q.split(/[\s,]+/).filter((w) => w.length >= 3);
    const matches = all.filter((l) => {
      const hay = norm(`${l.title} ${l.location} ${l.description}`);
      return words.length ? words.some((w) => hay.includes(w)) : hay.includes(q);
    });
    return NextResponse.json(matches, { status: 200 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('API /api/partners/airbnbs error', err);
    return NextResponse.json({ error: 'failed to read airbnbs data' }, { status: 500 });
  }
}
