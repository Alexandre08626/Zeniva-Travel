import { NextResponse } from "next/server";
import { getRequestId } from "@/routes/amadeus/routeUtils";
import { handleActivitiesSearch } from "@/routes/amadeus/activitiesRoutes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const requestId = getRequestId(req);
  const result = await handleActivitiesSearch(req, requestId);
  return NextResponse.json(result.body, { status: result.status });
}
