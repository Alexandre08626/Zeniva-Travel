import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/src/lib/supabase/server";
import { verifySession, getSessionCookieName } from "@/src/lib/server/auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { client } = getSupabaseAdminClient();
    const ck = req.headers.get("cookie") || "";
    const cn = getSessionCookieName();
    const m = ck.match(new RegExp(cn + "=([^;]+)"));
    const t = m?.[1];
    const session = t ? verifySession(t) : null;
    if (!session?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: profile } = await client.from("profiles").select("id").eq("account_email", session.email).single();
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    const slug = (body.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (!body.name || !slug) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const { data: existing } = await client.from("agencies").select("id").eq("slug", slug).single();
    if (existing) return NextResponse.json({ error: "Slug taken" }, { status: 409 });
    const { data: agency, error } = await client.from("agencies").insert({
      name: body.name, slug, domain: body.domain || null,
      contact_email: body.contactEmail || session.email,
      contact_phone: body.phone || null,
      primary_color: body.primaryColor || "#0f766e",
      secondary_color: body.secondaryColor || "#f0fdfa",
      owner_id: profile.id, is_active: true, setup_fee_paid: false,
      config: { suppliers: body.suppliers || [], lina_greeting: body.greeting || "", lina_language: body.language || "en", widget_position: body.widgetPosition || "bottom-right", branding: { show_zeniva_badge: true } },
    }).select("id").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await client.from("profiles").update({ agency_id: agency.id }).eq("id", profile.id);
    return NextResponse.json({ ok: true, agencyId: agency.id, slug });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
