import { z } from "zod";
import { mapAmadeusError } from "@/services/amadeus/amadeusErrors";
import { seatmapsFromFlightOffer, seatmapsFromOrder } from "@/services/amadeus/seatmapService";
import { logError, logInfo, logWarn } from "@/routes/amadeus/routeUtils";
import type { RouteResult } from "@/routes/amadeus/routeTypes";

const schema = z.object({
  // Preferred: pass the full flightOffer JSON (url-encoded) as `flightOffer`.
  flightOffer: z.string().optional(),
  // Optional: pass order-identifying query params for GET /shopping/seatmaps.
  // We accept any query keys here and forward them.
});

export async function handleSeatmaps(req: Request, requestId: string): Promise<RouteResult> {
  const url = new URL(req.url);
  const parsed = schema.safeParse({
    flightOffer: url.searchParams.get("flightOffer") || undefined,
  });

  if (!parsed.success) {
    logWarn("amadeus:seatmaps", requestId, "validation_failed", { issues: parsed.error.issues });
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

  try {
    if (parsed.data.flightOffer) {
      let flightOfferJson: unknown;
      try {
        flightOfferJson = JSON.parse(parsed.data.flightOffer);
      } catch {
        return {
          status: 400,
          body: {
            ok: false,
            code: "INVALID_REQUEST",
            message:
              "Invalid flightOffer JSON. Provide the full flightOffer object as a JSON string in the `flightOffer` query param.",
            requestId,
            status: 400,
          },
        };
      }

      logInfo("amadeus:seatmaps", requestId, "seatmaps_from_flight_offer");
      const { seatmaps } = await seatmapsFromFlightOffer(flightOfferJson, requestId);
      return { status: 200, body: { ok: true, requestId, seatmaps } };
    }

    // Fallback: forward all query params to Amadeus GET /shopping/seatmaps for order-based seatmaps.
    const query: Record<string, string> = {};
    for (const [k, v] of url.searchParams.entries()) query[k] = v;

    logInfo("amadeus:seatmaps", requestId, "seatmaps_from_order", { queryKeys: Object.keys(query) });
    const { seatmaps } = await seatmapsFromOrder(query, requestId);
    return { status: 200, body: { ok: true, requestId, seatmaps } };
  } catch (err) {
    const mapped = mapAmadeusError(err, requestId);
    logError("amadeus:seatmaps", requestId, "seatmaps_failed", { status: mapped.status, code: mapped.code });
    return { status: mapped.status, body: mapped };
  }
}
