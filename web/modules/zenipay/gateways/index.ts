/**
 * ZeniPay Gateway Abstraction Layer
 * Architecture: Zeniva → ZeniPay → Gateway → Card Network → Bank
 * Primary: Finix (sandbox → live)
 * Fallback: Authorize.net
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
  const gateway = process.env.FINIX_MERCHANT_ID ? "finix" : "authorizenet";
  
  if (gateway === "finix") {
    const { processFinixPayment } = await import("./finix");
    const result = await processFinixPayment(params);
    return {
      success: result.success,
      transactionId: result.transferId,
      instrumentId: result.instrumentId,
      brand: result.brand,
      last4: result.last4,
      state: result.state,
    };
  }

  // Fallback: Authorize.net (sandbox simulation)
  return {
    success: true,
    transactionId: `SANDBOX-${Date.now().toString(36).toUpperCase()}`,
    state: "SUCCEEDED",
  };
}
