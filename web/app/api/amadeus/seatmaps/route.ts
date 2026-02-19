import { NextResponse } from "next/server";
import { getRequestId } from "@/routes/amadeus/routeUtils";
import { handleSeatmaps } from "@/routes/amadeus/seatmapsRoutes";

export async function GET(req: Request) {
  const requestId = getRequestId(req);
  const result = await handleSeatmaps(req, requestId);
  return NextResponse.json(result.body, { status: result.status });
}
