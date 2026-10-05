import "server-only";

import { randomUUID } from "node:crypto";

export type ErrorCode =
  | "INVALID_REQUEST"
  | "INVALID_PAYLOAD"
  | "BODY_TOO_LARGE"
  | "ORIGIN_REJECTED"
  | "RATE_LIMITED"
  | "GUESTBOOK_UNAVAILABLE"
  | "INTERNAL_ERROR";

export function requestId() {
  return randomUUID();
}

export function errorResponse(
  id: string,
  status: number,
  code: ErrorCode,
  message: string,
  opts?: { fields?: Record<string, string>; retryAfter?: number },
) {
  return Response.json(
    {
      code,
      message,
      ...(opts?.fields ? { fields: opts.fields } : {}),
      ...(opts?.retryAfter ? { retryAfter: opts.retryAfter } : {}),
      requestId: id,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Request-ID": id,
        ...(opts?.retryAfter ? { "Retry-After": String(opts.retryAfter) } : {}),
      },
    },
  );
}

export function logServerError(id: string, event: string, error: unknown) {
  console.error(JSON.stringify({ event, requestId: id, error: error instanceof Error ? error.message : "unknown" }));
}
