type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * In-memory limiter (per instance). Enough to slow brute force on
 * a wedding admin; not a substitute for a strong ADMIN_PASSWORD.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  opts?: { peek?: boolean },
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const prev = buckets.get(key);
  if (!prev || now > prev.resetAt) {
    if (opts?.peek) return { ok: true, retryAfterSec: 0 };
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  if (prev.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((prev.resetAt - now) / 1000)),
    };
  }
  if (opts?.peek) return { ok: true, retryAfterSec: 0 };
  prev.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

export function clientKey(request: Request): string {
  // Prefer proxy-set X-Real-IP; X-Forwarded-For is easier to spoof if the
  // reverse proxy does not overwrite it.
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    return fwd.split(",")[0]?.trim() || "unknown";
  }
  return "unknown";
}
