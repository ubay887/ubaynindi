import { NextResponse } from "next/server";
import { findGuestByCode } from "@/lib/guests";

/**
 * Public lookup by 4-digit shortcode.
 * GET /api/guest?c=4821
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("c") ?? "";

  if (!/^\d{4}$/.test(code)) {
    return NextResponse.json({ error: "Kode tidak valid." }, { status: 400 });
  }

  const guest = await findGuestByCode(code);
  if (!guest) {
    return NextResponse.json({ error: "Kode tidak ditemukan." }, { status: 404 });
  }

  // Only expose fields needed for the invitation UI
  return NextResponse.json({
    code: guest.code,
    name: guest.name,
    side: guest.side,
  });
}
