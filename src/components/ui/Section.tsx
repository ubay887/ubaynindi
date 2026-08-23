import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  children: React.ReactNode;
  className?: string;
};

/** Lightweight layout wrapper (most sections use custom markup now) */
export function Section({ id, children, className }: SectionProps) {
  return (
    <section id={id} className={cn("relative px-5 py-16 sm:px-8 sm:py-20", className)}>
      <div className="mx-auto w-full max-w-[380px]">{children}</div>
    </section>
  );
}
