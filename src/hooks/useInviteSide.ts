"use client";

import { useInvitationGuest } from "@/hooks/useInvitationGuest";
import type { InviteSide } from "@/types/wedding";

/**
 * Invitation side (wanita/pria).
 * Comes from `?side=` (default wanita).
 */
export function useInviteSide(): InviteSide {
  return useInvitationGuest().side;
}
