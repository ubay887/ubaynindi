"use client";

import { useInvitationGuest } from "@/hooks/useInvitationGuest";

/** Guest display name — only personalised via valid shortcode `?c=`. */
export function useGuestName(): string {
  return useInvitationGuest().name;
}
