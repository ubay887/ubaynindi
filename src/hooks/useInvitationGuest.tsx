"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { sanitizeGuestName } from "@/lib/utils";
import type { GuestState } from "@/types/guest";
import type { InviteSide } from "@/types/wedding";

export type { GuestState };

const FALLBACK_NAME = "Tamu Undangan";

const GuestContext = createContext<GuestState | null>(null);

export function GuestProvider({
  children,
  initial,
}: {
  children: ReactNode;
  initial: GuestState;
}) {
  const [state, setState] = useState<GuestState>(initial);

  useEffect(() => {
    const code = initial.code;
    if (!code || initial.resolved || initial.error) return;

    let cancelled = false;
    const ac =
      typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = window.setTimeout(() => ac?.abort(), 8000);

    void (async () => {
      try {
        const res = await fetch(
          `/api/guest?c=${encodeURIComponent(code)}`,
          ac ? { signal: ac.signal } : undefined,
        );
        if (!res.ok) {
          if (!cancelled) {
            setState((prev) => ({
              ...prev,
              loading: false,
              ready: true,
              error: "Kode undangan tidak valid.",
            }));
          }
          return;
        }
        const data = (await res.json()) as {
          name: string;
          side: InviteSide;
          code: string;
        };
        if (!cancelled) {
          setState({
            name: sanitizeGuestName(data.name) || FALLBACK_NAME,
            side: data.side === "pria" ? "pria" : "wanita",
            code: data.code,
            loading: false,
            error: null,
            resolved: true,
            ready: true,
          });
        }
      } catch {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            loading: false,
            ready: true,
            error: "Gagal memuat data undangan.",
          }));
        }
      }
    })();

    return () => {
      cancelled = true;
      ac?.abort();
      window.clearTimeout(timer);
    };
  }, [initial]);

  return <GuestContext.Provider value={state}>{children}</GuestContext.Provider>;
}

export function useInvitationGuest(): GuestState {
  const ctx = useContext(GuestContext);
  if (!ctx) {
    throw new Error("useInvitationGuest must be used within GuestProvider");
  }
  return ctx;
}
