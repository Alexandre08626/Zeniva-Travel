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
      const r = await fetch(`${VPS_BASE}/admin/stats`, {
        headers: { Authorization: AUTH },
        next: { revalidate: 0 },
      });
      return NextResponse.json(await r.json());
    }

    if (endpoint === "webhook-test") {
      const r = await fetch(VPS_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "health-check", sessionId: "dashboard-monitor" }),
      });
      return NextResponse.json(await r.json());
    }

    if (endpoint === "leads") {
      const r = await fetch(`${VPS_BASE}/admin/leads?limit=100`, {
        headers: { Authorization: AUTH },
        next: { revalidate: 0 },
      });
      return NextResponse.json(await r.json());
    }

    return NextResponse.json({ error: "Unknown endpoint" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "VPS unreachable" }, { status: 502 });
  }
}

export const runtime = "nodejs";
