type ExpediaConfig = {
  baseUrl: string;
  apiKey: string;
  apiSecret?: string;
  keyHeader: string;
  keyPrefix?: string;
};

function getExpediaConfig(): ExpediaConfig {
  const baseUrl = (process.env.EXPEDIA_API_BASE_URL || "").trim();
  const apiKey = (process.env.EXPEDIA_API_KEY || "").trim();
  const apiSecret = (process.env.EXPEDIA_API_SECRET || "").trim() || undefined;

  const keyHeader = (process.env.EXPEDIA_API_KEY_HEADER || "x-api-key").trim() || "x-api-key";
  const keyPrefix = (process.env.EXPEDIA_API_KEY_PREFIX || "").trim() || undefined;

  if (!baseUrl) {
    throw new Error("EXPEDIA_API_BASE_URL not configured");
  }
  if (!/^https?:\/\//i.test(baseUrl)) {
    throw new Error("EXPEDIA_API_BASE_URL must be an absolute http(s) URL");
  }
  if (!apiKey) {
    throw new Error("EXPEDIA_API_KEY not configured");
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey, apiSecret, keyHeader, keyPrefix };
}

export function expediaIsConfigured() {
  return Boolean((process.env.EXPEDIA_API_BASE_URL || "").trim() && (process.env.EXPEDIA_API_KEY || "").trim());
}

function buildAuthHeaderValue(apiKey: string, prefix?: string) {
  if (!prefix) return apiKey;
  return `${prefix} ${apiKey}`;
}

function assertSafePath(path: string) {
  if (!path || typeof path !== "string") throw new Error("path required");
  if (!path.startsWith("/")) throw new Error("path must start with '/'");
  if (path.includes("..")) throw new Error("path must not contain '..'");
  if (/^https?:\/\//i.test(path)) throw new Error("path must be relative, not a full URL");
}

export async function expediaFetchJson<T = any>(opts: {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string | undefined>;
  body?: any;
  timeoutMs?: number;
}): Promise<{ status: number; ok: boolean; data?: T; text?: string; headers: Headers }> {
  const cfg = getExpediaConfig();
  assertSafePath(opts.path);

  const method = opts.method || "GET";
  const timeoutMs = typeof opts.timeoutMs === "number" ? opts.timeoutMs : 15000;

  const url = new URL(cfg.baseUrl + opts.path);
  for (const [key, value] of Object.entries(opts.query || {})) {
    if (value === undefined || value === null) continue;
    url.searchParams.set(key, String(value));
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(opts.headers || {}),
  };

  // Configurable header + optional prefix so it can fit different Expedia auth schemes.
  headers[cfg.keyHeader] = buildAuthHeaderValue(cfg.apiKey, cfg.keyPrefix);

  // Some Expedia products require a secret (HMAC, etc.). We don't guess an algorithm here,
  // but we expose it for future use in the route if needed.
  if (cfg.apiSecret) {
    headers["x-expedia-api-secret-present"] = "true";
  }

  let body: string | undefined = undefined;
  if (opts.body !== undefined && opts.body !== null && method !== "GET") {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
    body = typeof opts.body === "string" ? opts.body : JSON.stringify(opts.body);
  }

  try {
    const res = await fetch(url.toString(), {
      method,
      headers,
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const contentType = res.headers.get("content-type") || "";
    if (contentType.toLowerCase().includes("application/json")) {
      try {
        const data = (await res.json()) as T;
        return { status: res.status, ok: res.ok, data, headers: res.headers };
      } catch (err: any) {
        const text = await res.text().catch(() => "");
        return { status: res.status, ok: false, text: text || err?.message || "Invalid JSON", headers: res.headers };
      }
    }

    const text = await res.text();
    return { status: res.status, ok: res.ok, text, headers: res.headers };
  } catch (err: any) {
    clearTimeout(timeout);
    throw new Error(err?.name === "AbortError" ? "Expedia request timed out" : (err?.message || String(err)));
  }
}
