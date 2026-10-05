import "server-only";

import type { InviteSide, Wish } from "@/types/wedding";

const MAX_NAME = 80;
const MAX_MESSAGE = 500;

function normalized(raw: unknown, max: number): string {
  if (typeof raw !== "string") return "";
  return raw.normalize("NFC").replace(/[\u0000-\u001F\u007F]/g, "").replace(/\s+/gu, " ").trim().slice(0, max);
}

function codePointLength(value: string) {
  return Array.from(value).length;
}

export type GuestbookInput = {
  guestName: string;
  message: string;
  attendance: Wish["attendance"];
  guestCount: number | null;
  side: InviteSide | null;
  honeypot: string;
  formStartedAt: number | null;
};

export function parseGuestbookInput(value: unknown): GuestbookInput {
  if (!value || typeof value !== "object") throw new Error("INVALID_PAYLOAD");
  const data = value as Record<string, unknown>;
  const anonymous = data.anonymous === true;
  const name = anonymous ? "Anonim" : normalized(data.guest_name, MAX_NAME);
  const message = normalized(data.message, MAX_MESSAGE);
  const attendance = data.attendance;
  const side = data.side === "pria" || data.side === "wanita" ? data.side : null;
  const guestCount = data.guest_count === undefined || data.guest_count === null || data.guest_count === ""
    ? null
    : Number(data.guest_count);

  if (!anonymous && (codePointLength(name) < 2 || codePointLength(name) > MAX_NAME)) throw new Error("INVALID_NAME");
  if (codePointLength(message) < 1 || codePointLength(message) > MAX_MESSAGE) throw new Error("INVALID_MESSAGE");
  if (attendance !== "hadir" && attendance !== "tidak_hadir" && attendance !== "ragu") throw new Error("INVALID_ATTENDANCE");
  if (attendance === "hadir" && (guestCount === null || !Number.isInteger(guestCount) || guestCount < 1 || guestCount > 10)) throw new Error("INVALID_GUEST_COUNT");
  if (attendance !== "hadir" && guestCount !== null) throw new Error("INVALID_GUEST_COUNT");

  return {
    guestName: name || "Anonim",
    message,
    attendance,
    guestCount: attendance === "hadir" ? guestCount : null,
    side,
    honeypot: typeof data.website === "string" ? data.website : "",
    formStartedAt: typeof data.form_started_at === "number" ? data.form_started_at : null,
  };
}
