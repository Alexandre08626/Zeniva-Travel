import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

async function chargeViaAuthorizenet(params: {
  apiLoginId: string;
  transactionKey: string;
  env: string;
  amount: number;
  opaqueDataDescriptor: string;
  opaqueDataValue: string;
  customerEmail: string;
  customerName: string;
  description: string;
}) {
  const url = params.env === "production"
    ? "https://api2.authorize.net/xml/v1/request.api"
    : "https://apitest.authorize.net/xml/v1/request.api";

  const payload = {
    createTransactionRequest: {
      merchantAuthentication: { name: params.apiLoginId, transactionKey: params.transactionKey },
      transactionRequest: {
        transactionType: "authCaptureTransaction",
        amount: params.amount.toFixed(2),
        payment: { opaqueData: { dataDescriptor: params.opaqueDataDescriptor, dataValue: params.opaqueDataValue } },
        order: { description: params.description.slice(0, 255) },
        customer: { email: params.customerEmail },
        billTo: { firstName: params.customerName.split(" ")[0] || "", lastName: params.customerName.split(" ").slice(1).join(" ") || "" },
      },
    },
  };

  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const data = await res.json();
  const resp = data.transactionResponse;
  const msgs = data.messages;

  if (msgs?.resultCode === "Error") {
    const errText = msgs.message?.[0]?.text || "Gateway error";
    return { success: false, error: errText };
  }
  if (resp?.responseCode === "1") {
    return { success: true, transId: resp.transId || "unknown" };
  }
  const errMsg = resp?.errors?.[0]?.errorText || resp?.messages?.[0]?.description || "Payment declined";
  return { success: false, error: errMsg };
}

export async function POST(req: NextRequest) {
  const {
    payment_id, amount, currency = "USD",
    opaque_data_descriptor, opaque_data_value,
    customer_email, customer_name, description,
  } = await req.json();

  if (!payment_id || !amount) {
    return NextResponse.json({ status: "failed", error: "Missing required fields" }, { status: 400 });
  }

  const apiLoginId = process.env.AUTHORIZENET_API_LOGIN_ID || "PLACEHOLDER_TEST";
  const transactionKey = process.env.AUTHORIZENET_TRANSACTION_KEY || "PLACEHOLDER_TEST";
  const env = process.env.AUTHORIZENET_ENV || "sandbox";

  let transactionId: string;

  if (apiLoginId === "PLACEHOLDER_TEST" || !opaque_data_descriptor || !opaque_data_value) {
    // SANDBOX MODE — simulated success (waiting for real credentials from boss)
    transactionId = `SANDBOX-${Date.now().toString(36).toUpperCase()}`;
    console.log("[ZeniPay] SANDBOX MODE — real credentials needed from Authorize.net");
  } else {
    // REAL PAYMENT via Authorize.net
    const result = await chargeViaAuthorizenet({
      apiLoginId, transactionKey, env, amount,
      opaqueDataDescriptor: opaque_data_descriptor,
      opaqueDataValue: opaque_data_value,
      customerEmail: customer_email || "",
      customerName: customer_name || "",
      description: description || `ZeniPay-${payment_id}`,
    });
    if (!result.success) {
      return NextResponse.json({ status: "failed", error: result.error }, { status: 402 });
    }
    transactionId = result.transId!;
  }

  // ZeniPay Commission Distribution
  const agentCut      = Number((amount * 0.104).toFixed(2));
  const influencerCut = Number((amount * 0.0195).toFixed(2));
  const platformCut   = Number((amount * 0.0296).toFixed(2));
  const supplierPay   = Number((amount - agentCut - influencerCut - platformCut).toFixed(2));

  return NextResponse.json({
    status: "completed",
    transaction: {
      id: `TXN-${Date.now().toString(36).toUpperCase()}`,
      payment_id,
      gateway_transaction_id: transactionId,
      amount, currency,
      created_at: new Date().toISOString(),
    },
    wallet_updates: {
      platform:   { credited: platformCut },
      agent:      { credited: agentCut },
      influencer: { credited: influencerCut },
      supplier:   { credited: supplierPay },
    },
    confirmation_url: `/booking/confirmation?ref=${payment_id}&total=${amount}&trip=${encodeURIComponent(description || "Zeniva Travel")}`,
  });
}
