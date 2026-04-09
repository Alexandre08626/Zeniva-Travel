import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

function getClientIp(request: Request) {
  const header = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";
  return header.split(",")[0]?.trim() || "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = String(body?.code || "").trim();
    const slug = String(body?.slug || "").trim();
    const path = String(body?.path || "").trim();

    if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

    const { client: admin } = getSupabaseAdminClient();

    let formId: string | null = null;
    if (slug) {
      const { data: formRows } = await admin
        .from("influencer_referral_forms")
        .select("id")
        .eq("referral_code", code)
        .eq("slug", slug)
        .limit(1);
      formId = formRows?.[0]?.id || null;
    }

    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "";

    if (ipAddress) {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: recent } = await admin
        .from("influencer_clicks")
        .select("id")
        .eq("referral_code", code)
        .eq("ip_address", ipAddress)
        .gte("created_at", fiveMinAgo);
      if ((recent || []).length >= 3) {
        return NextResponse.json({ ok: true, skipped: true });
      }
    }

    const id = `inf-click-${crypto.randomUUID()}`;
    await admin
      .from("influencer_clicks")
      .insert({
        id,
        influencer_id: code,
        referral_code: code,
        form_id: formId,
        path: path || null,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
        created_at: new Date().toISOString(),
      });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to record click" }, { status: 500 });
  }
}

export const runtime = "nodejs";
