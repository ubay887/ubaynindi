"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { getPrimaryEvent } from "@/config/wedding";
import { useInvitationGuest } from "@/hooks/useInvitationGuest";
import { sideLabel } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { AmbientField } from "@/components/motion/AmbientField";
import {
  WaxSealCrest,
  FloatingIslamicCloud,
  SwayingLantern,
  SwayingFloralVine,
  IslamicArchHeader,
  IslamicCornerArt,
} from "@/components/ui/Ornament";

type CoverProps = {
  guestName: string;
  onOpen: () => void;
};

const ease = [0.22, 1, 0.36, 1] as const;

export function Cover({ guestName, onOpen }: CoverProps) {
  const guest = useInvitationGuest();
  const side = guest.side;
  const primary = getPrimaryEvent(side);
  const showSchedule = guest.ready;

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
        quality={70}
        sizes="100vw"
        className="object-cover object-[center_22%]"
      />
      <div className="absolute inset-0 illust-wash" />
      <AmbientField density="low" />

      {/* Dynamic Floating Islamic Clouds (Invisimple style continuous float) */}
      <FloatingIslamicCloud
        variant={1}
        width={210}
        className="-top-4 -left-10 text-gold-light/60"
        opacity={0.6}
      />
      <FloatingIslamicCloud
        variant={2}
        width={230}
        flip
        className="top-24 -right-12 text-gold-light/50"
        opacity={0.55}
      />
      <FloatingIslamicCloud
        variant={3}
        width={220}
        className="bottom-8 -left-12 text-gold-light/60"
        opacity={0.5}
      />

      <SwayingLantern className="top-0 left-6 z-10" size={56} />
      <SwayingLantern className="top-0 right-6 z-10" size={48} />
      <SwayingFloralVine className="top-10 left-1 z-10 text-gold/50" size={58} />
      <SwayingFloralVine className="top-16 right-1 z-10 text-gold/40" size={50} flip />

      {/* Corner Arabesque Art */}
      <IslamicCornerArt position="top-left" className="top-3 left-3" />
      <IslamicCornerArt position="top-right" className="top-3 right-3" />
      <IslamicCornerArt position="bottom-left" className="bottom-3 left-3" />
      <IslamicCornerArt position="bottom-right" className="bottom-3 right-3" />

      {/* Side vignette for focus */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 42%, transparent 0%, rgba(255,252,245,0.25) 100%)",
        }}
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-center overflow-y-auto px-6 py-8 sm:px-7">
        <div className="w-full max-w-[325px] text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease, delay: 0.05 }}
            className="mb-2"
          >
            <WaxSealCrest initials="UN" />
          </motion.div>

          <IslamicArchHeader className="mb-1" />

          <motion.p
            className="font-script text-[2.15rem] leading-none text-ink"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.55, ease }}
          >
            The Wedding Of
          </motion.p>

          <motion.p
            className="mt-1.5 text-[10.5px] font-bold uppercase tracking-[0.24em] text-primary min-h-[1.2em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: showSchedule ? 1 : 0.35 }}
            transition={{ delay: 0.18, duration: 0.5 }}
          >
            {showSchedule ? sideLabel(side) : "Undangan Pernikahan"}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.2 }}
            className="mx-auto my-2 flex w-full max-w-[285px] justify-center select-none"
          >
            <Image
              src="/images/couple-card-gold.png"
              alt="The Wedding of Ubay & Nindi"
              width={420}
              height={280}
              className="h-auto w-full object-contain drop-shadow-[0_6px_20px_rgba(20,45,32,0.18)]"
              priority
            />
          </motion.div>

          <motion.p
            className="mt-3 text-[11px] font-semibold tracking-[0.22em] text-primary uppercase min-h-[1.2em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.55 }}
          >
            {showSchedule ? primary.dateLabel : "\u00a0"}
          </motion.p>

          {/* Guest plate — thin glassy panel with gold border glow */}
          <motion.div
            className="guest-glass gold-border-glow mx-auto mt-4 w-full rounded-2xl px-4 py-3 sm:mt-5 sm:px-5 sm:py-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.9 }}
          >
            <p className="text-[10.5px] font-semibold tracking-[0.2em] text-muted uppercase">
              Kepada Yth.
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-muted">
              Bapak/Ibu/Saudara/i
            </p>
            <p className="mt-2 font-serif text-[1.5rem] font-bold tracking-wide text-ink">
              {guest.loading ? "Memuat undangan…" : guestName}
            </p>
            {guest.error ? (
              <p className="mt-1.5 text-[10.5px] leading-relaxed text-red-800">
                {guest.error} Undangan tetap dapat dibuka.
              </p>
            ) : (
              <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted">
                *Mohon maaf jika ada kesalahan penulisan nama / gelar.
              </p>
            )}
          </motion.div>

          <motion.div
            className="mt-4 sm:mt-6"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 1.1 }}
          >
            <Button
              size="lg"
              variant="double-solid"
              className="btn-pulse min-w-[210px] text-sm tracking-wider font-semibold shadow-lg"
              onClick={onOpen}
              disabled={!guest.ready}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 8l8-4 8 4v9a2 2 0 01-2 2H6a2 2 0 01-2-2V8z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path d="M4 9l8 5 8-5" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              Buka Undangan
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

