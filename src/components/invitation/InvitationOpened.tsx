"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Image from "next/image";
import { InvitationScrollProvider } from "@/components/invitation/InvitationScroll";
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
import { WaxSealCrest, IslamicArchHeader } from "@/components/ui/Ornament";

const LocationMap = dynamic(
  () =>
    import("@/components/invitation/LocationMap").then((m) => m.LocationMap),
  {
    ssr: false,
    loading: () => (
      <section className="section-cream section-pad sm:px-8">
        <div className="mx-auto max-w-[380px]">
          <div className="h-[280px] animate-pulse rounded-[1.35rem] bg-cream-soft" />
        </div>
      </section>
    ),
  },
);

function DesktopStickyPane({ guestName }: { guestName: string }) {
  return (
    <aside className="z-20 hidden h-full overflow-hidden rounded-[2rem] border border-gold/35 bg-cream shadow-[0_24px_60px_-18px_rgba(23,63,51,0.32)] lg:col-span-5 lg:flex">
      <div className="relative flex h-full w-full flex-col justify-between p-8 text-center">
        <Image
          src="/ornaments/cover-bg.jpg"
          alt=""
          fill
          quality={75}
          sizes="50vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 cover-wash" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center">
          <WaxSealCrest initials="UN" size={88} className="mb-3" />
          <IslamicArchHeader className="mb-1 max-w-[200px]" />
          <p className="font-script text-[2.4rem] leading-none text-ink">
            The Wedding Of
          </p>

          <div className="mx-auto my-3 flex w-full max-w-[290px] justify-center select-none">
            <Image
              src="/images/couple-card-gold.png"
              alt="The Wedding of Ubay & Nindi"
              width={420}
              height={280}
              className="h-auto w-full object-contain drop-shadow-[0_6px_20px_rgba(20,45,32,0.2)]"
            />
          </div>

          <div className="ornament-line mx-auto my-4">
            <span className="dot" />
          </div>

          <div className="guest-glass mx-auto mt-2 w-full max-w-[280px] rounded-[1.35rem] p-4.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
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

function DeferredLocationMap() {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder) return;
    if (typeof IntersectionObserver === "undefined") {
      const timer = window.setTimeout(() => setReady(true), 0);
      return () => window.clearTimeout(timer);
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setReady(true);
      observer.disconnect();
    }, { rootMargin: "500px 0px" });
    observer.observe(holder);
    return () => observer.disconnect();
  }, []);

  return (
    <div id="location" ref={holderRef}>
      {ready ? (
        <LocationMap />
      ) : (
        <section className="section-cream section-pad sm:px-8" aria-label="Lokasi acara">
          <div className="mx-auto max-w-[380px]">
            <div className="h-[280px] animate-pulse rounded-[1.35rem] bg-cream-soft" />
          </div>
        </section>
      )}
    </div>
  );
}

export function InvitationOpened({
  guestName,
  isPlaying,
  onToggleMusic,
}: {
  guestName: string;
  isPlaying: boolean;
  onToggleMusic: () => void;
}) {
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);

  return (
    <InvitationScrollProvider element={scrollEl}>
      <motion.main
        className="relative min-h-dvh overflow-x-hidden bg-cream-soft py-0 lg:h-dvh lg:overflow-hidden lg:py-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
      >
        <div className="relative z-10 lg:mx-auto lg:grid lg:h-full lg:max-w-6xl lg:grid-cols-12 lg:gap-8 lg:px-6">
          <DesktopStickyPane guestName={guestName} />

          <div
            id="invitation-scroll"
            ref={setScrollEl}
            className="scroll-soft relative overflow-x-hidden rounded-none lg:col-span-7 lg:h-full lg:overflow-y-auto lg:rounded-[2rem] lg:border lg:border-gold/35 lg:bg-cream lg:shadow-[0_24px_60px_-18px_rgba(23,63,51,0.26)]"
          >
            <Hero />
            <Verse />
            <Couple />
            <Countdown />
            <Events />
            <LoveStory />
            <DeferredLocationMap />
            <Gift />
            <Wishes />
            <Closing />
          </div>
        </div>
      </motion.main>

      <SectionNav />
      <SectionNavMobile />
      <ShareButton />
      <MusicToggle isPlaying={isPlaying} onToggle={onToggleMusic} />
    </InvitationScrollProvider>
  );
}
