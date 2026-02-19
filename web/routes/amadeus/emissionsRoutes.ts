import { z } from "zod";
import type { RouteResult } from "@/routes/amadeus/routeTypes";
import { computeEmissions } from "@/services/amadeus/emissionsService";
import { mapAmadeusError } from "@/services/amadeus/amadeusErrors";
import { logError, logInfo } from "@/routes/amadeus/routeUtils";

const schema = z
  .object({
    data: z.unknown().optional(),
    segments: z
      .array(
        z.object({
          origin: z.string().min(3),
          destination: z.string().min(3),
          departureDateTime: z.string().min(10),
          arrivalDateTime: z.string().min(10).optional(),
          carrierCode: z.string().min(2).optional(),
          flightNumber: z.string().min(1).optional(),
          aircraftCode: z.string().min(2).optional(),
        })
      )
      .optional(),
  })
  .refine((x) => Boolean(x.data) || Boolean(x.segments?.length), {
    message: "Provide `data` or `segments[]`",
    path: ["data"],
  });

export async function handleEmissions(req: Request, requestId: string): Promise<RouteResult> {
  let json: any = null;
  try {
    json = await req.json();
  } catch {
    return {
      status: 400,
      body: { ok: false, code: "INVALID_REQUEST", message: "Invalid JSON body", requestId, status: 400 },
    };
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return {
      status: 400,
      body: {
        ok: false,
        code: "INVALID_REQUEST",
        message: "Invalid emissions payload",
        issues: parsed.error.issues,
        requestId,
        status: 400,
      },
    };
  }

  logInfo("amadeus:emissions", requestId, "compute");

  try {
    const result = await computeEmissions(parsed.data, requestId);
    return { status: 200, body: { ok: true, requestId, ...result } };
  } catch (err) {
    const mapped = mapAmadeusError(err, requestId);
    logError("amadeus:emissions", requestId, "compute_failed", { status: mapped.status, code: mapped.code });
    return { status: mapped.status, body: mapped };
  }
}
