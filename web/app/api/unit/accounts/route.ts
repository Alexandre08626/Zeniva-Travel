export const dynamic = "force-dynamic";
/**
 * GET  /api/unit/accounts — list all Unit bank accounts + balances
 * POST /api/unit/accounts — create a new deposit account
 */

export async function GET() {
  try {
    const { getAccountsSummary } = await import("../../../../modules/zenipay/gateways/unit");
    const accounts = await getAccountsSummary();
    return Response.json({ accounts });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Unit] accounts GET error:", msg);
    return Response.json({ accounts: [], error: msg });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_id, name } = body;
    if (!customer_id) return Response.json({ error: "customer_id required" }, { status: 400 });

    const { createDepositAccount } = await import("../../../../modules/zenipay/gateways/unit");
    const account = await createDepositAccount({ customerId: customer_id, name });
    return Response.json({ account });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
