import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { customer_id, booking_id, amount, currency = "USD", description, customerName, customerEmail } = await req.json();
  const paymentId = `ZNV-${Date.now().toString(36).toUpperCase()}`;
  const params = new URLSearchParams({
    amount: String(amount), currency, 
    desc: description || "Zeniva Travel",
    customer: customerName || "", email: customerEmail || ""
  });
  return NextResponse.json({
    payment_id: paymentId,
    checkout_url: `/zenipay/checkout/${paymentId}?${params}`,
    amount, currency, status: "pending", customer_id, booking_id,
    created_at: new Date().toISOString(),
  });
}
