import { findGuestByCode } from "@/lib/guests";
import { createOgImage } from "@/lib/og";
import { decodeGuestName, parseInviteSide } from "@/lib/utils";
import { normalizeGuestCode } from "@/lib/guest-code";
import { clientKey, rateLimit } from "@/lib/rate-limit";

/**
 * Dynamic OG: /api/og?c=4821  or  /api/og?side=pria&to=Nama
 */
export async function GET(request: Request) {
  const limited = rateLimit(`og:${clientKey(request)}`, 20, 60_000);
  if (!limited.ok) {
    return new Response("Too Many Requests", {
      status: 429,
      headers: { "Retry-After": String(limited.retryAfterSec) },
    });
  }

  const { searchParams } = new URL(request.url);
  const code = normalizeGuestCode(searchParams.get("c"));
  const guest = code ? await findGuestByCode(code) : null;

  if (guest) {
    return createOgImage({ guestName: guest.name, side: guest.side });
  }

  const side = parseInviteSide(searchParams.get("side"));
  const toRaw = (searchParams.get("to") ?? "").trim();
  const guestName = toRaw ? decodeGuestName(toRaw) : undefined;
  return createOgImage({
    side,
    guestName: guestName === "Tamu Undangan" ? undefined : guestName,
  });
}
