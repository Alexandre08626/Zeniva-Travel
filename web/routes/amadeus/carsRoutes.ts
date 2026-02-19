import { z } from "zod";
import { searchCars, bookCar } from "@/services/amadeus/carService";
import { mapAmadeusError } from "@/services/amadeus/amadeusErrors";
import { logError, logInfo, logWarn } from "@/routes/amadeus/routeUtils";
import type { RouteResult } from "@/routes/amadeus/routeTypes";

const searchSchema = z.object({
  pickup: z.string().min(3),
  dropoff: z.string().min(3).optional(),
  startDate: z.string().min(8),
  endDate: z.string().min(8),
  age: z.coerce.number().int().min(18).max(99).optional(),
});

export async function handleCarsSearch(req: Request, requestId: string): Promise<RouteResult> {
  const url = new URL(req.url);
  const parsed = searchSchema.safeParse({
    pickup: url.searchParams.get("pickup") || "",
    dropoff: url.searchParams.get("dropoff") || undefined,
    startDate: url.searchParams.get("startDate") || "",
    endDate: url.searchParams.get("endDate") || "",
    age: url.searchParams.get("age") || undefined,
  });

  if (!parsed.success) {
    logWarn("amadeus:cars", requestId, "validation_failed", { issues: parsed.error.issues });
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

  logInfo("amadeus:cars", requestId, "search", { pickup: parsed.data.pickup, dropoff: parsed.data.dropoff });

  try {
    const { offers } = await searchCars(parsed.data, requestId);
    return {
      status: 200,
      body: { ok: true, requestId, offers },
    };
  } catch (err) {
    const mapped = mapAmadeusError(err, requestId);
    logError("amadeus:cars", requestId, "search_failed", { status: mapped.status, code: mapped.code });
    return { status: mapped.status, body: mapped };
  }
}

const bookSchema = z.object({
  // Booking payload is plan-dependent; we require a JSON body but do not enforce a strict shape.
  payload: z.unknown().optional(),
});

export async function handleCarsBook(req: Request, requestId: string): Promise<RouteResult> {
  let json: unknown = undefined;
  try {
    json = await req.json();
  } catch {
    json = undefined;
  }

  const parsed = bookSchema.safeParse({ payload: json });
  if (!parsed.success) {
    return {
      status: 400,
      body: {
        ok: false,
        code: "INVALID_REQUEST",
        message: "Invalid JSON body",
        issues: parsed.error.issues,
        requestId,
        status: 400,
      },
    };
  }

  logInfo("amadeus:cars", requestId, "book_attempt");

  try {
    const result = await bookCar(parsed.data.payload, requestId);
    if (result.notAvailable) {
      return {
        status: 501,
        body: { ok: false, code: "NOT_AVAILABLE", message: result.guidance, requestId, status: 501 },
      };
    }

    return { status: 200, body: { ok: true, requestId, data: result } };
  } catch (err) {
    const mapped = mapAmadeusError(err, requestId);
    return { status: mapped.status, body: mapped };
  }
}
