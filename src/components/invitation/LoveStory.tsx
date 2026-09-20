"use client";

import { wedding } from "@/config/wedding";
import { InView, SectionHead } from "@/components/motion/primitives";
import { FloatingIslamicCloud } from "@/components/ui/Ornament";

export function LoveStory() {
  return (
    <section
      id="story"
      className="relative overflow-hidden section-cream section-pad sm:px-8"
    >
      <FloatingIslamicCloud
        variant={3}
        width={180}
        className="-top-6 -right-8 text-gold-light/40"
        opacity={0.4}
      />

      <div className="relative mx-auto max-w-[360px]">
        <SectionHead
          script="Love Story"
          title="Kisah Cinta"
          subtitle="Sepenggal kisah perjalanan kami menuju pelaminan."
        />

        <ol className="relative space-y-6 pl-8">
          <span
            className="absolute bottom-4 left-[0.7rem] top-4 w-0.5 bg-gradient-to-b from-gold/50 via-primary/30 to-transparent"
            aria-hidden
          />

          {wedding.loveStory.map((item, i) => (
            <li key={`${item.date}-${i}`} className="relative">
              <span className="absolute -left-[1.85rem] top-4 flex h-6 w-6 items-center justify-center rounded-full border border-gold/50 bg-gradient-to-br from-white to-cream text-gold shadow-sm">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M12 21s-7-4.5-9.5-9C.5 8 2.5 4.5 6 4.5c2 0 3.5 1.2 4 2.5.5-1.3 2-2.5 4-2.5 3.5 0 5.5 3.5 3.5 7.5C19 16.5 12 21 12 21z" />
                </svg>
              </span>

              <InView delay={i * 0.07}>
                <div className="story-bubble border border-gold/30 bg-white/90 px-5 py-4.5 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                    {item.date}
                  </p>
                  <h3 className="mt-1 font-serif text-[1.2rem] font-bold text-primary-dark">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
                    {item.description}
                  </p>
                </div>
              </InView>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
