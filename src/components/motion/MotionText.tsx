"use client";

import { motion, useReducedMotion } from "framer-motion";
import { letterVariants, staggerFast } from "@/components/motion/variants";
import { cn } from "@/lib/utils";

type MotionTextProps = {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "p" | "span";
  delay?: number;
  /** split by character (default) or word */
  mode?: "chars" | "words";
};

export function MotionText({
  text,
  className,
  as = "span",
  delay = 0,
  mode = "chars",
}: MotionTextProps) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  const parts = mode === "words" ? text.split(" ") : Array.from(text);

  if (reduce) {
    const Static = as;
    return <Static className={className}>{text}</Static>;
  }

  return (
    <Tag
      className={cn("inline-flex flex-wrap justify-center", className)}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: mode === "words" ? 0.08 : 0.04,
            delayChildren: delay,
          },
        },
      }}
      aria-label={text}
    >
      {parts.map((part, i) => (
        <motion.span
          key={`${part}-${i}`}
          className={cn(
            "inline-block",
            mode === "chars" && part === " " && "w-[0.3em]",
            mode === "words" && "mr-[0.3em]",
          )}
          variants={letterVariants}
          style={{ transformOrigin: "50% 100%", perspective: 400 }}
        >
          {part === " " ? "\u00A0" : part}
        </motion.span>
      ))}
    </Tag>
  );
}

export function MotionScript({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <p className={className}>{text}</p>;
  }

  return (
    <motion.p
      className={className}
      initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {text}
    </motion.p>
  );
}

export function ScrollLine({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn(
        "mx-auto h-px w-16 origin-center bg-gradient-to-r from-transparent via-gold to-transparent",
        className,
      )}
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}

export { staggerFast };
