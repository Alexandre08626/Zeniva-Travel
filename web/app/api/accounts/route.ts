import { NextResponse } from "next/server";
import { normalizeEmail } from "../../../src/lib/server/db";
import { getSupabaseAdminClient } from "../../../src/lib/supabase/server";
import { requireRbacPermission } from "../../../src/lib/server/rbac";

type AccountRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  divisions?: string[];
  status?: "active" | "disabled" | "suspended";
  createdAt: string;
};

function mapAccountRow(row: any): AccountRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    roles: row.roles || undefined,
    divisions: row.divisions || undefined,
    status: row.status || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  try {
    const gate = await requireRbacPermission(request, "accounts:manage");
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
    const { client } = getSupabaseAdminClient();
    const { data, error } = await client
      .from("accounts")
      .select("id, name, email, role, roles, divisions, status, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ data: (data || []).map(mapAccountRow) });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to read accounts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const gate = await requireRbacPermission(request, "accounts:manage");
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
    const { client } = getSupabaseAdminClient();
    const body = await request.json();
    const required = ["name", "email", "role"];
    const missing = required.filter((k) => !body?.[k]);
    if (missing.length) {
      return NextResponse.json({ error: `Missing fields: ${missing.join(", ")}` }, { status: 400 });
    }

    const email = normalizeEmail(String(body.email));
    const name = String(body.name).trim() || "Agent";
    const role = String(body.role);
    const roles = Array.isArray(body.roles) ? body.roles : undefined;
    const divisions = Array.isArray(body.divisions) ? body.divisions : undefined;
    const status = body.status === "suspended" ? "suspended" : body.status === "disabled" ? "disabled" : "active";

    const { data: existingData, error: existingError } = await client
      .from("accounts")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (existingError) throw existingError;

    if (existingData) {
      const { data: updatedData, error: updateError } = await client
        .from("accounts")
        .update({
          name,
          role,
          roles: roles || null,
          divisions: divisions || null,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("email", email)
        .select("id, name, email, role, roles, divisions, status, created_at")
        .single();
      if (updateError) throw updateError;
      const record = mapAccountRow(updatedData);
      console.log(`ACCOUNT UPDATED: id=${record.id} email=${record.email}`);
      return NextResponse.json({ data: record });
    }

    const id = `acct-${email.replace(/[^a-z0-9]/gi, "-")}`;
    const { data: insertedData, error: insertError } = await client
      .from("accounts")
      .insert({
        id,
        name,
        email,
        role,
        roles: roles || null,
        divisions: divisions || null,
        status,
        created_at: new Date().toISOString(),
      })
      .select("id, name, email, role, roles, divisions, status, created_at")
      .single();
    if (insertError) throw insertError;
    const record = mapAccountRow(insertedData);
    console.log(`ACCOUNT CREATED: id=${record.id} email=${record.email}`);
    return NextResponse.json({ data: record }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save account" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const gate = await requireRbacPermission(request, "accounts:manage");
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
    const { client } = getSupabaseAdminClient();
    const url = new URL(request.url);
    const emailParam = url.searchParams.get("email") || "";
    const email = normalizeEmail(String(emailParam));
    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const { error } = await client
      .from("accounts")
      .delete()
      .eq("email", email);
    if (error) throw error;

    return NextResponse.json({ ok: true, deleted: email });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to delete account" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
