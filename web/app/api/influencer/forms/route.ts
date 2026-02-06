import { NextResponse } from "next/server";
import crypto from "crypto";
import { assertBackendEnv, dbQuery } from "../../../../src/lib/server/db";
import { getSessionCookieName, verifySession } from "../../../../src/lib/server/auth";
import { buildInfluencerCode } from "../../../../src/lib/influencerShared";
import { requireRbacPermission } from "../../../../src/lib/server/rbac";
import { normalizeRbacRole } from "../../../../src/lib/rbac";

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
    assertBackendEnv();
    const gate = await requireRbacPermission(request, "referrals:read");
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
    const referralCode = await resolveReferralCode(request);
    if (!referralCode) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { rows } = await dbQuery(
      "SELECT id, slug, title, created_at FROM influencer_referral_forms WHERE referral_code = $1 ORDER BY created_at DESC",
      [referralCode]
    );
    return NextResponse.json({ data: rows, referralCode });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load forms" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    assertBackendEnv();
    const gate = await requireRbacPermission(request, "referrals:read");
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
    const body = await request.json();
    const referralCode = await resolveReferralCode(request, body?.email ? String(body.email) : undefined);
    if (!referralCode) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const title = String(body?.title || "").trim();
    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const baseSlug = toSlug(body?.slug ? String(body.slug) : title) || "referral";
    let slug = baseSlug;

    const existing = await dbQuery(
      "SELECT id FROM influencer_referral_forms WHERE referral_code = $1 AND slug = $2 LIMIT 1",
      [referralCode, slug]
    );
    if (existing.rows.length) {
      slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    const id = `inf-form-${crypto.randomUUID()}`;
    const { rows } = await dbQuery(
      "INSERT INTO influencer_referral_forms (id, influencer_id, referral_code, slug, title, created_at) VALUES ($1,$2,$3,$4,$5, now()) RETURNING id, slug, title, created_at",
      [id, referralCode, referralCode, slug, title]
    );

    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to create form" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
