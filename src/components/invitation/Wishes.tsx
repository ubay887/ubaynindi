"use client";

import { FormEvent, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { wedding } from "@/config/wedding";
import type { Wish } from "@/types/wedding";
import { Button } from "@/components/ui/Button";
import { InView, SectionHead } from "@/components/motion/primitives";
import { FloatingIslamicCloud } from "@/components/ui/Ornament";
import { useInvitationGuest } from "@/hooks/useInvitationGuest";
import { fireWeddingConfetti } from "@/lib/confetti";

const STORAGE_KEY = "ubaynindi-wishes";

function loadWishes(): Wish[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Wish[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((w) => !String(w.id).startsWith("seed-"));
  } catch {
    return [];
  }
}

function saveWishes(list: Wish[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function Wishes() {
  const { wishes } = wedding;
  const guest = useInvitationGuest();
  const [list, setList] = useState<Wish[]>(loadWishes);
  const [name, setName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [attendance, setAttendance] = useState<Wish["attendance"]>("hadir");
  const [guestCount, setGuestCount] = useState(1);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [filter, setFilter] = useState<"semua" | "hadir" | "tidak_hadir">("semua");

  useEffect(() => {
    if (anonymous) return;
    if (
      guest.resolved &&
      guest.name &&
      guest.name !== "Tamu Undangan"
    ) {
      setName((current) => current || guest.name);
    }
  }, [anonymous, guest.resolved, guest.name]);

  if (!wishes.enabled) return null;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSent(false);
    const n = anonymous ? "Anonim" : name.trim().slice(0, 60);
    const m = message.trim().slice(0, 500);
    if (!anonymous && n.length < 2) {
      return setError("Nama minimal 2 karakter.");
    }
    if (m.length < 5) return setError("Ucapan minimal 5 karakter.");

    const next: Wish = {
      id: `${Date.now()}`,
      name: n,
      message: m,
      attendance,
      guestCount: attendance === "hadir" ? guestCount : 0,
      side: guest.side,
      createdAt: new Date().toISOString(),
    };
    const updated = [next, ...list];
    setList(updated);
    saveWishes(updated);
    setName(guest.resolved && guest.name !== "Tamu Undangan" ? guest.name : "");
    setAnonymous(false);
    setMessage("");
    setAttendance("hadir");
    setGuestCount(1);
    setSent(true);

    // Fire celebratory confetti!
    fireWeddingConfetti(2800);

    window.setTimeout(() => setSent(false), 3500);
  };

  const labels: Record<Wish["attendance"], string> = {
    hadir: "Hadir",
    tidak_hadir: "Tidak Hadir",
    ragu: "Belum Pasti",
  };

  const totalAttending = list
    .filter((w) => w.attendance === "hadir")
    .reduce((acc, curr) => acc + (curr.guestCount || 1), 0);

  const filteredList = list.filter((w) => {
    if (filter === "hadir") return w.attendance === "hadir";
    if (filter === "tidak_hadir") return w.attendance !== "hadir";
    return true;
  });

  return (
    <section id="wishes" className="relative overflow-hidden section-cream section-pad px-6 pb-28 sm:px-8">
      <FloatingIslamicCloud
        variant={2}
        width={200}
        className="-top-8 -right-10 text-gold-light/40"
        opacity={0.4}
      />

      <div className="relative mx-auto max-w-[400px]">
        <SectionHead
          script="Wishes & RSVP"
          title="Ucapan & Doa"
          subtitle="Berikan doa dan ucapan terbaik untuk kami."
        />

        <InView>
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-gold/40 bg-white/85 px-4.5 py-3.5 text-xs text-muted shadow-sm backdrop-blur-sm">
            <span className="font-bold text-primary-dark">Ucapan di perangkat ini</span>
            <span className="rounded-full bg-gradient-to-r from-primary-dark to-primary px-3.5 py-1 font-bold text-cream shadow-xs">
              {totalAttending} hadir
            </span>
          </div>

          <form
            onSubmit={onSubmit}
            className="mb-7 space-y-4.5 rounded-2xl border border-gold/40 bg-white/90 p-5.5 shadow-[0_16px_40px_-24px_rgba(18,44,30,0.2)] backdrop-blur-sm"
          >
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="wish-name"
                  className="block text-[11px] font-bold tracking-wide text-primary-soft uppercase"
                >
                  Nama Anda
                </label>
                {guest.resolved && guest.name !== "Tamu Undangan" && !anonymous && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10.5px] font-bold text-primary-dark">
                    ✓ Otomatis terisi
                  </span>
                )}
              </div>
              <input
                id="wish-name"
                value={anonymous ? "Anonim" : name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tulis nama lengkap Anda"
                disabled={anonymous}
                className="field-input w-full rounded-full border border-primary/20 bg-cream/90 px-4 py-2.5 text-sm font-medium text-ink outline-none disabled:cursor-not-allowed disabled:opacity-60"
                maxLength={60}
                autoComplete="name"
              />
              <label className="mt-2.5 flex cursor-pointer items-center gap-2 select-none">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => {
                    setAnonymous(e.target.checked);
                    if (e.target.checked) setError("");
                  }}
                  className="h-3.5 w-3.5 rounded border-primary/30 accent-primary-dark"
                />
                <span className="text-[12px] text-muted">
                  Kirim sebagai <span className="font-bold text-primary-dark">Anonim</span>
                </span>
              </label>
            </div>
            <div>
              <label
                htmlFor="wish-msg"
                className="mb-1.5 block text-[11px] font-bold tracking-wide text-primary-soft uppercase"
              >
                Ucapan & Doa Restu
              </label>
              <textarea
                id="wish-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tuliskan doa & ucapan hangat untuk Ubay & Nindi..."
                rows={3}
                className="field-input w-full resize-none rounded-2xl border border-primary/20 bg-cream/90 px-4 py-2.5 text-sm font-medium text-ink outline-none"
                maxLength={500}
              />
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold tracking-wide text-primary-soft uppercase">
                Konfirmasi Kehadiran
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ["hadir", "Hadir"],
                    ["tidak_hadir", "Tidak Hadir"],
                    ["ragu", "Ragu"],
                  ] as const
                ).map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAttendance(v)}
                    className={`rounded-full border py-2.5 text-[11px] font-bold leading-tight transition-all duration-200 ${
                      attendance === v
                        ? "border-primary-dark bg-primary-dark text-cream shadow-sm"
                        : "border-primary/20 bg-white/60 text-primary-dark hover:border-primary/40"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {attendance === "hadir" ? (
              <div>
                <p className="mb-2 text-[11px] font-bold tracking-wide text-primary-soft uppercase">
                  Jumlah Tamu
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setGuestCount(n)}
                      className={`rounded-full border py-2 text-xs font-bold transition-all duration-200 ${
                        guestCount === n
                          ? "border-primary bg-primary/15 text-primary-dark shadow-xs"
                          : "border-primary/15 bg-white/50 text-primary-dark hover:border-primary/30"
                      }`}
                    >
                      {n === 3 ? "3+ Orang" : `${n} Orang`}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {error ? <p className="text-xs font-semibold text-red-700">{error}</p> : null}
            {sent ? (
              <p className="rounded-xl bg-primary/12 px-3 py-2.5 text-center text-xs font-bold text-primary-dark">
                Terima kasih — doa & ucapan Anda sudah tersimpan ✓
              </p>
            ) : null}
            <Button type="submit" variant="double-solid" className="w-full font-bold shadow-md">
              Kirim Ucapan & Doa
            </Button>
            <p className="text-center text-[11px] leading-relaxed text-muted">
              Tersimpan di perangkat Anda. Daftar kehadiran terpusat menyusul.
            </p>
          </form>
        </InView>

        {/* Filter Bar */}
        <div className="mb-3 flex items-center justify-center gap-1.5 rounded-full bg-primary/10 p-1 border border-gold/20">
          {(
            [
              ["semua", "Semua"],
              ["hadir", "Hadir"],
              ["tidak_hadir", "Absen/Ragu"],
            ] as const
          ).map(([f, label]) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`flex-1 rounded-full py-1.5 text-[11px] font-bold transition-all ${
                filter === f
                  ? "bg-white text-primary-dark shadow-xs"
                  : "text-muted hover:text-primary-dark"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="scroll-soft max-h-[340px] space-y-3 overflow-y-auto pr-0.5">
          {filteredList.length === 0 ? (
            <p className="rounded-2xl border border-gold/25 bg-white/70 px-4 py-8 text-center text-sm text-muted">
              Belum ada ucapan di perangkat ini. Jadilah yang pertama.
            </p>
          ) : null}
          <AnimatePresence initial={false}>
            {filteredList.map((w) => (
              <motion.article
                key={w.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-gold/30 bg-white/90 p-4 shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold/30 to-gold-soft/20 font-serif text-sm font-bold text-primary-dark border border-gold/40">
                    {w.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-primary-dark truncate">
                        {w.name}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          w.attendance === "hadir"
                            ? "bg-primary/12 text-primary-dark border border-primary/20"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {labels[w.attendance]} {w.guestCount && w.attendance === "hadir" ? `(${w.guestCount} org)` : ""}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                      {w.message}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
