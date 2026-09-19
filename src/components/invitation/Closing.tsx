"use client";

import { wedding, getPrimaryEvent } from "@/config/wedding";
import { useInviteSide } from "@/hooks/useInviteSide";
import { GardenFooter } from "@/components/ui/Ornament";
import { InView } from "@/components/motion/primitives";

export function Closing() {
  const { closing, couple } = wedding;
  const side = useInviteSide();
  const date = getPrimaryEvent(side).dateLabel;

  return (
    <section id="closing" className="overflow-hidden">
      <div className="section-cream section-pad pb-8 sm:px-8">
        <div className="mx-auto max-w-[360px]">
          <InView>
            <div className="text-center">
              <p className="font-script text-[2.5rem] leading-none text-primary-dark">
                Terima Kasih
              </p>
              <div className="ornament-line mx-auto my-5">
                <span className="dot" />
              </div>
              <p className="mx-auto max-w-[300px] text-[13.5px] leading-[1.85] text-muted">
                {closing.body}
              </p>
              <p className="mt-4 text-[13.5px] font-semibold italic text-primary-dark">
                {closing.salam}
              </p>
              <p className="mt-10 text-[10px] uppercase tracking-[0.24em] text-primary-soft">
                Kami yang berbahagia
              </p>
              <p className="mt-2 font-serif text-[1.95rem] tracking-wide text-primary-dark">
                {couple.displayNames}
              </p>
            </div>
          </InView>
        </div>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-b from-[#1e4733] to-[#122c1e]">
        <GardenFooter className="max-w-none text-gold-light/40" />
        <div className="relative inset-x-0 bottom-0 bg-gradient-to-t from-[#0d1f15] via-[#122c1e]/90 to-transparent px-6 pb-28 pt-8 text-center">
          <p className="font-script text-[1.75rem] text-cream/95">
            The Wedding Of
          </p>
          <p className="mt-1 font-serif text-[1.5rem] tracking-[0.14em] text-cream uppercase">
            {couple.displayNames}
          </p>
          {date ? (
            <p className="mt-2.5 text-[10px] tracking-[0.2em] text-cream/55 uppercase">
              {date}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
