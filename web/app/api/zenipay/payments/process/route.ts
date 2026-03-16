export const dynamic = "force-dynamic";

/**
 * ZeniPay — Payment Processing Route
 * Architecture: Zeniva → ZeniPay → Finix → Card Network → Zeniva Bank Account
 * 
 * FLOW:
 * 1. Receive card data from ZeniPay checkout
 * 2. Tokenize card via Finix (never store raw card numbers)
 * 3. Create transfer via Finix
 * 4. 100% of funds go to Zeniva Travel Platform Wallet
 * 5. Admin manually distributes to agents/suppliers when needed
 * 6. Redirect client to /booking/confirmation
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      payment_id,
      amount,
      currency = "USD",
      card_number,
      expiry_month,
      expiry_year,
      cvc,
      cardholder_name,
      billing_zip,
      description,
    } = body;

    if (!payment_id || !amount) {
      return Response.json({ error: "Missing required fields: payment_id and amount" }, { status: 400 });
    }

    const amountCents = Math.round(parseFloat(amount) * 100);

    // ── FINIX GATEWAY ──────────────────────────────────────────────
    if (card_number && expiry_month && expiry_year && cvc) {
      const { processPayment } = await import("../../../../../modules/zenipay/gateways/index");

      const result = await processPayment({
        cardNumber: card_number,
        expiryMonth: expiry_month,
        expiryYear: expiry_year,
        cvc,
        cardholderName: cardholder_name || "Cardholder",
        postalCode: billing_zip || "00000",
        amount: amountCents,
        currency,
        description: description || `ZeniPay Payment ${payment_id}`,
      });

      if (!result.success) {
        return Response.json({
          success: false,
          error: result.error || "Payment declined. Please try another card.",
        }, { status: 402 });
      }

      /**
       * WALLET DISTRIBUTION — Real Mode
       * 100% of payment goes to Zeniva Travel Platform Wallet.
       * Admin manually decides when to pay agents, suppliers, influencers.
       * 
       * Future: when agent system is live, auto-split will be:
       *   Agent commission:     10.4%
       *   Influencer referral:   1.95%
       *   Platform margin:       2.96%
       *   Supplier amount:      remainder
       */
      const totalAmount = parseFloat(amount);
      console.log(`[ZeniPay] Payment SUCCESS — $${totalAmount} USD → Platform Wallet`);
      console.log(`[ZeniPay] Finix Transfer ID: ${result.transactionId}`);
      console.log(`[ZeniPay] Payment ID: ${payment_id}`);

      return Response.json({
        success: true,
        payment_id,
        transaction_id: result.transactionId,
        amount: totalAmount,
        currency,
        status: "succeeded",
        gateway: "Finix",
        wallet: "platform",
        message: `$${totalAmount} received. Funds added to Zeniva Travel Platform Wallet.`,
        confirmation_url: `/booking/confirmation?ref=${payment_id}&total=$${totalAmount}&trip=${encodeURIComponent(description || "Zeniva Travel Booking")}`,
      });
    }

    // ── ACH / PAY LATER ────────────────────────────────────────────
    return Response.json({
      success: true,
      payment_id,
      status: "pending",
      message: "Reserve confirmed. Payment due at check-in.",
      confirmation_url: `/booking/confirmation?ref=${payment_id}&total=$${amount}&trip=${encodeURIComponent(description || "Zeniva Travel Booking")}&payment=pending`,
    });

  } catch (err) {
    console.error("[ZeniPay] Process error:", err);
    return Response.json({
      success: false,
      error: "Payment processing error. Please try again or contact support.",
    }, { status: 500 });
  }
}
