import type { InviteSide } from "@/types/wedding";

export type GuestInvite = {
  /** 4–8 digit shortcode (legacy 4-digit still valid) */
  code: string;
  name: string;
  side: InviteSide;
  createdAt: string;
};

export type GuestState = {
  name: string;
  side: InviteSide;
  code: string | null;
  loading: boolean;
  error: string | null;
  resolved: boolean;
  ready: boolean;
};
