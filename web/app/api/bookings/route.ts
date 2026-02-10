import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../src/lib/supabase/server";

const TABLE = "bookings";

const hasSupabaseEnv = () =>
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);

type BookingPayload = {
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
      .select("id, owner_email, status, created_at, updated_at, payload")
      .order("updated_at", { ascending: false });

    if (ownerEmail) {
      query = query.eq("owner_email", ownerEmail.toLowerCase());
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to read bookings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!hasSupabaseEnv()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }
    const body = (await request.json()) as BookingPayload;
    if (!body?.id || !body?.ownerEmail) {
      return NextResponse.json({ error: "Missing id or ownerEmail" }, { status: 400 });
    }
    const now = new Date().toISOString();
    const record = {
      id: body.id,
      owner_email: body.ownerEmail.toLowerCase(),
      status: body.status || "Confirmed",
      created_at: body.createdAt || now,
      updated_at: body.updatedAt || now,
      payload: body.payload || {},
    };

    const { client } = getSupabaseAdminClient();
    const { error } = await client.from(TABLE).upsert(record, { onConflict: "id" });
    if (error) throw error;

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save booking" }, { status: 500 });
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
    return NextResponse.json({ error: err?.message || "Failed to delete booking" }, { status: 500 });
  }
}
