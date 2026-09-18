"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Float } from "@/components/motion/primitives";

/** Soft floral corner accent */
export function FloralSprig({
  className,
  flip,
  float = true,
  size = 72,
  opacity = 0.7,
}: {
  className?: string;
  flip?: boolean;
  float?: boolean;
  size?: number;
  opacity?: number;
}) {
  const img = (
    <div
      className={cn("pointer-events-none relative", className)}
      style={{ width: size, height: size * 0.75, opacity }}
      aria-hidden
    >
      <Image
        src="/ornaments/divider.png"
        alt=""
        fill
        className={cn(
          "object-contain mix-blend-multiply opacity-90",
          flip && "-scale-x-100",
        )}
        sizes={`${size}px`}
      />
    </div>
  );

  return float ? (
    <Float distance={5} duration={7} className="inline-flex">
      {img}
    </Float>
  ) : (
    img
  );
}

/** Monogram & — soft luminous circle */
export function Monogram({
  size = 96,
  float = true,
  className,
}: {
  size?: number;
  float?: boolean;
  className?: string;
}) {
  const node = (
    <div
      className={cn(
        "pointer-events-none relative overflow-hidden rounded-full",
        "shadow-[0_12px_32px_-12px_rgba(44,63,42,0.4),0_0_24px_-4px_rgba(196,160,106,0.25)]",
        "ring-1 ring-gold/30 ring-offset-2 ring-offset-transparent",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Image
        src="/ornaments/monogram.png"
        alt=""
        fill
        className="scale-110 object-cover"
        sizes={`${size}px`}
      />
    </div>
  );

  return float ? (
    <Float distance={6} duration={6} className="mx-auto flex justify-center">
      {node}
    </Float>
  ) : (
    <div className="mx-auto flex justify-center">{node}</div>
  );
}

export function GardenFooter({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none relative mx-auto aspect-[16/9] w-full max-w-lg",
        className,
      )}
      aria-hidden
    >
      <Image
        src="/ornaments/floral.png"
        alt=""
        fill
        className="object-contain object-bottom"
        sizes="512px"
      />
    </div>
  );
}

/** Thin decorative SVG vine — lighter than photo sprig */
export function VineDivider({ className }: { className?: string }) {
  return (
    <svg
      className={cn("mx-auto text-gold/50", className)}
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
      <circle cx="60" cy="8" r="1.5" fill="currentColor" opacity="0.8" />
    </svg>
  );
}

/** Vector SVG Bismillah Calligraphy */
export function BismillahSVG({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto flex justify-center text-gold-light", className)} aria-label="Bismillahi-r-Rahmani-r-Rahim">
      <svg width="220" height="42" viewBox="0 0 400 70" fill="currentColor" aria-hidden>
        <path d="M72.2 46.5c-3.1 0-5.4-1.2-6.8-3.5-1.4-2.3-1.6-5.4-.5-9.3 1.8-6.2 5.6-11.2 11.4-15.1 5.8-3.9 12.4-5.8 19.8-5.8 5.6 0 9.8 1.4 12.6 4.2 2.8 2.8 3.5 6.4 2.1 10.8-1.5 5-4.8 9.3-9.9 12.9-5.1 3.8-11.3 5.8-18.7 5.8zm3.2-6.5c4.1 0 7.8-1.2 11.1-3.6 3.3-2.4 5.5-5.3 6.6-8.7.9-3.1.4-5.3-1.5-6.6-1.9-1.3-4.7-1.9-8.4-1.9-4.8 0-9.2 1.3-13.2 3.9-4 2.6-6.6 5.8-7.8 9.6-.7 2.4-.4 4.2.9 5.4 1.3 1.3 3.4 1.9 6.3 1.9zm101.4 6.5c-6.8 0-12.4-2-16.8-6.1-4.4-4.1-6.1-9.6-5.1-16.5 1.5-10.4 6.6-18.4 15.3-24 8.7-5.6 18.6-8.4 29.7-8.4 6.8 0 12.1 1.6 15.9 4.8 3.8 3.2 5.1 7.4 3.9 12.6-1.5 6.5-5.5 12.1-12 16.8-6.5 4.7-14 7.1-22.5 7.1-2.4 0-4.6-.2-6.6-.7-1.3 4.9-1.1 8.7.6 11.4 1.7 2.7 4.7 4.1 9 4.1 3.5 0 7.2-.9 11.1-2.7l2.1 5.8c-4.7 2.2-9.4 3.3-14.1 3.3-6.6 0-11.7-1.6-15.3-4.8-3.6-3.2-4.5-7.4-2.8-12.6l1.6-5.1c-4 1.3-8 1.9-12 1.9zm13.5-12.2c5.3 0 10.1-1.5 14.4-4.5 4.3-3 7.1-6.7 8.4-11.1 1-3.4.3-5.8-2.1-7.2-2.4-1.4-5.8-2.1-10.2-2.1-6 0-11.1 1.7-15.3 5.1-4.2 3.4-6.8 7.5-7.8 12.3-.6 3 .1 5.1 2.1 6.3 2 1.2 5.5 1.8 10.5 1.8zm112 12.2c-3.1 0-5.4-1.2-6.8-3.5-1.4-2.3-1.6-5.4-.5-9.3 1.8-6.2 5.6-11.2 11.4-15.1 5.8-3.9 12.4-5.8 19.8-5.8 5.6 0 9.8 1.4 12.6 4.2 2.8 2.8 3.5 6.4 2.1 10.8-1.5 5-4.8 9.3-9.9 12.9-5.1 3.8-11.3 5.8-18.7 5.8zm3.2-6.5c4.1 0 7.8-1.2 11.1-3.6 3.3-2.4 5.5-5.3 6.6-8.7.9-3.1.4-5.3-1.5-6.6-1.9-1.3-4.7-1.9-8.4-1.9-4.8 0-9.2 1.3-13.2 3.9-4 2.6-6.6 5.8-7.8 9.6-.7 2.4-.4 4.2.9 5.4 1.3 1.3 3.4 1.9 6.3 1.9z" />
      </svg>
    </div>
  );
}

/** Golden Wax Seal Crest / Monogram Emblem */
export function WaxSealCrest({ initials = "UN", className }: { initials?: string; className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#8e7a5a] via-[#b09f83] to-[#6e5c3d] p-0.5 shadow-[0_10px_24px_-8px_rgba(31,45,34,0.35)]">
        <div className="flex h-full w-full items-center justify-center rounded-full border border-amber-100/30 bg-gradient-to-br from-[#1f2d22] via-[#2a382c] to-[#172219] shadow-inner">
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
    <div className={cn("flex items-center justify-center gap-3 text-gold/60", className)}>
      <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold/60" />
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
      </svg>
      <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold/60" />
    </div>
  );
}

