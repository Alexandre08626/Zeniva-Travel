import { NextRequest, NextResponse } from "next/server";
import { getMessages } from "@/src/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const channel = req.nextUrl.searchParams.get("channel") || undefined;
  const status = req.nextUrl.searchParams.get("status") || undefined;
  const leadId = req.nextUrl.searchParams.get("lead_id") || undefined;
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "100");
  const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0");

  const { data, total } = await getMessages({ channel, status, lead_id: leadId, limit, offset });

  const sent = data.filter((m: any) => m.status === "sent").length;
  const failed = data.filter((m: any) => m.status === "failed").length;
  const opened = data.filter((m: any) => m.status === "opened").length;
  const replied = data.filter((m: any) => m.status === "replied").length;

  return NextResponse.json({
    data,
    total,
    offset,
    limit,
    stats: { total, sent, failed, opened, replied },
    filters: { channel: channel || "all", status: status || "all", lead_id: leadId || null },
  });
}
