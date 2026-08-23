import { NextResponse } from "next/server";
import {
  adminCookieOptions,
  checkPassword,
  clearAdminCookieOptions,
  createAdminToken,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  let body: { password?: string } = {};
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  if (!checkPassword(body.password ?? "")) {
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
