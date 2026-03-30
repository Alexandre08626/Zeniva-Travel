import { logUsage } from "@/lib/usage-tracker";
import { NextRequest, NextResponse } from "next/server";

const VPS = "http://217.216.88.202:8000";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const params = new URLSearchParams({
    market: sp.get("market") || "us",
    page: sp.get("page") || "1",
    limit: sp.get("limit") || "24",
  });
  if (sp.get("operators")) params.set("operators", sp.get("operators")!);
  if (sp.get("date_from")) params.set("date_from", sp.get("date_from")!);
  if (sp.get("date_to")) params.set("date_to", sp.get("date_to")!);
  if (sp.get("duration_min")) params.set("duration_min", sp.get("duration_min")!);
  if (sp.get("duration_max")) params.set("duration_max", sp.get("duration_max")!);
  if (sp.get("regions")) params.set("regions", sp.get("regions")!);
  if (sp.get("holiday_types")) params.set("holiday_types", sp.get("holiday_types")!);

  try {
    const r = await fetch(`${VPS}/cruises/search?${params}`, { next: { revalidate: 300 } });
    const data = await r.json();
    logUsage({ service: "api_search", action: "cruises_search", metadata: {} });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
