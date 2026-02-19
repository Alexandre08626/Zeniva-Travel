export type AmadeusUpstreamErrorInit = {
  requestId: string;
  status: number;
  responseText?: string;
  responseJson?: unknown;
  headers?: Record<string, string>;
};

export class AmadeusUpstreamError extends Error {
  readonly requestId: string;
  readonly status: number;
  readonly responseText?: string;
  readonly responseJson?: unknown;
  readonly headers: Record<string, string>;

  constructor(message: string, init: AmadeusUpstreamErrorInit) {
    super(message);
    this.name = "AmadeusUpstreamError";
    this.requestId = init.requestId;
    this.status = init.status;
    this.responseText = init.responseText;
    this.responseJson = init.responseJson;
    this.headers = init.headers || {};
  }
}

export type ApiErrorCode =
  | "INVALID_REQUEST"
  | "AUTH_FAILED"
  | "RATE_LIMITED"
  | "NOT_AVAILABLE"
  | "UPSTREAM_ERROR"
  | "INTERNAL_ERROR";

export type ApiErrorShape = {
  ok: false;
  code: ApiErrorCode;
  message: string;
  requestId: string;
  status: number;
  upstreamStatus?: number;
  retryAfterSec?: number;
  details?: unknown;
};

export function mapAmadeusError(err: unknown, requestId: string): ApiErrorShape {
  if (err instanceof AmadeusUpstreamError) {
    const retryAfterHeader = err.headers?.["retry-after"];
    const retryAfterSec = retryAfterHeader ? Number(retryAfterHeader) : undefined;

    if (err.status === 401) {
      return {
        ok: false,
        code: "AUTH_FAILED",
        message: "Amadeus authentication failed (401)",
        requestId,
        status: 401,
        upstreamStatus: err.status,
        retryAfterSec: Number.isFinite(retryAfterSec) ? retryAfterSec : undefined,
        details: err.responseJson || err.responseText,
      };
    }

    if (err.status === 429) {
      return {
        ok: false,
        code: "RATE_LIMITED",
        message: "Amadeus rate limit exceeded (429)",
        requestId,
        status: 429,
        upstreamStatus: err.status,
        retryAfterSec: Number.isFinite(retryAfterSec) ? retryAfterSec : undefined,
        details: err.responseJson || err.responseText,
      };
    }

    if (err.status === 400) {
      return {
        ok: false,
        code: "INVALID_REQUEST",
        message: "Amadeus rejected the request (400)",
        requestId,
        status: 400,
        upstreamStatus: err.status,
        details: err.responseJson || err.responseText,
      };
    }

    if (err.status === 403 || err.status === 404) {
      return {
        ok: false,
        code: "NOT_AVAILABLE",
        message:
          "This Amadeus capability is not available with the current access level/environment, or the endpoint is not enabled.",
        requestId,
        status: 501,
        upstreamStatus: err.status,
        details: err.responseJson || err.responseText,
      };
    }

    const status = err.status >= 500 ? 502 : 502;
    return {
      ok: false,
      code: "UPSTREAM_ERROR",
      message: `Amadeus upstream error (${err.status})`,
      requestId,
      status,
      upstreamStatus: err.status,
      details: err.responseJson || err.responseText,
    };
  }

  return {
    ok: false,
    code: "INTERNAL_ERROR",
    message: err instanceof Error ? err.message : "Unhandled error",
    requestId,
    status: 500,
  };
}
