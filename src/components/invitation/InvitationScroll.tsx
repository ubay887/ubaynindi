"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

type InvitationScrollValue = {
  /** Column element (may or may not be the active scroller). */
  element: HTMLElement | null;
  /** Non-null when the invitation column is overflow-scrolling (desktop). */
  scroller: HTMLElement | null;
  scrollerRef: RefObject<HTMLElement | null>;
};

const InvitationScrollContext = createContext<InvitationScrollValue | null>(
  null,
);

export function InvitationScrollProvider({
  element,
  children,
}: {
  element: HTMLElement | null;
  children: ReactNode;
}) {
  const [overflowing, setOverflowing] = useState(false);
  const scroller = overflowing && element ? element : null;
  const scrollerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!element) {
      scrollerRef.current = null;
      return;
    }

    const measure = () => {
      const next =
        element.scrollHeight > element.clientHeight + 4 ? element : null;
      scrollerRef.current = next;
      setOverflowing(Boolean(next));
    };
    measure();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => {
        window.removeEventListener("resize", measure);
        scrollerRef.current = null;
      };
    }

    const ro = new ResizeObserver(measure);
    ro.observe(element);
    return () => {
      ro.disconnect();
      scrollerRef.current = null;
    };
  }, [element]);

  const value = useMemo(
    () => ({ element, scroller, scrollerRef }),
    [element, scroller],
  );

  return (
    <InvitationScrollContext.Provider value={value}>
      {children}
    </InvitationScrollContext.Provider>
  );
}

export function useInvitationScroll() {
  return useContext(InvitationScrollContext);
}
