import { NextRequest, NextResponse } from "next/server";

/**
 * ZeniPay Payment Processor — Authorize.net Gateway
 * 
 * Accepts Accept.js opaque data (tokenized card — NEVER raw card numbers)
 * Processes payment via Authorize.net → returns transaction record + wallet updates
 */

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const {
    payment_id,
    amount,
    currency = "USD",
    payment_method = "card",
    // Accept.js opaque data (from frontend tokenization — PCI compliant)
    opaque_data_descriptor,
    opaque_data_value,
    customer_email,
    customer_name,
    description,
  } = await req.json();

  if (!payment_id || !amount) {
    return NextResponse.json({ status: "failed", error: "Missing required fields" }, { status: 400 });
  }

  try {
    // === AUTHORIZE.NET GATEWAY CALL ===
    const { processAuthNetPayment } = await import("../../../../../modules/zenipay/gateways/authorizenet");
    const gatewayResult = await processAuthNetPayment({
      opaqueDataDescriptor: opaque_data_descriptor || "COMMON.ACCEPT.INAPP.PAYMENT",
      opaqueDataValue: opaque_data_value || `acceptjs_token_${Date.now()}`,
      amount,
      currency,
      customerEmail: customer_email || "",
      customerName: customer_name || "",
      description: description || "Zeniva Travel Booking",
      invoiceNumber: payment_id,
    });

    if (!gatewayResult.success) {
      return NextResponse.json({
        status: "failed",
        payment_id,
        error: gatewayResult.errorMessage || "Payment declined",
        errorCode: gatewayResult.errorCode,
      }, { status: 402 });
    }

    // === ZENIPAY TRANSACTION RECORD ===
    const transaction = {
      transaction_id: `TXN-${Date.now().toString(36).toUpperCase()}`,
      payment_id,
      gateway_transaction_id: gatewayResult.transactionId, // Processor token — no card data stored
      amount,
      currency,
      status: "completed",
      payment_method,
      gateway: "authorizenet",
      avs_result: gatewayResult.avsResultCode,
      cvv_result: gatewayResult.cvvResultCode,
      created_at: new Date().toISOString(),
    };

    // === COMMISSION DISTRIBUTION (Zeniva Marketplace Logic) ===
    const agentCommission  = Number((amount * 0.104).toFixed(2));   // 10.4% → Agent
    const influencerRef    = Number((amount * 0.0195).toFixed(2));  // 1.95% → Influencer
    const platformMargin   = Number((amount * 0.0296).toFixed(2));  // 2.96% → Platform
    const supplierPayout   = Number((amount - agentCommission - influencerRef - platformMargin).toFixed(2));

    const walletUpdates = {
      platform_wallet:   { credited: platformMargin, currency },
      agent_wallet:      { credited: agentCommission, currency },
      influencer_wallet: { credited: influencerRef, currency },
      supplier_wallet:   { credited: supplierPayout, currency },
    };

    return NextResponse.json({
      status: "completed",
      transaction,
      wallet_updates: walletUpdates,
      gateway_response: {
        transaction_id: gatewayResult.transactionId,
        response_code: gatewayResult.responseCode,
        response_text: gatewayResult.responseText,
        gateway: "authorizenet",
      },
      confirmation_url: `/booking/confirmation/${payment_id}`,
    });

  } catch (err) {
    console.error("[ZeniPay] Payment processing error:", err);
    return NextResponse.json({
      status: "failed",
      payment_id,
      error: "Internal payment processing error",
    }, { status: 500 });
  }
}
