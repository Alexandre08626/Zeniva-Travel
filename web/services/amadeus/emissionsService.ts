import { amadeusJson } from "@/services/amadeus/amadeusHttp";

export type EmissionsInput = {
  // Accepts either a raw Amadeus payload (data: ...) or a simplified segments[] payload.
  data?: unknown;
  segments?: Array<{
    origin: string;
    destination: string;
    departureDateTime: string;
    arrivalDateTime?: string;
    carrierCode?: string;
    flightNumber?: string;
    aircraftCode?: string;
  }>;
};

export type NormalizedEmissions = {
  co2Kg?: number;
  raw: unknown;
};

export async function computeEmissions(input: EmissionsInput, requestId: string): Promise<NormalizedEmissions> {
  // Official endpoint (Amadeus Self-Service): POST /v1/travel/predictions/flight-carbon-emissions
  // Payload varies by API version. We support:
  //  - caller-provided Amadeus payload via `data`
  //  - a simplified `segments[]` which we wrap under data.

  let payload: any = null;

  if (input?.data) {
    payload = { data: input.data };
  } else if (input?.segments?.length) {
    payload = {
      data: {
        type: "flight-carbon-emissions",
        segments: input.segments.map((s) => ({
          originLocationCode: s.origin,
          destinationLocationCode: s.destination,
          departureDateTime: s.departureDateTime,
          ...(s.arrivalDateTime ? { arrivalDateTime: s.arrivalDateTime } : null),
          ...(s.carrierCode ? { carrierCode: s.carrierCode } : null),
          ...(s.flightNumber ? { flightNumber: s.flightNumber } : null),
          ...(s.aircraftCode ? { aircraftCode: s.aircraftCode } : null),
        })),
      },
    };
  } else {
    throw new Error("Missing emissions input: provide `data` or `segments[]`");
  }

  const upstream: any = await amadeusJson({
    requestId,
    method: "POST",
    path: "/v1/travel/predictions/flight-carbon-emissions",
    body: payload,
  });

  const co2Candidate =
    upstream?.data?.co2Emissions?.[0]?.weight ||
    upstream?.data?.co2Emission?.weight ||
    upstream?.data?.co2Emission ||
    upstream?.data?.co2Kg;

  const co2Kg = co2Candidate != null ? Number(co2Candidate) : undefined;

  return {
    co2Kg: Number.isFinite(co2Kg) ? co2Kg : undefined,
    raw: upstream,
  };
}
