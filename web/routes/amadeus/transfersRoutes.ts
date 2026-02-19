import { z } from "zod";
import { bookTransfer, cancelTransfer, searchTransfers } from "@/services/amadeus/transferService";
import { searchLocations } from "@/services/amadeus/contentService";
import { mapAmadeusError } from "@/services/amadeus/amadeusErrors";
import { logError, logInfo, logWarn } from "@/routes/amadeus/routeUtils";
import type { RouteResult } from "@/routes/amadeus/routeTypes";

function isIataCode(value: string) {
  return /^[A-Z]{3}$/i.test(String(value || "").trim());
}

async function resolveLocationCode(keyword: string, requestId: string, preferredSubType: "AIRPORT" | "CITY") {
  const trimmed = String(keyword || "").trim();
  if (!trimmed) return "";

  const firstTry = await searchLocations(
    {
      keyword: trimmed,
      subType: preferredSubType,
      pageLimit: 10,
    },
    requestId
  );

  const pickFrom = (list: any[]) =>
    list.find((l) => l?.iataCode) || list.find((l) => l?.cityCode) || list[0];

  const pick1 = pickFrom(firstTry.locations);
  const code1 = String(pick1?.iataCode || pick1?.cityCode || "").trim();
  if (code1) return code1;

  const fallback = await searchLocations(
    {
      keyword: trimmed,
      subType: "CITY,AIRPORT",
      pageLimit: 10,
    },
    requestId
  );
  const pick2 = pickFrom(fallback.locations);
  return String(pick2?.iataCode || pick2?.cityCode || "").trim();
}

const searchSchema = z.object({
  origin: z.string().min(3),
  destination: z.string().min(3),
  dateTime: z.string().min(10),
  passengers: z.coerce.number().int().min(1).max(9).optional(),
});

export async function handleTransfersSearch(req: Request, requestId: string): Promise<RouteResult> {
  const url = new URL(req.url);
  const parsed = searchSchema.safeParse({
    origin: url.searchParams.get("origin") || "",
    destination: url.searchParams.get("destination") || "",
    dateTime: url.searchParams.get("dateTime") || "",
    passengers: url.searchParams.get("passengers") || undefined,
  });

  if (!parsed.success) {
    logWarn("amadeus:transfers", requestId, "validation_failed", { issues: parsed.error.issues });
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

  logInfo("amadeus:transfers", requestId, "search", {
    origin: parsed.data.origin,
    destination: parsed.data.destination,
  });

  try {
    let originCode = parsed.data.origin;
    let destinationCode = parsed.data.destination;

    if (!isIataCode(originCode)) {
      originCode = await resolveLocationCode(originCode, requestId, "AIRPORT");
    }

    if (!isIataCode(destinationCode)) {
      destinationCode = await resolveLocationCode(destinationCode, requestId, "CITY");
    }

    const { offers } = await searchTransfers(
      {
        ...parsed.data,
        origin: originCode || parsed.data.origin,
        destination: destinationCode || parsed.data.destination,
      },
      requestId
    );

    return {
      status: 200,
      body: {
        ok: true,
        requestId,
        resolved: { originCode: originCode || null, destinationCode: destinationCode || null },
        offers,
      },
    };
  } catch (err) {
    const mapped = mapAmadeusError(err, requestId);
    logError("amadeus:transfers", requestId, "search_failed", { status: mapped.status, code: mapped.code });
    return { status: mapped.status, body: mapped };
  }
}

const bookSchema = z.object({
  // Requires Amadeus Transfer Booking payload (reservation/payment info).
  data: z.unknown(),
});

export async function handleTransfersBook(req: Request, requestId: string): Promise<RouteResult> {
  let json: any = null;
  try {
    json = await req.json();
  } catch {
    return {
      status: 400,
      body: { ok: false, code: "INVALID_REQUEST", message: "Invalid JSON body", requestId, status: 400 },
    };
  }

  const parsed = bookSchema.safeParse(json);
  if (!parsed.success) {
    return {
      status: 400,
      body: {
        ok: false,
        code: "INVALID_REQUEST",
        message: "Invalid booking payload",
        issues: parsed.error.issues,
        requestId,
        status: 400,
      },
    };
  }

  logInfo("amadeus:transfers", requestId, "book");

  try {
    const result = await bookTransfer(parsed.data.data, requestId);
    return { status: 200, body: { ok: true, requestId, ...result } };
  } catch (err) {
    const mapped = mapAmadeusError(err, requestId);
    return { status: mapped.status, body: mapped };
  }
}

const cancelSchema = z.object({
  orderId: z.string().min(1),
  data: z.unknown().optional(),
});

export async function handleTransfersCancel(req: Request, requestId: string): Promise<RouteResult> {
  let json: any = null;
  try {
    json = await req.json();
  } catch {
    return {
      status: 400,
      body: { ok: false, code: "INVALID_REQUEST", message: "Invalid JSON body", requestId, status: 400 },
    };
  }

  const parsed = cancelSchema.safeParse(json);
  if (!parsed.success) {
    return {
      status: 400,
      body: {
        ok: false,
        code: "INVALID_REQUEST",
        message: "Invalid cancellation payload",
        issues: parsed.error.issues,
        requestId,
        status: 400,
      },
    };
  }

  logInfo("amadeus:transfers", requestId, "cancel", { orderId: parsed.data.orderId });

  try {
    const result = await cancelTransfer(parsed.data.orderId, parsed.data.data || {}, requestId);
    return { status: 200, body: { ok: true, requestId, ...result } };
  } catch (err) {
    const mapped = mapAmadeusError(err, requestId);
    return { status: mapped.status, body: mapped };
  }
}
