import { NextRequest, NextResponse } from "next/server";
import { initializeHelcimPayment } from "../../../../modules/zenipay/gateways";


export async function POST(req: NextRequest) {
  const { amount, currency = "CAD", description, customerName, customerEmail } = await req.json();
  
  const paymentId = `ZNV-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
  const result = await initializeHelcimPayment(Number(amount), currency);
  
  return NextResponse.json({
    paymentId,
    amount,
    currency,
    description,
    customerName,
    customerEmail,
    ...result,
  });
}
