"use client";

import { wedding } from "@/config/wedding";
import { InView, SectionHead } from "@/components/motion/primitives";
import { GoldDivider } from "@/components/ui/Ornament";

function GroomAvatar() {
  return (
    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-gold/40 bg-gradient-to-br from-[#1f2d22] via-[#2a382c] to-[#172219] text-gold-light shadow-md">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="1.4" />
        <path d="M12 13v4M10 15h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function BrideAvatar() {
  return (
    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-gold/40 bg-gradient-to-br from-[#8e7a5a] via-[#b09f83] to-[#6e5c3d] text-white shadow-md">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5 21c0-3.8 3.1-7 7-7s7 3.2 7 7" stroke="currentColor" strokeWidth="1.4" />
        <path d="M12 4c-4 0-5 3-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function Person({
  fullName,
  nickname,
  parents,
  isGroom,
  delay = 0,
}: {
  fullName: string;
  nickname: string;
  parents: string;
  isGroom?: boolean;
  delay?: number;
}) {
  return (
    <InView delay={delay} className="text-center">
      <div className="arch-frame card-gold-shine mx-auto px-6 py-10 shadow-[0_20px_48px_-20px_rgba(31,45,34,0.18)]">
        {isGroom ? <GroomAvatar /> : <BrideAvatar />}
        <p className="mt-5 font-script text-[2.85rem] leading-none text-gold sm:text-[3.1rem]">
          {nickname}
        </p>
        <h3 className="mt-2 font-serif text-[1.4rem] font-medium tracking-wide text-primary-dark sm:text-[1.5rem]">
          {fullName}
        </h3>
        <GoldDivider className="my-4" />
        <p className="text-[12.5px] leading-relaxed text-muted">
          {parents}
        </p>
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
    <section id="couple" className="relative section-cream section-pad sm:px-8">
      <div className="mx-auto max-w-[360px]">
        <SectionHead script="Bride & Groom" title="Mempelai" />

        <InView>
          <div className="mb-10 text-center">
            <p className="font-serif text-[14px] font-medium italic text-primary-dark">
              {intro.greeting}
            </p>
            <p className="mx-auto mt-4 max-w-[300px] text-[13.5px] leading-[1.8] text-muted">
              {intro.body}
            </p>
          </div>
        </InView>

        <div className="space-y-6">
          <Person
            fullName={first.fullName}
            nickname={first.nickname}
            parents={first.parents}
            isGroom={first.nickname === groom.nickname}
          />

          <InView delay={0.06} className="py-2 text-center">
            <span
              className="ampersand ampersand-sm inline-flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-gradient-to-br from-white via-cream to-cream-2 text-gold shadow-md backdrop-blur-md"
              aria-hidden
            >
              &amp;
            </span>
          </InView>

          <Person
            fullName={second.fullName}
            nickname={second.nickname}
            parents={second.parents}
            isGroom={second.nickname === groom.nickname}
            delay={0.1}
          />
        </div>
      </div>
    </section>
  );
}

