import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdminClient } from "../../../../../src/lib/supabase/server";

function getClientIp(request: Request) {
  const header = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";
  return header.split(",")[0]?.trim() || "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const code = String(body?.code || "").trim();
    const slug = String(body?.slug || "").trim();
    const honeypot = String(body?.company || "").trim();
    if (honeypot) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    if (!code || !slug) {
      return NextResponse.json({ error: "Missing form information" }, { status: 400 });
    }

    const { client: admin } = getSupabaseAdminClient();

    const { data: formRows } = await admin
      .from("influencer_referral_forms")
      .select("id, referral_code")
      .eq("referral_code", code)
      .eq("slug", slug)
      .limit(1);

    const form = formRows?.[0];
    if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim();
    const destination = String(body?.destination || "").trim();
    const startDate = body?.startDate ? String(body.startDate).slice(0, 10) : "";
    const endDate = body?.endDate ? String(body.endDate).slice(0, 10) : "";
    const budget = String(body?.budget || "").trim();
    const notes = String(body?.notes || "").trim();
    const phone = String(body?.phone || "").trim();

    if (!name || !email || !destination) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "";

    if (ipAddress) {
      const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { data: recent } = await admin
        .from("influencer_referral_leads")
        .select("id")
        .eq("form_id", form.id)
        .eq("ip_address", ipAddress)
        .gte("created_at", tenMinAgo);
      if ((recent || []).length >= 5) {
        return NextResponse.json({ error: "Too many submissions" }, { status: 429 });
      }
    }

    const id = `inf-lead-${crypto.randomUUID()}`;
    const { data, error } = await admin
      .from("influencer_referral_leads")
      .insert({
        id,
        form_id: form.id,
        influencer_id: form.referral_code,
        referral_code: form.referral_code,
        traveler_name: name,
        traveler_email: email,
        phone: phone || null,
        destination,
        start_date: startDate || null,
        end_date: endDate || null,
        budget: budget || null,
        notes: notes || null,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
        created_at: new Date().toISOString(),
      })
      .select("id, created_at")
      .single();

    if (error) {
      console.error("Supabase lead insert error", { message: error.message });
      return NextResponse.json({ error: "Failed to submit referral" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to submit referral" }, { status: 500 });
  }
}

export const runtime = "nodejs";
