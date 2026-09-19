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
import { sideLabel } from "@/lib/utils";
import { InView } from "@/components/motion/primitives";
import { AmbientField } from "@/components/motion/AmbientField";
import { WaxSealCrest } from "@/components/ui/Ornament";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const side = useInviteSide();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const yImg = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const yContent = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.78], [1, 0.12]);

  const primary = getPrimaryEvent(side);
  const [first, second] = wedding.couple.displayNames.split(" & ");

  return (
    <section ref={ref} className="relative min-h-[100dvh] overflow-hidden">
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

      <motion.div
        className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-28 pt-16 text-center"
        style={reduce ? undefined : { y: yContent, opacity }}
      >
        <InView>
          <WaxSealCrest initials="UN" className="mb-4 scale-90" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
            {sideLabel(side)}
          </p>
          <p className="mt-1 font-script text-[2.15rem] text-primary-dark sm:text-[2.4rem]">
            The Wedding Of
          </p>
        </InView>

        <InView delay={0.08}>
          <h1 className="mt-4 font-serif text-[3rem] font-semibold uppercase tracking-[0.18em] text-primary-dark name-shadow sm:text-[3.35rem]">
            {first}
          </h1>
        </InView>

        <InView delay={0.14}>
          <p className="ampersand my-0.5" aria-hidden>
            &amp;
          </p>
        </InView>

        <InView delay={0.18}>
          <h1 className="font-serif text-[3rem] font-semibold uppercase tracking-[0.18em] text-primary-dark name-shadow sm:text-[3.35rem]">
            {second}
          </h1>
        </InView>

        <InView delay={0.28}>
          <div className="ornament-line mx-auto mt-6">
            <span className="dot" />
          </div>
          <p className="mt-4 text-[12px] font-medium tracking-[0.22em] text-primary uppercase">
            {primary.dateLabel.replace(/,/g, " ·").replace(/\s+/g, " ")}
          </p>
        </InView>

        <motion.div
          className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-primary-dark/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.15 }}
        >
          <span className="text-[9px] tracking-[0.3em] uppercase">Scroll</span>
          <motion.span
            className="block h-8 w-px bg-gradient-to-b from-primary-dark/45 to-transparent"
            animate={{ scaleY: [0.45, 1, 0.45], opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
            style={{ originY: 0 }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

