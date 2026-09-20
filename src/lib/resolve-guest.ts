import { findGuestByCode } from "@/lib/guests";
import { decodeGuestName, parseInviteSide, sanitizeGuestName } from "@/lib/utils";
import { normalizeGuestCode } from "@/lib/guest-code";
import type { GuestState } from "@/types/guest";
import type { InviteSide } from "@/types/wedding";

const FALLBACK_NAME = "Tamu Undangan";

function pick(raw: string | string[] | undefined): string | undefined {
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

/** Server lookup so the cover HTML already has the guest name (no extra /api/guest wait). */
export async function resolveInvitationGuest(search: {
  c?: string | string[];
  to?: string | string[];
  side?: string | string[];
}): Promise<GuestState> {
  const code = normalizeGuestCode(pick(search.c));
  const guest = code ? await findGuestByCode(code) : null;
  const directRaw = (pick(search.to) ?? "").trim();
  const directName = directRaw ? decodeGuestName(directRaw) : "";
  const toName =
    directName && directName !== FALLBACK_NAME ? directName : null;
  const sideFallback = parseInviteSide(pick(search.side));

  if (guest) {
    return {
      name: sanitizeGuestName(guest.name) || FALLBACK_NAME,
      side: guest.side,
      code: guest.code,
      loading: false,
      error: null,
      resolved: true,
      ready: true,
    };
  }

  const side: InviteSide = sideFallback;
  return {
    name: toName ?? FALLBACK_NAME,
    side,
    code,
    loading: false,
    error: code ? "Kode undangan tidak valid." : null,
    resolved: Boolean(toName) && !code,
    ready: true,
  };
}
