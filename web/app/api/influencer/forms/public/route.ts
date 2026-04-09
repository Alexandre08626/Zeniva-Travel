import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../../src/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code") || "";
    const slug = url.searchParams.get("slug") || "";

    if (!code || !slug) {
      return NextResponse.json({ error: "Missing code or slug" }, { status: 400 });
    }

    const { client: admin } = getSupabaseAdminClient();
    const { data, error } = await admin
      .from("influencer_referral_forms")
      .select("id, slug, title, created_at")
      .eq("referral_code", code)
      .eq("slug", slug)
      .limit(1);

    if (error) {
      console.error("Supabase form fetch error", { message: error.message });
      return NextResponse.json({ error: "Failed to load form" }, { status: 500 });
    }

    if (!data?.[0]) return NextResponse.json({ error: "Form not found" }, { status: 404 });

    return NextResponse.json({ data: data[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load form" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
