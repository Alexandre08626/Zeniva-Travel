import { amadeusJson } from "@/services/amadeus/amadeusHttp";

export type SeatmapResult = {
  seatmaps: unknown;
  raw: unknown;
};

export async function seatmapsFromFlightOffer(flightOffer: unknown, requestId: string): Promise<SeatmapResult> {
  // Amadeus Seatmap Display supports POST /v1/shopping/seatmaps with a flightOffer payload.
  const payload = {
    data: flightOffer,
  };

  const upstream: any = await amadeusJson({
    requestId,
    method: "POST",
    path: "/v1/shopping/seatmaps",
    body: payload,
  });

  return {
    seatmaps: upstream?.data || upstream,
    raw: upstream,
  };
}

export async function seatmapsFromOrder(query: Record<string, string>, requestId: string): Promise<SeatmapResult> {
  // GET /v1/shopping/seatmaps typically expects order-identifying query params.
  const upstream: any = await amadeusJson({
    requestId,
    method: "GET",
    path: "/v1/shopping/seatmaps",
    query,
  });

  return {
    seatmaps: upstream?.data || upstream,
    raw: upstream,
  };
}
