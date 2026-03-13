import { NextRequest, NextResponse } from "next/server";

const VPS = "http://217.216.88.202:8000";

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");
  const market = req.nextUrl.searchParams.get("market") || "us";
  if (!ref) return NextResponse.json({ error: "ref required" }, { status: 400 });

  try {
    const r = await fetch(`${VPS}/cruises/holiday/${ref}?market=${market}`, { next: { revalidate: 300 } });
    const data = await r.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
