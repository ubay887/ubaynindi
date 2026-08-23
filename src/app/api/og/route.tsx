import { findGuestByCode } from "@/lib/guests";
import { createOgImage } from "@/lib/og";
import { parseInviteSide } from "@/lib/utils";

/**
 * Dynamic OG: /api/og?c=4821  or  /api/og?side=pria
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = (searchParams.get("c") ?? "").trim();
  const guest = /^\d{4}$/.test(code) ? await findGuestByCode(code) : null;

  if (guest) {
    return createOgImage({ guestName: guest.name, side: guest.side });
  }

  const side = parseInviteSide(searchParams.get("side"));
  return createOgImage({ side });
}
