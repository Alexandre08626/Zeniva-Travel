import { NextResponse } from "next/server";
import { listings } from "../../../../src/lib/devPartnerStore";
import { getSupabaseAnonClient } from "../../../../src/lib/supabase/server";

const hasSupabaseEnv = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type");

  if (type === "yacht" && hasSupabaseEnv()) {
    const { client } = getSupabaseAnonClient();
    const { data, error } = await client
      .from("yacht_listings")
      .select("id, broker_user_id, type, title, status, data, created_at, updated_at")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mapped = (data || []).map((row) => ({
      id: row.id,
      partnerId: row.broker_user_id,
      type: row.type || "yacht",
      title: row.title,
      status: row.status,
      data: row.data || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ data: mapped });
  }

  // only published listings are public
  let results = listings.filter((l) => l.status === "published");
  if (type) results = results.filter((l) => l.type === type);

  return NextResponse.json({ data: results });
}
