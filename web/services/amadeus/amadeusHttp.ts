import { getAmadeusConfig } from "@/services/amadeus/amadeusConfig";
import { getAmadeusAccessToken } from "@/services/amadeus/amadeusAuth";
import { AmadeusUpstreamError } from "@/services/amadeus/amadeusErrors";

export type HttpMethod = "GET" | "POST";

export type AmadeusRequestOptions = {
  requestId: string;
  method: HttpMethod;
  path: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  signal?: AbortSignal;
};

function buildUrl(baseUrl: string, path: string, query?: AmadeusRequestOptions["query"]) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${baseUrl}${normalizedPath}`);

  for (const [key, val] of Object.entries(query || {})) {
    if (val === undefined || val === null) continue;
    url.searchParams.set(key, String(val));
  }

  return url;
}

export async function amadeusJson<T = unknown>(opts: AmadeusRequestOptions): Promise<T> {
  const { baseUrl } = getAmadeusConfig();
  const url = buildUrl(baseUrl, opts.path, opts.query);

  const start = Date.now();
  console.info(`[amadeus:http] ${opts.requestId} -> ${opts.method} ${opts.path}`, {
    hasBody: Boolean(opts.body),
    queryKeys: Object.keys(opts.query || {}),
  });

  const token = await getAmadeusAccessToken(opts.requestId);

  const resp = await fetch(url, {
    method: opts.method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(opts.body ? { "Content-Type": "application/json" } : null),
    } as Record<string, string>,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });

  const durationMs = Date.now() - start;

  const text = await resp.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!resp.ok) {
    console.warn(`[amadeus:http] ${opts.requestId} <- ${resp.status} ${opts.method} ${opts.path} (${durationMs}ms)`);
    throw new AmadeusUpstreamError("Amadeus request failed", {
      requestId: opts.requestId,
      status: resp.status,
      responseText: text,
      responseJson: json,
      headers: Object.fromEntries(resp.headers.entries()),
    });
  }

  console.info(`[amadeus:http] ${opts.requestId} <- ${resp.status} ${opts.method} ${opts.path} (${durationMs}ms)`);

  return (json ?? ({} as any)) as T;
}
