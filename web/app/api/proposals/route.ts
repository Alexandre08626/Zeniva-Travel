import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../src/lib/supabase/server";

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
    const ownerEmail = searchParams.get("ownerEmail");

    const { client } = getSupabaseAdminClient();
    let query = client
      .from(TABLE)
      .select("id, trip_id, owner_email, status, created_at, updated_at, payload, destination, title, content")
      .order("updated_at", { ascending: false });

    const id = searchParams.get("id");
    if (id) {
      query = query.eq("trip_id", id);
    }
    if (ownerEmail) {
      query = query.eq("owner_email", ownerEmail.toLowerCase());
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
      content: (body.payload as any)?.proposal || {},
      payload: body.payload || {},
      updated_at: body.updatedAt || now,
    };

    const { client } = getSupabaseAdminClient();
    // Check if trip_id exists, update if so
    const { data: existing } = await client.from(TABLE).select("id").eq("trip_id", body.id).limit(1);
    let error;
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
    const { error } = await client.from(TABLE).delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ data: { removed: 1 } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to delete proposal" }, { status: 500 });
  }
}
