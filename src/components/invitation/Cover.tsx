"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { wedding, getPrimaryEvent } from "@/config/wedding";
import { useInviteSide } from "@/hooks/useInviteSide";
import { sideLabel } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { AmbientField } from "@/components/motion/AmbientField";
import { WaxSealCrest } from "@/components/ui/Ornament";

type CoverProps = {
  guestName: string;
  onOpen: () => void;
};

const ease = [0.22, 1, 0.36, 1] as const;

export function Cover({ guestName, onOpen }: CoverProps) {
  const side = useInviteSide();
  const primary = getPrimaryEvent(side);
  const [first, second] = wedding.couple.displayNames.split(" & ");

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden bg-cream"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.08,
        y: -24,
        filter: "blur(12px)",
        transition: { duration: 0.85, ease: [0.4, 0, 0.2, 1] },
      }}
    >
      <Image
        src="/ornaments/cover-bg.jpg"
        alt=""
        fill
        priority
        quality={90}
        sizes="100vw"
        className="object-cover object-[center_22%]"
      />
      <div className="absolute inset-0 illust-wash" />
      <AmbientField density="high" />

      {/* Side vignette for focus — like framed manuscript */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 42%, transparent 0%, rgba(255,252,245,0.25) 100%)",
        }}
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-7 pb-8 pt-10">
        <div className="w-full max-w-[320px] text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease, delay: 0.05 }}
            className="mb-3"
          >
            <WaxSealCrest initials="UN" />
          </motion.div>

          <motion.p
            className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08, duration: 0.5 }}
          >
            {sideLabel(side)}
          </motion.p>

          <motion.p
            className="mt-1 font-script text-[2.05rem] leading-none text-primary-dark sm:text-[2.25rem]"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.15 }}
          >
            The Wedding Of
          </motion.p>

          <motion.h1
            className="mt-4 font-serif text-[2.85rem] font-semibold uppercase leading-[1.02] tracking-[0.18em] text-primary-dark name-shadow sm:text-[3.1rem]"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease, delay: 0.32 }}
          >
            {first}
          </motion.h1>

          <motion.p
            className="ampersand my-0.5"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease, delay: 0.5 }}
            aria-hidden
          >
            &amp;
          </motion.p>

          <motion.h1
            className="font-serif text-[2.85rem] font-semibold uppercase leading-[1.02] tracking-[0.18em] text-primary-dark name-shadow sm:text-[3.1rem]"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease, delay: 0.55 }}
          >
            {second}
          </motion.h1>

          <motion.p
            className="mt-3 text-[11px] font-medium tracking-[0.2em] text-primary uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.55 }}
          >
            {primary.dateLabel}
          </motion.p>

          {/* Guest plate — thin glassy panel with gold border glow */}
          <motion.div
            className="guest-glass gold-border-glow mx-auto mt-6 w-full rounded-2xl px-5 py-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.9 }}
          >
            <p className="text-[11px] tracking-[0.18em] text-muted uppercase">
              Kepada Yth.
            </p>
            <p className="mt-0.5 text-[11px] text-muted">
              Bapak/Ibu/Saudara/i
            </p>
            <p className="mt-2 font-serif text-[1.45rem] font-medium tracking-wide text-primary-dark">
              {guestName}
            </p>
            <p className="mt-1.5 text-[10px] leading-relaxed text-muted">
              *Mohon maaf jika ada kesalahan penulisan nama / gelar.
            </p>
          </motion.div>

          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 1.1 }}
          >
            <Button
              size="lg"
              variant="double-solid"
              className="btn-pulse min-w-[200px]"
              onClick={onOpen}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 8l8-4 8 4v9a2 2 0 01-2 2H6a2 2 0 01-2-2V8z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path d="M4 9l8 5 8-5" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              Buka Undangan
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

