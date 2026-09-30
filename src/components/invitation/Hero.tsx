"use client";

import Image from "next/image";
import { getPrimaryEvent } from "@/config/wedding";
import { useInviteSide } from "@/hooks/useInviteSide";
import { sideLabel } from "@/lib/utils";
import { InView } from "@/components/motion/primitives";
import { WaxSealCrest, IslamicArchHeader } from "@/components/ui/Ornament";

export function Hero() {
  const side = useInviteSide();
  const primary = getPrimaryEvent(side);

  return (
    <section className="relative min-h-[100dvh] overflow-hidden lg:min-h-full">
      <div className="absolute inset-0">
        <Image
          src="/ornaments/hero-bg.jpg"
          alt=""
          fill
          quality={75}
          sizes="(max-width: 768px) 100vw, 448px"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 cover-wash" />
      </div>

      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-20 pt-14 text-center lg:min-h-full">
        <InView>
          <WaxSealCrest initials="UN" size={76} className="mb-2" />
          <IslamicArchHeader className="mb-1 max-w-[220px]" />
          <p className="font-script text-[2.35rem] leading-none text-ink">
            The Wedding Of
          </p>
          <p className="mt-1.5 text-[10.5px] font-bold uppercase tracking-[0.24em] text-primary">
            {sideLabel(side)}
          </p>
        </InView>

        <InView delay={0.08} className="mx-auto my-3 flex w-full max-w-[290px] justify-center select-none">
          <Image
            src="/images/couple-card-gold.png"
            alt="The Wedding of Ubay & Nindi"
            width={420}
            height={280}
            className="h-auto w-full object-contain drop-shadow-[0_6px_20px_rgba(20,45,32,0.18)]"
          />
        </InView>

        <InView delay={0.24}>
          <div className="ornament-line mx-auto mt-4">
            <span className="dot" />
          </div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/45 bg-cream px-4 py-1.5 shadow-sm">
            <span className="text-[11.5px] font-bold tracking-[0.2em] text-primary-dark uppercase">
              {primary.dateLabel.replace(/,/g, " ·").replace(/\s+/g, " ")}
            </span>
          </div>
        </InView>

        <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 text-primary-dark/60 lg:bottom-8">
          <span className="text-[8.5px] font-bold tracking-[0.3em] uppercase">Scroll Down</span>
          <span className="block h-7 w-px bg-gradient-to-b from-primary-dark/60 to-transparent" />
        </div>
      </div>
    </section>
  );
}

