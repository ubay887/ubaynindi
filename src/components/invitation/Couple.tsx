"use client";

import Image from "next/image";
import { wedding } from "@/config/wedding";
import { InView, SectionHead } from "@/components/motion/primitives";
import {
  GoldDivider,
  IslamicArchHeader,
  IslamicCornerArt,
  FloatingIslamicCloud,
} from "@/components/ui/Ornament";

function GroomAvatar() {
  return (
    <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full p-1 bg-gradient-to-br from-[#dfbe7e] via-[#c29b4e] to-[#1b6554] shadow-[0_14px_30px_-10px_rgba(15,61,52,0.45)] ring-2 ring-[#dfbe7e]/60 transition-transform duration-500 hover:scale-105">
      <div className="relative h-full w-full overflow-hidden rounded-full border border-amber-100/40 bg-[#0f3d34]">
        <Image
          src="/images/avatar-ubay.png"
          alt="Muhammad Ubaydillah"
          fill
          sizes="112px"
          className="object-cover"
        />
      </div>
      <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-gold/60 bg-cream text-[12px] font-serif font-bold text-primary-dark shadow-md">
        U
      </span>
    </div>
  );
}

function BrideAvatar() {
  return (
    <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full p-1 bg-gradient-to-br from-[#dfbe7e] via-[#e2c8be] to-[#c29b4e] shadow-[0_14px_30px_-10px_rgba(194,155,78,0.45)] ring-2 ring-[#dfbe7e]/60 transition-transform duration-500 hover:scale-105">
      <div className="relative h-full w-full overflow-hidden rounded-full border border-amber-100/40 bg-[#0f3d34]">
        <Image
          src="/images/avatar-nindi.png"
          alt="Nindi Nirmala Nadziroh"
          fill
          sizes="112px"
          className="object-cover"
        />
      </div>
      <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-gold/60 bg-cream text-[12px] font-serif font-bold text-primary-dark shadow-md">
        N
      </span>
    </div>
  );
}

function Person({
  fullName,
  nickname,
  parents,
  instagram,
  isGroom,
  delay = 0,
}: {
  fullName: string;
  nickname: string;
  parents: string;
  instagram?: string;
  isGroom?: boolean;
  delay?: number;
}) {
  return (
    <InView delay={delay} className="text-center">
      <div className="arch-frame card-gold-shine relative mx-auto overflow-hidden px-6 py-10 shadow-[0_20px_48px_-20px_rgba(31,45,34,0.18)]">
        <IslamicCornerArt position="top-left" className="top-2 left-2 opacity-50" />
        <IslamicCornerArt position="top-right" className="top-2 right-2 opacity-50" />

        {isGroom ? <GroomAvatar /> : <BrideAvatar />}

        <p className="mt-5 font-script text-[2.9rem] leading-none text-gold sm:text-[3.2rem]">
          {nickname}
        </p>
        <h3 className="mt-2 font-serif text-[1.45rem] font-bold tracking-wide text-ink sm:text-[1.55rem]">
          {fullName}
        </h3>
        <GoldDivider className="my-4" />
        <p className="text-[13px] font-medium leading-relaxed text-muted">
          {parents}
        </p>
        {instagram ? (
          <a
            href={`https://instagram.com/${instagram.replace(/^@/, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-white/70 px-3 py-1.5 text-[11px] font-bold text-primary-dark hover:border-gold"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
            </svg>
            @{instagram.replace(/^@/, "")}
          </a>
        ) : null}
      </div>
    </InView>
  );
}

export function Couple() {
  const { groom, bride, order } = wedding.couple;
  const { intro } = wedding;
  const first = order === "groom-first" ? groom : bride;
  const second = order === "groom-first" ? bride : groom;

  return (
    <section id="couple" className="relative overflow-hidden section-cream section-pad sm:px-8">
      <FloatingIslamicCloud
        variant={3}
        width={190}
        className="-top-8 -right-8 text-gold-light/40"
        opacity={0.4}
      />
      <FloatingIslamicCloud
        variant={1}
        width={200}
        flip
        className="bottom-12 -left-10 text-gold-light/40"
        opacity={0.4}
      />

      <div className="relative mx-auto max-w-[360px]">
        <SectionHead script="Bride & Groom" title="Mempelai" />

        <InView>
          <div className="mb-10 text-center">
            <IslamicArchHeader className="mb-3 max-w-[200px]" />
            <p className="font-serif text-[15px] font-semibold italic text-primary-dark">
              {intro.greeting}
            </p>
            <p className="mx-auto mt-3 max-w-[310px] text-[13.5px] leading-[1.85] text-muted">
              {intro.body}
            </p>
          </div>
        </InView>

        <div className="space-y-6">
          <Person
            fullName={first.fullName}
            nickname={first.nickname}
            parents={first.parents}
            instagram={first.instagram}
            isGroom={first.nickname === groom.nickname}
          />

          <InView delay={0.06} className="py-2 text-center">
            <span
              className="ampersand ampersand-sm inline-flex h-14 w-14 items-center justify-center rounded-full border border-gold/45 bg-gradient-to-br from-white via-cream to-cream-2 text-gold shadow-md backdrop-blur-md"
              aria-hidden
            >
              &amp;
            </span>
          </InView>

          <Person
            fullName={second.fullName}
            nickname={second.nickname}
            parents={second.parents}
            instagram={second.instagram}
            isGroom={second.nickname === groom.nickname}
            delay={0.1}
          />
        </div>
      </div>
    </section>
  );
}

