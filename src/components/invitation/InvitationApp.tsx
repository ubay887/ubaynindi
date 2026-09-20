"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { wedding } from "@/config/wedding";
import { GuestProvider, useInvitationGuest } from "@/hooks/useInvitationGuest";
import { useInvitationAudio } from "@/hooks/useInvitationAudio";
import { InvitationScrollProvider } from "@/components/invitation/InvitationScroll";
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
import { Gift } from "@/components/invitation/Gift";
import { Wishes } from "@/components/invitation/Wishes";
import { Closing } from "@/components/invitation/Closing";
import Image from "next/image";
import {
  WaxSealCrest,
  FloatingIslamicCloud,
  IslamicArchHeader,
} from "@/components/ui/Ornament";
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
  return (
    <aside className="hidden h-full overflow-hidden rounded-[2.2rem] border border-gold/45 bg-cream shadow-[0_24px_60px_-15px_rgba(13,34,23,0.35)] lg:flex lg:col-span-5 z-20">
      <div className="relative flex h-full w-full flex-col justify-between p-8 text-center">
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

        {/* Dynamic Floating Islamic Clouds on Desktop Sticky Pane */}
        <FloatingIslamicCloud
          variant={1}
          width={180}
          className="-top-4 -left-8 text-gold-light/50"
          opacity={0.5}
        />
        <FloatingIslamicCloud
          variant={2}
          width={180}
          flip
          className="bottom-12 -right-8 text-gold-light/45"
          opacity={0.45}
        />

        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <WaxSealCrest initials="UN" size={88} className="mb-3" />
          <IslamicArchHeader className="mb-2 max-w-[200px]" />

          <div className="mx-auto my-3 flex w-full max-w-[290px] justify-center select-none">
            <Image
              src="/images/couple-card-gold.png"
              alt="The Wedding of Ubay & Nindi"
              width={420}
              height={280}
              className="h-auto w-full object-contain drop-shadow-[0_6px_20px_rgba(20,45,32,0.2)]"
              priority
            />
          </div>

          <div className="ornament-line mx-auto my-4">
            <span className="dot" />
          </div>

          {/* Guest Plate on Desktop */}
          <div className="guest-glass gold-border-glow mx-auto w-full max-w-[280px] rounded-2xl p-4.5 mt-2">
            <p className="text-[10px] tracking-[0.22em] text-muted uppercase font-bold">
              Kepada Yth.
            </p>
            <p className="mt-1 font-serif text-xl font-bold text-ink">
              {guestName}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function InvitationInner() {
  const guest = useInvitationGuest();
  const guestName = guest.name;
  const [opened, setOpened] = useState(false);
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);
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
        <InvitationScrollProvider element={scrollEl}>
          <motion.main
            key="main"
            className="relative min-h-dvh overflow-x-hidden bg-[#f4ece1] py-0 lg:h-dvh lg:overflow-hidden lg:py-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          >
            {/* Continuous atmospheric motion canvas */}
            <div className="pointer-events-none fixed inset-0 z-0">
              <AuroraBg variant="page" />
              <AmbientField density="high" scrollLinked />
            </div>

            <div className="relative z-10 lg:grid lg:h-full lg:grid-cols-12 lg:max-w-6xl lg:mx-auto lg:gap-8 lg:px-6">
              <DesktopStickyPane guestName={guestName} />

              {/* Scrollable invitation column — phone-width on desktop */}
              <div
                id="invitation-scroll"
                ref={setScrollEl}
                className="relative lg:col-span-7 overflow-x-hidden rounded-none lg:h-full lg:overflow-y-auto scroll-soft lg:rounded-[2rem] lg:border lg:border-gold/30 lg:bg-[#fbf9f4] lg:shadow-[0_24px_60px_-15px_rgba(13,34,23,0.28)]"
              >
                <Hero />
                <Verse />
                <Couple />
                <Countdown />
                <Events />
                <LoveStory />
                <LocationMap />
                <Gift />
                <Wishes />
                <Closing />
              </div>
            </div>
          </motion.main>

          <SectionNav />
          <SectionNavMobile />
          <ShareButton />
          <MusicToggle isPlaying={isPlaying} onToggle={toggle} />
        </InvitationScrollProvider>
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
      <GuestProvider>
        <InvitationInner />
      </GuestProvider>
    </Suspense>
  );
}
