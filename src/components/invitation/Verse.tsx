"use client";

import { wedding } from "@/config/wedding";
import { InView } from "@/components/motion/primitives";
import { BismillahSVG, GoldDivider } from "@/components/ui/Ornament";

export function Verse() {
  const { verse } = wedding;
  const [first, second] = wedding.couple.displayNames.split(" & ");

  return (
    <section className="relative overflow-hidden section-cream section-pad px-6">
      {/* Soft monogram initials watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.05]">
        <span className="font-serif text-[12rem] font-semibold leading-none text-primary-dark select-none">
          {first.charAt(0)}
          {second.charAt(0)}
        </span>
      </div>

      <div className="relative mx-auto max-w-[360px] text-center">
        <InView>
          <BismillahSVG className="mb-4 text-gold" />
        </InView>

        <InView delay={0.08}>
          <div className="rounded-2xl border border-gold/30 bg-white/70 px-6 py-8 shadow-[0_16px_40px_-20px_rgba(46,63,44,0.18)] backdrop-blur-sm">
            <p className="font-script text-[2.6rem] leading-none text-primary-dark">
              {first.charAt(0)}
              <span className="ampersand ampersand-sm mx-1.5 align-middle" aria-hidden>
                &amp;
              </span>
              {second.charAt(0)}
            </p>
            <p className="mt-6 font-serif text-[1.05rem] leading-[1.95] text-primary-dark italic sm:text-[1.1rem]">
              &ldquo;{verse.text}&rdquo;
            </p>
            <GoldDivider className="mt-6" />
            <p className="mt-4 text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
              {verse.source}
            </p>
          </div>
        </InView>
      </div>
    </section>
  );
}

