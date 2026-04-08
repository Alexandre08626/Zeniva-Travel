import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";
import { sendEmail } from "../../../../src/lib/server/email";

const VPS = "https://vmi3097009.contaboserver.net";
const AUTH = "Bearer zeniva-secret-2025";

export async function GET(req: Request) {
  // Verify Vercel cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Ask Lina AI to generate prospecting targets
    const prospectingPrompt = `You are Marco, the Lead Hunter AI at Zeniva Travel.
Generate a daily prospecting report with 10 potential leads in these categories:
- 3 travel agencies that could partner with Zeniva (real agency names, cities)
- 3 independent travel agents who could join Zeniva (realistic profiles)
- 4 potential travelers showing luxury travel intent (realistic personas with destinations)

For each lead, provide: name, type (agency/agent/traveler), location, estimated value, and a recommended outreach approach.
Format as a clean report. Be specific and realistic.`;

    const linaRes = await fetch(`${VPS}/chat`, {
      method: "POST",
      headers: { Authorization: AUTH, "Content-Type": "application/json" },
      body: JSON.stringify({ message: prospectingPrompt, sessionId: `marco-daily-${Date.now()}`, source: "cron" }),
    });

    let report = "Marco prospecting report unavailable today.";
    if (linaRes.ok) {
      const data = await linaRes.json();
      report = data?.response || report;
    }

    // 2. Save report to Supabase
    const { client } = getSupabaseAdminClient();
    await client.from("agent_inbox_messages").insert({
      id: `marco-${Date.now()}`,
      message: `🔥 Marco Daily Prospecting Report\n\n${report}`,
      source: "marco-cron",
      sourcePath: "/agent/ai-chat/marco",
      status: "pending",
      created_at: new Date().toISOString(),
    });

    // 3. Email report to HQ
    await sendEmail({
      to: "info@zenivatravel.com",
      fromName: "Marco — Zeniva AI",
      subject: `🔥 Marco Daily Report — ${new Date().toLocaleDateString("en-CA")}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#f59e0b;">🔥 Marco — Daily Prospecting Report</h2>
        <p style="color:#64748b;font-size:13px;">${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:16px 0;white-space:pre-wrap;font-size:14px;line-height:1.6;color:#1e293b;">
${report}
        </div>
        <p style="color:#94a3b8;font-size:12px;margin-top:20px;">Marco AI · Zeniva Travel · <a href="https://www.zenivatravel.com/agent/ai-chat/marco">Open Marco Chat</a></p>
      </div>`,
    });

    return NextResponse.json({ ok: true, message: "Marco daily prospecting complete" });
  } catch (err: any) {
    console.error("Marco cron error:", err?.message);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
