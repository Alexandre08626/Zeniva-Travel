import { NextResponse } from "next/server";
import crypto from "crypto";
import { assertBackendEnv, dbQuery } from "../../../../../src/lib/server/db";

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
    const honeypot = String(body?.company || "").trim();
    if (honeypot) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    if (!code || !slug) {
      return NextResponse.json({ error: "Missing form information" }, { status: 400 });
    }

    const { rows: formRows } = await dbQuery(
      "SELECT id, referral_code FROM influencer_referral_forms WHERE referral_code = $1 AND slug = $2 LIMIT 1",
      [code, slug]
    );
    const form = formRows[0];
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
      const { rows: recent } = await dbQuery(
        "SELECT id FROM influencer_referral_leads WHERE form_id = $1 AND ip_address = $2 AND created_at > now() - interval '10 minutes'",
        [form.id, ipAddress]
      );
      if (recent.length >= 5) {
        return NextResponse.json({ error: "Too many submissions" }, { status: 429 });
      }
    }

    const id = `inf-lead-${crypto.randomUUID()}`;
    const { rows } = await dbQuery(
      "INSERT INTO influencer_referral_leads (id, form_id, influencer_id, referral_code, traveler_name, traveler_email, phone, destination, start_date, end_date, budget, notes, ip_address, user_agent, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14, now()) RETURNING id, created_at",
      [
        id,
        form.id,
        form.referral_code,
        form.referral_code,
        name,
        email,
        phone || null,
        destination,
        startDate || null,
        endDate || null,
        budget || null,
        notes || null,
        ipAddress || null,
        userAgent || null,
      ]
    );

    return NextResponse.json({ ok: true, data: rows[0] }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to submit referral" }, { status: 500 });
  }
}

export const runtime = "nodejs";
