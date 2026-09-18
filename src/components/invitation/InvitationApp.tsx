"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { wedding } from "@/config/wedding";
import { useGuestName } from "@/hooks/useGuestName";
import { useInvitationAudio } from "@/hooks/useInvitationAudio";
import { Cover } from "@/components/invitation/Cover";
import { MusicToggle } from "@/components/invitation/MusicToggle";
import { ShareButton } from "@/components/invitation/ShareButton";
import {
  SectionNav,
  SectionNavMobile,
} from "@/components/invitation/SectionNav";
import { Hero } from "@/components/invitation/Hero";
import { Verse } from "@/components/invitation/Verse";
import { Couple } from "@/components/invitation/Couple";
import { Countdown } from "@/components/invitation/Countdown";
import { Events } from "@/components/invitation/Events";
import { LoveStory } from "@/components/invitation/LoveStory";
import { Notes } from "@/components/invitation/Notes";
import { Gift } from "@/components/invitation/Gift";
import { Wishes } from "@/components/invitation/Wishes";
import { Closing } from "@/components/invitation/Closing";
import Image from "next/image";
import { WaxSealCrest } from "@/components/ui/Ornament";
import { AmbientField } from "@/components/motion/AmbientField";
import { AuroraBg } from "@/components/motion/AuroraBg";

/** Leaflet needs `window` — load map only on the client */
const LocationMap = dynamic(
  () =>
    import("@/components/invitation/LocationMap").then((m) => m.LocationMap),
  {
    ssr: false,
    loading: () => (
      <section className="section-cream section-pad sm:px-8">
        <div className="mx-auto max-w-[380px]">
          <div className="h-[280px] animate-pulse rounded-[1.35rem] bg-[#e8efe6]" />
        </div>
      </section>
    ),
  },
);

function DesktopStickyPane({ guestName }: { guestName: string }) {
  const [first, second] = wedding.couple.displayNames.split(" & ");

  return (
    <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] overflow-hidden rounded-[2rem] border border-gold/30 bg-cream shadow-[0_24px_60px_-15px_rgba(31,45,34,0.35)] lg:flex lg:col-span-5 flex-col justify-between p-8 text-center relative z-20">
      <Image
        src="/ornaments/cover-bg.jpg"
        alt=""
        fill
        priority
        quality={90}
        sizes="50vw"
        className="object-cover object-[center_22%]"
      />
      <div className="absolute inset-0 illust-wash" />
      <AmbientField density="high" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <WaxSealCrest initials="UN" className="mb-4 scale-100" />
        <p className="font-script text-[2.2rem] leading-none text-primary-dark">
          The Wedding Of
        </p>
        <h1 className="mt-4 font-serif text-[3.2rem] font-bold uppercase leading-none tracking-[0.16em] text-primary-dark name-shadow">
          {first}
        </h1>
        <p className="ampersand my-1 text-2xl" aria-hidden>
          &amp;
        </p>
        <h1 className="font-serif text-[3.2rem] font-bold uppercase leading-none tracking-[0.16em] text-primary-dark name-shadow">
          {second}
        </h1>

        <div className="ornament-line mx-auto my-5">
          <span className="dot" />
        </div>

        {/* Guest Plate on Desktop */}
        <div className="guest-glass gold-border-glow mx-auto w-full max-w-[280px] rounded-2xl p-4 mt-2">
          <p className="text-[10px] tracking-[0.2em] text-muted uppercase font-semibold">
            Kepada Yth.
          </p>
          <p className="mt-1 font-serif text-lg font-bold text-primary-dark">
            {guestName}
          </p>
        </div>
      </div>
    </aside>
  );
}

function InvitationInner() {
  const guestName = useGuestName();
  const [opened, setOpened] = useState(false);
  const { isPlaying, play, toggle } = useInvitationAudio(opened);

  useEffect(() => {
    document.body.classList.toggle("invitation-locked", !opened);
    return () => document.body.classList.remove("invitation-locked");
  }, [opened]);

  const handleOpen = useCallback(async () => {
    setOpened(true);
    if (wedding.audio.autoplayOnOpen) {
      window.setTimeout(() => void play(), 350);
    }
  }, [play]);

  return (
    <>
      <AnimatePresence mode="wait">
        {!opened ? (
          <Cover key="cover" guestName={guestName} onOpen={handleOpen} />
        ) : null}
      </AnimatePresence>

      {opened ? (
        <motion.main
          key="main"
          className="relative min-h-dvh overflow-hidden bg-[#efece6] py-0 lg:py-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        >
          {/* Continuous atmospheric motion canvas */}
          <div className="pointer-events-none fixed inset-0 z-0">
            <AuroraBg variant="page" />
            <AmbientField density="high" scrollLinked />
          </div>

          <div className="relative z-10 lg:grid lg:grid-cols-12 lg:max-w-6xl lg:mx-auto lg:gap-8 lg:px-6">
            <DesktopStickyPane guestName={guestName} />

            {/* Scrollable invitation column */}
            <div className="lg:col-span-7 overflow-hidden rounded-none lg:rounded-[2rem] lg:border lg:border-gold/30 lg:bg-[#f7f6f2] lg:shadow-[0_24px_60px_-15px_rgba(31,45,34,0.28)]">
              <Hero />
              <Verse />
              <Couple />
              <Countdown />
              <Events />
              <LoveStory />
              <LocationMap />
              <Notes />
              <Gift />
              <Wishes />
              <Closing />
            </div>
          </div>
        </motion.main>
      ) : null}

      {opened ? (
        <>
          <SectionNav />
          <SectionNavMobile />
          <ShareButton />
          <MusicToggle isPlaying={isPlaying} onToggle={toggle} />
        </>
      ) : null}
    </>
  );
}

export function InvitationApp() {
  return (
    <Suspense
      fallback={
        <div className="relative flex min-h-dvh items-center justify-center overflow-hidden section-cream">
          <div className="text-center">
            <p className="font-script text-[2rem] text-primary-dark">
              The Wedding Of
            </p>
            <div className="ornament-line mx-auto my-3">
              <span className="dot" />
            </div>
            <p className="font-serif text-2xl tracking-[0.14em] text-primary-dark uppercase">
              {wedding.couple.displayNames}
            </p>
          </div>
        </div>
      }
    >
      <InvitationInner />
    </Suspense>
  );
}
