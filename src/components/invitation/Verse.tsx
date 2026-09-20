"use client";

import Image from "next/image";
import { wedding } from "@/config/wedding";
import { InView } from "@/components/motion/primitives";
import {
  BismillahSVG,
  GoldDivider,
  IslamicArchHeader,
  IslamicCornerArt,
} from "@/components/ui/Ornament";

export function Verse() {
  const { verse } = wedding;

  return (
    <section className="relative overflow-hidden section-cream section-pad px-6">
      {/* Soft monogram watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.035] select-none">
        <Image
          src="/images/monogram-calligraphy.png"
          alt=""
          width={450}
          height={190}
          className="h-auto w-80 object-contain"
        />
      </div>

      <div className="relative mx-auto max-w-[360px] text-center">
        <InView>
          <BismillahSVG className="mb-4 text-gold anim-pulse-glow" />
          <IslamicArchHeader className="mb-4 max-w-[200px]" />
        </InView>

        <InView delay={0.08}>
          <div className="arch-frame-dark relative overflow-hidden px-6 py-9 text-cream shadow-[0_20px_48px_-18px_rgba(18,44,30,0.45)]">
            <IslamicCornerArt position="top-left" className="top-2 left-2 text-gold-light/30" />
            <IslamicCornerArt position="top-right" className="top-2 right-2 text-gold-light/30" />

            <div className="mx-auto -my-1 flex justify-center">
              <Image
                src="/images/monogram-calligraphy.png"
                alt="U & N"
                width={260}
                height={110}
                className="h-auto w-48 object-contain brightness-110 drop-shadow-[0_4px_16px_rgba(223,190,126,0.35)]"
              />
            </div>

            <p className="mt-5 font-serif text-[1.08rem] leading-[2.1] text-amber-50/95 italic sm:text-[1.12rem]">
              &ldquo;{verse.text}&rdquo;
            </p>

            <GoldDivider className="mt-6 text-gold-light/70" />

            <p className="mt-4 text-[11px] font-bold tracking-[0.24em] text-gold-light uppercase">
              {verse.source}
            </p>
          </div>
        </InView>
      </div>
    </section>
  );
}

