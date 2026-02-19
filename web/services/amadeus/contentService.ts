import { amadeusJson } from "@/services/amadeus/amadeusHttp";

export type NormalizedLocation = {
  id: string;
  name: string;
  subType?: string;
  iataCode?: string;
  cityCode?: string;
  countryCode?: string;
  geo?: { lat: number; lng: number };
  raw?: unknown;
};

export type NormalizedPoi = {
  id: string;
  name: string;
  category?: string;
  tags?: string[];
  geo?: { lat: number; lng: number };
  raw?: unknown;
};

export async function searchLocations(
  params: {
    keyword: string;
    subType?: string;
    countryCode?: string;
    pageLimit?: number;
  },
  requestId: string
) {
  const upstream: any = await amadeusJson({
    requestId,
    method: "GET",
    path: "/v1/reference-data/locations",
    query: {
      keyword: params.keyword,
      subType: params.subType || "CITY,AIRPORT",
      ...(params.countryCode ? { countryCode: params.countryCode } : null),
      ...(params.pageLimit ? { "page[limit]": params.pageLimit } : null),
    },
  });

  const locations: NormalizedLocation[] = (upstream?.data || []).map((x: any) => ({
    id: String(x?.id || x?.iataCode || x?.name || ""),
    name: String(x?.name || x?.detailedName || ""),
    subType: x?.subType,
    iataCode: x?.iataCode,
    cityCode: x?.address?.cityCode,
    countryCode: x?.address?.countryCode,
    geo:
      x?.geoCode?.latitude != null && x?.geoCode?.longitude != null
        ? { lat: Number(x.geoCode.latitude), lng: Number(x.geoCode.longitude) }
        : undefined,
    raw: x,
  }));

  return { locations, raw: upstream };
}

export async function searchCities(params: { keyword: string; countryCode?: string }, requestId: string) {
  const upstream: any = await amadeusJson({
    requestId,
    method: "GET",
    path: "/v1/reference-data/locations/cities",
    query: {
      keyword: params.keyword,
      ...(params.countryCode ? { countryCode: params.countryCode } : null),
    },
  });

  const locations: NormalizedLocation[] = (upstream?.data || []).map((x: any) => ({
    id: String(x?.id || x?.name || ""),
    name: String(x?.name || ""),
    subType: x?.subType,
    countryCode: x?.address?.countryCode,
    geo:
      x?.geoCode?.latitude != null && x?.geoCode?.longitude != null
        ? { lat: Number(x.geoCode.latitude), lng: Number(x.geoCode.longitude) }
        : undefined,
    raw: x,
  }));

  return { locations, raw: upstream };
}

export async function poisByRadius(
  params: { lat: number; lng: number; radius?: number; categories?: string },
  requestId: string
) {
  const upstream: any = await amadeusJson({
    requestId,
    method: "GET",
    path: "/v1/reference-data/locations/pois",
    query: {
      latitude: params.lat,
      longitude: params.lng,
      radius: params.radius || 2,
      ...(params.categories ? { categories: params.categories } : null),
    },
  });

  const pois: NormalizedPoi[] = (upstream?.data || []).map((x: any) => ({
    id: String(x?.id || x?.name || ""),
    name: String(x?.name || ""),
    category: x?.category,
    tags: Array.isArray(x?.tags) ? x.tags.map(String) : undefined,
    geo:
      x?.geoCode?.latitude != null && x?.geoCode?.longitude != null
        ? { lat: Number(x.geoCode.latitude), lng: Number(x.geoCode.longitude) }
        : undefined,
    raw: x,
  }));

  return { pois, raw: upstream };
}

export async function recommendedLocations(params: { cityCode: string }, requestId: string) {
  // Some accounts expose this as /v1/reference-data/recommended-locations
  const upstream: any = await amadeusJson({
    requestId,
    method: "GET",
    path: "/v1/reference-data/recommended-locations",
    query: {
      cityCodes: params.cityCode,
    },
  });

  const locations: NormalizedLocation[] = (upstream?.data || []).map((x: any) => ({
    id: String(x?.id || x?.iataCode || x?.name || ""),
    name: String(x?.name || x?.detailedName || ""),
    subType: x?.subType,
    iataCode: x?.iataCode,
    cityCode: x?.address?.cityCode,
    countryCode: x?.address?.countryCode,
    geo:
      x?.geoCode?.latitude != null && x?.geoCode?.longitude != null
        ? { lat: Number(x.geoCode.latitude), lng: Number(x.geoCode.longitude) }
        : undefined,
    raw: x,
  }));

  return { locations, raw: upstream };
}
