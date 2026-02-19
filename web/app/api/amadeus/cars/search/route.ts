import { NextResponse } from "next/server";
import { getRequestId } from "@/routes/amadeus/routeUtils";
import { handleCarsSearch } from "@/routes/amadeus/carsRoutes";

export async function GET(req: Request) {
  const requestId = getRequestId(req);
  const result = await handleCarsSearch(req, requestId);
  return NextResponse.json(result.body, { status: result.status });
}
