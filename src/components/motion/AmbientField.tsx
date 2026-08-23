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
  kind: "petal" | "dot" | "spark";
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
      r > 0.72 ? "spark" : r > 0.38 ? "petal" : "dot";
    return {
      id: i,
      x: rand() * 100,
      y: rand() * 100,
      size: kind === "petal" ? 10 + rand() * 16 : kind === "spark" ? 2 + rand() * 3 : 3 + rand() * 5,
      dur: 10 + rand() * 16,
      delay: rand() * -20,
      drift: (rand() - 0.5) * 40,
      kind,
      opacity: kind === "spark" ? 0.25 + rand() * 0.35 : 0.18 + rand() * 0.35,
    };
  });
}

function Petal({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3c2.5 3.5 6 5.2 6 9.2 0 3.3-2.7 5.8-6 5.8s-6-2.5-6-5.8C6 8.2 9.5 6.5 12 3z"
        fill="currentColor"
      />
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
  const count = density === "high" ? 28 : density === "low" ? 12 : 20;
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
            p.kind === "petal"
              ? "absolute text-blush/80"
              : p.kind === "spark"
                ? "absolute rounded-full bg-gold"
                : "absolute rounded-full bg-primary-light"
          }
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.kind === "petal" ? undefined : p.size,
            height: p.kind === "petal" ? undefined : p.size,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -28 - (p.id % 5) * 4, 0],
            x: [0, p.drift, 0],
            rotate: p.kind === "petal" ? [0, 25, -15, 0] : [0, 0, 0],
            scale: p.kind === "spark" ? [1, 1.4, 1] : [1, 1.05, 1],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {p.kind === "petal" ? <Petal size={p.size} /> : null}
        </motion.div>
      ))}
    </motion.div>
  );
}
