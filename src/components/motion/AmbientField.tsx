"use client";

import { useMemo } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  dur: number;
  delay: number;
  drift: number;
  kind: "star" | "dot" | "spark";
  opacity: number;
};

function makeParticles(count: number): Particle[] {
  // Deterministic pseudo-random so SSR/client match
  let seed = 42;
  const rand = () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  return Array.from({ length: count }, (_, i) => {
    const r = rand();
    const kind: Particle["kind"] =
      r > 0.62 ? "star" : r > 0.32 ? "spark" : "dot";
    return {
      id: i,
      x: rand() * 100,
      y: rand() * 100,
      size: kind === "star" ? 7 + rand() * 8 : kind === "spark" ? 2 + rand() * 3 : 3 + rand() * 4,
      dur: 12 + rand() * 14,
      delay: rand() * -20,
      drift: (rand() - 0.5) * 28,
      kind,
      opacity: kind === "spark" ? 0.28 + rand() * 0.4 : 0.16 + rand() * 0.28,
    };
  });
}

function StarSpark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2L14.2 9.2L22 12L14.2 14.8L12 22L9.8 14.8L2 12L9.8 9.2Z" />
    </svg>
  );
}

type AmbientFieldProps = {
  /** denser field on cover */
  density?: "low" | "med" | "high";
  className?: string;
  /** react to page scroll (parallax drift) */
  scrollLinked?: boolean;
};

/**
 * Lightweight ambient motion field — petals, dots, sparks.
 * Pure Framer Motion + SVG (no heavy particle engines).
 */
export function AmbientField({
  density = "med",
  className = "",
  scrollLinked = false,
}: AmbientFieldProps) {
  const reduce = useReducedMotion();
  const count = density === "high" ? 16 : density === "low" ? 8 : 12;
  const particles = useMemo(() => makeParticles(count), [count]);

  const { scrollYProgress } = useScroll();
  const yShift = useTransform(scrollYProgress, [0, 1], [0, -80]);

  if (reduce) return null;

  return (
    <motion.div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={scrollLinked ? { y: yShift } : undefined}
      aria-hidden
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={
            p.kind === "star"
              ? "absolute text-gold"
              : p.kind === "spark"
                ? "absolute rounded-full bg-gold-soft"
                : "absolute rounded-full bg-gold/70"
          }
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.kind === "star" ? undefined : p.size,
            height: p.kind === "star" ? undefined : p.size,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -22 - (p.id % 5) * 3, 0],
            x: [0, p.drift, 0],
            rotate: p.kind === "star" ? [0, 40, -20, 0] : [0, 0, 0],
            scale: p.kind === "spark" ? [1, 1.55, 1] : [1, 1.08, 1],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {p.kind === "star" ? <StarSpark size={p.size} /> : null}
        </motion.div>
      ))}
    </motion.div>
  );
}
