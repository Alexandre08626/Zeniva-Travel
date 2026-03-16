import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    platform_wallet:   { available: 94302.40, pending: 23401.00, paid: 478900.00, currency: "USD" },
    agent_wallet:      { available: 47230.80, pending: 18900.00, paid: 284500.00, currency: "USD" },
    influencer_wallet: { available: 52050.60, pending: 8200.00,  paid: 123000.00, currency: "USD" },
    supplier_wallet:   { available: 281400.00, pending: 89200.00, paid: 1423000.00, currency: "USD" },
  });
}

export async function POST(req: NextRequest) {
  const { entity_type, entity_id, bank_name, account_number_last4, routing_number, account_holder_name, payout_method } = await req.json();
  
  // In production: save to Supabase zenipay_wallets table + create Stripe Express account for payouts
  const walletId = `WAL-${entity_type.slice(0,3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  
  return NextResponse.json({
    wallet_id: walletId,
    entity_type,
    entity_id,
    bank_name,
    account_last4: account_number_last4,
    payout_method: payout_method || "direct_deposit",
    status: "pending_verification",
    message: "Wallet registered. Micro-deposit verification will be sent within 1-2 business days.",
    created_at: new Date().toISOString(),
  });
}
