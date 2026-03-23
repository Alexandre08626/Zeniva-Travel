import { NextResponse } from "next/server";

const UNIT_API = process.env.UNIT_API_URL || "https://api.s.unit.co";
const UNIT_TOKEN = process.env.UNIT_API_TOKEN;

export async function POST(req: Request) {
  if (!UNIT_TOKEN) return NextResponse.json({ error: "Unit not configured" }, { status: 500 });

  try {
    const body = await req.json().catch(() => ({}));
    const accountName = body.name || "Zeniva LLC";

    // Step 1: Create business customer
    const custResp = await fetch(`${UNIT_API}/customers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UNIT_TOKEN}`,
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "businessCustomer",
          attributes: {
            name: accountName,
            stateOfIncorporation: "DE",
            entityType: "LLC",
            contact: {
              fullName: { first: "Alexandre", last: "Blais" },
              email: "info@zeniva.ca",
              phone: { countryCode: "1", number: "5145550000" },
            },
            officer: {
              fullName: { first: "Alexandre", last: "Blais" },
              dateOfBirth: "1990-01-01",
              address: { street: "123 Main St", city: "Wilmington", state: "DE", postalCode: "19801", country: "US" },
              phone: { countryCode: "1", number: "5145550000" },
              email: "info@zeniva.ca",
              ssn: "000000002",
            },
            beneficialOwners: [],
            website: "https://zenivatravel.com",
            address: { street: "123 Main St", city: "Wilmington", state: "DE", postalCode: "19801", country: "US" },
            phone: { countryCode: "1", number: "5145550000" },
            ein: "000000002",
          },
        },
      }),
    });

    const custData = await custResp.json();
    if (!custResp.ok) {
      return NextResponse.json({ error: "Failed to create customer", details: custData }, { status: 400 });
    }

    const customerId = custData.data?.id;

    // Step 2: Create deposit account linked to customer
    const accResp = await fetch(`${UNIT_API}/accounts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UNIT_TOKEN}`,
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "depositAccount",
          attributes: {
            depositProduct: "checking",
            tags: { purpose: "platform-wallet", company: "zeniva-travel" },
          },
          relationships: {
            customer: { data: { type: "businessCustomer", id: customerId } },
          },
        },
      }),
    });

    const accData = await accResp.json();
    if (!accResp.ok) {
      return NextResponse.json({ error: "Failed to create account", details: accData }, { status: 400 });
    }

    return NextResponse.json({ ok: true, customer: custData.data, account: accData.data });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
