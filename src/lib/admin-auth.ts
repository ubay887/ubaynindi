import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "ubaynindi_admin";
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

/** Dev fallback only. Production must set ADMIN_PASSWORD. */
const DEV_FALLBACK = "ubay2026";

export function getAdminPassword(): string | null {
  const fromEnv = process.env.ADMIN_PASSWORD?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV !== "production") return DEV_FALLBACK;
  return null;
}

/** HMAC key: ADMIN_SECRET if set, else ADMIN_PASSWORD. Never a public fallback. */
function signSecret(): string | null {
  const dedicated = process.env.ADMIN_SECRET?.trim();
  if (dedicated) return dedicated;
  return getAdminPassword();
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function equalHex(a: string, b: string): boolean {
  try {
    const left = Buffer.from(a, "hex");
    const right = Buffer.from(b, "hex");
    if (left.length !== right.length || left.length === 0) return false;
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export function createAdminToken(): string {
  const secret = signSecret();
  if (!secret) {
    throw new Error("Admin is not configured.");
  }
  const exp = Date.now() + MAX_AGE_SEC * 1000;
  const payload = `ok.${exp}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  const secret = signSecret();
  if (!secret || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [flag, expStr, sig] = parts;
  if (flag !== "ok") return false;
  if (!/^\d+$/.test(expStr)) return false;
  const exp = Number(expStr);
  if (!Number.isSafeInteger(exp) || Date.now() > exp) return false;
  const payload = `${flag}.${expStr}`;
  return equalHex(sig, sign(payload, secret));
}

export async function isAdminAuthenticated(): Promise<boolean> {
  if (!signSecret()) return false;
  const jar = await cookies();
  return verifyAdminToken(jar.get(COOKIE)?.value);
}

export function adminCookieOptions(token: string) {
  return {
    name: COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  };
}

export function clearAdminCookieOptions() {
  return {
    name: COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}

export function checkPassword(input: string): boolean {
  const expected = getAdminPassword();
  if (!expected) return false;
  const a = Buffer.from(input, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) {
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}
