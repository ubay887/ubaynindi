"use client";

import { motion } from "framer-motion";

type MusicToggleProps = {
  isPlaying: boolean;
  onToggle: () => void;
};

export function MusicToggle({ isPlaying, onToggle }: MusicToggleProps) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-label={isPlaying ? "Matikan musik" : "Putar musik"}
      className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary-dark/20 bg-cream/95 text-primary-dark shadow-[0_12px_30px_-12px_rgba(47,66,45,0.45)] backdrop-blur-md"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {isPlaying ? (
        <span className="flex items-end gap-[3px]">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-[2.5px] rounded-full bg-primary-dark"
              animate={{ height: [5, 13, 5] }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.12,
              }}
              style={{ height: 8 }}
            />
          ))}
        </span>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
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
  );
}
