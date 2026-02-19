import { NextResponse } from "next/server";
import { getRequestId } from "@/routes/amadeus/routeUtils";
import { handleTransfersSearch } from "@/routes/amadeus/transfersRoutes";

export async function GET(req: Request) {
  const requestId = getRequestId(req);
  const result = await handleTransfersSearch(req, requestId);
  return NextResponse.json(result.body, { status: result.status });
}
