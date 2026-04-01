import { NextRequest, NextResponse } from "next/server";
import { verifySession, getSessionCookieName } from "@/src/lib/server/auth";
import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "info@zeniva.ca",
    pass: "ffngbulfzfbzcoab",
  },
});

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
    await transporter.sendMail({
      from: '"Alexandre Blais" <info@zeniva.ca>',
      to,
      subject: `[TEST] ${subject}`,
      html,
    });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to send" }, { status: 500 });
  }
}
