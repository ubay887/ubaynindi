import type { InviteSide } from "@/types/wedding";

export type GuestInvite = {
  /** 4-digit shortcode, e.g. "4821" */
  code: string;
  name: string;
  side: InviteSide;
  createdAt: string;
};
