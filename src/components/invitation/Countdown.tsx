"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getCalendarUrl,
  getCountdownTarget,
  getPrimaryEvent,
} from "@/config/wedding";
import { useCountdown } from "@/hooks/useCountdown";
import { useInviteSide } from "@/hooks/useInviteSide";
import { pad2 } from "@/lib/utils";
import { LinkButton } from "@/components/ui/Button";
import { InView, SectionHead } from "@/components/motion/primitives";

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="count-cell flex flex-1 flex-col items-center rounded-xl border border-gold/30 bg-white/75 px-1 py-4 shadow-[0_12px_28px_-14px_rgba(46,63,44,0.22)] backdrop-blur-md">
      <div className="relative h-8 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            className="block font-serif text-[1.85rem] font-bold tabular-nums leading-none text-primary-dark sm:text-[2rem]"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {pad2(value)}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-2 text-[9.5px] font-bold uppercase tracking-[0.18em] text-primary-soft">
        {label}
      </span>
    </div>
  );
}

export function Countdown() {
  const side = useInviteSide();
  const target = useMemo(() => getCountdownTarget(side), [side]);
  const parts = useCountdown(target);
  const primary = getPrimaryEvent(side);

  return (
    <section
      id="countdown"
      className="relative overflow-hidden section-sage-soft section-pad sm:px-8"
    >
      <div className="relative mx-auto max-w-[360px]">
        <SectionHead
          script="Save The Date"
          subtitle={primary.dateLabel}
        />

        {parts.isPast ? (
          <p className="text-center font-serif text-lg text-primary-dark">
            Acara telah berlangsung. Terima kasih atas doa restunya.
          </p>
        ) : (
          <InView>
            <div className="flex gap-2.5">
              <Unit value={parts.days} label="Hari" />
              <Unit value={parts.hours} label="Jam" />
              <Unit value={parts.minutes} label="Menit" />
              <Unit value={parts.seconds} label="Detik" />
            </div>
          </InView>
        )}

        <InView delay={0.12} className="mt-9 flex justify-center">
          <LinkButton
            href={getCalendarUrl(side)}
            target="_blank"
            rel="noopener noreferrer"
            variant="double"
            size="md"
            className="min-w-[170px]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect
                x="3"
                y="5"
                width="18"
                height="16"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M3 10h18M8 3v4M16 3v4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Simpan Tanggal
          </LinkButton>
        </InView>
      </div>
    </section>
  );
}
