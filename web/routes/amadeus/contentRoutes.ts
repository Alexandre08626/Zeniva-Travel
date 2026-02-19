import { z } from "zod";
import type { RouteResult } from "@/routes/amadeus/routeTypes";
import { mapAmadeusError } from "@/services/amadeus/amadeusErrors";
import { logError, logInfo, logWarn } from "@/routes/amadeus/routeUtils";
import { poisByRadius, recommendedLocations, searchCities, searchLocations } from "@/services/amadeus/contentService";

const locationsSchema = z.object({
  keyword: z.string().min(1),
  subType: z.string().optional(),
  countryCode: z.string().length(2).optional(),
});

export async function handleLocationsSearch(req: Request, requestId: string): Promise<RouteResult> {
  const url = new URL(req.url);
  const parsed = locationsSchema.safeParse({
    keyword: url.searchParams.get("keyword") || "",
    subType: url.searchParams.get("subType") || undefined,
    countryCode: url.searchParams.get("countryCode") || undefined,
  });

  if (!parsed.success) {
    logWarn("amadeus:content", requestId, "locations_validation_failed", { issues: parsed.error.issues });
    return {
      status: 400,
      body: {
        ok: false,
        code: "INVALID_REQUEST",
        message: "Invalid query params",
        issues: parsed.error.issues,
        requestId,
        status: 400,
      },
    };
  }

  logInfo("amadeus:content", requestId, "locations_search");

  try {
    const { locations } = await searchLocations(parsed.data, requestId);
    return { status: 200, body: { ok: true, requestId, locations } };
  } catch (err) {
    const mapped = mapAmadeusError(err, requestId);
    logError("amadeus:content", requestId, "locations_failed", { status: mapped.status, code: mapped.code });
    return { status: mapped.status, body: mapped };
  }
}

const poisSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(0.1).max(50).optional(),
  categories: z.string().optional(),
});

export async function handlePois(req: Request, requestId: string): Promise<RouteResult> {
  const url = new URL(req.url);
  const parsed = poisSchema.safeParse({
    lat: url.searchParams.get("lat") || "",
    lng: url.searchParams.get("lng") || "",
    radius: url.searchParams.get("radius") || undefined,
    categories: url.searchParams.get("categories") || undefined,
  });

  if (!parsed.success) {
    logWarn("amadeus:content", requestId, "pois_validation_failed", { issues: parsed.error.issues });
    return {
      status: 400,
      body: {
        ok: false,
        code: "INVALID_REQUEST",
        message: "Invalid query params",
        issues: parsed.error.issues,
        requestId,
        status: 400,
      },
    };
  }

  logInfo("amadeus:content", requestId, "pois_search");

  try {
    const { pois } = await poisByRadius(parsed.data, requestId);
    return { status: 200, body: { ok: true, requestId, pois } };
  } catch (err) {
    const mapped = mapAmadeusError(err, requestId);
    logError("amadeus:content", requestId, "pois_failed", { status: mapped.status, code: mapped.code });
    return { status: mapped.status, body: mapped };
  }
}

const recSchema = z.object({
  cityCode: z.string().min(3).max(3),
});

export async function handleRecommendations(req: Request, requestId: string): Promise<RouteResult> {
  const url = new URL(req.url);
  const parsed = recSchema.safeParse({
    cityCode: url.searchParams.get("cityCode") || "",
  });

  if (!parsed.success) {
    return {
      status: 400,
      body: {
        ok: false,
        code: "INVALID_REQUEST",
        message: "Invalid query params",
        issues: parsed.error.issues,
        requestId,
        status: 400,
      },
    };
  }

  logInfo("amadeus:content", requestId, "recommendations");

  try {
    const { locations } = await recommendedLocations(parsed.data, requestId);
    return { status: 200, body: { ok: true, requestId, locations } };
  } catch (err) {
    const mapped = mapAmadeusError(err, requestId);
    return { status: mapped.status, body: mapped };
  }
}

const citiesSchema = z.object({
  keyword: z.string().min(1),
  countryCode: z.string().length(2).optional(),
});

export async function handleCitiesSearch(req: Request, requestId: string): Promise<RouteResult> {
  const url = new URL(req.url);
  const parsed = citiesSchema.safeParse({
    keyword: url.searchParams.get("keyword") || "",
    countryCode: url.searchParams.get("countryCode") || undefined,
  });

  if (!parsed.success) {
    return {
      status: 400,
      body: {
        ok: false,
        code: "INVALID_REQUEST",
        message: "Invalid query params",
        issues: parsed.error.issues,
        requestId,
        status: 400,
      },
    };
  }

  logInfo("amadeus:content", requestId, "cities_search");

  try {
    const { locations } = await searchCities(parsed.data, requestId);
    return { status: 200, body: { ok: true, requestId, locations } };
  } catch (err) {
    const mapped = mapAmadeusError(err, requestId);
    return { status: mapped.status, body: mapped };
  }
}
