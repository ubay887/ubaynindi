import type { Transition, Variants } from "framer-motion";

export const springSoft: Transition = {
  type: "spring",
  stiffness: 90,
  damping: 18,
  mass: 0.9,
};

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 160,
  damping: 20,
};

export const easeOutExpo: Transition = {
  duration: 0.9,
  ease: [0.16, 1, 0.3, 1],
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: easeOutExpo,
  },
};

export const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: springSoft,
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
};

export const staggerFast: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.05,
    },
  },
};

export const letterVariants: Variants = {
  hidden: { opacity: 0, y: 24, rotateX: 40 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: springSoft,
  },
};

export const coverExit: Variants = {
  initial: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: {
    opacity: 0,
    scale: 1.08,
    filter: "blur(12px)",
    transition: { duration: 0.85, ease: [0.4, 0, 0.2, 1] },
  },
};

export const pageEnter: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.15 },
  },
};
