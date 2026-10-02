import { NextRequest, NextResponse } from "next/server";
import { saveTravelLead } from "@/lib/travel-lead";

export async function POST(req: NextRequest) {
  try {
    const { firstName, email, destination, ref } = await req.json();
    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return NextResponse.json({ ok: false, error: "Email required" }, { status: 400 });
    }
    const refCode = String(ref || "").slice(0, 60);
    const result = await saveTravelLead({
      name: String(firstName || ""),
      email: cleanEmail,
      destination: String(destination || ""),
      source: refCode === "marco" ? "marco-facebook" : `social-${refCode || "direct"}`,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed" }, { status: 500 });
  }
}
