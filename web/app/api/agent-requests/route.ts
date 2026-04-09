import { NextResponse } from "next/server";
import crypto from "crypto";
import { normalizeEmail } from "../../../src/lib/server/db";
import { getSupabaseAdminClient } from "../../../src/lib/supabase/server";
import { getSessionCookieName, verifySession } from "../../../src/lib/server/auth";
import { requireRbacPermission } from "../../../src/lib/server/rbac";

function getSessionFromRequest(request: Request) {
  const cookies = request.headers.get("cookie") || "";
  const sessionToken = cookies
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${getSessionCookieName()}=`))
    ?.split("=")[1] || "";
  return verifySession(sessionToken);
}

function makeCode(role: string) {
  const prefix = role === "hq" ? "Z-HQ" : role === "admin" ? "ZA" : role === "yacht_broker" ? "ZY" : role === "influencer" ? "ZI" : "ZT";
  const seed = crypto.randomBytes(3).toString("hex");
  return `${prefix}-${seed.toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    const { client } = getSupabaseAdminClient();
    const body = await request.json();
    const name = String(body?.name || "").trim();
    const email = normalizeEmail(String(body?.email || ""));
    const role = String(body?.role || "travel_agent").trim();
    const note = String(body?.note || "").trim() || null;

    if (!email || !name) {
      return NextResponse.json({ ok: false, error: "Missing name or email" }, { status: 400 });
    }

    const { data: existingData, error: existingError } = await client
      .from("agent_requests")
      .select("id, status, code")
      .ilike("email", email)
      .in("status", ["pending", "approved"])
      .order("requested_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existingData) {
      return NextResponse.json({ ok: true, status: existingData.status, code: existingData.code || null, id: existingData.id });
    }

    const id = crypto.randomUUID();
    const { error: insertError } = await client
      .from("agent_requests")
      .insert({ id, name, email, role, status: "pending", note });
    if (insertError) throw insertError;

    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed to submit request" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const gate = await requireRbacPermission(request, "accounts:manage");
  if (!gate.ok) {
    return NextResponse.json({ ok: false, error: gate.error }, { status: gate.status });
  }
  try {
    const { client } = getSupabaseAdminClient();
    const { data, error } = await client
      .from("agent_requests")
      .select("id, name, email, role, status, code, note, requested_at, reviewed_at, reviewed_by, completed_at")
      .order("requested_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ ok: true, data: data || [] });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed to load requests" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const gate = await requireRbacPermission(request, "accounts:manage");
  if (!gate.ok) {
    return NextResponse.json({ ok: false, error: gate.error }, { status: gate.status });
  }
  try {
    const { client } = getSupabaseAdminClient();
    const body = await request.json();
    const id = String(body?.id || "").trim();
    const action = String(body?.action || "").trim();
    const note = String(body?.note || "").trim() || null;

    if (!id || !action) {
      return NextResponse.json({ ok: false, error: "Missing id or action" }, { status: 400 });
    }

    const { data: currentData, error: currentError } = await client
      .from("agent_requests")
      .select("id, role, status, code")
      .eq("id", id)
      .maybeSingle();
    if (currentError) throw currentError;
    if (!currentData) {
      return NextResponse.json({ ok: false, error: "Request not found" }, { status: 404 });
    }

    if (action === "approve") {
      const role = currentData.role || "travel_agent";
      const code = currentData.code || makeCode(role);
      const updateFields: any = {
        status: "approved",
        code,
        reviewed_at: new Date().toISOString(),
        reviewed_by: gate.session?.email || null,
      };
      if (note) updateFields.note = note;
      const { data: updatedData, error: updateError } = await client
        .from("agent_requests")
        .update(updateFields)
        .eq("id", id)
        .select("id, name, email, role, status, code, note, requested_at, reviewed_at, reviewed_by, completed_at")
        .single();
      if (updateError) throw updateError;
      return NextResponse.json({ ok: true, data: updatedData });
    }

    if (action === "reject") {
      const updateFields: any = {
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: gate.session?.email || null,
      };
      if (note) updateFields.note = note;
      const { data: updatedData, error: updateError } = await client
        .from("agent_requests")
        .update(updateFields)
        .eq("id", id)
        .select("id, name, email, role, status, code, note, requested_at, reviewed_at, reviewed_by, completed_at")
        .single();
      if (updateError) throw updateError;
      return NextResponse.json({ ok: true, data: updatedData });
    }

    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed to update request" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
