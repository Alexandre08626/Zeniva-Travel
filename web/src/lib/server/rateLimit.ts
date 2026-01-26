import "server-only";

type RateLimitOptions = {
  limit: number;
  windowMs: number;
  keyPrefix?: string;
};

type Bucket = { count: number; resetAt: number };

export type RateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  ip: string;
  key: string;
};

const buckets = new Map<string, Bucket>();

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();
  return "unknown";
}

function getBucket(key: string, now: number, windowMs: number): Bucket {
  const existing = buckets.get(key);
  if (!existing || now > existing.resetAt) {
    const bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
    return bucket;
  }
  return existing;
}

export function rateLimit(req: Request, options: RateLimitOptions): RateLimitResult {
  const { limit, windowMs, keyPrefix = "global" } = options;
  const ip = getClientIp(req);
  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();

  const bucket = getBucket(key, now, windowMs);
  bucket.count += 1;
  buckets.set(key, bucket);

  const remaining = Math.max(0, limit - bucket.count);
  const ok = bucket.count <= limit;

  if (buckets.size > 5000) {
    for (const [bucketKey, value] of buckets.entries()) {
      if (now > value.resetAt) buckets.delete(bucketKey);
    }
  }

  return {
    ok,
    limit,
    remaining,
    resetAt: bucket.resetAt,
    ip,
    key,
  };
}

export function rateLimitHeaders(result: RateLimitResult) {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}
