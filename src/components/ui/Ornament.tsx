"use client";

import { useId } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Float } from "@/components/motion/primitives";

export { BismillahSVG } from "./Bismillah";

/** Dynamic Floating Islamic Cloud Motif (Reverse Engineered from Invisimple) */
export function FloatingIslamicCloud({
  className,
  variant = 1,
  flip = false,
  width = 180,
  opacity = 0.45,
}: {
  className?: string;
  variant?: 1 | 2 | 3;
  flip?: boolean;
  width?: number;
  opacity?: number;
}) {
  const animClass =
    variant === 1
      ? "anim-galleggia-1"
      : variant === 2
        ? "anim-galleggia-2"
        : "anim-galleggia-3";
  const uid = useId().replace(/:/g, "");
  const gradId = `cloudGrad-${uid}`;
  const strokeId = `cloudStroke-${uid}`;

  return (
    <div
      className={cn(
        "pointer-events-none absolute select-none text-gold-light",
        animClass,
        flip && "-scale-x-100",
        className,
      )}
      style={{ width, opacity }}
      aria-hidden
    >
      <svg
        viewBox="0 0 240 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-[0_4px_12px_rgba(194,155,78,0.15)]"
      >
        <path
          d="M20 70C12 70 5 63 5 55C5 47 11 41 18 40C19 28 30 18 43 18C52 18 60 23 64 30C69 22 79 16 90 16C104 16 116 26 118 40C123 37 130 35 137 35C148 35 158 43 160 54C165 52 171 51 176 51C189 51 200 60 200 72C200 73 200 74 199.8 75C208 76 215 82 215 90C215 98 208 100 200 100H20C9 100 0 91 0 80C0 72 6 65 14 62"
          fill={`url(#${gradId})`}
          fillOpacity="0.18"
          stroke={`url(#${strokeId})`}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M60 55C60 45 70 38 80 42C88 45 88 56 80 60C74 63 70 58 73 54C75 51 79 52 79 55"
          stroke={`url(#${strokeId})`}
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M130 65C130 57 138 52 146 55C152 57 152 66 146 69C141 71 138 67 140 64"
          stroke={`url(#${strokeId})`}
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.5"
        />
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="240" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#dfbe7e" stopOpacity="0.4" />
            <stop offset="0.5" stopColor="#c29b4e" stopOpacity="0.15" />
            <stop offset="1" stopColor="#fbf9f4" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id={strokeId} x1="0" y1="0" x2="240" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#dfbe7e" stopOpacity="0.75" />
            <stop offset="0.5" stopColor="#c29b4e" stopOpacity="0.5" />
            <stop offset="1" stopColor="#dfbe7e" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/** Dynamic Swaying Islamic Lantern */
export function SwayingLantern({
  className,
  size = 54,
}: {
  className?: string;
  size?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const glowId = `lanternGlow-${uid}`;

  return (
    <div
      className={cn(
        "pointer-events-none absolute select-none text-gold anim-dondola origin-top",
        className,
      )}
      style={{ width: size }}
      aria-hidden
    >
      <svg
        viewBox="0 0 60 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-[0_4px_10px_rgba(194,155,78,0.4)]"
      >
        <line x1="30" y1="0" x2="30" y2="35" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2" />
        <circle cx="30" cy="38" r="4" stroke="currentColor" strokeWidth="1.2" />
        <path d="M22 46C22 42 25 40 30 40C35 40 38 42 38 46H22Z" fill="#dfbe7e" stroke="currentColor" strokeWidth="1" />
        <path
          d="M18 52L20 46H40L42 52L40 85L30 95L20 85L18 52Z"
          fill={`url(#${glowId})`}
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <circle cx="30" cy="68" r="5" fill="#fffdfa" className="anim-pulse-glow" />
        <path
          d="M30 60L32 66L38 68L32 70L30 76L28 70L22 68L28 66Z"
          fill="#dfbe7e"
          opacity="0.85"
        />
        <line x1="30" y1="95" x2="30" y2="108" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="30" cy="110" r="2.5" fill="#c29b4e" />
        <defs>
          <radialGradient id={glowId} cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
            <stop offset="0%" stopColor="#fff8e7" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#dfbe7e" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#1b6554" stopOpacity="0.85" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

/** Hanging Islamic floral vine — gentle sway from the top */
export function SwayingFloralVine({
  className,
  size = 72,
  flip = false,
}: {
  className?: string;
  size?: number;
  flip?: boolean;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute select-none text-gold/70 anim-dondola origin-top",
        flip && "-scale-x-100",
        className,
      )}
      style={{ width: size }}
      aria-hidden
    >
      <svg viewBox="0 0 48 140" fill="none" className="w-full h-auto">
        <path
          d="M24 0v118"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <path
          d="M24 28c-10 4-16 12-14 20 6-2 12-8 14-16 2 8 8 14 14 16-2-8-8-16-14-20z"
          fill="currentColor"
          opacity="0.55"
        />
        <path
          d="M24 58c-12 6-18 16-14 24 7-3 12-10 14-20 3 10 9 17 14 20-2-8-8-18-14-24z"
          fill="currentColor"
          opacity="0.45"
        />
        <path
          d="M24 92c-9 4-14 12-12 20 5-2 10-8 12-16 2 8 7 14 12 16-2-8-6-16-12-20z"
          fill="currentColor"
          opacity="0.4"
        />
        <circle cx="24" cy="128" r="3" fill="#c29b4e" />
      </svg>
    </div>
  );
}

/** Islamic Arch Header / Lace Frame */
export function IslamicArchHeader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none mx-auto flex w-full max-w-[280px] items-center justify-center text-gold/60",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 200 30" fill="none" className="w-full h-auto">
        <path
          d="M0 25C40 25 60 5 100 5C140 5 160 25 200 25"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M15 28C50 28 70 12 100 12C130 12 150 28 185 28"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeDasharray="2 4"
        />
        {/* Center 8-pointed star */}
        <circle cx="100" cy="5" r="2.5" fill="var(--color-gold)" />
      </svg>
    </div>
  );
}

/** Corner Islamic Arabesque Line Art */
export function IslamicCornerArt({
  className,
  position = "top-left",
}: {
  className?: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  const transform =
    position === "top-right"
      ? "-scale-x-100"
      : position === "bottom-left"
        ? "-scale-y-100"
        : position === "bottom-right"
          ? "-scale-x-100 -scale-y-100"
          : "";

  return (
    <div
      className={cn(
        "pointer-events-none absolute h-16 w-16 text-gold/40 select-none",
        transform,
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <path
          d="M2 62V20C2 10 10 2 20 2H62"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path
          d="M8 62V24C8 15 15 8 24 8H62"
          stroke="currentColor"
          strokeWidth="0.7"
          strokeDasharray="2 3"
        />
        <path
          d="M18 18C22 10 32 10 34 18C34 26 24 28 20 22"
          stroke="currentColor"
          strokeWidth="0.8"
        />
        <circle cx="20" cy="20" r="2" fill="currentColor" />
      </svg>
    </div>
  );
}

/** Soft botanical leaf accent - pure SVG */
export function FloralSprig({
  className,
  flip,
  float = true,
  size = 56,
}: {
  className?: string;
  flip?: boolean;
  float?: boolean;
  size?: number;
}) {
  const node = (
    <svg
      width={size}
      height={size * 0.75}
      viewBox="0 0 72 54"
      fill="none"
      className={cn("pointer-events-none text-primary-light/60", className, flip && "-scale-x-100")}
      aria-hidden
    >
      <path
        d="M6 48C18 36 34 24 66 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M20 38C18 30 24 24 30 26C32 32 26 38 20 38Z"
        fill="currentColor"
        opacity="0.75"
      />
      <path
        d="M36 28C38 20 46 16 50 20C50 26 42 30 36 28Z"
        fill="currentColor"
        opacity="0.75"
      />
      <path
        d="M50 18C54 10 62 8 66 12C64 18 56 20 50 18Z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );

  return float ? (
    <Float distance={5} duration={7} className="inline-flex">
      {node}
    </Float>
  ) : (
    node
  );
}

export function GardenFooter({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none relative mx-auto flex justify-center py-6 text-primary/30",
        className,
      )}
      aria-hidden
    >
      <svg width="240" height="40" viewBox="0 0 240 40" fill="none">
        <path d="M10 30C50 15 90 20 120 10C150 20 190 15 230 30" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="120" cy="10" r="3" fill="var(--color-gold)" />
        <path d="M110 18C114 12 120 12 124 18" stroke="var(--color-gold)" strokeWidth="1" />
      </svg>
    </div>
  );
}

/** Thin decorative SVG vine */
export function VineDivider({ className }: { className?: string }) {
  return (
    <svg
      className={cn("mx-auto text-gold/60", className)}
      width="120"
      height="16"
      viewBox="0 0 120 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 8h40M76 8h40"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <path
        d="M52 8c2-4 6-4 8 0s6 4 8 0"
        stroke="currentColor"
        strokeWidth="0.9"
        fill="none"
      />
      <circle cx="60" cy="8" r="1.5" fill="currentColor" opacity="0.85" />
    </svg>
  );
}

/** Golden & Royal Emerald Wax Seal Crest / Monogram Emblem */
export function WaxSealCrest({
  size = 80,
  className,
}: {
  size?: number;
  initials?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative flex items-center justify-center select-none", className)}>
      <div
        className="relative flex items-center justify-center rounded-full transition-transform duration-300 hover:scale-105"
        style={{ width: size, height: size }}
      >
        <Image
          src="/images/seal-crest-un.png"
          alt="UN Crest"
          width={size * 2}
          height={size * 2}
          className="h-full w-full object-contain drop-shadow-[0_10px_24px_rgba(15,61,52,0.4)]"
          priority
        />
      </div>
    </div>
  );
}

/** Luxury Filigree Divider */
export function GoldDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3 text-gold/70", className)}>
      <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold/70" />
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
      </svg>
      <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold/70" />
    </div>
  );
}
