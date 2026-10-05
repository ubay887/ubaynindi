"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { GuestState } from "@/types/guest";

export type { GuestState };

const GuestContext = createContext<GuestState | null>(null);

export function GuestProvider({
  children,
  initial,
}: {
  children: ReactNode;
  initial: GuestState;
}) {
  return (
    <GuestContext.Provider value={initial}>{children}</GuestContext.Provider>
  );
}

export function useInvitationGuest(): GuestState {
  const ctx = useContext(GuestContext);
  if (!ctx) {
    throw new Error("useInvitationGuest must be used within GuestProvider");
  }
  return ctx;
}
