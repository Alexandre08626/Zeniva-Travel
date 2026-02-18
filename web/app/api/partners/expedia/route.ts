import { NextResponse } from "next/server";
import { z } from "zod";
import { expediaFetchJson, expediaIsConfigured } from "../../../../src/lib/expediaClient";

const getSchema = z.object({
  path: z.string().trim().min(1, "path required"),
});

const postSchema = z.object({
  path: z.string().trim().min(1, "path required"),
  query: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  body: z.any().optional(),
  method: z.enum(["POST", "PUT", "PATCH", "DELETE"]).optional(),
});

export async function GET(req: Request) {
  if (!expediaIsConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Expedia env not configured",
        missing: {
          EXPEDIA_API_BASE_URL: !process.env.EXPEDIA_API_BASE_URL,
          EXPEDIA_API_KEY: !process.env.EXPEDIA_API_KEY,
        },
      },
      { status: 500 },
    );
  }

  const url = new URL(req.url);
  const parsed = getSchema.safeParse({ path: url.searchParams.get("path") || "" });
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid params", issues: parsed.error.issues }, { status: 400 });
  }

  const { path } = parsed.data;

  // Forward all query params except `path`
  const query: Record<string, string> = {};
  for (const [key, value] of url.searchParams.entries()) {
    if (key === "path") continue;
    query[key] = value;
  }

  try {
    const upstream = await expediaFetchJson({ path, method: "GET", query });
    return NextResponse.json(
      {
        ok: upstream.ok,
        status: upstream.status,
        data: upstream.data,
        text: upstream.text,
      },
      { status: upstream.ok ? 200 : upstream.status || 502 },
    );
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 502 });
  }
}

export async function POST(req: Request) {
  if (!expediaIsConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Expedia env not configured",
        missing: {
          EXPEDIA_API_BASE_URL: !process.env.EXPEDIA_API_BASE_URL,
          EXPEDIA_API_KEY: !process.env.EXPEDIA_API_KEY,
        },
      },
      { status: 500 },
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const parsed = postSchema.safeParse(body || {});
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid body", issues: parsed.error.issues }, { status: 400 });
  }

  const { path, query, body: upstreamBody, method } = parsed.data;

  try {
    const upstream = await expediaFetchJson({
      path,
      method: method || "POST",
      query: query as any,
      body: upstreamBody,
    });

    return NextResponse.json(
      {
        ok: upstream.ok,
        status: upstream.status,
        data: upstream.data,
        text: upstream.text,
      },
      { status: upstream.ok ? 200 : upstream.status || 502 },
    );
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 502 });
  }
}

export const runtime = "nodejs";
