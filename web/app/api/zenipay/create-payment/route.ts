import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { amount, currency = "USD", description, customerName, customerEmail } = await req.json();
  const paymentId = `ZNV-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
  return NextResponse.json({
    paymentId,
    amount,
    currency,
    description,
    customerName,
    customerEmail,
    status: "pending",
    createdAt: new Date().toISOString(),
  });
}
