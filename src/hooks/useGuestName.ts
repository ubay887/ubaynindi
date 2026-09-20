"use client";

import { useInvitationGuest } from "@/hooks/useInvitationGuest";

/**
 * Guest display name.
 * Prefer valid shortcode `?c=`; else optional `?to=`; else "Tamu Undangan".
 */
export function useGuestName(): string {
  return useInvitationGuest().name;
}
