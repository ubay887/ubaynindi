"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInvitationScroll } from "@/components/invitation/InvitationScroll";

const items = [
  {
    id: "couple",
    label: "Mempelai",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
  },
  {
    id: "events",
    label: "Acara",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: "location",
    label: "Lokasi",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    id: "gift",
    label: "Kado",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <rect x="3" y="8" width="18" height="13" rx="2" />
        <path d="M12 8v13M3 12h18" />
        <path d="M8 8a3 3 0 1 1 4-2.83M12 5.17A3 3 0 1 1 16 8" />
      </svg>
    ),
  },
  {
    id: "wishes",
    label: "Ucapan",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
] as const;

function useActiveSection() {
  const [active, setActive] = useState<string>(items[0].id);
  const scroll = useInvitationScroll();
  const scroller = scroll?.scroller ?? null;

  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter(Boolean) as HTMLElement[];

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActive(visible[0].target.id);
        }
      },
      {
        root: scroller,
        rootMargin: "-25% 0px -40% 0px",
        threshold: [0.1, 0.25, 0.5],
      },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [scroller]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (scroller) {
      const top =
        el.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop;
      scroller.scrollTo({ top: Math.max(0, top - 12), behavior: "smooth" });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setActive(id);
  };

  return { active, go };
}

/** Desktop: soft vertical dots on the left */
export function SectionNav() {
  const { active, go } = useActiveSection();

  return (
    <motion.nav
      aria-label="Navigasi undangan"
      className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 sm:flex"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      {items.map((item) => {
        const on = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => go(item.id)}
            title={item.label}
            aria-label={item.label}
            aria-current={on ? "true" : undefined}
            className="group relative flex items-center"
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                on
                  ? "h-3 w-3 bg-gradient-to-br from-primary to-primary-dark shadow-[0_0_0_4px_rgba(194,155,78,0.35)]"
                  : "h-2 w-2 bg-primary/40 group-hover:bg-primary/80 group-hover:scale-125"
              }`}
            />
            <span className="pointer-events-none absolute left-5 ml-1 whitespace-nowrap rounded-full border border-gold/30 bg-primary-dark/95 px-2.5 py-1 text-[10px] font-bold tracking-wide text-cream opacity-0 shadow-md transition-opacity group-hover:opacity-100">
              {item.label}
            </span>
          </button>
        );
      })}
    </motion.nav>
  );
}

/**
 * Mobile: Floating Bottom Glassmorphism Dock (Invisimple style)
 */
export function SectionNavMobile() {
  const { active, go } = useActiveSection();

  return (
    <motion.nav
      aria-label="Navigasi cepat"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 rounded-full border border-gold/45 bg-cream/90 px-2.5 py-1.5 shadow-[0_14px_36px_-10px_rgba(18,44,30,0.45)] backdrop-blur-xl sm:hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      {items.map((item) => {
        const on = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => go(item.id)}
            aria-label={item.label}
            aria-current={on ? "true" : undefined}
            className={`relative flex flex-col items-center justify-center rounded-full p-2 transition-all duration-200 ${
              on
                ? "bg-gradient-to-br from-primary-dark to-primary text-gold-light shadow-sm"
                : "text-primary-dark/70 hover:text-primary-dark active:scale-95"
            }`}
          >
            {item.icon}
          </button>
        );
      })}
    </motion.nav>
  );
}
