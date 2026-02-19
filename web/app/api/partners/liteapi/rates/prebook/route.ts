import { NextResponse } from "next/server";
import { z } from "zod";
import { liteApiFetchJson, liteApiIsConfigured } from "../../../../../../src/lib/liteapiClient";

const schema = z.object({
  offerId: z.string().trim().min(1, "offerId required"),
  usePaymentSdk: z.boolean().default(false),
  voucherCode: z.string().trim().optional(),
  includeCreditBalance: z.boolean().optional(),
  timeout: z.number().int().min(1).max(60).optional(),
});

export async function POST(req: Request) {
  if (!liteApiIsConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "LiteAPI env not configured",
        missing: {
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

  const { offerId, usePaymentSdk, voucherCode, includeCreditBalance, timeout } = parsed.data;

  try {
    const upstream = await liteApiFetchJson<any>({
      path: "/rates/prebook",
      method: "POST",
      baseUrlOverride: process.env.LITEAPI_BOOK_BASE_URL || "https://book.liteapi.travel/v3.0",
      query: {
        ...(typeof timeout === "number" ? { timeout } : {}),
        ...(typeof includeCreditBalance === "boolean" ? { includeCreditBalance } : {}),
      } as any,
      body: {
        offerId,
        usePaymentSdk,
        ...(voucherCode ? { voucherCode } : {}),
        ...(typeof includeCreditBalance === "boolean" ? { includeCreditBalance } : {}),
      },
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
