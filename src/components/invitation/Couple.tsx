"use client";

import { wedding } from "@/config/wedding";
import { InView, SectionHead } from "@/components/motion/primitives";

function Person({
  fullName,
  nickname,
  parents,
  delay = 0,
}: {
  fullName: string;
  nickname: string;
  parents: string;
  delay?: number;
}) {
  return (
    <InView delay={delay} className="text-center">
      <p className="font-script text-[2.75rem] leading-none text-gold sm:text-[3rem]">
        {nickname}
      </p>
      <h3 className="mt-2 font-serif text-[1.35rem] font-medium tracking-wide text-primary-dark sm:text-[1.45rem]">
        {fullName}
      </h3>
      <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
        {parents}
      </p>
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
        <SectionHead script="Bride & Groom" />

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

        <div className="space-y-2">
          <Person
            fullName={first.fullName}
            nickname={first.nickname}
            parents={first.parents}
          />

          <InView delay={0.06} className="py-6 text-center">
            <span
              className="ampersand ampersand-sm inline-flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-white/60 shadow-sm backdrop-blur-sm"
              aria-hidden
            >
              &amp;
            </span>
          </InView>

          <Person
            fullName={second.fullName}
            nickname={second.nickname}
            parents={second.parents}
            delay={0.1}
          />
        </div>
      </div>
    </section>
  );
}
