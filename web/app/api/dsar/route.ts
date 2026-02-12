import { NextResponse } from "next/server";

const sanitizeText = (value: string) =>
  value.replace(/[<>]/g, "").replace(/[\r\n\t]+/g, " ").trim();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = {
      name: sanitizeText(String(body?.name || "")),
      email: sanitizeText(String(body?.email || "")),
      requestType: sanitizeText(String(body?.requestType || "")),
      message: sanitizeText(String(body?.message || "")),
      source: sanitizeText(String(body?.source || "web")),
    };

    if (!payload.email || !payload.requestType) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      requestId: crypto.randomUUID(),
      receivedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
}

export function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed" }, { status: 405 });
}
