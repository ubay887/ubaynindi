"use client";

import { wedding } from "@/config/wedding";
import { InView } from "@/components/motion/primitives";

export function Verse() {
  const { verse } = wedding;
  const [first, second] = wedding.couple.displayNames.split(" & ");

  return (
    <section className="relative overflow-hidden section-cream section-pad px-6">
      {/* Soft monogram initials like Invisimple P / A */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06]">
        <span className="font-serif text-[12rem] font-semibold leading-none text-primary-dark">
          {first.charAt(0)}
          {second.charAt(0)}
        </span>
      </div>

      <div className="relative mx-auto max-w-[340px] text-center">
        <InView>
          <p className="font-script text-[2.8rem] leading-none text-primary-dark">
            {first.charAt(0)}
            <span className="ampersand ampersand-sm mx-1.5 align-middle" aria-hidden>
              &amp;
            </span>
            {second.charAt(0)}
          </p>
        </InView>
        <InView delay={0.1}>
          <p className="mt-8 font-serif text-[1.05rem] leading-[1.95] text-primary-dark italic sm:text-[1.1rem]">
            &ldquo;{verse.text}&rdquo;
          </p>
        </InView>
        <InView delay={0.18}>
          <div className="ornament-line mx-auto mt-7">
            <span className="dot" />
          </div>
          <p className="mt-4 text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
            {verse.source}
          </p>
        </InView>
      </div>
    </section>
  );
}
