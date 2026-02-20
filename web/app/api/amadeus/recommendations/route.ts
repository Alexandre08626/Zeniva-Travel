import { NextResponse } from "next/server";
import { getRequestId } from "@/routes/amadeus/routeUtils";
import { handleRecommendations } from "@/routes/amadeus/contentRoutes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const requestId = getRequestId(req);
  const result = await handleRecommendations(req, requestId);
  return NextResponse.json(result.body, { status: result.status });
}
