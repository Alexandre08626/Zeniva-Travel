import { NextResponse } from "next/server";
import { assertBackendEnv, dbQuery } from "../../../../../src/lib/server/db";

export async function GET(request: Request) {
  try {
    assertBackendEnv();
    const url = new URL(request.url);
    const code = url.searchParams.get("code") || "";
    const slug = url.searchParams.get("slug") || "";

    if (!code || !slug) {
      return NextResponse.json({ error: "Missing code or slug" }, { status: 400 });
    }

    const { rows } = await dbQuery(
      "SELECT id, slug, title, created_at FROM influencer_referral_forms WHERE referral_code = $1 AND slug = $2 LIMIT 1",
      [code, slug]
    );

    if (!rows[0]) return NextResponse.json({ error: "Form not found" }, { status: 404 });

    return NextResponse.json({ data: rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load form" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
