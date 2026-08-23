"use client";

import { useEffect } from "react";

/** Lightweight scroll reveal for `.reveal` elements */
export function useReveal(rootSelector = "main") {
  useEffect(() => {
    const root = document.querySelector(rootSelector) ?? document;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>(".reveal"));
    if (!nodes.length) return;

    if (typeof IntersectionObserver === "undefined") {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [rootSelector]);
}
