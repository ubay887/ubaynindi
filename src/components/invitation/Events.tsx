"use client";

import type { EventDetail } from "@/types/wedding";
import { getEventsForSide } from "@/config/wedding";
import { useInviteSide } from "@/hooks/useInviteSide";
import { InView, SectionHead } from "@/components/motion/primitives";

function EventCard({ event, index }: { event: EventDetail; index: number }) {
  const day = event.date.split("-")[2];
  const weekday = event.dateLabel.split(",")[0];
  const rest = event.dateLabel.replace(/^[^,]+,\s*\d+\s*/, "");
  const [month, year] = rest.split(" ");
  const sessions = event.sessions?.length
    ? event.sessions
    : [{ label: "Waktu", time: event.time }];

  return (
    <InView delay={index * 0.1}>
      <article className="oval-frame relative mx-auto w-full max-w-[300px] px-8 py-14 text-center sm:max-w-[318px] sm:px-10 sm:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
          {event.title}
        </p>

        <div className="gold-rule mx-auto mt-4 w-10" />

        <p className="mt-6 font-script text-[1.9rem] leading-none text-gold">
          {weekday}
        </p>
        <p className="mt-1 font-serif text-[3.6rem] font-semibold leading-none tracking-tight text-primary-dark">
          {day}
        </p>
        <p className="mt-2 text-[12px] font-medium uppercase tracking-[0.16em] text-muted">
          {month} {year}
        </p>

        <div className="mx-auto mt-6 w-full max-w-[220px] space-y-3">
          {sessions.map((s) => (
            <div key={`${s.label}-${s.time}`} className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-soft">
                {s.label}
              </p>
              <p className="mt-0.5 text-[14px] font-semibold text-primary-dark">
                {s.time}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-soft">
            Lokasi
          </p>
          <p className="mt-1.5 text-[14px] font-semibold text-primary-dark">
            {event.venue}
          </p>
        </div>
      </article>
    </InView>
  );
}

export function Events() {
  const side = useInviteSide();
  const events = getEventsForSide(side);

  return (
    <section id="events" className="section-sage section-pad sm:px-8">
      <div className="mx-auto max-w-[380px]">
        <SectionHead
          script="Wedding Event"
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
