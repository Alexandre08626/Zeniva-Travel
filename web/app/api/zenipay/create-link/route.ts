import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  const { amount, currency = "USD", description, customerName, customerEmail } = await req.json();
  const paymentId = Math.random().toString(36).slice(2,12);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://zenivatravel.com";
  const url = `${baseUrl}/pay/${paymentId}`;
  
  return NextResponse.json({
    paymentId,
    url,
    amount,
    currency,
    description,
    customerName,
    customerEmail,
    expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
  });
}
