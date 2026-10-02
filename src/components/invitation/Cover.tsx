"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { getPrimaryEvent } from "@/config/wedding";
import { useInvitationGuest } from "@/hooks/useInvitationGuest";
import { sideLabel } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { WaxSealCrest, IslamicArchHeader } from "@/components/ui/Ornament";

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
        y: -12,
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
      }}
    >
      <Image
        src="/ornaments/cover-bg.jpg"
        alt=""
        fill
        priority
        quality={75}
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 cover-wash" />

      <div className="cover-scroll relative z-10 h-full">
        <div className="cover-stage">
        <div className="cover-card">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease, delay: 0.05 }}
            className="cover-crest mb-2"
          >
            <WaxSealCrest initials="UN" eager />
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
            className="cover-monogram mx-auto my-1.5 flex w-full max-w-[245px] justify-center select-none sm:max-w-[275px]"
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
            className="cover-guest guest-glass mx-auto mt-3.5 w-full rounded-[1.35rem] px-4 py-3 sm:mt-5 sm:px-5 sm:py-4"
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
            className="cover-cta mt-3.5 sm:mt-5"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 1.1 }}
          >
            <Button
              size="lg"
              variant="double-solid"
              className="btn-pulse w-full text-sm tracking-wider sm:w-auto sm:min-w-[220px]"
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
      </div>
    </motion.div>
  );
}
