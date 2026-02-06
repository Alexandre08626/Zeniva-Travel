import { NextResponse } from "next/server";
import crypto from "crypto";
import { assertBackendEnv, dbQuery } from "../../../../src/lib/server/db";

function getClientIp(request: Request) {
  const header = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";
  return header.split(",")[0]?.trim() || "";
}

export async function POST(request: Request) {
  try {
    assertBackendEnv();
    const body = await request.json();
    const code = String(body?.code || "").trim();
    const slug = String(body?.slug || "").trim();
    const path = String(body?.path || "").trim();

    if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

    const { rows: formRows } = slug
      ? await dbQuery("SELECT id FROM influencer_referral_forms WHERE referral_code = $1 AND slug = $2 LIMIT 1", [code, slug])
      : { rows: [] };

    const formId = formRows[0]?.id || null;
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "";

    if (ipAddress) {
      const { rows: recent } = await dbQuery(
        "SELECT id FROM influencer_clicks WHERE referral_code = $1 AND ip_address = $2 AND created_at > now() - interval '5 minutes'",
        [code, ipAddress]
      );
      if (recent.length >= 3) {
        return NextResponse.json({ ok: true, skipped: true });
      }
    }

    const id = `inf-click-${crypto.randomUUID()}`;
    await dbQuery(
      "INSERT INTO influencer_clicks (id, influencer_id, referral_code, form_id, path, ip_address, user_agent, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7, now())",
      [id, code, code, formId, path || null, ipAddress || null, userAgent || null]
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to record click" }, { status: 500 });
  }
}

export const runtime = "nodejs";
