import { promises as fs } from "fs";
import path from "path";
import type { GuestInvite } from "@/types/guest";
import type { InviteSide } from "@/types/wedding";

const DATA_PATH = path.join(process.cwd(), "data", "guests.json");

export async function readGuests(): Promise<GuestInvite[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as GuestInvite[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeGuests(list: GuestInvite[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(list, null, 2) + "\n", "utf8");
}

export async function findGuestByCode(
  code: string,
): Promise<GuestInvite | null> {
  const normalized = code.trim();
  if (!/^\d{4}$/.test(normalized)) return null;
  const list = await readGuests();
  return list.find((g) => g.code === normalized) ?? null;
}

/** Generate unique 4-digit code (1000–9999). */
export function generateCode(existing: Set<string>): string {
  for (let i = 0; i < 200; i++) {
    const n = 1000 + Math.floor(Math.random() * 9000);
    const code = String(n);
    if (!existing.has(code)) return code;
  }
  throw new Error("Gagal membuat shortcode unik. Coba lagi.");
}

export async function addGuest(input: {
  name: string;
  side: InviteSide;
  code?: string;
}): Promise<GuestInvite> {
  const name = input.name.trim();
  if (name.length < 2) throw new Error("Nama minimal 2 karakter.");
  if (input.side !== "pria" && input.side !== "wanita") {
    throw new Error("Side harus pria atau wanita.");
  }

  const list = await readGuests();
  const codes = new Set(list.map((g) => g.code));

  let code = input.code?.trim() ?? "";
  if (code) {
    if (!/^\d{4}$/.test(code)) throw new Error("Shortcode harus 4 digit.");
    if (codes.has(code)) throw new Error("Shortcode sudah dipakai.");
  } else {
    code = generateCode(codes);
  }

  const guest: GuestInvite = {
    code,
    name,
    side: input.side,
    createdAt: new Date().toISOString(),
  };
  list.unshift(guest);
  await writeGuests(list);
  return guest;
}

export async function removeGuest(code: string): Promise<boolean> {
  const list = await readGuests();
  const next = list.filter((g) => g.code !== code);
  if (next.length === list.length) return false;
  await writeGuests(next);
  return true;
}

export function invitePath(guest: GuestInvite, siteUrl?: string): string {
  const base = (siteUrl ?? "").replace(/\/$/, "");
  const path = `/?c=${guest.code}`;
  return base ? `${base}${path}` : path;
}
