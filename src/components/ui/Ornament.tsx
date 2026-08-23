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
