"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { wedding } from "@/config/wedding";

export function useInvitationAudio(enabled: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  const createAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;
    const audio = new Audio(wedding.audio.src);
    audio.loop = true;
    audio.preload = "none";
    audio.volume = 0.45;
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onCanPlay = () => setReady(true);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("canplaythrough", onCanPlay);

    audioRef.current = audio;
    return audio;
  }, []);

  useEffect(() => {
    if (enabled) return;
    const audio = audioRef.current;
    audio?.pause();
    if (audio) {
      audioRef.current = null;
    }
  }, [enabled]);

  const play = useCallback(async () => {
    const audio = createAudio();
    try {
      await audio.play();
    } catch {
      // Autoplay blocked or missing file — ignore silently
      setIsPlaying(false);
    }
  }, [createAudio]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(async () => {
    if (isPlaying) pause();
    else await play();
  }, [isPlaying, pause, play]);

  return { isPlaying, ready, play, pause, toggle };
}
