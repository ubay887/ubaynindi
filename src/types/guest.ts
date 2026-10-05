import type { InviteSide } from "@/types/wedding";

export type GuestState = {
  name: string;
  side: InviteSide;
  loading: boolean;
  error: string | null;
  resolved: boolean;
  ready: boolean;
};
