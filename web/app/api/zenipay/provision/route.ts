/**
 * POST /api/zenipay/provision
 * ───────────────────────────
 * Auto-provisions the ZeniPay platform owner's bank account + debit card in ONE call.
 *
 * Flow:
 *   1. Create Unit.co business customer (Zeniva Travel LLC)
 *   2. Create deposit account (checking) linked to that customer
 *   3. Issue a virtual Visa debit card on that account
 *   4. Store account/card references in Supabase
 *   5. Return full banking setup details
 *
 * This is the "Open Banking Account" button in the ZeniPay dashboard.
 */
export const dynamic = "force-dynamic";

// createClient imported lazily inside handler

const UNIT_URL = () => process.env.UNIT_API_URL || "https://api.s.unit.co";
const UNIT_TOKEN = () => process.env.UNIT_API_TOKEN || "";

function unitHeaders() {
  return {
    Authorization: `Bearer ${UNIT_TOKEN()}`,
    "Content-Type": "application/vnd.api+json",
  };
}

async function unitPost(path: string, body: unknown) {
  const res = await fetch(`${UNIT_URL()}${path}`, {
    method: "POST",
    headers: unitHeaders(),
    body: JSON.stringify(body),
  });
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text) };
  } catch {
    return { ok: false, status: res.status, data: { error: text } };
  }
}

async function unitGet(path: string) {
  const res = await fetch(`${UNIT_URL()}${path}`, { headers: unitHeaders() });
  const text = await res.text();
  try {
    return { ok: res.ok, data: JSON.parse(text) };
  } catch {
    return { ok: false, data: { error: text } };
  }
}

export async function POST() {
  const token = UNIT_TOKEN();
  if (!token) {
    return Response.json({ error: "UNIT_API_TOKEN not configured" }, { status: 500 });
  }
  // Lazy-load Supabase client (avoid build-time errors)
  const { createClient: sbCreate } = await import("@supabase/supabase-js");
  const sb = sbCreate(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  try {
    // ── Step 1: Create business customer ──────────────────────────────
    const custRes = await unitPost("/customers", {
      data: {
        type: "businessCustomer",
        attributes: {
          name: "Zeniva Travel LLC",
          ein: "00-0000000", // sandbox placeholder
          phone: { countryCode: "1", number: "5145550100" },
          address: {
            street: "123 Travel Way",
            city: "Montreal",
            state: "QC",
            postalCode: "H3Z1A1",
            country: "CA",
          },
          email: "info@zeniva.ca",
          website: "https://zenivatravel.com",
          stateOfIncorporation: "DE",
          entityType: "LLC",
          contact: {
            fullName: { first: "Alexandre", last: "Zeniva" },
            email: "info@zeniva.ca",
            phone: { countryCode: "1", number: "5145550100" },
          },
          authorizedUsers: [],
        },
      },
    });

    let customerId: string;
    if (custRes.ok) {
      customerId = custRes.data?.data?.id;
    } else {
      // If customer already exists, list existing customers
      const listRes = await unitGet("/customers?filter[email]=info@zeniva.ca");
      if (listRes.ok && listRes.data?.data?.length > 0) {
        customerId = listRes.data.data[0].id;
      } else {
        return Response.json(
          { error: "Failed to create customer", details: custRes.data },
          { status: 500 },
        );
      }
    }

    // ── Step 2: Create deposit (checking) account ───────────────────
    const acctRes = await unitPost("/accounts", {
      data: {
        type: "depositAccount",
        attributes: {
          depositProduct: "checking",
          idempotencyKey: `zeniva-platform-account-${Date.now()}`,
          tags: { purpose: "platform", org: "zeniva" },
        },
        relationships: {
          customer: { data: { type: "businessCustomer", id: customerId } },
        },
      },
    });

    if (!acctRes.ok) {
      return Response.json(
        { error: "Failed to create account", details: acctRes.data },
        { status: 500 },
      );
    }

    const account = acctRes.data?.data;
    const accountId = account?.id;
    const routingNumber = account?.attributes?.routingNumber || "";
    const accountNumber = account?.attributes?.accountNumber || "";
    const balance = account?.attributes?.balance || 0;

    // ── Step 3: Issue virtual Visa debit card ───────────────────────
    const cardRes = await unitPost("/cards", {
      data: {
        type: "businessVirtualDebitCard",
        attributes: {
          fullName: { first: "Zeniva", last: "Travel LLC" },
          idempotencyKey: `zeniva-platform-card-${Date.now()}`,
          tags: { purpose: "platform", holder: "admin" },
          limits: {
            dailyPurchase: 1000000,   // $10,000
            dailyCardTransaction: 1000000,
            monthlyPurchase: 10000000, // $100,000
          },
        },
        relationships: {
          account: { data: { type: "depositAccount", id: accountId } },
        },
      },
    });

    const card = cardRes.data?.data;
    const cardId = card?.id;
    const last4 = card?.attributes?.last4Digits || "****";
    const expiry = card?.attributes?.expirationDate || "";

    // ── Step 4: Persist to Supabase (non-fatal) ────────────────────
    try {
      await sb.from("zenipay_unit_accounts").upsert({
        id: accountId,
        customer_id: customerId,
        account_type: "depositAccount",
        routing_number: routingNumber,
        account_number: accountNumber,
        balance_cents: balance,
        available_cents: balance,
        status: account?.attributes?.status || "Open",
        currency: "USD",
        created_at: new Date().toISOString(),
      }, { onConflict: "id" });

      if (cardId) {
        await sb.from("zenipay_unit_cards").upsert({
          id: cardId,
          account_id: accountId,
          card_type: "businessVirtualDebitCard",
          last4,
          expiry_date: expiry,
          status: card?.attributes?.status || "Active",
          created_at: new Date().toISOString(),
        }, { onConflict: "id" });
      }
    } catch (dbErr) {
      // Non-fatal: Supabase tables may not exist yet — account is still created
      console.warn("[provision] Supabase persist failed:", dbErr);
    }

    // ── Response ─────────────────────────────────────────────────────
    return Response.json({
      ok: true,
      message: "ZeniPay banking provisioned successfully",
      account: {
        id: accountId,
        customerId,
        routingNumber,
        accountNumber,
        balanceCents: balance,
        status: account?.attributes?.status,
        currency: "USD",
      },
      card: cardId ? {
        id: cardId,
        last4,
        expiry,
        type: "Virtual Visa Debit",
        status: card?.attributes?.status,
      } : null,
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
