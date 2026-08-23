import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "ubaynindi_admin";
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() || "ubay2026";
}

function sign(payload: string): string {
  return createHmac("sha256", getAdminPassword()).update(payload).digest("hex");
}

export function createAdminToken(): string {
  const exp = Date.now() + MAX_AGE_SEC * 1000;
  const payload = `ok.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [flag, expStr, sig] = parts;
  if (flag !== "ok") return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const payload = `${flag}.${expStr}`;
  const expected = sign(payload);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifyAdminToken(jar.get(COOKIE)?.value);
}

export function adminCookieOptions(token: string) {
  return {
    name: COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
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
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}

export function checkPassword(input: string): boolean {
  const expected = getAdminPassword();
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    // still do a dummy compare-ish delay
    timingSafeEqual(Buffer.from(expected), Buffer.from(expected));
    return false;
  }
  return timingSafeEqual(a, b);
}
