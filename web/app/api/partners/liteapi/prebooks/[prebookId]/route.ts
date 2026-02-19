import { NextResponse } from "next/server";
import { z } from "zod";
import { liteApiFetchJson, liteApiIsConfigured } from "../../../../../../src/lib/liteapiClient";

const paramsSchema = z.object({
  prebookId: z.string().trim().min(1),
});

export async function GET(req: Request, context: { params: Promise<{ prebookId?: string }> | { prebookId?: string } }) {
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

  const awaitedParams: any = (context as any)?.params && typeof (context as any).params.then === "function" ? await (context as any).params : (context as any).params;
  const parsed = paramsSchema.safeParse({ prebookId: awaitedParams?.prebookId || "" });
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid params", issues: parsed.error.issues }, { status: 400 });
  }

  const url = new URL(req.url);
  const includeCreditBalance = url.searchParams.get("includeCreditBalance");

  try {
    const upstream = await liteApiFetchJson<any>({
      path: `/prebooks/${encodeURIComponent(parsed.data.prebookId)}`,
      method: "GET",
      baseUrlOverride: process.env.LITEAPI_BOOK_BASE_URL || "https://book.liteapi.travel/v3.0",
      query: includeCreditBalance ? { includeCreditBalance } : undefined,
      timeoutMs: 15000,
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
