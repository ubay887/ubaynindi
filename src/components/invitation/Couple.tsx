"use client";

import { wedding } from "@/config/wedding";
import { InView, SectionHead } from "@/components/motion/primitives";
import { GoldDivider } from "@/components/ui/Ornament";

function GroomAvatar() {
  return (
    <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full p-1 bg-gradient-to-br from-[#dfbe7e] via-[#c29b4e] to-[#2b5f45] shadow-[0_12px_28px_-10px_rgba(18,44,30,0.35)] ring-1 ring-[#dfbe7e]/40">
      <div className="flex h-full w-full items-center justify-center rounded-full border border-amber-100/30 bg-gradient-to-b from-[#1e4733] to-[#122c1e] text-[#dfbe7e] shadow-inner">
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" aria-hidden className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
          <circle cx="12" cy="7" r="3.75" stroke="#fcfaf6" strokeWidth="1.6" fill="#2d6248" />
          <path d="M4 21c0-4.5 3.5-8 8-8s8 3.5 8 8" stroke="#fcfaf6" strokeWidth="1.6" fill="#1b3f2c" />
          <path d="M10 13.5l2 1.5 2-1.5-1 3-1-0.5-1 0.5-1-3z" fill="#c29b4e" stroke="#967432" strokeWidth="0.5" />
          <circle cx="12" cy="18.5" r="0.75" fill="#fcfaf6" />
        </svg>
      </div>
      <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-gold/40 bg-cream text-[11px] font-serif font-bold text-primary-dark shadow-sm">
        U
      </span>
    </div>
  );
}

function BrideAvatar() {
  return (
    <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full p-1 bg-gradient-to-br from-[#dfbe7e] via-[#e2c8be] to-[#c29b4e] shadow-[0_12px_28px_-10px_rgba(194,155,78,0.35)] ring-1 ring-[#dfbe7e]/40">
      <div className="flex h-full w-full items-center justify-center rounded-full border border-amber-100/30 bg-gradient-to-b from-[#234e3d] to-[#142d20] text-[#fcfaf6] shadow-inner">
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" aria-hidden className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          <path d="M7 9c0-3.5 2.2-6 5-6s5 2.5 5 6c0 2-0.8 3.8-2 4.8v0.7c1.5 0.5 3.5 2.2 4 5.5H5c0.5-3.3 2.5-5 4-5.5v-0.7C7.8 12.8 7 11 7 9z" stroke="#fcfaf6" strokeWidth="1.5" fill="#1b3f2c" />
          <circle cx="12" cy="8.8" r="2.5" fill="#eed9cc" />
          <path d="M9.5 5.5c1.5-0.8 3.5-0.8 5 0" stroke="#dfbe7e" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="12" cy="4.5" r="0.9" fill="#dfbe7e" />
        </svg>
      </div>
      <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-gold/40 bg-cream text-[11px] font-serif font-bold text-primary-dark shadow-sm">
        N
      </span>
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

