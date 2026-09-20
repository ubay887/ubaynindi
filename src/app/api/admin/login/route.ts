import { NextResponse } from "next/server";
import {
  adminCookieOptions,
  checkPassword,
  clearAdminCookieOptions,
  createAdminToken,
  getAdminPassword,
} from "@/lib/admin-auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limitKey = `admin-login:${clientKey(request)}`;
  const blocked = rateLimit(limitKey, 5, 15 * 60_000, { peek: true });
  if (!blocked.ok) {
    return NextResponse.json(
      { error: `Terlalu banyak percobaan. Coba lagi dalam ${blocked.retryAfterSec} detik.` },
      { status: 429, headers: { "Retry-After": String(blocked.retryAfterSec) } },
    );
  }

  if (!getAdminPassword()) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD belum diset di server." },
      { status: 503 },
    );
  }

  let body: { password?: string } = {};
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  if (!checkPassword(body.password ?? "")) {
    const limited = rateLimit(limitKey, 5, 15 * 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: `Terlalu banyak percobaan. Coba lagi dalam ${limited.retryAfterSec} detik.` },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
      );
    }
    return NextResponse.json({ error: "Password salah." }, { status: 401 });
  }

  const token = createAdminToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookieOptions(token));
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(clearAdminCookieOptions());
  return res;
}
