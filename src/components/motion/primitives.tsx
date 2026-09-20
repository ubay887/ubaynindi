"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useInvitationScroll } from "@/components/invitation/InvitationScroll";

const ease = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease },
  },
};

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

export function InView({
  children,
  className,
  delay = 0,
  y = 22,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  const scroll = useInvitationScroll();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{
        once: true,
        amount: 0.18,
        margin: "0px 0px -36px 0px",
        root: scroll?.scroller ? scroll.scrollerRef : undefined,
      }}
      transition={{ duration: 0.9, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

export function Float({
  children,
  className,
  duration = 6,
  distance = 7,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  distance?: number;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      animate={{ y: [0, -distance, 0] }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

/** Section head — solid colors (no low-opacity text) for readable contrast */
export function SectionHead({
  script,
  title,
  subtitle,
}: {
  script: string;
  title?: string;
  subtitle?: string;
}) {
  return (
    <InView className="mb-10 text-center">
      <p className="font-script text-[2.35rem] leading-none text-ink sm:text-[2.55rem]">
        {script}
      </p>
      {title ? (
        <h2 className="mt-2 font-serif text-[1.3rem] font-medium tracking-[0.12em] text-primary uppercase">
          {title}
        </h2>
      ) : null}
      <div className="ornament-line mx-auto mt-4">
        <span className="dot" />
      </div>
      {subtitle ? (
        <p className="mx-auto mt-4 max-w-[300px] text-[13.5px] leading-[1.75] text-muted">
          {subtitle}
        </p>
      ) : null}
    </InView>
  );
}
