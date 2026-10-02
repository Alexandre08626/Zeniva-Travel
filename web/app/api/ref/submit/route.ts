import { NextResponse } from "next/server";
import { saveTravelLead } from "@/lib/travel-lead";

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

    // Lead + referral code saved in Supabase `leads` (the old VPS no longer answers).
    await saveTravelLead({
      name,
      email,
      phone,
      destination,
      source: `influencer_referral:${String(refCode || "").slice(0, 60)}`,
      details: message,
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("Ref submit error:", err);
    return NextResponse.json({ error: (err as Error)?.message || "Failed to submit" }, { status: 500 });
  }
}

export const runtime = "nodejs";
