import { NextRequest, NextResponse } from "next/server";

const VPS_BASE = "http://217.216.88.202:8000";
const AUTH = "Bearer zeniva-secret-2025";

export async function GET(req: NextRequest) {
  try {
    const r = await fetch(`${VPS_BASE}/tiktok/content`, {
      headers: { Authorization: AUTH },
      next: { revalidate: 0 },
    });
    return NextResponse.json(await r.json());
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const r = await fetch(`${VPS_BASE}/tiktok/action`, {
      method: "POST",
      headers: { Authorization: AUTH, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return NextResponse.json(await r.json());
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 502 });
  }
}

export const runtime = "nodejs";
