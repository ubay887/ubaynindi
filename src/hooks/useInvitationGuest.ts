"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { parseInviteSide } from "@/lib/utils";
import type { InviteSide } from "@/types/wedding";

type GuestState = {
  name: string;
  side: InviteSide;
  code: string | null;
  loading: boolean;
  error: string | null;
  /** True when name came from a valid shortcode */
  resolved: boolean;
};

/**
 * Resolves guest from 4-digit shortcode `?c=4821`.
 * Public `?to=` is ignored (cannot spoof guest names).
 * Optional `?side=` only applies when there is no valid code.
 */
export function useInvitationGuest(): GuestState {
  const params = useSearchParams();
  const code = useMemo(() => {
    const c = (params.get("c") ?? "").trim();
    return /^\d{4}$/.test(c) ? c : null;
  }, [params]);
  const toParam = useMemo(() => {
    const to = (params.get("to") ?? "").trim();
    return to.length > 0 ? to : null;
  }, [params]);
  const sideFallback = useMemo(
    () => parseInviteSide(params.get("side")),
    [params],
  );

  const initialName = toParam ?? "Tamu Undangan";
  const [state, setState] = useState<GuestState>({
    name: initialName,
    side: sideFallback,
    code: null,
    loading: Boolean(code),
    error: null,
    resolved: Boolean(toParam),
  });

  useEffect(() => {
    if (!code) {
      setState({
        name: toParam ?? "Tamu Undangan",
        side: sideFallback,
        code: null,
        loading: false,
        error: null,
        resolved: Boolean(toParam),
      });
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null, code }));

    void (async () => {
      try {
        const res = await fetch(`/api/guest?c=${code}`);
        if (!res.ok) {
          if (!cancelled) {
            setState({
              name: "Tamu Undangan",
              side: sideFallback,
              code,
              loading: false,
              error: "Kode undangan tidak valid.",
              resolved: false,
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
          setState({
            name: data.name,
            side: data.side,
            code: data.code,
            loading: false,
            error: null,
            resolved: true,
          });
        }
      } catch {
        if (!cancelled) {
          setState({
            name: "Tamu Undangan",
            side: sideFallback,
            code,
            loading: false,
            error: "Gagal memuat data undangan.",
            resolved: false,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, sideFallback]);

  return state;
}
