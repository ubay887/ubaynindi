"use client";

import { cn } from "@/lib/utils";
import { Float } from "@/components/motion/primitives";

export { BismillahSVG } from "./Bismillah";

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
export function WaxSealCrest({ initials = "UN", className }: { initials?: string; className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#c29b4e] via-[#dfbe7e] to-[#967432] p-0.5 shadow-[0_12px_28px_-8px_rgba(20,45,32,0.38)] ring-1 ring-[#dfbe7e]/50">
        <div className="flex h-full w-full items-center justify-center rounded-full border border-amber-100/40 bg-gradient-to-br from-[#16382b] via-[#234e3d] to-[#12281e] shadow-inner">
          <span className="gold-text-gradient font-serif text-xl font-bold tracking-widest uppercase">
            {initials}
          </span>
        </div>
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
