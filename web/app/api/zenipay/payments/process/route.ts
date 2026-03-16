import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { payment_id, processor_token, amount, currency = "USD", payment_method = "card" } = await req.json();

  // === PROCESSOR (Authorize.net / Global Payments — replace with real SDK) ===
  const processorRef = `PROC-${Math.random().toString(36).slice(2,10).toUpperCase()}`;
  
  const transaction = {
    transaction_id: `TXN-${Date.now().toString(36).toUpperCase()}`,
    payment_id, amount, currency, status: "completed",
    payment_method, processor_reference: processorRef,
    created_at: new Date().toISOString(),
  };

  // Commission distribution
  const agentCommission  = Number((amount * 0.104).toFixed(2));
  const influencerRef    = Number((amount * 0.0195).toFixed(2));
  const platformMargin   = Number((amount * 0.0296).toFixed(2));
  const supplierPayout   = Number((amount - agentCommission - influencerRef - platformMargin).toFixed(2));

  return NextResponse.json({
    status: "completed", transaction,
    wallet_updates: {
      agent_wallet:      { credited: agentCommission },
      influencer_wallet: { credited: influencerRef },
      platform_wallet:   { credited: platformMargin },
      supplier_wallet:   { credited: supplierPayout },
    },
    confirmation_url: `/booking/confirmation/${payment_id}`,
  });
}
