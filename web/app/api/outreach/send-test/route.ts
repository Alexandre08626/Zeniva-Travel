import { NextRequest, NextResponse } from "next/server";
import { verifySession, getSessionCookieName } from "@/src/lib/server/auth";
import { sendEmail } from "@/src/lib/server/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getAuth(req: NextRequest) {
  const ck = req.headers.get("cookie") || "";
  const cn = getSessionCookieName();
  const m = ck.match(new RegExp(cn + "=([^;]+)"));
  const t = m?.[1];
  if (!t) return null;
  const s = verifySession(t);
  return s?.email ? s : null;
}

export async function POST(req: NextRequest) {
  const session = getAuth(req);
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
