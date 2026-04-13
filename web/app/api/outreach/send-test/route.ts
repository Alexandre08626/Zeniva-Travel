import { NextRequest, NextResponse } from "next/server";
import { getOutreachAuth } from "../auth";
import { sendEmail } from "@/src/lib/server/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = getOutreachAuth(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { html, subject, to } = await req.json();
  if (!html || !subject || !to) {
    return NextResponse.json({ error: "html, subject, and to are required" }, { status: 400 });
  }

  try {
    await sendEmail({
      fromName: "Alexandre Blais",
      to,
      subject: `[TEST] ${subject}`,
      html,
    });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to send" }, { status: 500 });
  }
}
