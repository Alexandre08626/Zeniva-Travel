import { NextRequest, NextResponse } from "next/server";

const VPS_BASE = "https://vmi3097009.contaboserver.net";
const AUTH = "Bearer zeniva-secret-2025";

export async function POST(req: NextRequest) {
  try {
    const { firstName, email, destination, ref } = await req.json();
    if (!email) return NextResponse.json({ ok: false, error: "Email required" }, { status: 400 });

    // Save lead to VPS → Supabase with REAL email
    const res = await fetch(`${VPS_BASE}/admin/leads`, {
      method: "POST",
      headers: { Authorization: AUTH, "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: firstName || "Visitor",
        email: email,
        destination: destination || null,
        source: ref === "marco" ? "marco-facebook" : `social-${ref}`,
        source_ref: ref,
        status: "new",
        language: "en",
        deal_value: 1500,
      }),
    });

    const data = await res.json();
    return NextResponse.json({ ok: true, lead_id: data.id });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
