import { NextResponse } from "next/server";
import { z } from "zod";
import { liteApiFetchJson, liteApiIsConfigured } from "../../../../../../src/lib/liteapiClient";

const schema = z.object({
  // Support both strategies:
  // - hotelIds: ["lp..."]
  // - countryCode + cityName
  hotelIds: z.array(z.string().trim().min(1)).optional(),
  countryCode: z.string().trim().min(2).optional(),
  cityName: z.string().trim().min(1).optional(),
  checkin: z.string().trim().min(1),
  checkout: z.string().trim().min(1),
  currency: z.string().trim().min(1).default("USD"),
  guestNationality: z.string().trim().min(2).default("US"),
  adults: z.number().int().min(1).default(2),
  rooms: z.number().int().min(1).default(1),
  maxRatesPerHotel: z.number().int().min(1).max(20).default(10),
  roomMapping: z.boolean().default(true),
  includeHotelData: z.boolean().default(true),
  limit: z.number().int().min(1).max(200).default(50),
});

export async function POST(req: Request) {
  if (!liteApiIsConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "LiteAPI env not configured",
        missing: {
          LITEAPI_API_BASE_URL: !process.env.LITEAPI_API_BASE_URL && !process.env.LITEAPI_BASE_URL,
          LITEAPI_API_KEY: !process.env.LITEAPI_API_KEY,
        },
      },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const parsed = schema.safeParse(body || {});
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid body", issues: parsed.error.issues }, { status: 400 });
  }

  const {
    hotelIds,
    countryCode,
    cityName,
    checkin,
    checkout,
    currency,
    guestNationality,
    adults,
    rooms,
    maxRatesPerHotel,
    roomMapping,
    includeHotelData,
    limit,
  } = parsed.data;

  const occupancies = Array.from({ length: rooms }, () => ({ adults, children: [] as any[] }));

  const upstreamBody: Record<string, any> = {
    occupancies,
    guestNationality,
    currency,
    checkin,
    checkout,
    roomMapping,
    maxRatesPerHotel,
    limit,
  };

  if (Array.isArray(hotelIds) && hotelIds.length > 0) {
    upstreamBody.hotelIds = hotelIds;
    upstreamBody.includeHotelData = includeHotelData;
  } else {
    if (countryCode) upstreamBody.countryCode = countryCode;
    if (cityName) upstreamBody.cityName = cityName;
  }

  try {
    const upstream = await liteApiFetchJson<any>({
      path: "/hotels/rates",
      method: "POST",
      query: { rm: true },
      body: upstreamBody,
      timeoutMs: 30000,
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { ok: false, error: "LiteAPI request failed", status: upstream.status, data: upstream.data, text: upstream.text },
        { status: upstream.status || 502 },
      );
    }

    return NextResponse.json({ ok: true, data: upstream.data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 502 });
  }
}

export const runtime = "nodejs";
