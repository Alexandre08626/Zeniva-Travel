import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET || "zeniva-cron-2026";

type N8nPayload = {
  agent?: string;
  trigger?: string;
  data?: Record<string, unknown>;
};

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || req.nextUrl.searchParams.get("secret") || "";
  if (auth !== CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body: N8nPayload = await req.json().catch(() => ({}));
  const agent = body.agent || req.nextUrl.searchParams.get("agent") || "all";
  const trigger = body.trigger || "n8n";

  console.log(`[N8N-WEBHOOK] Trigger: ${trigger}, Agent: ${agent}`);

  // Forward to the automation scheduler
  const origin = req.headers.get("host") ? `${req.nextUrl.protocol}//${req.headers.get("host")}` : req.nextUrl.origin;
  const r = await fetch(`${origin}/api/automation?agent=${agent}&secret=${CRON_SECRET}`);
  const result = await r.json();

  return NextResponse.json({
    received: true,
    trigger,
    agent,
    automation: result,
    ts: new Date().toISOString(),
  });
}
