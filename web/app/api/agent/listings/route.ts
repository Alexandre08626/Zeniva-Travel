import { NextResponse } from "next/server";

import { listings } from "../../../../src/lib/devPartnerStore";
import { hasRbacPermission, normalizeRbacRoles } from "../../../../src/lib/rbac";
import { getSessionCookieName, verifySession } from "../../../../src/lib/server/auth";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

type ListingType = "yacht" | "hotel" | "home";

const hasSupabaseEnv = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY) &&
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

function getCookieValue(cookieHeader: string, name: string) {
  return (
    cookieHeader
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${name}=`))
      ?.split("=")[1] || ""
  );
}

function normalizeImages(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[\n,]+/g)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [] as string[];
}

function normalizeType(value: unknown): ListingType | null {
  const type = String(value || "").toLowerCase().trim();
  if (type === "yacht" || type === "hotel" || type === "home") return type;
  return null;
}

async function getAccountIdByEmail(email: string) {
  const { client } = getSupabaseAdminClient();
  const { data, error } = await client
    .from("accounts")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  if (error) throw new Error(error.message || "Failed to resolve account");
  return data?.id || null;
}

export async function POST(request: Request) {
  try {
    const cookies = request.headers.get("cookie") || "";
    const token = getCookieValue(cookies, getSessionCookieName());
    const session = verifySession(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const roles = normalizeRbacRoles(session.roles || []);
    const isAdmin = roles.includes("hq") || roles.includes("admin");
    const canManageYachts = hasRbacPermission("yacht_listings:manage", { roles: session.roles });

    if (!canManageYachts) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payload = await request.json().catch(() => null);
    if (!payload) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    const type = normalizeType(payload.type);
    if (!type) return NextResponse.json({ error: "Invalid listing type" }, { status: 400 });

    if (type !== "yacht" && !isAdmin) {
      return NextResponse.json({ error: "Only admin can create hotel or short-term rental listings" }, { status: 403 });
    }

    const title = String(payload.title || "").trim();
    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const description = String(payload.description || "").trim();
    const location = String(payload.location || "").trim();
    const currency = String(payload.currency || "USD").toUpperCase();
    const priceInput = payload.price;
    const numericPrice = typeof priceInput === "number" ? priceInput : Number(priceInput || 0) || 0;
    const capacity = Number(payload.capacity || 0) || 0;
    const bedrooms = Number(payload.bedrooms || 0) || 0;
    const bathrooms = Number(payload.bathrooms || 0) || 0;
    const partnerId = String(payload.partnerId || "").trim() || undefined;
    const images = normalizeImages(payload.images);
    const thumbnail = String(payload.thumbnail || images[0] || "").trim();
    const now = new Date().toISOString();

    if (type === "yacht") {
      if (!hasSupabaseEnv()) {
        return NextResponse.json({ error: "Supabase not configured for yacht listings" }, { status: 500 });
      }

      const accountId = isAdmin && payload.brokerUserId
        ? String(payload.brokerUserId)
        : await getAccountIdByEmail(session.email);

      if (!accountId) return NextResponse.json({ error: "Account not found" }, { status: 404 });

      const data = {
        title,
        description,
        location,
        destination: location,
        price: numericPrice || undefined,
        currency,
        prices: numericPrice ? [`${currency} ${numericPrice}`] : [],
        thumbnail,
        images,
        capacity: capacity || undefined,
        bedrooms: bedrooms || undefined,
        bathrooms: bathrooms || undefined,
        partnerId,
        createdByAgent: true,
        createdByAgentEmail: session.email,
        createdByAgentAt: now,
      };

      const { client } = getSupabaseAdminClient();
      const { data: created, error } = await client
        .from("yacht_listings")
        .insert({
          broker_user_id: accountId,
          broker_email: session.email,
          type: "yacht",
          title,
          status: "published",
          data,
          updated_at: now,
          published_at: now,
        })
        .select("id, broker_user_id, broker_email, type, title, status, data, created_at, updated_at")
        .single();

      if (error) {
        return NextResponse.json({ error: error.message || "Failed to create yacht listing" }, { status: 500 });
      }

      return NextResponse.json({ data: created }, { status: 201 });
    }

    const createdListing = {
      id: `agent-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      partnerId,
      title,
      type,
      status: "published",
      thumbnail,
      images,
      location,
      price: numericPrice || undefined,
      currency,
      description,
      amenities: normalizeImages(payload.amenities),
      capacity: capacity || undefined,
      bedrooms: bedrooms || undefined,
      bathrooms: bathrooms || undefined,
      createdAt: now,
      updatedAt: now,
      createdByAgent: true,
      createdByAgentEmail: session.email,
      createdByAgentAt: now,
    };

    listings.unshift(createdListing);

    return NextResponse.json({ data: createdListing }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to create listing" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";