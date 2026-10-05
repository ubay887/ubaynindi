import "server-only";

type ServerEnv = {
  databaseUrl: string;
  appOrigin: string;
  allowedOrigins: string[];
  rateLimitHmacSecret: string;
  trustedProxyHeader: string | null;
  trustedProxyVerified: boolean;
  nodeEnv: string;
};

let cached: ServerEnv | null = null;

function required(name: string, value: string | undefined, help: string): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(`Missing ${name}. Configure it using the ${help} section.`);
  }
  return trimmed;
}

function origin(value: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("APP_ORIGIN must be an absolute URL without a trailing slash.");
  }
  if (!/^https?:$/.test(parsed.protocol) || parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error("APP_ORIGIN must contain only the scheme, host, and optional port.");
  }
  return parsed.toString().replace(/\/$/, "");
}

function optionalOrigins(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map(origin);
}

export function getServerEnv(): ServerEnv {
  if (cached) return cached;

  const appOrigin = origin(
    required("APP_ORIGIN", process.env.APP_ORIGIN, "Environment configuration in README.md and DEPLOY.md"),
  );
  const allowedOrigins = [...new Set([appOrigin, ...optionalOrigins(process.env.APP_ALLOWED_ORIGINS)])];
  const databaseUrl = required(
    "DATABASE_URL",
    process.env.DATABASE_URL,
    "PostgreSQL setup in README.md and DEPLOY.md",
  );
  const rateLimitHmacSecret = required(
    "RATE_LIMIT_HMAC_SECRET",
    process.env.RATE_LIMIT_HMAC_SECRET,
    "Environment configuration in README.md and DEPLOY.md",
  );
  if (rateLimitHmacSecret.length < 32) {
    throw new Error("RATE_LIMIT_HMAC_SECRET must be at least 32 characters.");
  }

  const trustedProxyHeader = process.env.TRUSTED_PROXY_HEADER?.trim() || null;
  const trustedProxyVerified = process.env.TRUSTED_PROXY_VERIFIED === "true";

  cached = {
    databaseUrl,
    appOrigin,
    allowedOrigins,
    rateLimitHmacSecret,
    trustedProxyHeader,
    trustedProxyVerified,
    nodeEnv: process.env.NODE_ENV ?? "development",
  };
  return cached;
}

export function clearServerEnvCache() {
  cached = null;
}
