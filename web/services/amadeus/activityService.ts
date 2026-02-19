import { amadeusJson } from "@/services/amadeus/amadeusHttp";
import { searchCities, searchLocations } from "@/services/amadeus/contentService";

export type ActivitySearchParams = {
  keyword: string;
  radius?: number;
  limit?: number;
};

export type NormalizedActivity = {
  id: string;
  provider: "amadeus";
  name: string;
  description?: string;
  geo?: { lat: number; lng: number };
  pictures?: string[];
  bookingLink?: string;
  price?: {
    amount: number;
    currency: string;
  };
  raw?: unknown;
};

async function resolveGeo(keyword: string, requestId: string): Promise<{ lat: number; lng: number; label: string }> {
  const trimmed = String(keyword || "").trim();
  if (!trimmed) throw new Error("Missing keyword");

  // Try City Search first
  try {
    const cities = await searchCities({ keyword: trimmed }, requestId);
    const first = cities.locations.find((l) => l.geo?.lat != null && l.geo?.lng != null);
    if (first?.geo) {
      return { lat: first.geo.lat, lng: first.geo.lng, label: first.name || trimmed };
    }
  } catch {
    // ignore and fall back
  }

  // Fall back to generic locations
  const locations = await searchLocations({ keyword: trimmed, subType: "CITY" }, requestId);
  const first = locations.locations.find((l) => l.geo?.lat != null && l.geo?.lng != null);
  if (first?.geo) {
    return { lat: first.geo.lat, lng: first.geo.lng, label: first.name || trimmed };
  }

  throw new Error(`Unable to resolve coordinates for keyword: ${trimmed}`);
}

export async function searchActivities(params: ActivitySearchParams, requestId: string) {
  const geo = await resolveGeo(params.keyword, requestId);

  const upstream: any = await amadeusJson({
    requestId,
    method: "GET",
    path: "/v1/shopping/activities",
    query: {
      latitude: geo.lat,
      longitude: geo.lng,
      radius: params.radius || 5,
    },
  });

  const normalized: NormalizedActivity[] = (upstream?.data || []).map((item: any) => {
    const id = String(item?.id || item?.activityId || item?.name || "");

    const pictures = Array.isArray(item?.pictures)
      ? item.pictures.map((x: any) => String(x)).filter(Boolean)
      : Array.isArray(item?.media)
        ? item.media.map((m: any) => String(m?.uri || m?.url)).filter(Boolean)
        : [];

    const priceAmountCandidate = item?.price?.amount ?? item?.price?.total ?? item?.price?.grandTotal;
    const priceCurrencyCandidate = item?.price?.currencyCode ?? item?.price?.currency;

    const amount = priceAmountCandidate != null ? Number(priceAmountCandidate) : NaN;
    const currency = priceCurrencyCandidate ? String(priceCurrencyCandidate) : "";

    const lat = item?.geoCode?.latitude != null ? Number(item.geoCode.latitude) : undefined;
    const lng = item?.geoCode?.longitude != null ? Number(item.geoCode.longitude) : undefined;

    return {
      id,
      provider: "amadeus",
      name: String(item?.name || "Activity"),
      description: item?.shortDescription || item?.description || undefined,
      geo: Number.isFinite(lat) && Number.isFinite(lng) ? { lat: lat as number, lng: lng as number } : undefined,
      pictures,
      bookingLink: item?.bookingLink || item?.links?.booking || item?.self?.href || undefined,
      price:
        Number.isFinite(amount) && currency
          ? {
              amount,
              currency,
            }
          : undefined,
      raw: item,
    };
  });

  const limited = params.limit ? normalized.slice(0, params.limit) : normalized;

  return { activities: limited, resolvedGeo: geo, raw: upstream };
}
