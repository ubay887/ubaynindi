/** Shortcode undangan: 4–8 digit. Kode lama 4 digit tetap valid. */

export const GUEST_CODE_MIN_LEN = 4;
export const GUEST_CODE_MAX_LEN = 8;
export const GUEST_CODE_PATTERN = /^\d{4,8}$/;

export function normalizeGuestCode(
  raw: string | null | undefined,
): string | null {
  const code = (raw ?? "").trim();
  return GUEST_CODE_PATTERN.test(code) ? code : null;
}

function randomSixDigit(): number {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return 100000 + (buf[0] % 900000);
  }
  return 100000 + Math.floor(Math.random() * 900000);
}

/** Kode baru: 6 digit (100000–999999). */
export function generateGuestCode(existing: Set<string>): string {
  for (let i = 0; i < 400; i++) {
    const code = String(randomSixDigit());
    if (!existing.has(code)) return code;
  }
  throw new Error("Gagal membuat shortcode unik. Coba lagi.");
}
