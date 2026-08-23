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
          className="min-h-dvh"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        >
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
