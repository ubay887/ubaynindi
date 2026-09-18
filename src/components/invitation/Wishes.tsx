"use client";

import { FormEvent, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { wedding } from "@/config/wedding";
import type { Wish } from "@/types/wedding";
import { Button } from "@/components/ui/Button";
import { InView, SectionHead } from "@/components/motion/primitives";

const STORAGE_KEY = "ubaynindi-wishes";

const seedWishes: Wish[] = [
  {
    id: "seed-1",
    name: "Keluarga Besar",
    message:
      "Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Barakallahu lakuma.",
    attendance: "hadir",
    guestCount: 2,
    createdAt: new Date().toISOString(),
  },
];

function loadWishes(): Wish[] {
  if (typeof window === "undefined") return seedWishes;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedWishes;
    const parsed = JSON.parse(raw) as Wish[];
    return Array.isArray(parsed) && parsed.length ? parsed : seedWishes;
  } catch {
    return seedWishes;
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
  const [list, setList] = useState<Wish[]>(seedWishes);
  const [name, setName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [attendance, setAttendance] = useState<Wish["attendance"]>("hadir");
  const [guestCount, setGuestCount] = useState(1);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [filter, setFilter] = useState<"semua" | "hadir" | "tidak_hadir">("semua");

  useEffect(() => {
    setList(loadWishes());
  }, []);

  if (!wishes.enabled) return null;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSent(false);
    const n = anonymous ? "Anonim" : name.trim();
    const m = message.trim();
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
      createdAt: new Date().toISOString(),
    };
    const updated = [next, ...list];
    setList(updated);
    saveWishes(updated);
    setName("");
    setAnonymous(false);
    setMessage("");
    setAttendance("hadir");
    setGuestCount(1);
    setSent(true);
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
    <section id="wishes" className="section-cream section-pad sm:px-8">
      <div className="mx-auto max-w-[360px]">
        <SectionHead
          script="Wishes & RSVP"
          title={wishes.title}
          subtitle={wishes.subtitle}
        />

        <InView>
          <div className="mb-5 flex items-center justify-between rounded-xl border border-gold/20 bg-gradient-to-r from-cream via-white to-cream-2 px-4 py-3 shadow-xs">
            <span className="text-xs font-semibold text-primary-dark">
              Kehadiran Tamu
            </span>
            <span className="rounded-full bg-primary-dark px-3 py-1 text-[11px] font-bold text-cream">
              {totalAttending} Konfirmasi Hadir
            </span>
          </div>

          <form
            onSubmit={onSubmit}
            className="mb-7 space-y-4 rounded-2xl border border-gold/30 bg-white/80 p-5 shadow-[0_16px_40px_-24px_rgba(47,66,45,0.2)] backdrop-blur-sm"
          >
            <div>
              <label
                htmlFor="wish-name"
                className="mb-1.5 block text-[11px] font-semibold tracking-wide text-primary-soft uppercase"
              >
                Nama Anda
              </label>
              <input
                id="wish-name"
                value={anonymous ? "Anonim" : name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tulis nama lengkap Anda"
                disabled={anonymous}
                className="field-input w-full rounded-full border border-primary/18 bg-cream/90 px-4 py-2.5 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
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
                  Kirim sebagai <span className="font-medium text-primary-dark">Anonim</span>
                </span>
              </label>
            </div>
            <div>
              <label
                htmlFor="wish-msg"
                className="mb-1.5 block text-[11px] font-semibold tracking-wide text-primary-soft uppercase"
              >
                Ucapan & Doa Restu
              </label>
              <textarea
                id="wish-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tuliskan doa & ucapan hangat untuk Ubay & Nindi..."
                rows={3}
                className="field-input w-full resize-none rounded-2xl border border-primary/18 bg-cream/90 px-4 py-2.5 text-sm outline-none"
                maxLength={500}
              />
            </div>
            <div>
              <p className="mb-2 text-[11px] font-semibold tracking-wide text-primary-soft uppercase">
                Konfirmasi Kehadiran
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ["hadir", "Hadir"],
                    ["tidak_hadir", "Tidak"],
                    ["ragu", "Ragu"],
                  ] as const
                ).map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAttendance(v)}
                    className={`rounded-full border py-2 text-xs font-semibold transition-all duration-200 ${
                      attendance === v
                        ? "border-primary-dark bg-primary-dark text-cream shadow-sm"
                        : "border-primary/20 bg-transparent text-primary-dark hover:border-primary/40"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {attendance === "hadir" ? (
              <div>
                <p className="mb-2 text-[11px] font-semibold tracking-wide text-primary-soft uppercase">
                  Jumlah Tamu
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setGuestCount(n)}
                      className={`rounded-full border py-2 text-xs font-semibold transition-all duration-200 ${
                        guestCount === n
                          ? "border-primary bg-primary/15 text-primary-dark shadow-xs"
                          : "border-primary/15 bg-transparent text-primary-dark hover:border-primary/30"
                      }`}
                    >
                      {n === 3 ? "3+ Orang" : `${n} Orang`}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {error ? <p className="text-xs font-medium text-red-700">{error}</p> : null}
            {sent ? (
              <p className="rounded-xl bg-primary/12 px-3 py-2.5 text-center text-xs font-semibold text-primary-dark">
                Terima kasih — doa & ucapan Anda sudah tersimpan ✓
              </p>
            ) : null}
            <Button type="submit" variant="double-solid" className="w-full font-semibold">
              Kirim Ucapan & Doa
            </Button>
          </form>
        </InView>

        {/* Filter Bar */}
        <div className="mb-3 flex items-center justify-center gap-1.5 rounded-full bg-primary/8 p-1">
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
              className={`flex-1 rounded-full py-1.5 text-[11px] font-semibold transition-all ${
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
          <AnimatePresence initial={false}>
            {filteredList.map((w) => (
              <motion.article
                key={w.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-gold/20 bg-white/80 p-4 shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-soft/30 to-gold/15 font-serif text-sm font-bold text-primary-dark">
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
                            ? "bg-primary/12 text-primary-dark"
                            : "bg-amber-100 text-amber-800"
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
