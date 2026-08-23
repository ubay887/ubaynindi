"use client";

import { wedding } from "@/config/wedding";
import { InView, SectionHead } from "@/components/motion/primitives";

export function DressCode() {
  const { dressCode } = wedding;
  if (!dressCode.enabled) return null;

  return (
    <section id="dresscode" className="section-sage-soft section-pad sm:px-8">
      <div className="mx-auto max-w-[360px]">
        <SectionHead
          script="Attire"
          title={dressCode.title}
          subtitle={dressCode.note}
        />

        <InView>
          <div className="flex items-end justify-center gap-5 sm:gap-7">
            {dressCode.colors.map((c, i) => (
              <div key={c.hex} className="flex flex-col items-center gap-2.5">
                <div
                  className="relative h-16 w-16 rounded-full shadow-[0_12px_28px_-12px_rgba(46,63,44,0.35)] ring-2 ring-white sm:h-[4.5rem] sm:w-[4.5rem]"
                  style={{
                    background: c.hex,
                    transform: `translateY(${i === 1 ? 0 : 6}px)`,
                  }}
                  aria-hidden
                >
                  <span className="absolute inset-[3px] rounded-full border border-black/5" />
                </div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-primary-dark uppercase">
                  {c.name}
                </p>
                <p className="font-mono text-[10px] text-muted">{c.hex}</p>
              </div>
            ))}
          </div>
        </InView>
      </div>
    </section>
  );
}
