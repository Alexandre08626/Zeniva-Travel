import { NextResponse } from "next/server";
import { getRequestId } from "@/routes/amadeus/routeUtils";
import { handleCarsBook } from "@/routes/amadeus/carsRoutes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  const result = await handleCarsBook(req, requestId);
  return NextResponse.json(result.body, { status: result.status });
}
