import { z } from "zod";
import type { RouteResult } from "@/routes/amadeus/routeTypes";
import { logError, logInfo, logWarn } from "@/routes/amadeus/routeUtils";
import { mapAmadeusError } from "@/services/amadeus/amadeusErrors";
import { searchActivities } from "@/services/amadeus/activityService";

const schema = z.object({
  keyword: z.string().min(1),
  radius: z.coerce.number().min(0.1).max(50).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export async function handleActivitiesSearch(req: Request, requestId: string): Promise<RouteResult> {
  const url = new URL(req.url);
  const parsed = schema.safeParse({
    keyword: url.searchParams.get("keyword") || "",
    radius: url.searchParams.get("radius") || undefined,
    limit: url.searchParams.get("limit") || undefined,
  });

  if (!parsed.success) {
    logWarn("amadeus:activities", requestId, "validation_failed", { issues: parsed.error.issues });
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

  logInfo("amadeus:activities", requestId, "search", { keyword: parsed.data.keyword });

  try {
    const { activities, resolvedGeo } = await searchActivities(parsed.data, requestId);
    return {
      status: 200,
      body: {
        ok: true,
        requestId,
        resolvedGeo,
        activities,
      },
    };
  } catch (err) {
    const mapped = mapAmadeusError(err, requestId);
    logError("amadeus:activities", requestId, "search_failed", { status: mapped.status, code: mapped.code });
    return { status: mapped.status, body: mapped };
  }
}
