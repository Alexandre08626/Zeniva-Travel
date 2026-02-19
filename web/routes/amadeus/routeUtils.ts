import crypto from "crypto";

export function getRequestId(req: Request): string {
  const fromHeader = req.headers.get("x-request-id") || req.headers.get("x-correlation-id");
  if (fromHeader && fromHeader.length <= 64) return fromHeader;
  return crypto.randomUUID().substring(0, 12);
}

export function logInfo(scope: string, requestId: string, msg: string, meta?: Record<string, unknown>) {
  console.info(`[${scope}] ${requestId} ${msg}`, meta || {});
}

export function logWarn(scope: string, requestId: string, msg: string, meta?: Record<string, unknown>) {
  console.warn(`[${scope}] ${requestId} ${msg}`, meta || {});
}

export function logError(scope: string, requestId: string, msg: string, meta?: Record<string, unknown>) {
  console.error(`[${scope}] ${requestId} ${msg}`, meta || {});
}
