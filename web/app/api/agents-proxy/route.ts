import { NextRequest, NextResponse } from "next/server";

const VPS_BASE = "http://217.216.88.202:8000";
const VPS_WEBHOOK = "https://vmi3097009.contaboserver.net/webhook/zeniva-lina-chat";
const AUTH = "Bearer zeniva-secret-2025";

export async function GET(req: NextRequest) {
  const endpoint = req.nextUrl.searchParams.get("endpoint") || "health";

  try {
    if (endpoint === "health") {
      const r = await fetch(`${VPS_BASE}/health`, { next: { revalidate: 0 } });
      return NextResponse.json(await r.json());
    }
    if (endpoint === "stats") {
      const r = await fetch(`${VPS_BASE}/admin/stats`, { headers: { Authorization: AUTH }, next: { revalidate: 0 } });
      return NextResponse.json(await r.json());
    }
    if (endpoint === "webhook-test") {
      const r = await fetch(`${VPS_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "health-check", sessionId: "dashboard-monitor" }),
      });
      return NextResponse.json(await r.json());
    }
    if (endpoint === "leads") {
      const r = await fetch(`${VPS_BASE}/admin/leads?limit=100`, { headers: { Authorization: AUTH }, next: { revalidate: 0 } });
      return NextResponse.json(await r.json());
    }
    if (endpoint === "activity") {
      const r = await fetch(`${VPS_BASE}/admin/activity`, { headers: { Authorization: AUTH }, next: { revalidate: 0 } });
      return NextResponse.json(await r.json());
    }
    if (endpoint === "tiktok") {
      const r = await fetch(`${VPS_BASE}/tiktok/content`, { headers: { Authorization: AUTH }, next: { revalidate: 0 } });
      return NextResponse.json(await r.json());
    }
    if (endpoint === "tiktok-video") {
      const filename = req.nextUrl.searchParams.get("file") || "";
      const r = await fetch(`${VPS_BASE}/tiktok/video/${filename}`);
      if (!r.ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const buffer = await r.arrayBuffer();
      return new NextResponse(buffer, { headers: { "Content-Type": "video/mp4", "Content-Length": String(buffer.byteLength), "Cache-Control": "public, max-age=3600" } });
    }
    // Serve any video/audio from video-assets or video-queue
    if (endpoint === "video-serve") {
      const filename = req.nextUrl.searchParams.get("file") || "";
      const r = await fetch(`${VPS_BASE}/video-serve/${filename}`, { headers: { Authorization: AUTH } });
      if (!r.ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const buffer = await r.arrayBuffer();
      const ct = filename.endsWith(".mp3") ? "audio/mpeg" : "video/mp4";
      return new NextResponse(buffer, { headers: { "Content-Type": ct, "Content-Length": String(buffer.byteLength), "Cache-Control": "no-cache" } });
    }
    // Get video queue (uploaded videos pending approval)
    if (endpoint === "video-queue") {
      const r = await fetch(`${VPS_BASE}/video-queue`, { headers: { Authorization: AUTH }, next: { revalidate: 0 } });
      return NextResponse.json(await r.json());
    }
    return NextResponse.json({ error: "Unknown endpoint" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "VPS unreachable" }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const endpoint = req.nextUrl.searchParams.get("endpoint") || "";
  try {
    if (endpoint === "tiktok-action") {
      const body = await req.json();
      const r = await fetch(`${VPS_BASE}/tiktok/action`, { method: "POST", headers: { Authorization: AUTH, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      return NextResponse.json(await r.json());
    }
    if (endpoint === "video-queue-action") {
      const body = await req.json();
      const r = await fetch(`${VPS_BASE}/video-queue/action`, { method: "POST", headers: { Authorization: AUTH, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      return NextResponse.json(await r.json());
    }
    if (endpoint === "upload-video") {
      const formData = await req.formData();
      const r = await fetch(`${VPS_BASE}/video-queue/upload`, { method: "POST", headers: { Authorization: AUTH }, body: formData });
      return NextResponse.json(await r.json());
    }
    if (endpoint === "add-voice") {
      const body = await req.json();
      const r = await fetch(`${VPS_BASE}/video-queue/add-voice`, { method: "POST", headers: { Authorization: AUTH, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      return NextResponse.json(await r.json());
    }
    if (endpoint === "social-queue") {
      const body = await req.json();
      const r = await fetch(`${VPS_BASE}/social-queue`, { method: "POST", headers: { Authorization: AUTH, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      return NextResponse.json(await r.json());
    }
    return NextResponse.json({ error: "Unknown endpoint" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 502 });
  }
}

export const runtime = "nodejs";
