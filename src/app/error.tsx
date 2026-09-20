"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cream px-6 text-center">
      <p className="font-script text-[2rem] text-ink">The Wedding Of</p>
      <p className="mt-2 font-serif text-xl tracking-[0.14em] text-primary-dark uppercase">
        Ubay &amp; Nindi
      </p>
      <p className="mt-6 max-w-sm text-sm text-muted">
        Undangan gagal dimuat. Silakan muat ulang halaman.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="btn-double-solid mt-6 rounded-full px-6 py-2.5 text-sm font-medium text-cream"
      >
        Coba lagi
      </button>
    </div>
  );
}
