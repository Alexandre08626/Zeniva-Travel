/**
 * ZeniPay Gateway Abstraction Layer
 * Supported gateways: Authorize.net (primary), Global Payments, Adyen, Cybersource
 */

export * from "./authorizenet";

export interface GatewayPaymentRequest {
  payment_id: string;
  amount: number;
  currency: string;
  opaqueDataDescriptor?: string; // Accept.js token descriptor
  opaqueDataValue?: string;       // Accept.js token value
  customerEmail?: string;
  customerName?: string;
  description?: string;
}

export interface GatewayPaymentResponse {
  success: boolean;
  transactionId?: string;
  processorRef?: string;
  errorMessage?: string;
  gateway: string;
}

export async function processPayment(req: GatewayPaymentRequest): Promise<GatewayPaymentResponse> {
  // Primary: Authorize.net
  const { processAuthNetPayment } = await import("./authorizenet");
  const result = await processAuthNetPayment({
    opaqueDataDescriptor: req.opaqueDataDescriptor || "COMMON.ACCEPT.INAPP.PAYMENT",
    opaqueDataValue: req.opaqueDataValue || `sim_${req.payment_id}`,
    amount: req.amount,
    currency: req.currency,
    customerEmail: req.customerEmail || "",
    customerName: req.customerName || "",
    description: req.description || "Zeniva Travel",
    invoiceNumber: req.payment_id,
  });

  return {
    success: result.success,
    transactionId: result.transactionId,
    processorRef: result.transactionId,
    errorMessage: result.errorMessage,
    gateway: "authorizenet",
  };
}
