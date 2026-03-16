// ZeniPay Database Schema
// Tables managed via Supabase

export const ZENIPAY_TABLES = {
  payments: "zenipay_payments",
  transactions: "zenipay_transactions",
  payouts: "zenipay_payouts",
  paymentLinks: "zenipay_payment_links",
  invoices: "zenipay_invoices",
} as const;

export interface ZeniPayment {
  id: string;
  booking_id?: string;
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded" | "disputed";
  gateway: "helcim" | "stripe" | "authorize" | "adyen";
  gateway_transaction_id?: string;
  payment_method?: string;
  description?: string;
  metadata?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface ZeniTransaction {
  id: string;
  payment_id: string;
  gateway_response?: Record<string, unknown>;
  status: string;
  created_at: string;
}

export interface ZeniPayout {
  id: string;
  agent_id: string;
  agent_name: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "paid" | "failed";
  period_start: string;
  period_end: string;
  created_at: string;
}

export interface ZeniPaymentLink {
  id: string;
  payment_id: string;
  amount: number;
  currency: string;
  description: string;
  customer_name?: string;
  customer_email?: string;
  status: "active" | "paid" | "expired" | "cancelled";
  expires_at?: string;
  created_at: string;
}
