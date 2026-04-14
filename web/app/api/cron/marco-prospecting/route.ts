import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(req: Request) {
  // Verify Vercel cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Run the prospecting engine: 5 travelers, 3 agencies, 2 agents
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zenivatravel.com";
    const res = await fetch(`${baseUrl}/api/prospecting/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cronSecret || ""}`,
      },
      body: JSON.stringify({ travelers: 5, agencies: 3, agents: 2 }),
    });

    const data = await res.json();
    return NextResponse.json({ ok: true, ...data });
  } catch (err: any) {
    console.error("Marco cron error:", err?.message);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
