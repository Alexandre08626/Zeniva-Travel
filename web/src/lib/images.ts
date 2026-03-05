import airbnbs from "../data/airbnbs.json";

const DESTINATION_IMAGES: Record<string, string[]> = {
  cancun: ["https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=1400&q=85","https://images.unsplash.com/photo-1512813498716-3e640fed3a73?w=1400&q=85","https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=85","https://images.unsplash.com/photo-1533760881669-80db4d7b341c?w=1400&q=85"],
  maldives: ["https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1400&q=85","https://images.unsplash.com/photo-1540202404-1b927e27fa8b?w=1400&q=85","https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1400&q=85","https://images.unsplash.com/photo-1589979481223-deb893e4fc80?w=1400&q=85"],
  bali: ["https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1400&q=85","https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1400&q=85","https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1400&q=85","https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=1400&q=85"],
  paris: ["https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1400&q=85","https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=1400&q=85","https://images.unsplash.com/photo-1471623432079-b009d30b6729?w=1400&q=85","https://images.unsplash.com/photo-1499856871958-5b9357976b82?w=1400&q=85"],
  dubai: ["https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1400&q=85","https://images.unsplash.com/photo-1526495124232-a04e1849168c?w=1400&q=85","https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=1400&q=85","https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?w=1400&q=85"],
  miami: ["https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=1400&q=85","https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1400&q=85","https://images.unsplash.com/photo-1605723517503-3cadb5818a0c?w=1400&q=85","https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1400&q=85"],
  tokyo: ["https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1400&q=85","https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=1400&q=85","https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1400&q=85","https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1400&q=85"],
  santorini: ["https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1400&q=85","https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=1400&q=85","https://images.unsplash.com/photo-1469796466635-455ede028aca?w=1400&q=85","https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1400&q=85"],
  tulum: ["https://images.unsplash.com/photo-1682553064441-5766a0b4bd02?w=1400&q=85","https://images.unsplash.com/photo-1617655775754-5ac52e6e8168?w=1400&q=85","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=85","https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=85"],
  puntacana: ["https://images.unsplash.com/photo-1580237541049-2d715a09486e?w=1400&q=85","https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=85","https://images.unsplash.com/photo-1553197347-8d4a2e1b45e0?w=1400&q=85","https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1400&q=85"],
  barcelona: ["https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1400&q=85","https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1400&q=85","https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1400&q=85","https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1400&q=85"],
  amalfi: ["https://images.unsplash.com/photo-1533587851505-d119e13c8b59?w=1400&q=85","https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1400&q=85","https://images.unsplash.com/photo-1525874684015-58379d421a52?w=1400&q=85","https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1400&q=85"],
  hawaii: ["https://images.unsplash.com/photo-1542259009477-d625272157b7?w=1400&q=85","https://images.unsplash.com/photo-1507876466758-e54b914aab25?w=1400&q=85","https://images.unsplash.com/photo-1598135753163-6167c1a1ad65?w=1400&q=85","https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?w=1400&q=85"],
  caribbean: ["https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=1400&q=85","https://images.unsplash.com/photo-1580237541049-2d715a09486e?w=1400&q=85","https://images.unsplash.com/photo-1545579133-99bb5ad189be?w=1400&q=85","https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1400&q=85"],
  mediterranean: ["https://images.unsplash.com/photo-1533533572953-72f6e1d0c0f5?w=1400&q=85","https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1400&q=85","https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1400&q=85","https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=1400&q=85"],
};
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1400&q=85",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&q=85",
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1400&q=85",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400&q=85",
];

export function getImagesForDestination(destination: string) {
  const key = (destination || "").toLowerCase();
  for (const [kw, imgs] of Object.entries(DESTINATION_IMAGES)) {
    if (key.includes(kw)) return imgs;
  }
  return FALLBACK_IMAGES;
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
