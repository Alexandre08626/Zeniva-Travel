import { NextResponse } from "next/server";
import { getRequestId } from "@/routes/amadeus/routeUtils";
import { handleLocationsSearch } from "@/routes/amadeus/contentRoutes";

export async function GET(req: Request) {
  const requestId = getRequestId(req);
  const result = await handleLocationsSearch(req, requestId);
  return NextResponse.json(result.body, { status: result.status });
}
