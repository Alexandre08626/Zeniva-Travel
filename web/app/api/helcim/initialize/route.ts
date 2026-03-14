import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiToken = process.env.HELCIM_API_TOKEN;
  if (!apiToken) {
    return NextResponse.json({ error: "Helcim not configured" }, { status: 500 });
  }

  try {
    const { amount, currency = "CAD" } = await req.json();

    const response = await fetch("https://api.helcim.com/v2/helcim-pay/initialize", {
      method: "POST",
      headers: {
        "api-token": apiToken,
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify({
        paymentType: "purchase",
        amount: Number(amount),
        currency,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.errors?.[0]?.message || "Helcim initialization failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
