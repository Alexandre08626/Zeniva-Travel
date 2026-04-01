import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/src/lib/supabase/server";
import { verifySession, getSessionCookieName } from "@/src/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getAuth(req: NextRequest) {
  const ck = req.headers.get("cookie") || "";
  const cn = getSessionCookieName();
  const m = ck.match(new RegExp(cn + "=([^;]+)"));
  const t = m?.[1];
  if (!t) return null;
  const s = verifySession(t);
  return s?.email ? s : null;
}

export async function GET() {
  const { client } = getSupabaseAdminClient();
  const { data, error } = await client
    .from("email_templates")
    .select("*")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, templates: data || [] });
}

export async function POST(req: NextRequest) {
  const session = getAuth(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { client } = getSupabaseAdminClient();

  const record = {
    name: body.name,
    subject: body.subject,
    html_body: body.html_body,
    preview_text: body.preview_text || null,
    audience_type: body.audience_type || "all",
    variables: body.variables || [],
    is_default: false,
  };

  const { data, error } = await client
    .from("email_templates")
    .insert(record)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, template: data });
}
