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
  const [attendance, setAttendance] =
    useState<Wish["attendance"]>("hadir");
  const [guestCount, setGuestCount] = useState(1);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

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

  return (
    <section id="wishes" className="section-cream section-pad sm:px-8">
      <div className="mx-auto max-w-[360px]">
        <SectionHead
          script="Wishes"
          title={wishes.title}
          subtitle={wishes.subtitle}
        />

        <InView>
          <form
            onSubmit={onSubmit}
            className="mb-7 space-y-4 rounded-2xl border border-gold/20 bg-white/70 p-5 shadow-[0_16px_40px_-24px_rgba(47,66,45,0.2)]"
          >
            <div>
              <label
                htmlFor="wish-name"
                className="mb-1.5 block text-[11px] font-medium tracking-wide text-muted"
              >
                Nama
              </label>
              <input
                id="wish-name"
                value={anonymous ? "Anonim" : name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Anda"
                disabled={anonymous}
                className="field-input w-full rounded-full border border-primary/12 bg-cream/90 px-4 py-2.5 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
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
                className="mb-1.5 block text-[11px] font-medium tracking-wide text-muted"
              >
                Ucapan & Doa
              </label>
              <textarea
                id="wish-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tulis doa dan ucapan terbaik..."
                rows={3}
                className="field-input w-full resize-none rounded-2xl border border-primary/12 bg-cream/90 px-4 py-2.5 text-sm outline-none"
                maxLength={500}
              />
            </div>
            <div>
              <p className="mb-2 text-[11px] font-medium tracking-wide text-muted">
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
                    className={`rounded-full border py-2 text-xs font-medium transition-all duration-200 ${
                      attendance === v
                        ? "border-primary-dark bg-primary-dark text-cream"
                        : "border-primary/15 bg-transparent text-primary-dark hover:border-primary/30"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {attendance === "hadir" ? (
              <div>
                <p className="mb-2 text-[11px] font-medium tracking-wide text-muted">
                  Jumlah Tamu
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setGuestCount(n)}
                      className={`rounded-full border py-2 text-xs font-medium transition-all duration-200 ${
                        guestCount === n
                          ? "border-primary bg-primary/12 text-primary-dark"
                          : "border-primary/15 bg-transparent text-primary-dark hover:border-primary/30"
                      }`}
                    >
                      {n === 3 ? "3+" : `${n} Orang`}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {error ? <p className="text-xs text-red-700">{error}</p> : null}
            {sent ? (
              <p className="rounded-xl bg-primary/10 px-3 py-2 text-center text-xs font-medium text-primary-dark">
                Terima kasih — doa & ucapan Anda sudah tersimpan.
              </p>
            ) : null}
            <Button type="submit" variant="double-solid" className="w-full">
              Kirim Ucapan
            </Button>
          </form>
        </InView>

        <div className="scroll-soft max-h-[320px] space-y-2.5 overflow-y-auto pr-0.5">
          <AnimatePresence initial={false}>
            {list.map((w) => (
              <motion.article
                key={w.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-gold/15 bg-white/65 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-primary-dark">
                    {w.name}
                  </p>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {w.guestCount && w.attendance === "hadir" ? (
                      <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-medium text-primary-dark">
                        {w.guestCount >= 3 ? "3+" : w.guestCount} org
                      </span>
                    ) : null}
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary-dark">
                      {labels[w.attendance]}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">
                  {w.message}
                </p>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
