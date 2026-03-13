import { NextRequest, NextResponse } from "next/server";

const VPS = "http://217.216.88.202:8000";

export async function GET(req: NextRequest) {
  const destination = req.nextUrl.searchParams.get("destination") || "";
  const travelers = req.nextUrl.searchParams.get("travelers") || "2";
  if (!destination) return NextResponse.json({ error: "Missing destination" }, { status: 400 });
  try {
    const res = await fetch(`${VPS}/experiences/search?city=${encodeURIComponent(destination)}&travelers=${travelers}`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json({ experiences: data.items || [], total: data.total || 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "VPS error" }, { status: 500 });
  }
}
