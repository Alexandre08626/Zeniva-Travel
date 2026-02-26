import { NextRequest, NextResponse } from "next/server";

const VPS_BASE = "http://217.216.88.202:8000";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  try {
    const r = await fetch(`${VPS_BASE}/tiktok/video/${filename}`);
    if (!r.ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    const buffer = await r.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 502 });
  }
}

export const runtime = "nodejs";
