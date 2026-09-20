"use client";

import { useInvitationGuest } from "@/hooks/useInvitationGuest";
import type { InviteSide } from "@/types/wedding";

/**
 * Invitation side (wanita/pria).
 * From shortcode guest record when `?c=` is valid;
 * otherwise from `?side=` (default wanita).
 * Wait for `useInvitationGuest().ready` before showing schedule.
 */
export function useInviteSide(): InviteSide {
  return useInvitationGuest().side;
}
