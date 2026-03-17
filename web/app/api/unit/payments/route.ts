export const dynamic = "force-dynamic";
/**
 * POST /api/unit/payments — execute ACH payment or book transfer
 * Body: { type: "ach"|"book", from_account_id, amount_cents, ... }
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, from_account_id, amount_cents, description } = body;

    if (!from_account_id || !amount_cents || !description) {
      return Response.json({ error: "from_account_id, amount_cents, description required" }, { status: 400 });
    }

    const amountCents = Math.round(Number(amount_cents));
    if (isNaN(amountCents) || amountCents <= 0) {
      return Response.json({ error: "Invalid amount_cents" }, { status: 400 });
    }

    if (type === "book") {
      const { to_account_id } = body;
      if (!to_account_id) return Response.json({ error: "to_account_id required for book payment" }, { status: 400 });

      const { createBookPayment } = await import("../../../../modules/zenipay/gateways/unit");
      const payment = await createBookPayment({ fromAccountId: from_account_id, toAccountId: to_account_id, amount: amountCents, description });
      return Response.json({ payment, type: "book" });
    }

    // ACH payment
    const { counterparty_name, routing_number, account_number, account_type = "Checking", direction = "Credit" } = body;
    if (!counterparty_name || !routing_number || !account_number) {
      return Response.json({ error: "counterparty_name, routing_number, account_number required for ACH" }, { status: 400 });
    }

    const { createACHPayment } = await import("../../../../modules/zenipay/gateways/unit");
    const payment = await createACHPayment({
      accountId: from_account_id,
      amount: amountCents,
      direction,
      counterpartyName: counterparty_name,
      counterpartyRoutingNumber: routing_number,
      counterpartyAccountNumber: account_number,
      counterpartyAccountType: account_type,
      description,
    });
    return Response.json({ payment, type: "ach" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
