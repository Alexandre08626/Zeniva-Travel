import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSessionCookieName, verifySession } from "../../../../src/lib/server/auth";
import { buildInfluencerCode } from "../../../../src/lib/influencerShared";
import { requireRbacPermission } from "../../../../src/lib/server/rbac";
import { normalizeRbacRole } from "../../../../src/lib/rbac";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

function getSession(request: Request) {
  const cookies = request.headers.get("cookie") || "";
  const token = cookies
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${getSessionCookieName()}=`))
    ?.split("=")[1] || "";
  return verifySession(token);
}

function isAdminRole(roles: string[]) {
  const normalized = roles.map((role) => normalizeRbacRole(role)).filter(Boolean) as string[];
  return normalized.includes("hq") || normalized.includes("admin");
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

async function resolveReferralCode(request: Request, bodyEmail?: string) {
  const session = getSession(request);
  if (!session) return null;
  const url = new URL(request.url);
  const queryCode = url.searchParams.get("code") || "";
  const queryEmail = url.searchParams.get("email") || "";
  const roles = Array.isArray(session.roles) ? session.roles : [];
  const isAdmin = isAdminRole(roles);
  if (isAdmin && queryCode) return queryCode;
  if (isAdmin && queryEmail) return buildInfluencerCode(queryEmail);
  if (isAdmin && bodyEmail) return buildInfluencerCode(bodyEmail);
  return buildInfluencerCode(session.email);
}

export async function GET(request: Request) {
  try {
    const gate = await requireRbacPermission(request, "referrals:read");
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
    const referralCode = await resolveReferralCode(request);
    if (!referralCode) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { client: admin } = getSupabaseAdminClient();
    const { data, error } = await admin
      .from("influencer_referral_forms")
      .select("id, slug, title, created_at")
      .eq("referral_code", referralCode)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase forms fetch error", { message: error.message });
      return NextResponse.json({ error: "Failed to load forms" }, { status: 500 });
    }

    return NextResponse.json({ data: data || [], referralCode });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load forms" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const gate = await requireRbacPermission(request, "referrals:read");
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
    const body = await request.json();
    const referralCode = await resolveReferralCode(request, body?.email ? String(body.email) : undefined);
    if (!referralCode) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const title = String(body?.title || "").trim();
    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const baseSlug = toSlug(body?.slug ? String(body.slug) : title) || "referral";
    let slug = baseSlug;

    const { client: admin } = getSupabaseAdminClient();

    const { data: existingData } = await admin
      .from("influencer_referral_forms")
      .select("id")
      .eq("referral_code", referralCode)
      .eq("slug", slug)
      .limit(1);

    if ((existingData || []).length) {
      slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    const id = `inf-form-${crypto.randomUUID()}`;
    const { data, error } = await admin
      .from("influencer_referral_forms")
      .insert({
        id,
        influencer_id: referralCode,
        referral_code: referralCode,
        slug,
        title,
        created_at: new Date().toISOString(),
      })
      .select("id, slug, title, created_at")
      .single();

    if (error) {
      console.error("Supabase form insert error", { message: error.message });
      return NextResponse.json({ error: "Failed to create form" }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to create form" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
