import type { InviteSide } from "@/types/wedding";

export const GUEST_NAME_MAX_LEN = 80;

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Strip control chars, collapse space, cap length. Safe for UI + OG + JSON. */
export function sanitizeGuestName(raw: string | null | undefined): string {
  return (raw ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, GUEST_NAME_MAX_LEN);
}

export function decodeGuestName(raw: string | null | undefined): string {
  if (!raw) return "Tamu Undangan";
  try {
    const decoded = sanitizeGuestName(
      decodeURIComponent(raw.replace(/\+/g, " ")),
    );
    return decoded || "Tamu Undangan";
  } catch {
    return sanitizeGuestName(raw) || "Tamu Undangan";
  }
}

/** Parse `?side=pria|wanita` — default wanita */
export function parseInviteSide(
  raw: string | null | undefined,
): InviteSide {
  const v = (raw ?? "").trim().toLowerCase();
  if (v === "pria" || v === "groom" || v === "laki") return "pria";
  return "wanita";
}

export function sideLabel(side: InviteSide): string {
  return side === "pria" ? "Resepsi Pihak Pria" : "Akad & Resepsi Pihak Wanita";
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through
  }

  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

export function pad2(n: number) {
  return n.toString().padStart(2, "0");
}
