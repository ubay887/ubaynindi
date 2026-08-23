"use client";

import { wedding } from "@/config/wedding";
import { InView, SectionHead } from "@/components/motion/primitives";

const icons = [
  // clock
  <svg key="c" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>,
  // heart
  <svg key="h" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 21s-7-4.5-9.5-9C.5 8 2.5 4.5 6 4.5c2 0 3.5 1.2 4 2.5.5-1.3 2-2.5 4-2.5 3.5 0 5.5 3.5 3.5 7.5C19 16.5 12 21 12 21z" />
  </svg>,
  // pin
  <svg key="p" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.5" />
  </svg>,
];

export function Notes() {
  const { notes } = wedding;
  if (!notes.enabled || !notes.items.length) return null;

  return (
    <section id="notes" className="section-cream section-pad sm:px-8">
      <div className="mx-auto max-w-[360px]">
        <SectionHead
          script="Information"
          title="Catatan Tamu"
          subtitle="Beberapa informasi singkat untuk kenyamanan bersama."
        />

        <div className="space-y-3">
          {notes.items.map((item, i) => (
            <InView key={item.title} delay={i * 0.06}>
              <div className="flex gap-3.5 rounded-2xl border border-primary/8 bg-white/75 px-4 py-4 shadow-[0_12px_28px_-18px_rgba(46,63,44,0.15)]">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary-dark">
                  {icons[i % icons.length]}
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-primary-dark">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                    {item.body}
                  </p>
                </div>
              </div>
            </InView>
          ))}
        </div>
      </div>
    </section>
  );
}
