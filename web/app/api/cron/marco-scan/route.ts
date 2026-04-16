import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Marco lead-hunter cron — triggered by n8n webhook or Vercel Cron.
 * Calls the prospecting engine which scans real social media leads.
 */
export async function GET(req: NextRequest) {
  // Verify: Vercel cron secret OR n8n webhook secret
  const authHeader = req.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET;
  const n8nSecret = process.env.N8N_WEBHOOK_SECRET || "zeniva-n8n-2026";

  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && authHeader !== `Bearer ${n8nSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Call the prospecting engine internally
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.zenivatravel.com";
  try {
    const res = await fetch(`${baseUrl}/api/prospecting/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${n8nSecret}`,
      },
      body: JSON.stringify({ travelers: 5, agencies: 3, agents: 2 }),
    });
    const data = await res.json();
    console.log("[Marco Cron]", JSON.stringify(data));
    return NextResponse.json({ ok: true, timestamp: new Date().toISOString(), ...data });
  } catch (err: any) {
    console.error("[Marco Cron] Error:", err?.message);
    return NextResponse.json({ error: err?.message || "Cron failed" }, { status: 500 });
  }
}

/**
 * POST handler — for n8n webhook calls
 */
export async function POST(req: NextRequest) {
  return GET(req);
}
