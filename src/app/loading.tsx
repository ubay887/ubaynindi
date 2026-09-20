import { wedding } from "@/config/wedding";

export default function Loading() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden section-cream">
      <div className="text-center">
        <p className="font-script text-[2rem] text-ink">The Wedding Of</p>
        <div className="ornament-line mx-auto my-3">
          <span className="dot" />
        </div>
        <p className="font-serif text-2xl tracking-[0.14em] text-primary-dark uppercase">
          {wedding.couple.displayNames}
        </p>
      </div>
    </div>
  );
}
