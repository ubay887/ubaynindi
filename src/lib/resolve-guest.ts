import { decodeGuestName, parseInviteSide, sanitizeGuestName } from "@/lib/utils";
import type { GuestState } from "@/types/guest";
import type { InviteSide } from "@/types/wedding";

const FALLBACK_NAME = "Tamu Undangan";

function pick(raw: string | string[] | undefined): string | undefined {
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

/** Resolve the direct URL parameters so the cover HTML already has the guest name. */
export async function resolveInvitationGuest(search: {
  to?: string | string[];
  side?: string | string[];
}): Promise<GuestState> {
  const directRaw = (pick(search.to) ?? "").trim();
  const directName = directRaw ? decodeGuestName(directRaw) : "";
  const toName =
    directName && directName !== FALLBACK_NAME ? directName : null;
  const sideFallback = parseInviteSide(pick(search.side));

  const side: InviteSide = sideFallback;
  return {
    name: sanitizeGuestName(toName) || FALLBACK_NAME,
    side,
    loading: false,
    error: null,
    resolved: Boolean(toName),
    ready: true,
  };
}
