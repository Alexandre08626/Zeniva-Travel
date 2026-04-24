import { NextResponse } from "next/server";
import crypto from "crypto";
import { normalizeEmail } from "../../../../src/lib/server/db";
import { hashPassword } from "../../../../src/lib/server/auth";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = String(body?.name || "").trim();
    const email = normalizeEmail(String(body?.email || ""));
    const phone = String(body?.phone || "").trim();
    const origin = String(body?.origin || "zenistay_booking");

    if (!email || !name) {
      return NextResponse.json({ ok: false, message: "name and email required" }, { status: 400 });
    }

    const { client } = getSupabaseAdminClient();

    // If account already exists (any status), do nothing.
    const { data: existing } = await client.from("accounts").select("id, status").ilike("email", email).limit(1);
    if (existing && existing.length > 0) {
      return NextResponse.json({ ok: true, existed: true, status: existing[0].status });
    }

    const password = crypto.randomBytes(18).toString("base64url");

    const { data: created, error: createErr } = await client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: "traveler", roles: ["traveler"], origin },
    });

    if (createErr || !created?.user) {
      // If auth user already exists but no accounts row, just stop — nothing to backfill safely.
      return NextResponse.json({ ok: false, message: createErr?.message || "auth create failed" }, { status: 500 });
    }

    const userId = created.user.id;
    const now = new Date().toISOString();

    await client.from("accounts").insert({
      id: userId,
      name,
      email,
      role: "traveler",
      roles: ["traveler"],
      divisions: [],
      status: "active",
      password_hash: hashPassword(password),
      traveler_profile: { origin },
      created_at: now,
    });

    const { data: existingClient } = await client.from("clients").select("id").ilike("email", email).limit(1);
    if (!existingClient || existingClient.length === 0) {
      await client.from("clients").insert({
        id: `C-${userId}`,
        name,
        email,
        owner_email: "info@zenivatravel.com",
        phone: phone || null,
        origin,
        assigned_agents: [],
        primary_division: "TRAVEL",
        created_at: now,
      });
    }

    // Trigger Supabase password reset so the client can set their own password.
    try {
      await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.zenivatravel.com"}/login?reset=1`,
      });
    } catch {
      // best-effort
    }

    // Sofia welcome email — same path the standard signup uses.
    import("../../../../src/lib/server/sofia-emails").then(({ sofiaCongratulations }) => {
      sofiaCongratulations(email, name).catch(() => {});
    }).catch(() => {});

    return NextResponse.json({ ok: true, created: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || "crash" }, { status: 500 });
  }
}
