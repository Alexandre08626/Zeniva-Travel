/**
 * ZeniPay Gateway Abstraction Layer
 * Architecture: Zeniva → ZeniPay → Finix/Tilled → Card Network → Bank
 *
 * Gateway Priority:
 * 1. Finix (if FINIX_MERCHANT_ID configured) - Primary processor
 * 2. Tilled (fallback) - Legacy processor
 */

export interface GatewayResult {
  success: boolean;
  transactionId: string;
  instrumentId?: string;
  brand?: string;
  last4?: string;
  state: string;
  error?: string;
}

export async function processPayment(params: {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  cardholderName: string;
  postalCode?: string;
  amount: number;
  currency?: string;
  description?: string;
  paymentId: string;
}): Promise<GatewayResult> {
  // ── GATEWAY SELECTION ──────────────────────────────────────────────────
  // Priority 1: Finix (primary processor)
  const finixMerchantId = process.env.FINIX_MERCHANT_ID;
  const finixUsername = process.env.FINIX_API_USERNAME;
  const finixPassword = process.env.FINIX_API_PASSWORD;

  if (finixMerchantId && finixUsername && finixPassword) {
    console.log("[ZeniPay] Using Finix gateway");
    const { processFinixPayment } = await import("./finix");

    try {
      const result = await processFinixPayment({
        ...params,
        currency: params.currency?.toUpperCase() || "USD",
        description: params.description || `ZeniPay ${params.paymentId}`,
      });

      return {
        success: result.success,
        transactionId: result.transferId,
        instrumentId: result.instrumentId,
        brand: result.brand,
        last4: result.last4,
        state: result.state,
        error: result.success ? undefined : "Payment declined",
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[ZeniPay] Finix error:", msg);
      return {
        success: false,
        transactionId: "",
        state: "FAILED",
        error: msg,
      };
    }
  }

  // ── FALLBACK: Tilled ───────────────────────────────────────────────────
  console.log("[ZeniPay] Finix not configured, using Tilled fallback");
  const tilledSk = process.env.TILLED_SECRET_KEY;
  const tilledAccountId = process.env.TILLED_ACCOUNT_ID;

  if (!tilledSk || !tilledAccountId) {
    console.error("[ZeniPay] No payment processor configured:", {
      hasFinix: !!finixMerchantId,
      hasTilled: !!tilledSk,
    });
    return {
      success: false,
      transactionId: "",
      state: "FAILED",
      error: "Payment processor not configured. Contact support.",
    };
  }

  const { processTilledPayment } = await import("./tilled");
  try {
    const result = await processTilledPayment({
      ...params,
      currency: params.currency || "usd",
      description: params.description || `ZeniPay ${params.paymentId}`,
    });
    return {
      success: result.success,
      transactionId: result.transferId,
      instrumentId: result.instrumentId,
      state: result.state,
      error: result.error,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[ZeniPay] Tilled error:", msg);
    return {
      success: false,
      transactionId: "",
      state: "FAILED",
      error: msg,
    };
  }
}
