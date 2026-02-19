import { NextResponse } from "next/server";
import { getRequestId } from "@/routes/amadeus/routeUtils";
import { handleTransfersCancel } from "@/routes/amadeus/transfersRoutes";

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  const result = await handleTransfersCancel(req, requestId);
  return NextResponse.json(result.body, { status: result.status });
}
