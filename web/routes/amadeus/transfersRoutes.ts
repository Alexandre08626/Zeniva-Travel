import { z } from "zod";
import { bookTransfer, searchTransfers } from "@/services/amadeus/transferService";
import { mapAmadeusError } from "@/services/amadeus/amadeusErrors";
import { logError, logInfo, logWarn } from "@/routes/amadeus/routeUtils";
import type { RouteResult } from "@/routes/amadeus/routeTypes";

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
    const { offers } = await searchTransfers(parsed.data, requestId);
    return { status: 200, body: { ok: true, requestId, offers } };
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
