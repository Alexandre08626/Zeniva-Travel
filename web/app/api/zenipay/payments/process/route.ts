import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const {
    payment_id, amount, currency = "USD",
    card_number, expiry_month, expiry_year, cvc,
    cardholder_name, billing_zip,
    // ACH fields
    payment_method,
    // Legacy opaque data fields (Authorize.net fallback)
    opaque_data_descriptor, opaque_data_value,
    customer_email, customer_name, description,
  } = await req.json();

  if (!payment_id || !amount) {
    return NextResponse.json({ status: "failed", error: "Missing required fields" }, { status: 400 });
  }

  let transactionId: string;
  let instrumentId: string | undefined;
  let last4: string | undefined;
  let brand: string | undefined;

  try {
    if (payment_method === "ach") {
      // ACH — record pending, no real processing yet
      transactionId = `ACH-${Date.now().toString(36).toUpperCase()}`;
    } else if (card_number && expiry_month && expiry_year && cvc) {
      // Real card payment via Finix
      const { processPayment } = await import("../../../../../../modules/zenipay/gateways/index");
      const result = await processPayment({
        cardNumber: card_number,
        expiryMonth: expiry_month,
        expiryYear: expiry_year,
        cvc,
        cardholderName: cardholder_name || customer_name || "",
        postalCode: billing_zip,
        amount: parseFloat(amount),
        currency,
        description: description || `Zeniva-${payment_id}`,
        paymentId: payment_id,
      });

      if (!result.success) {
        return NextResponse.json({ status: "failed", error: result.error || "Payment declined" }, { status: 402 });
      }

      transactionId = result.transactionId;
      instrumentId = result.instrumentId;
      last4 = result.last4;
      brand = result.brand;
    } else {
      // Sandbox/test mode — no card data sent
      transactionId = `SANDBOX-${Date.now().toString(36).toUpperCase()}`;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Payment processing error";
    console.error("[ZeniPay]", msg);
    return NextResponse.json({ status: "failed", error: msg }, { status: 500 });
  }

  // Commission distribution
  const a = parseFloat(amount);
  const agentCut      = Number((a * 0.104).toFixed(2));
  const influencerCut = Number((a * 0.0195).toFixed(2));
  const platformCut   = Number((a * 0.0296).toFixed(2));
  const supplierPay   = Number((a - agentCut - influencerCut - platformCut).toFixed(2));

  const txnId = `TXN-${Date.now().toString(36).toUpperCase()}`;

  return NextResponse.json({
    status: "completed",
    transaction: {
      id: txnId,
      payment_id,
      gateway: "finix",
      gateway_transaction_id: transactionId,
      instrument_id: instrumentId,
      card_brand: brand,
      card_last4: last4,
      amount: a,
      currency,
      created_at: new Date().toISOString(),
    },
    wallet_updates: {
      platform:   { credited: platformCut },
      agent:      { credited: agentCut },
      influencer: { credited: influencerCut },
      supplier:   { credited: supplierPay },
    },
    confirmation_url: `/booking/confirmation?ref=${payment_id}&total=${a}&trip=${encodeURIComponent(description || "Zeniva Travel")}`,
  });
}
