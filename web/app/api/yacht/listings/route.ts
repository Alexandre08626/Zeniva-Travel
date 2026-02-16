import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";
import { requireRbacPermission } from "../../../../src/lib/server/rbac";
import { normalizeRbacRole } from "../../../../src/lib/rbac";

const hasSupabaseEnv = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY) &&
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

function normalizeRoles(roles: unknown): string[] {
  return Array.isArray(roles) ? roles.filter((role) => typeof role === "string") : [];
}

async function getAccountIdByEmail(email: string) {
  const { client } = getSupabaseAdminClient();
  const { data, error } = await client
    .from("accounts")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  if (error) throw new Error(error.message || "Failed to load account");
  return data?.id || null;
}

function coerceStatus(value: unknown) {
  const normalized = String(value || "").toLowerCase().trim();
  if (normalized === "published" || normalized === "draft" || normalized === "archived") return normalized;
  return "draft";
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

export async function GET(request: Request) {
  try {
    if (!hasSupabaseEnv()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const gate = await requireRbacPermission(request, "yacht_listings:manage");
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

    const roles = normalizeRoles(gate.session.roles);
    const normalized = roles.map((role) => normalizeRbacRole(role)).filter(Boolean) as string[];
    const isAdmin = normalized.includes("hq") || normalized.includes("admin");

    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "";
    const brokerId = url.searchParams.get("brokerId") || "";

    const { client } = getSupabaseAdminClient();
    let query = client
      .from("yacht_listings")
      .select("id, broker_user_id, broker_email, type, title, status, data, created_at, updated_at, published_at")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (isAdmin && brokerId) {
      query = query.eq("broker_user_id", brokerId);
    }

    if (!isAdmin) {
      const accountId = await getAccountIdByEmail(gate.session.email);
      if (!accountId) return NextResponse.json({ error: "Account not found" }, { status: 404 });
      query = query.eq("broker_user_id", accountId);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load yacht listings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!hasSupabaseEnv()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const gate = await requireRbacPermission(request, "yacht_listings:manage");
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

    const payload = await request.json().catch(() => null);
    if (!payload) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    const title = String(payload.title || "").trim();
    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const roles = normalizeRoles(gate.session.roles);
    const normalized = roles.map((role) => normalizeRbacRole(role)).filter(Boolean) as string[];
    const isAdmin = normalized.includes("hq") || normalized.includes("admin");

    const accountId = isAdmin && payload.brokerUserId
      ? String(payload.brokerUserId)
      : await getAccountIdByEmail(gate.session.email);

    if (!accountId) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    const status = coerceStatus(payload.status);
    const currency = String(payload.currency || payload.data?.currency || "USD").toUpperCase();
    const price = payload.price ?? payload.data?.price;
    const numericPrice = typeof price === "number" ? price : Number(price || 0) || undefined;
    const images = normalizeImages(payload.images || payload.data?.images);

    const data = {
      ...(payload.data || {}),
      title,
      location: payload.location || payload.data?.location || "",
      destination: payload.destination || payload.data?.destination || payload.location || payload.data?.location || "",
      description: payload.description || payload.data?.description || "",
      price: numericPrice,
      currency,
      prices: numericPrice ? [`${currency} ${numericPrice}`] : payload.data?.prices || [],
      thumbnail: payload.thumbnail || payload.data?.thumbnail || images[0] || "",
      images,
    };

    const now = new Date().toISOString();
    const insertPayload = {
      broker_user_id: accountId,
      broker_email: gate.session.email,
      type: "yacht",
      title,
      status,
      data,
      updated_at: now,
      published_at: status === "published" ? now : null,
    };

    const { client } = getSupabaseAdminClient();
    const { data: created, error } = await client
      .from("yacht_listings")
      .insert(insertPayload)
      .select("id, broker_user_id, broker_email, type, title, status, data, created_at, updated_at, published_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to create listing" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!hasSupabaseEnv()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const gate = await requireRbacPermission(request, "yacht_listings:manage");
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

    const payload = await request.json().catch(() => null);
    if (!payload) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    const id = String(payload.id || payload.listingId || "").trim();
    if (!id) return NextResponse.json({ error: "Listing id required" }, { status: 400 });

    const roles = normalizeRoles(gate.session.roles);
    const normalized = roles.map((role) => normalizeRbacRole(role)).filter(Boolean) as string[];
    const isAdmin = normalized.includes("hq") || normalized.includes("admin");

    const accountId = isAdmin ? null : await getAccountIdByEmail(gate.session.email);
    if (!isAdmin && !accountId) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    const { client } = getSupabaseAdminClient();
    const { data: existing, error: loadError } = await client
      .from("yacht_listings")
      .select("id, broker_user_id, title, status, data")
      .eq("id", id)
      .maybeSingle();

    if (loadError) return NextResponse.json({ error: loadError.message }, { status: 500 });
    if (!existing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    if (!isAdmin && existing.broker_user_id !== accountId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const status = payload.status ? coerceStatus(payload.status) : existing.status;
    const title = payload.title ? String(payload.title || "").trim() : existing.title;
    const currentData = typeof existing.data === "object" && existing.data ? existing.data : {};

    const currency = String(payload.currency || currentData.currency || "USD").toUpperCase();
    const price = payload.price ?? currentData.price;
    const numericPrice = typeof price === "number" ? price : Number(price || 0) || undefined;
    const images = normalizeImages(payload.images || currentData.images);

    const nextData = {
      ...currentData,
      ...(payload.data || {}),
      title,
      location: payload.location ?? currentData.location ?? "",
      destination: payload.destination ?? currentData.destination ?? payload.location ?? currentData.location ?? "",
      description: payload.description ?? currentData.description ?? "",
      price: numericPrice,
      currency,
      prices: numericPrice ? [`${currency} ${numericPrice}`] : currentData.prices || [],
      thumbnail: payload.thumbnail || currentData.thumbnail || images[0] || "",
      images,
    };

    const now = new Date().toISOString();
    const updatePayload = {
      title,
      status,
      data: nextData,
      updated_at: now,
      published_at: status === "published" ? now : status === "draft" || status === "archived" ? null : undefined,
    };

    const { data: updated, error } = await client
      .from("yacht_listings")
      .update(updatePayload)
      .eq("id", id)
      .select("id, broker_user_id, broker_email, type, title, status, data, created_at, updated_at, published_at")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to update listing" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
