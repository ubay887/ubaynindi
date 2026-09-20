import { NextResponse } from "next/server";
import { findGuestByCode } from "@/lib/guests";
import { normalizeGuestCode } from "@/lib/guest-code";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { sanitizeGuestName } from "@/lib/utils";

/**
 * Public lookup by shortcode.
 * GET /api/guest?c=4821
 */
export async function GET(request: Request) {
  const limited = rateLimit(`guest:${clientKey(request)}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi sebentar." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const { searchParams } = new URL(request.url);
  const code = normalizeGuestCode(searchParams.get("c"));

  if (!code) {
    return NextResponse.json({ error: "Kode tidak valid." }, { status: 400 });
  }

  const guest = await findGuestByCode(code);
  if (!guest) {
    return NextResponse.json({ error: "Kode tidak ditemukan." }, { status: 404 });
  }

  // Only expose fields needed for the invitation UI
  return NextResponse.json({
    code: guest.code,
    name: sanitizeGuestName(guest.name),
    side: guest.side,
  });
}
