"use client";

import { useInvitationGuest } from "@/hooks/useInvitationGuest";

/**
 * Guest display name.
 * Comes from the optional `?to=` URL parameter; otherwise "Tamu Undangan".
 */
export function useGuestName(): string {
  return useInvitationGuest().name;
}
