import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { client } = getSupabaseAdminClient();
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const platform = url.searchParams.get("platform");

    let query = client.from("social_posts").select("*").order("created_at", { ascending: false });
    if (status && status !== "all") query = query.eq("status", status);
    if (platform && platform !== "all") query = query.eq("platform", platform);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ posts: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { client } = getSupabaseAdminClient();
    const body = await request.json();
    const { platform, content_text, hashtags, status, scheduled_at } = body;

    if (!platform || !content_text) {
      return NextResponse.json({ error: "Platform and content required" }, { status: 400 });
    }

    const { data, error } = await client
      .from("social_posts")
      .insert({
        platform,
        content_text,
        hashtags: hashtags || [],
        status: status || "draft",
        scheduled_at: scheduled_at || null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ post: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
