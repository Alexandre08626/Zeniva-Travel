import { logUsage } from "@/lib/usage-tracker";
import { NextResponse } from "next/server";
import { getRequestId } from "@/routes/amadeus/routeUtils";
import { handleTransfersSearch } from "@/routes/amadeus/transfersRoutes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const requestId = getRequestId(req);
  const result = await handleTransfersSearch(req, requestId);
  logUsage({ service: "api_search", action: "amadeus_transfers_search", metadata: {} });
  return NextResponse.json(result.body, { status: result.status });
}
