"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { wedding, getPrimaryEvent } from "@/config/wedding";
import { useInviteSide } from "@/hooks/useInviteSide";
import { useInvitationScroll } from "@/components/invitation/InvitationScroll";
import { sideLabel } from "@/lib/utils";
import { InView } from "@/components/motion/primitives";
import { AmbientField } from "@/components/motion/AmbientField";
import {
  WaxSealCrest,
  FloatingIslamicCloud,
  SwayingLantern,
  SwayingFloralVine,
  IslamicArchHeader,
} from "@/components/ui/Ornament";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const side = useInviteSide();
  const scroll = useInvitationScroll();
  const { scrollYProgress } = useScroll({
    target: ref,
    container: scroll?.scroller ? scroll.scrollerRef : undefined,
    offset: ["start start", "end start"],
  });

  const yImg = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const yContent = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.78], [1, 0.12]);

  const primary = getPrimaryEvent(side);

  return (
    <section ref={ref} className="relative min-h-[100dvh] overflow-hidden lg:min-h-full">
      <motion.div
        className="absolute inset-0"
        style={reduce ? undefined : { y: yImg }}
      >
        <Image
          src="/ornaments/hero-bg.jpg"
          alt=""
          fill
          priority
          quality={90}
          sizes="(max-width: 768px) 100vw, 448px"
          className="scale-105 object-cover object-center"
        />
        <div className="absolute inset-0 illust-wash" />
        <AmbientField density="low" scrollLinked />
      </motion.div>

      {/* Dynamic Floating Islamic Clouds */}
      <FloatingIslamicCloud
        variant={2}
        width={220}
        className="-top-6 -right-12 text-gold-light/60"
        opacity={0.55}
      />
      <FloatingIslamicCloud
        variant={1}
        width={200}
        flip
        className="bottom-20 -left-10 text-gold-light/50"
        opacity={0.5}
      />

      <SwayingLantern className="top-0 right-8 z-10" size={52} />
      <SwayingFloralVine className="top-2 left-4 z-10 text-gold/55" size={64} />
      <SwayingFloralVine className="top-8 right-16 z-10 text-gold/45" size={52} flip />

      <motion.div
        className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-20 pt-14 text-center lg:min-h-full"
        style={reduce ? undefined : { y: yContent, opacity }}
      >
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
            priority
          />
        </InView>

        <InView delay={0.24}>
          <div className="ornament-line mx-auto mt-4">
            <span className="dot" />
          </div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/45 bg-cream/75 px-4 py-1.5 shadow-sm backdrop-blur-md">
            <span className="text-[11.5px] font-bold tracking-[0.2em] text-primary-dark uppercase">
              {primary.dateLabel.replace(/,/g, " ·").replace(/\s+/g, " ")}
            </span>
          </div>
        </InView>

        <motion.div
          className="absolute bottom-20 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 text-primary-dark/60 lg:bottom-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          <span className="text-[8.5px] font-bold tracking-[0.3em] uppercase">Scroll Down</span>
          <motion.span
            className="block h-7 w-px bg-gradient-to-b from-primary-dark/60 to-transparent"
            animate={{ scaleY: [0.45, 1, 0.45], opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
            style={{ originY: 0 }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

