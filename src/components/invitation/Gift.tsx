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
      window.setTimeout(() => setCopied(null), 2000);
    }
  };

  return (
    <section id="gift" className="section-cream section-pad sm:px-8">
      <div className="mx-auto max-w-[360px]">
        <SectionHead script="Wedding Gift" subtitle={gifts.note} />

        <InView className="flex flex-col items-center">
          <Button
            type="button"
            size="md"
            variant="double"
            className="min-w-[160px]"
            aria-expanded={open}
            aria-controls="gift-accounts"
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect
                x="3"
                y="6"
                width="18"
                height="13"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M3 10h18M8 14h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            {open ? "Tutup" : "Klik di Sini"}
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
              className="mt-6 space-y-4 overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {gifts.accounts.map((acc) => (
                <div
                  key={`${acc.bank}-${acc.accountNumber}`}
                  className="relative overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-[#2c3f2a] via-primary-dark to-[#4a6b47] px-5 py-6 text-cream shadow-[0_20px_44px_-18px_rgba(47,66,45,0.5)]"
                >
                  <div
                    className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full opacity-30 blur-2xl"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(212,188,138,0.55), transparent 70%)",
                    }}
                  />

                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-cream/50">
                        Bank
                      </p>
                      <p className="mt-0.5 text-lg font-bold tracking-wide">
                        {acc.bank}
                      </p>
                    </div>
                    <div className="h-7 w-10 rounded-md bg-gradient-to-br from-gold-soft/90 to-gold/55 shadow-inner" />
                  </div>

                  <div className="relative mt-5">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-cream/50">
                      No. Rekening
                    </p>
                    <p className="mt-1 font-mono text-[1.2rem] tracking-[0.12em]">
                      {acc.accountNumber}
                    </p>
                  </div>

                  <div className="relative mt-3.5">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-cream/50">
                      Atas Nama
                    </p>
                    <p className="mt-1 text-sm font-medium">{acc.accountName}</p>
                  </div>

                  <Button
                    size="sm"
                    variant="double-on-sage"
                    className="relative mt-5 w-full font-semibold"
                    onClick={() => handleCopy(acc.accountNumber)}
                  >
                    {copied === acc.accountNumber
                      ? "Tersalin ✓"
                      : "Salin Rekening"}
                  </Button>
                </div>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
