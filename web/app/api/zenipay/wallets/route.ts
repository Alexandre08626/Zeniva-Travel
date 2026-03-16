import { NextResponse } from "next/server";

export async function GET() {
  // Mock wallet balances — replace with Supabase queries
  return NextResponse.json({
    platform_wallet:   { available: 9430, pending: 2340, paid: 47890, currency: "USD" },
    agent_wallet:      { available: 4723, pending: 1890, paid: 28450, currency: "USD" },
    influencer_wallet: { available: 5205, pending: 820,  paid: 12300, currency: "USD" },
    supplier_wallet:   { available: 28140, pending: 8920, paid: 142300, currency: "USD" },
  });
}
