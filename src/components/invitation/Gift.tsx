"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { wedding } from "@/config/wedding";
import { copyToClipboard } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { InView, SectionHead } from "@/components/motion/primitives";

export function Gift() {
  const { gifts } = wedding;
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  if (!gifts.enabled) return null;

  const handleCopy = async (number: string) => {
    const ok = await copyToClipboard(number);
    if (ok) {
      setCopied(number);
      window.setTimeout(() => setCopied(null), 2500);
    }
  };

  return (
    <section id="gift" className="section-cream section-pad sm:px-8">
      <div className="mx-auto max-w-[360px]">
        <SectionHead script="Wedding Gift" title="Amplop Digital" subtitle={gifts.note} />

        <InView className="flex flex-col items-center">
          <Button
            type="button"
            size="md"
            variant="double-solid"
            className="btn-pulse min-w-[180px]"
            aria-expanded={open}
            aria-controls="gift-accounts"
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect
                x="3"
                y="6"
                width="18"
                height="13"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M3 10h18M8 14h4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            {open ? "Tutup Amplop" : "Transfer Amplop"}
          </Button>
          {!open ? (
            <p className="mt-3 text-center text-[11px] text-muted">
              Opsional — hanya bila berkenan
            </p>
          ) : null}
        </InView>

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              id="gift-accounts"
              className="mt-6 space-y-5 overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {gifts.accounts.map((acc) => (
                <div
                  key={`${acc.bank}-${acc.accountNumber}`}
                  className="card-gold-shine relative overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-br from-[#142d20] via-[#1e4733] to-[#112519] px-6 py-6 text-cream shadow-[0_20px_42px_-18px_rgba(18,44,30,0.5)]"
                >
                  <div
                    className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-30 blur-2xl"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(194,155,78,0.7), transparent 70%)",
                    }}
                  />

                  <div className="relative flex items-center justify-between">
                    <div>
                      <span className="text-[9.5px] font-bold uppercase tracking-[0.22em] text-gold-light">
                        Digital Card
                      </span>
                      <p className="mt-0.5 font-serif text-xl font-bold tracking-wider text-white">
                        {acc.bank}
                      </p>
                    </div>
                    {/* Metallic Microchip Visual */}
                    <div className="flex h-7 w-9 items-center justify-center rounded-md border border-gold-light/40 bg-gradient-to-br from-[#dfbe7e] to-[#967432] shadow-inner">
                      <div className="h-3 w-5 rounded-sm border border-emerald-950/30 bg-amber-50/30" />
                    </div>
                  </div>

                  <div className="relative mt-6">
                    <p className="text-[9.5px] uppercase tracking-[0.2em] text-cream/60">
                      Nomor Rekening
                    </p>
                    <p className="mt-1 font-mono text-[1.25rem] font-semibold tracking-[0.14em] text-amber-100">
                      {acc.accountNumber}
                    </p>
                  </div>

                  <div className="relative mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-[9.5px] uppercase tracking-[0.2em] text-cream/60">
                        Atas Nama
                      </p>
                      <p className="mt-0.5 font-serif text-sm font-semibold tracking-wide text-white">
                        {acc.accountName}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="double-on-sage"
                      className="font-semibold shadow-md"
                      onClick={() => handleCopy(acc.accountNumber)}
                    >
                      {copied === acc.accountNumber ? "Tersalin ✓" : "Salin No. Rek"}
                    </Button>
                  </div>
                </div>
              ))}

              {copied ? (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-gold/40 bg-gold/15 p-3 text-center text-xs font-semibold text-primary-dark"
                >
                  Nomor rekening telah berhasil disalin!
                </motion.div>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}

