import airbnbs from "../data/airbnbs.json";

export function getImagesForDestination(destination: string) {
  const seed = encodeURIComponent(destination.toLowerCase().replace(/\s+/g, '-'));
  return [
    `https://picsum.photos/seed/${seed}a/1200/700`,
    `https://picsum.photos/seed/${seed}b/1200/700`,
    `https://picsum.photos/seed/${seed}c/1200/700`,
    `https://picsum.photos/seed/${seed}d/1200/700`,
  ];
}

// Fetch images from configured partner API. If no partner is configured or the
// request fails, fallback to `getImagesForDestination`.
export async function fetchPartnerImages(destination: string) {
  const base = process.env.PARTNER_API_URL || process.env.NEXT_PUBLIC_PARTNER_API_URL;
  const key = process.env.PARTNER_API_KEY || process.env.NEXT_PUBLIC_PARTNER_API_KEY;

  if (!base) {
    return getImagesForDestination(destination);
  }

  try {
    const endpoint = `${base.replace(/\/$/, '')}/images?destination=${encodeURIComponent(destination)}`;
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (key) headers['Authorization'] = `Bearer ${key}`;

    const res = await fetch(endpoint, { headers, next: { revalidate: 60 } });
    if (!res.ok) {
      console.error('Partner images request failed', res.status, await res.text());
      return getImagesForDestination(destination);
    }

    const body = await res.json();
    // Accept several possible shapes: array of strings, { images: [] }, { data: [] }
    let images: string[] = [];
    if (Array.isArray(body)) images = body;
    else if (Array.isArray(body.images)) images = body.images;
    else if (Array.isArray(body.data)) images = body.data;

    if (images.length > 0) return images;
  } catch (err) {
    // do not crash the app if partner API fails
    // eslint-disable-next-line no-console
    console.error('fetchPartnerImages error', err);
  }

  return getImagesForDestination(destination);
}

export function getPartnerHotelImages(destination: string) {
  const term = (destination || "").toLowerCase();
  const match = airbnbs.find((item: any) => {
    const title = (item.title || "").toLowerCase();
    const location = (item.location || "").toLowerCase();
    return term && (title.includes(term) || location.includes(term));
  });

  if (match?.images?.length) return match.images as string[];
  if (match?.thumbnail) return [match.thumbnail as string];
  return getImagesForDestination(destination);
}

export default getImagesForDestination;
