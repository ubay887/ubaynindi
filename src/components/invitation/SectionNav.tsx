"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const items = [
  { id: "couple", label: "Mempelai" },
  { id: "countdown", label: "Tanggal" },
  { id: "events", label: "Acara" },
  { id: "location", label: "Lokasi" },
  { id: "gift", label: "Gift" },
  { id: "wishes", label: "Ucapan" },
] as const;

function useActiveSection() {
  const [active, setActive] = useState<string>(items[0].id);

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
      { rootMargin: "-35% 0px -45% 0px", threshold: [0.1, 0.25, 0.5] },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      className="fixed left-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2.5 sm:flex"
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
                  ? "h-2.5 w-2.5 bg-primary-dark shadow-[0_0_0_3px_rgba(79,109,76,0.2)]"
                  : "h-1.5 w-1.5 bg-primary/35 group-hover:bg-primary/70"
              }`}
            />
            <span className="pointer-events-none absolute left-4 ml-1 whitespace-nowrap rounded-full bg-primary-dark/90 px-2 py-0.5 text-[9px] font-medium tracking-wide text-cream opacity-0 transition-opacity group-hover:opacity-100">
              {item.label}
            </span>
          </button>
        );
      })}
    </motion.nav>
  );
}

/**
 * Mobile: one glass FAB — expands to a clean list (no cramped chip bar).
 * Sits mid-right above the music button.
 */
export function SectionNavMobile() {
  const { active, go } = useActiveSection();
  const [open, setOpen] = useState(false);

  const jump = (id: string) => {
    go(id);
    setOpen(false);
  };

  return (
    <div className="fixed bottom-[4.75rem] right-5 z-40 sm:hidden">
      <AnimatePresence>
        {open ? (
          <motion.div
            key="panel"
            className="mb-2 w-[11.5rem] overflow-hidden rounded-2xl border border-white/60 bg-cream/95 shadow-[0_16px_40px_-14px_rgba(46,63,44,0.4)] backdrop-blur-xl"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="border-b border-primary/8 px-3.5 py-2 text-[9px] font-semibold tracking-[0.18em] text-muted uppercase">
              Menu
            </p>
            <ul className="py-1">
              {items.map((item) => {
                const on = active === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => jump(item.id)}
                      className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] transition-colors ${
                        on
                          ? "bg-primary/10 font-semibold text-primary-dark"
                          : "font-medium text-primary-dark/80 active:bg-primary/8"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          on ? "bg-primary-dark" : "bg-primary/30"
                        }`}
                      />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Tutup menu" : "Buka menu"}
        aria-expanded={open}
        className="ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-cream/95 text-primary-dark shadow-[0_12px_28px_-12px_rgba(46,63,44,0.45)] backdrop-blur-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.94 }}
        transition={{ delay: 0.55 }}
      >
        {open ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M5 8h14M5 12h14M5 16h10"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        )}
      </motion.button>
    </div>
  );
}
