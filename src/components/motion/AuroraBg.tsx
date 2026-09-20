"use client";

import { motion, useReducedMotion } from "framer-motion";

type AuroraBgProps = {
  variant?: "cover" | "page" | "section";
  className?: string;
};

/**
 * Morphing soft-gradient orbs — premium ambient depth without video/Lottie.
 */
export function AuroraBg({ variant = "page", className = "" }: AuroraBgProps) {
  const reduce = useReducedMotion();

  const blobs =
    variant === "cover"
      ? [
          {
            className:
              "left-[-20%] top-[-10%] h-[55vmax] w-[55vmax] bg-[radial-gradient(circle,rgba(27,101,84,0.28)_0%,transparent_68%)]",
            animate: { x: [0, 40, -20, 0], y: [0, 30, -10, 0], scale: [1, 1.12, 0.96, 1] },
            duration: 18,
          },
          {
            className:
              "right-[-25%] top-[20%] h-[50vmax] w-[50vmax] bg-[radial-gradient(circle,rgba(194,155,78,0.22)_0%,transparent_70%)]",
            animate: { x: [0, -35, 15, 0], y: [0, -25, 20, 0], scale: [1, 0.9, 1.1, 1] },
            duration: 22,
          },
          {
            className:
              "bottom-[-15%] left-[15%] h-[45vmax] w-[45vmax] bg-[radial-gradient(circle,rgba(74,155,132,0.18)_0%,transparent_70%)]",
            animate: { x: [0, 25, -30, 0], y: [0, -20, 10, 0], scale: [1, 1.08, 0.94, 1] },
            duration: 20,
          },
        ]
      : [
          {
            className:
              "left-[-25%] top-[5%] h-[50vmax] w-[50vmax] bg-[radial-gradient(circle,rgba(27,101,84,0.12)_0%,transparent_70%)]",
            animate: { x: [0, 45, 0], y: [0, 50, 0], scale: [1, 1.18, 1] },
            duration: 18,
          },
          {
            className:
              "right-[-20%] top-[35%] h-[45vmax] w-[45vmax] bg-[radial-gradient(circle,rgba(194,155,78,0.14)_0%,transparent_70%)]",
            animate: { x: [0, -35, 0], y: [0, -40, 0], scale: [1, 0.9, 1] },
            duration: 22,
          },
          {
            className:
              "left-[15%] top-[65%] h-[40vmax] w-[40vmax] bg-[radial-gradient(circle,rgba(74,155,132,0.10)_0%,transparent_70%)]",
            animate: { x: [0, 30, 0], y: [0, -25, 0], scale: [1, 1.1, 1] },
            duration: 16,
          },
        ];

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      {/* base wash */}
      <div
        className={
          variant === "cover"
            ? "absolute inset-0 bg-gradient-to-b from-[#1b6554] via-[#175c4d] to-[#0f3d34]"
            : "absolute inset-0 bg-gradient-to-b from-[#f7f6f2] via-[#efece6] to-[#f7f6f2]"
        }
      />

      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl will-change-transform ${b.className}`}
          animate={reduce ? undefined : b.animate}
          transition={
            reduce
              ? undefined
              : { duration: b.duration, repeat: Infinity, ease: "easeInOut" }
          }
        />
      ))}

      {/* subtle film grain via CSS noise pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}

