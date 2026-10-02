import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../src/lib/supabase/server";
import { sessionFromRequest, isStaffSession, isInternalOrStaff, forbidden } from "@/lib/internal-auth";

const TABLE = "proposals";

const hasSupabaseEnv = () =>
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);

type ProposalPayload = {
  id: string;
  ownerEmail: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  payload?: Record<string, unknown>;
};

export async function GET(request: Request) {
  try {
    if (!hasSupabaseEnv()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }
    const { searchParams } = new URL(request.url);
    const ownerEmail = (searchParams.get("ownerEmail") || "").toLowerCase();
    const id = searchParams.get("id");

    // One trip by its (random) id: open, it's the shareable link. Lists: only the
    // signed-in owner or staff — never the whole table.
    const session = sessionFromRequest(request);
    const staff = isStaffSession(session);
    if (!id) {
      if (!session) return NextResponse.json({ data: [] }, { status: 401 });
      if (!staff && ownerEmail !== String(session.email || "").toLowerCase()) {
        return NextResponse.json({ data: [] }, { status: 403 });
      }
    }

    const { client } = getSupabaseAdminClient();
    let query = client
      .from(TABLE)
      .select("id, trip_id, owner_email, status, created_at, updated_at, payload, destination, title")
      .order("updated_at", { ascending: false })
      .limit(200);

    if (id) {
      query = query.eq("trip_id", id).limit(1);
    } else if (ownerEmail) {
      query = query.eq("owner_email", ownerEmail);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to read proposals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!hasSupabaseEnv()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }
    const body = (await request.json()) as ProposalPayload;
    if (!body?.id || !body?.ownerEmail) {
      return NextResponse.json({ error: "Missing id or ownerEmail" }, { status: 400 });
    }
    const now = new Date().toISOString();
    const record = {
      trip_id: body.id,
      owner_email: body.ownerEmail.toLowerCase(),
      client_email: body.ownerEmail.toLowerCase(),
      status: body.status || "Draft",
      destination: (body.payload as any)?.tripDraft?.destination || "",
      title: (body.payload as any)?.trip?.title || (body.payload as any)?.proposal?.title || "Trip",
      payload: body.payload || {},
      updated_at: body.updatedAt || now,
    };

    const { client } = getSupabaseAdminClient();
    // Check if trip_id exists, update if so
    const { data: existing } = await client.from(TABLE).select("id, payload").eq("trip_id", body.id).limit(1);
    let error;
    // merge: add keys to the stored payload (checkout saves passengers) without touching owner/status.
    if ((body as any).merge && existing && existing.length > 0) {
      // Only traveler data can be merged anonymously — never prices or selections.
      const incoming = (body.payload || {}) as Record<string, unknown>;
      const allowed: Record<string, unknown> = {};
      for (const k of ["passengers", "hotelGuests", "contact"]) if (k in incoming) allowed[k] = incoming[k];
      const merged = { ...((existing[0] as any).payload || {}), ...allowed };
      ({ error } = await client.from(TABLE).update({ payload: merged, updated_at: now }).eq("trip_id", body.id));
      if (error) throw error;
      return NextResponse.json({ data: { trip_id: body.id, merged: true } }, { status: 200 });
    }
    if (existing && existing.length > 0) {
      ({ error } = await client.from(TABLE).update(record).eq("trip_id", body.id));
    } else {
      ({ error } = await client.from(TABLE).insert({ ...record, created_at: now }));
    }
    if (error) throw error;

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save proposal" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isInternalOrStaff(request)) return forbidden();
  try {
    if (!hasSupabaseEnv()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const { client } = getSupabaseAdminClient();
    const { error } = await client.from(TABLE).delete().eq("trip_id", id);
    if (error) throw error;

    return NextResponse.json({ data: { removed: 1 } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to delete proposal" }, { status: 500 });
  }
}
