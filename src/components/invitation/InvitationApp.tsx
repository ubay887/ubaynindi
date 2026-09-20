"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { wedding } from "@/config/wedding";
import { GuestProvider, useInvitationGuest } from "@/hooks/useInvitationGuest";
import { useInvitationAudio } from "@/hooks/useInvitationAudio";
import { Cover } from "@/components/invitation/Cover";
import type { GuestState } from "@/types/guest";

const InvitationOpened = dynamic(
  () =>
    import("@/components/invitation/InvitationOpened").then(
      (m) => m.InvitationOpened,
    ),
  {
    loading: () => (
      <div className="flex min-h-dvh items-center justify-center section-cream">
        <p className="font-script text-[2rem] text-ink">The Wedding Of</p>
      </div>
    ),
  },
);

function InvitationInner() {
  const guest = useInvitationGuest();
  const guestName = guest.name;
  const [opened, setOpened] = useState(false);
  const { isPlaying, play, toggle } = useInvitationAudio(opened);

  useEffect(() => {
    document.body.classList.toggle("invitation-locked", !opened);
    return () => document.body.classList.remove("invitation-locked");
  }, [opened]);

  useEffect(() => {
    void import("@/components/invitation/InvitationOpened");
  }, []);

  const handleOpen = useCallback(async () => {
    setOpened(true);
    if (wedding.audio.autoplayOnOpen) {
      window.setTimeout(() => void play(), 350);
    }
  }, [play]);

  return (
    <>
      <AnimatePresence mode="wait">
        {!opened ? (
          <Cover key="cover" guestName={guestName} onOpen={handleOpen} />
        ) : null}
      </AnimatePresence>

      {opened ? (
        <InvitationOpened
          guestName={guestName}
          isPlaying={isPlaying}
          onToggleMusic={toggle}
        />
      ) : null}
    </>
  );
}

export function InvitationApp({ initialGuest }: { initialGuest: GuestState }) {
  return (
    <GuestProvider initial={initialGuest}>
      <InvitationInner />
    </GuestProvider>
  );
}
