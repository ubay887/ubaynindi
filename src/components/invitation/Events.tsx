"use client";

import type { EventDetail } from "@/types/wedding";
import { getEventsForSide } from "@/config/wedding";
import { useInviteSide } from "@/hooks/useInviteSide";
import { InView, SectionHead } from "@/components/motion/primitives";
import {
  GoldDivider,
  IslamicCornerArt,
  FloatingIslamicCloud,
} from "@/components/ui/Ornament";
import { LinkButton } from "@/components/ui/Button";

function EventCard({ event, index }: { event: EventDetail; index: number }) {
  const day = event.date.split("-")[2];
  const weekday = event.dateLabel.split(",")[0];
  const rest = event.dateLabel.replace(/^[^,]+,\s*\d+\s*/, "");
  const [month, year] = rest.split(" ");
  const sessions = event.sessions?.length
    ? event.sessions
    : [{ label: "Waktu", time: event.time }];

  const mapsHref =
    event.mapsUrl ?? `https://www.google.com/maps?q=${event.lat},${event.lng}`;

  return (
    <InView delay={index * 0.1}>
      <article className="arch-frame relative mx-auto w-full max-w-[325px] overflow-hidden px-7 py-12 text-center shadow-[0_20px_48px_-20px_rgba(18,44,30,0.2)]">
        <IslamicCornerArt position="top-left" className="top-2 left-2 opacity-40" />
        <IslamicCornerArt position="top-right" className="top-2 right-2 opacity-40" />

        <p className="text-[11.5px] font-bold uppercase tracking-[0.28em] text-primary">
          {event.title}
        </p>

        <GoldDivider className="my-4" />

        {/* Vertical Date Presentation (Invisimple style) */}
        <div className="my-2 flex flex-col items-center">
          <p className="font-script text-[2.3rem] leading-none text-gold">
            {weekday}
          </p>
          <p className="mt-1 font-serif text-[4.2rem] font-bold leading-none tracking-tight text-ink">
            {day}
          </p>
          <div className="mt-1.5 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.2em] text-muted">
            <span>{month}</span>
            <span className="h-1 w-1 rounded-full bg-gold" />
            <span>{year}</span>
          </div>
        </div>

        {/* Sessions Schedule */}
        <div className="mx-auto mt-6 w-full max-w-[240px] space-y-3 rounded-2xl bg-primary/5 p-4 border border-primary/10">
          {sessions.map((s) => (
            <div key={`${s.label}-${s.time}`} className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-soft">
                {s.label}
              </p>
              <p className="mt-0.5 font-serif text-[15px] font-bold text-primary-dark">
                {s.time}
              </p>
            </div>
          ))}
        </div>

        {/* Venue Info */}
        <div className="mt-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-soft">
            Lokasi Acara
          </p>
          <p className="mt-1 font-serif text-[1.2rem] font-bold text-primary-dark">
            {event.venue}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted px-2">
            {event.address}
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-center">
          <LinkButton
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            variant="double-solid"
            size="sm"
            className="min-w-[170px] text-xs font-semibold shadow-md"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" />
            </svg>
            Buka Google Maps
          </LinkButton>
        </div>
      </article>
    </InView>
  );
}

export function Events() {
  const side = useInviteSide();
  const events = getEventsForSide(side);

  return (
    <section id="events" className="relative overflow-hidden section-cream section-pad sm:px-8">
      <FloatingIslamicCloud
        variant={1}
        width={210}
        className="-top-8 -left-8 text-gold-light/45"
        opacity={0.45}
      />
      <FloatingIslamicCloud
        variant={2}
        width={210}
        flip
        className="bottom-10 -right-8 text-gold-light/45"
        opacity={0.45}
      />

      <div className="relative mx-auto max-w-[380px]">
        <SectionHead
          script="Wedding Event"
          title="Rangkaian Acara"
          subtitle="Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir:"
        />
        <div className="flex flex-col items-center gap-10">
          {events.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
