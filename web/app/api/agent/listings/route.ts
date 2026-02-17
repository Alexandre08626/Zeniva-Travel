import { NextResponse } from "next/server";

import { listings } from "../../../../src/lib/devPartnerStore";
import { hasRbacPermission, normalizeRbacRoles } from "../../../../src/lib/rbac";
import { getSessionCookieName, verifySession } from "../../../../src/lib/server/auth";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";
import { resortPartners } from "../../../../src/data/partners/resorts";
import ycnData from "../../../../src/data/ycn_packages.json";

type ListingType = "yacht" | "hotel" | "home";
type ListingStatus = "published" | "draft" | "archived";
type WorkflowStatus = "in_progress" | "completed" | "paused";

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

function normalizeStatus(value: unknown): ListingStatus {
  const status = String(value || "published").toLowerCase().trim();
  if (status === "published" || status === "draft" || status === "archived") return status;
  return "published";
}

function normalizeWorkflowStatus(value: unknown): WorkflowStatus {
  const status = String(value || "in_progress").toLowerCase().trim();
  if (status === "completed" || status === "paused") return status;
  return "in_progress";
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

function requireAgentSession(request: Request) {
  const cookies = request.headers.get("cookie") || "";
  const token = getCookieValue(cookies, getSessionCookieName());
  const session = verifySession(token);
  if (!session) {
    return { ok: false as const, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const roles = normalizeRbacRoles(session.roles || []);
  if (!roles.length) {
    return { ok: false as const, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  const isAdmin = roles.includes("hq") || roles.includes("admin");
  const canManageYachts = hasRbacPermission("yacht_listings:manage", { roles: session.roles });

  return { ok: true as const, session, roles, isAdmin, canManageYachts };
}

export async function GET(request: Request) {
  try {
    const gate = requireAgentSession(request);
    if (!gate.ok) return gate.error;

    const catalogListings = listings.map((item: any) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      status: item.status || "published",
      workflowStatus: item.workflowStatus || "in_progress",
      data: {
        title: item.title,
        location: item.location || "",
        destination: item.location || "",
        description: item.description || "",
        price: item.price,
        currency: item.currency,
        images: Array.isArray(item.images) ? item.images : item.thumbnail ? [item.thumbnail] : [],
        thumbnail: item.thumbnail || (Array.isArray(item.images) ? item.images[0] : "") || "",
        capacity: item.capacity,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        partnerId: item.partnerId,
        createdByAgent: Boolean(item.createdByAgent),
      },
      source: "catalog",
      editable: true,
      createdAt: item.createdAt || null,
      updatedAt: item.updatedAt || null,
    }));

    const resortListings = resortPartners.map((resort) => ({
      id: `resort-${resort.id}`,
      type: "hotel",
      title: resort.name,
      status: resort.status || "published",
      workflowStatus: "in_progress",
      data: {
        title: resort.name,
        location: resort.destination,
        destination: resort.destination,
        description: resort.description || resort.positioning,
        images: resort.media?.flatMap((group) => group.images) || [],
        thumbnail: resort.media?.[0]?.images?.[0] || "",
      },
      source: "resort",
      editable: false,
      createdAt: null,
      updatedAt: null,
    }));

    const ycnListings = (Array.isArray(ycnData) ? ycnData : []).map((item: any, index: number) => ({
      id: `ycn-${item?.id || index}`,
      type: "yacht",
      title: item?.title || "Yacht Charter",
      status: "published",
      workflowStatus: "in_progress",
      data: {
        title: item?.title || "Yacht Charter",
        location: item?.destination || "",
        destination: item?.destination || "",
        description: "Curated YCN listing",
        prices: item?.prices || [],
        images: item?.images || [],
        thumbnail: item?.thumbnail || (item?.images && item.images[0]) || "",
      },
      source: "ycn",
      editable: false,
      createdAt: null,
      updatedAt: null,
    }));

    let supabaseYachts: any[] = [];
    if (hasSupabaseEnv()) {
      const { client } = getSupabaseAdminClient();
      const { data } = await client
        .from("yacht_listings")
        .select("id, type, title, status, data, created_at, updated_at")
        .order("created_at", { ascending: false });

      supabaseYachts = (data || []).map((item: any) => ({
        id: item.id,
        type: item.type || "yacht",
        title: item.title,
        status: item.status || "published",
        workflowStatus: item?.data?.workflowStatus || "in_progress",
        data: item.data || {},
        source: "partner",
        editable: true,
        createdAt: item.created_at || null,
        updatedAt: item.updated_at || null,
      }));
    }

    return NextResponse.json({
      data: [...catalogListings, ...resortListings, ...ycnListings, ...supabaseYachts],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load listings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const gate = requireAgentSession(request);
    if (!gate.ok) return gate.error;

    const { session, isAdmin, canManageYachts } = gate;
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
    const images = normalizeImages(payload.images || payload.photos);
    const thumbnail = String(payload.thumbnail || images[0] || "").trim();
    const status = normalizeStatus(payload.status);
    const workflowStatus = normalizeWorkflowStatus(payload.workflowStatus);
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
        status,
        workflowStatus,
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
          status,
          data,
          updated_at: now,
          published_at: status === "published" ? now : null,
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
      status,
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
      workflowStatus,
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

export async function PATCH(request: Request) {
  try {
    const gate = requireAgentSession(request);
    if (!gate.ok) return gate.error;

    const { isAdmin, canManageYachts } = gate;
    if (!canManageYachts) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payload = await request.json().catch(() => null);
    if (!payload) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    const id = String(payload.id || "").trim();
    if (!id) return NextResponse.json({ error: "Listing id required" }, { status: 400 });

    const title = String(payload.title || "").trim();
    const location = String(payload.location || "").trim();
    const description = String(payload.description || "").trim();
    const status = normalizeStatus(payload.status);
    const workflowStatus = normalizeWorkflowStatus(payload.workflowStatus);
    const currency = String(payload.currency || "USD").toUpperCase();
    const images = normalizeImages(payload.images || payload.photos);
    const thumbnail = String(payload.thumbnail || images[0] || "").trim();
    const priceValue = payload.price;
    const price = typeof priceValue === "number" ? priceValue : Number(priceValue || 0) || undefined;

    const localIndex = listings.findIndex((item: any) => String(item.id) === id);
    if (localIndex >= 0) {
      const existing = listings[localIndex];
      const localType = normalizeType(payload.type || existing.type);
      if (localType !== "yacht" && !isAdmin) {
        return NextResponse.json({ error: "Only admin can update hotel or short-term rental listings" }, { status: 403 });
      }

      const updated = {
        ...existing,
        title: title || existing.title,
        type: localType || existing.type,
        status,
        workflowStatus,
        location: location || existing.location || "",
        description: description || existing.description || "",
        price: price ?? existing.price,
        currency,
        images: images.length ? images : existing.images || [],
        thumbnail: thumbnail || existing.thumbnail || (images.length ? images[0] : ""),
        capacity: Number(payload.capacity || existing.capacity || 0) || undefined,
        bedrooms: Number(payload.bedrooms || existing.bedrooms || 0) || undefined,
        bathrooms: Number(payload.bathrooms || existing.bathrooms || 0) || undefined,
        partnerId: String(payload.partnerId || existing.partnerId || "") || undefined,
        updatedAt: new Date().toISOString(),
      };

      listings[localIndex] = updated;
      return NextResponse.json({ data: updated });
    }

    if (!hasSupabaseEnv()) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const { client } = getSupabaseAdminClient();
    const { data: existingYacht, error: loadError } = await client
      .from("yacht_listings")
      .select("id, type, title, status, data")
      .eq("id", id)
      .maybeSingle();

    if (loadError) return NextResponse.json({ error: loadError.message }, { status: 500 });
    if (!existingYacht) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    const currentData = typeof existingYacht.data === "object" && existingYacht.data ? existingYacht.data : {};
    const yachtData = {
      ...currentData,
      title: title || existingYacht.title,
      location: location || (currentData as any).location || "",
      destination: location || (currentData as any).destination || (currentData as any).location || "",
      description: description || (currentData as any).description || "",
      currency,
      price: price ?? (currentData as any).price,
      prices: price ? [`${currency} ${price}`] : (currentData as any).prices || [],
      images: images.length ? images : (currentData as any).images || [],
      thumbnail: thumbnail || (currentData as any).thumbnail || (images.length ? images[0] : ""),
      workflowStatus,
      partnerId: String(payload.partnerId || (currentData as any).partnerId || "") || undefined,
      capacity: Number(payload.capacity || (currentData as any).capacity || 0) || undefined,
      bedrooms: Number(payload.bedrooms || (currentData as any).bedrooms || 0) || undefined,
      bathrooms: Number(payload.bathrooms || (currentData as any).bathrooms || 0) || undefined,
    };

    const now = new Date().toISOString();
    const { data: updatedYacht, error: updateError } = await client
      .from("yacht_listings")
      .update({
        title: title || existingYacht.title,
        status,
        data: yachtData,
        updated_at: now,
        published_at: status === "published" ? now : null,
      })
      .eq("id", id)
      .select("id, type, title, status, data, created_at, updated_at")
      .single();

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    return NextResponse.json({ data: updatedYacht });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to update listing" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";