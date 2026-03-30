import { logUsage } from "@/lib/usage-tracker";
import { NextRequest, NextResponse } from "next/server";

const VPS = "http://217.216.88.202:8000";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const pickup = params.get("pickup") || "";
  const dropoff = params.get("dropoff") || pickup;
  const pickup_date = params.get("pickup_date") || "";
  const dropoff_date = params.get("dropoff_date") || "";
  const pickup_time = params.get("pickup_time") || "10:00";
  const dropoff_time = params.get("dropoff_time") || "10:00";
  const driver_age = params.get("driver_age") || "30";

  if (!pickup || !pickup_date || !dropoff_date) {
    return NextResponse.json({ error: "Missing required params" }, { status: 400 });
  }

  try {
    const qs = new URLSearchParams({ pickup, dropoff, pickup_date, dropoff_date, pickup_time, dropoff_time, driver_age });
    const res = await fetch(`${VPS}/cars/search?${qs}`, { cache: "no-store" });
    const data = await res.json();
    logUsage({ service: "api_search", action: "cars_search", metadata: {} });
    return NextResponse.json(data, { status: res.ok ? 200 : 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "VPS error" }, { status: 500 });
  }
}
