import type { InviteSide } from "@/types/wedding";

export type GuestInvite = {
  /** 4–8 digit shortcode (legacy 4-digit still valid) */
  code: string;
  name: string;
  side: InviteSide;
  createdAt: string;
};
