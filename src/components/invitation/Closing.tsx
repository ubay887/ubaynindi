"use client";

import Image from "next/image";
import { wedding, getPrimaryEvent } from "@/config/wedding";
import { useInviteSide } from "@/hooks/useInviteSide";
import {
  GoldDivider,
  IslamicArchHeader,
  WaxSealCrest,
  FloatingIslamicCloud,
} from "@/components/ui/Ornament";
import { InView } from "@/components/motion/primitives";

export function Closing() {
  const { closing, couple } = wedding;
  const side = useInviteSide();
  const date = getPrimaryEvent(side).dateLabel;

  return (
    <section id="closing" className="relative overflow-hidden section-cream">
      <FloatingIslamicCloud
        variant={1}
        width={180}
        className="-top-6 -left-8 text-gold-light/40"
        opacity={0.4}
      />

      <div className="section-pad pb-4 sm:px-8">
        <div className="mx-auto max-w-[360px]">
          <InView>
            <div className="text-center">
              <WaxSealCrest initials="UN" className="mb-3 scale-90" />
              <IslamicArchHeader className="mb-3 max-w-[200px]" />
              <p className="font-script text-[2.7rem] leading-none text-ink">
                Terima Kasih
              </p>
              <div className="ornament-line mx-auto my-5">
                <span className="dot" />
              </div>
              <p className="mx-auto max-w-[310px] text-[13.5px] leading-[1.85] text-muted font-medium">
                {closing.body}
              </p>
              <p className="mt-4 text-[14px] font-bold italic text-primary">
                {closing.salam}
              </p>
              <p className="mt-9 text-[10px] font-bold uppercase tracking-[0.24em] text-gold-deep">
                Kami yang berbahagia
              </p>
              <div className="mx-auto mt-2 flex justify-center select-none">
                <Image
                  src="/images/ubay-nindi-banner.png"
                  alt={couple.displayNames}
                  width={360}
                  height={120}
                  className="h-auto w-64 object-contain drop-shadow-[0_4px_16px_rgba(20,45,32,0.1)]"
                />
              </div>
            </div>
          </InView>
        </div>
      </div>

      <footer className="relative mx-auto max-w-[360px] px-6 pb-32 pt-8 text-center">
        <GoldDivider />
        {date ? (
          <p className="mt-6 text-[10.5px] font-medium tracking-[0.22em] text-muted uppercase">
            {date}
          </p>
        ) : null}
        <IslamicArchHeader className="mt-4 max-w-[148px] opacity-60" />
      </footer>
    </section>
  );
}
