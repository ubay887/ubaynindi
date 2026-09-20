"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type MusicToggleProps = {
  isPlaying: boolean;
  onToggle: () => void;
};

export function MusicToggle({ isPlaying, onToggle }: MusicToggleProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    onToggle();
    setShowTooltip(true);
    window.setTimeout(() => setShowTooltip(false), 2000);
  };

  return (
    <div className="fixed top-4 right-4 z-40 sm:top-5 sm:right-5">
      <AnimatePresence>
        {showTooltip ? (
          <motion.div
            initial={{ opacity: 0, x: 8, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.9 }}
            className="pointer-events-none absolute right-13 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-gold/35 bg-cream/95 px-3 py-1 text-[10.5px] font-bold tracking-wide text-primary-dark shadow-md backdrop-blur-md"
          >
            {isPlaying ? "Musik Diputar ♫" : "Musik Dijeda"}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={handleClick}
        aria-label={isPlaying ? "Matikan musik" : "Putar musik"}
        className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 border-gold/55 bg-cream/95 text-primary-dark shadow-[0_10px_25px_-8px_rgba(13,34,23,0.35)] backdrop-blur-md transition-all hover:border-gold ${
          isPlaying ? "ring-2 ring-gold/30" : ""
        }`}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {isPlaying ? (
          <span className="flex items-end gap-[3px]">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-[2.5px] rounded-full bg-primary-dark"
                animate={{ height: [4, 12, 4] }}
                transition={{
                  duration: 0.7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.14,
                }}
                style={{ height: 7 }}
              />
            ))}
          </span>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M9 18V6l10-2v12"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <circle cx="7" cy="18" r="2.1" fill="currentColor" />
            <circle cx="17" cy="16" r="2.1" fill="currentColor" />
            <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </motion.button>
    </div>
  );
}

