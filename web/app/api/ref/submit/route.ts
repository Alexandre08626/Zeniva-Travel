import { NextResponse } from "next/server";

const VPS_BASE = "http://217.216.88.202:8000";
const VPS_SECRET = "zeniva-secret-2025";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refCode, name, email, phone, destination, startDate, endDate, travelers, budget, notes } = body;

    if (!name || !email || !destination) {
      return NextResponse.json({ error: "Name, email and destination are required" }, { status: 400 });
    }

    // Build a message that includes all trip details
    const message = [
      `I'd like to plan a trip to ${destination}.`,
      startDate ? `Departure: ${startDate}` : "",
      endDate ? `Return: ${endDate}` : "",
      travelers ? `Travelers: ${travelers}` : "",
      budget ? `Budget: ${budget}` : "",
      notes ? `Notes: ${notes}` : "",
    ].filter(Boolean).join(" | ");

    // Submit to VPS chat endpoint — which handles lead extraction + ref attribution
    const res = await fetch(`${VPS_BASE}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${VPS_SECRET}`,
      },
      body: JSON.stringify({
        message,
        session_id: `ref-${refCode}-${Date.now()}`,
        name,
        email,
        phone: phone || null,
        ref: refCode,
        source: "influencer_referral",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`VPS error: ${err}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("Ref submit error:", err);
    return NextResponse.json({ error: (err as Error)?.message || "Failed to submit" }, { status: 500 });
  }
}

export const runtime = "nodejs";
