import { NextResponse } from "next/server";
import { getRequestId } from "@/routes/amadeus/routeUtils";
import { handleTransfersBook } from "@/routes/amadeus/transfersRoutes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  const result = await handleTransfersBook(req, requestId);
  return NextResponse.json(result.body, { status: result.status });
}
