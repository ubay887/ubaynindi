import type { InviteSide } from "@/types/wedding";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function decodeGuestName(raw: string | null | undefined): string {
  if (!raw) return "Tamu Undangan";
  try {
    const decoded = decodeURIComponent(raw.replace(/\+/g, " ")).trim();
    return decoded || "Tamu Undangan";
  } catch {
    return raw.trim() || "Tamu Undangan";
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
