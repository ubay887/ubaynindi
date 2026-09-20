"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getInviteUrl, getWhatsAppShareUrl } from "@/config/wedding";
import { copyToClipboard } from "@/lib/utils";
import { useInvitationGuest } from "@/hooks/useInvitationGuest";

export function ShareButton() {
  const { name: guestName, side, code } = useInvitationGuest();
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const shareWa = () => {
    window.open(
      getWhatsAppShareUrl({ guestName, side, code }),
      "_blank",
      "noopener,noreferrer",
    );
    setOpen(false);
  };

  const copyLink = async () => {
    const ok = await copyToClipboard(
      getInviteUrl({ code, side, guestName }),
    );
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
    setOpen(false);
  };

  const nativeShare = async () => {
    if (!navigator.share) return shareWa();
    try {
      await navigator.share({
        title: "Undangan Pernikahan Ubay & Nindi",
        text: "Undangan digital pernikahan Ubay & Nindi",
        url: getInviteUrl({ code, side, guestName }),
      });
      setOpen(false);
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="fixed top-4 left-4 z-40 sm:top-5 sm:left-5">
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Tutup menu bagikan" : "Bagikan undangan"}
        aria-expanded={open}
        className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 border-primary-dark/20 bg-cream/95 text-primary-dark shadow-[0_10px_25px_-8px_rgba(46,63,44,0.35)] backdrop-blur-md transition-all hover:border-gold ${
          open ? "ring-2 ring-gold/40 border-gold" : ""
        }`}
        whileTap={{ scale: 0.92 }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {open ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="18" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="6" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="18" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8.2 13.2l7.6 4.4M15.8 6.4l-7.6 4.4" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        )}
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="mt-2 flex min-w-[155px] flex-col gap-1 rounded-2xl border border-gold/30 bg-cream/98 p-1.5 shadow-[0_14px_36px_-12px_rgba(46,63,44,0.35)] backdrop-blur-xl"
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <button
              type="button"
              onClick={shareWa}
              className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-primary-dark transition-colors hover:bg-primary/10"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#25D366]/15 text-[#128C7E]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.82c0 1.96.53 3.8 1.46 5.4L2 22l4.95-1.56a10 10 0 004.99 1.34h.01c5.46 0 9.9-4.4 9.9-9.82C21.84 6.4 17.5 2 12.04 2zm5.75 13.97c-.24.68-1.4 1.25-1.94 1.33-.5.07-1.13.1-1.82-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.14-4.9-4.33-.14-.19-1.15-1.53-1.15-2.92 0-1.39.73-2.07.99-2.35.26-.28.57-.35.76-.35h.54c.17 0 .4-.06.62.48.24.58.81 2 .88 2.14.07.14.12.31.02.5-.1.19-.14.31-.28.48-.14.17-.3.38-.43.51-.14.14-.29.29-.12.56.17.28.75 1.24 1.61 2.01 1.11.99 2.04 1.3 2.33 1.44.29.14.45.12.62-.07.17-.19.72-.84.91-1.13.19-.28.38-.24.64-.14.26.1 1.66.78 1.95.93.28.14.47.21.54.33.07.12.07.68-.17 1.36z" />
                </svg>
              </span>
              WhatsApp
            </button>
            <button
              type="button"
              onClick={copyLink}
              className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-primary-dark transition-colors hover:bg-primary/10"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary-dark">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </span>
              {copied ? "Tersalin ✓" : "Salin Tautan"}
            </button>
            {typeof navigator !== "undefined" && "share" in navigator ? (
              <button
                type="button"
                onClick={nativeShare}
                className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-primary-dark transition-colors hover:bg-primary/10"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary-dark">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="18" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="6" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="18" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8.2 13.2l7.6 4.4M15.8 6.4l-7.6 4.4" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
                Lainnya…
              </button>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

