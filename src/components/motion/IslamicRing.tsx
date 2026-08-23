"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Slow-rotating geometric ring — subtle Islamic-modern motif, not clipart */
export function IslamicRing({
  className = "",
  size = 280,
}: {
  className?: string;
  size?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <div
      className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <motion.svg
        viewBox="0 0 200 200"
        className="h-full w-full text-gold/25"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={
          reduce
            ? undefined
            : { duration: 80, repeat: Infinity, ease: "linear" }
        }
      >
        <circle
          cx="100"
          cy="100"
          r="88"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
          strokeDasharray="2 6"
        />
        <circle
          cx="100"
          cy="100"
          r="72"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.4"
        />
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * Math.PI) / 4;
          const x1 = 100 + Math.cos(a) * 52;
          const y1 = 100 + Math.sin(a) * 52;
          const x2 = 100 + Math.cos(a) * 88;
          const y2 = 100 + Math.sin(a) * 88;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.7"
            />
          );
        })}
        <circle
          cx="100"
          cy="100"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
        />
      </motion.svg>

      <motion.svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full text-primary-light/20"
        animate={reduce ? undefined : { rotate: -360 }}
        transition={
          reduce
            ? undefined
            : { duration: 110, repeat: Infinity, ease: "linear" }
        }
      >
        <path
          d="M100 20 L115 70 L168 70 L125 100 L140 150 L100 120 L60 150 L75 100 L32 70 L85 70 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
        />
      </motion.svg>
    </div>
  );
}
