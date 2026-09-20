"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { decodeGuestName, parseInviteSide, sanitizeGuestName } from "@/lib/utils";
import { normalizeGuestCode } from "@/lib/guest-code";
import type { InviteSide } from "@/types/wedding";

const FALLBACK_NAME = "Tamu Undangan";

export type GuestState = {
  name: string;
  side: InviteSide;
  code: string | null;
  loading: boolean;
  error: string | null;
  /** True when name came from a valid shortcode or `?to=`. */
  resolved: boolean;
  /**
   * False while a shortcode is in-flight.
   * Do not paint side-specific schedule until this is true.
   */
  ready: boolean;
};

const GuestContext = createContext<GuestState | null>(null);

function useGuestState(): GuestState {
  const params = useSearchParams();
  const code = useMemo(() => normalizeGuestCode(params.get("c")), [params]);
  const toName = useMemo(() => {
    const raw = (params.get("to") ?? "").trim();
    if (!raw) return null;
    const decoded = decodeGuestName(raw);
    return decoded === FALLBACK_NAME ? null : decoded;
  }, [params]);
  const sideFallback = useMemo(
    () => parseInviteSide(params.get("side")),
    [params],
  );

  const [lookup, setLookup] = useState<{
    forCode: string;
    name: string;
    side: InviteSide;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    if (!code) return;

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
            setLookup({
              forCode: code,
              name: toName ?? FALLBACK_NAME,
              side: sideFallback,
              error: "Kode undangan tidak valid.",
            });
          }
          return;
        }
        const data = (await res.json()) as {
          name: string;
          side: InviteSide;
          code: string;
        };
        if (!cancelled) {
          setLookup({
            forCode: data.code,
            name: sanitizeGuestName(data.name) || FALLBACK_NAME,
            side: data.side === "pria" ? "pria" : "wanita",
            error: null,
          });
        }
      } catch {
        if (!cancelled) {
          setLookup({
            forCode: code,
            name: toName ?? FALLBACK_NAME,
            side: sideFallback,
            error: "Gagal memuat data undangan.",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
      ac?.abort();
      window.clearTimeout(timer);
    };
  }, [code, sideFallback, toName]);

  const hit = code && lookup?.forCode === code ? lookup : null;

  return {
    name: hit?.name ?? toName ?? FALLBACK_NAME,
    side: hit?.side ?? sideFallback,
    code,
    loading: Boolean(code) && !hit,
    error: hit?.error ?? null,
    resolved: hit ? !hit.error : Boolean(toName) && !code,
    ready: !code || Boolean(hit),
  };
}

export function GuestProvider({ children }: { children: ReactNode }) {
  const guest = useGuestState();
  return <GuestContext.Provider value={guest}>{children}</GuestContext.Provider>;
}

export function useInvitationGuest(): GuestState {
  const ctx = useContext(GuestContext);
  if (!ctx) {
    throw new Error("useInvitationGuest must be used within GuestProvider");
  }
  return ctx;
}
