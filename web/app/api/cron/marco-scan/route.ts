import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const VPS_BASE = "http://217.216.88.202:8000";
const AUTH = "Bearer zeniva-secret-2025";

/**
 * Marco lead-hunter cron — runs daily via Vercel Cron.
 * Triggers the VPS social-leads scanner for all 3 audience types.
 */
export async function GET(req: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = req.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const audiences = ["travelers", "agencies", "agents"] as const;
  const results: Record<string, any> = {};

  for (const audience of audiences) {
    try {
      const res = await fetch(`${VPS_BASE}/social-leads/scan`, {
        method: "POST",
        headers: { Authorization: AUTH, "Content-Type": "application/json" },
        body: JSON.stringify({ audience, source: "marco-cron" }),
      });
      results[audience] = await res.json();
    } catch (err: any) {
      results[audience] = { error: err?.message || "VPS unreachable" };
    }
  }

  console.log("[Marco Cron]", JSON.stringify(results));
  return NextResponse.json({ ok: true, timestamp: new Date().toISOString(), results });
}
