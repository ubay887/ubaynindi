"use client";

import { useEffect, useState } from "react";

export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
};

function calc(target: Date): CountdownParts {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { days, hours, minutes, seconds, isPast: false };
}

export function useCountdown(target: Date): CountdownParts {
  const [parts, setParts] = useState<CountdownParts>(() => calc(target));

  useEffect(() => {
    setParts(calc(target));
    const id = window.setInterval(() => setParts(calc(target)), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  return parts;
}
