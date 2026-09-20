import { promises as fs } from "fs";
import path from "path";
import type { GuestInvite } from "@/types/guest";
import type { InviteSide } from "@/types/wedding";
import {
  generateGuestCode,
  GUEST_CODE_PATTERN,
  normalizeGuestCode,
} from "@/lib/guest-code";
import { sanitizeGuestName } from "@/lib/utils";

const DATA_DIR =
  process.env.DATA_DIR?.trim() || path.join(process.cwd(), "data");
const DATA_PATH = path.join(DATA_DIR, "guests.json");

export class GuestStoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GuestStoreError";
  }
}

/** Serialize writes so two admin requests cannot clobber guests.json. */
let writeChain: Promise<unknown> = Promise.resolve();

function withWriteLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeChain.then(fn, fn);
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

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
  try {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    const payload = JSON.stringify(list, null, 2) + "\n";
    const tmp = `${DATA_PATH}.${process.pid}.tmp`;
    await fs.writeFile(tmp, payload, "utf8");
    try {
      await fs.rename(tmp, DATA_PATH);
    } catch {
      await fs.copyFile(tmp, DATA_PATH);
      await fs.unlink(tmp).catch(() => undefined);
    }
  } catch {
    throw new GuestStoreError(
      "Tidak bisa menulis data tamu. Di Coolify, pasang Persistent Storage ke /app/data agar folder bisa ditulis.",
    );
  }
}

export async function findGuestByCode(
  code: string,
): Promise<GuestInvite | null> {
  const normalized = normalizeGuestCode(code);
  if (!normalized) return null;
  const list = await readGuests();
  return list.find((g) => g.code === normalized) ?? null;
}

export function generateCode(existing: Set<string>): string {
  return generateGuestCode(existing);
}

export async function addGuest(input: {
  name: string;
  side: InviteSide;
  code?: string;
}): Promise<GuestInvite> {
  return withWriteLock(async () => {
    const name = sanitizeGuestName(input.name);
    if (name.length < 2) throw new Error("Nama minimal 2 karakter.");
    if (input.side !== "pria" && input.side !== "wanita") {
      throw new Error("Side harus pria atau wanita.");
    }

    const list = await readGuests();
    const codes = new Set(list.map((g) => g.code));

    let code = input.code?.trim() ?? "";
    if (code) {
      if (!GUEST_CODE_PATTERN.test(code)) {
        throw new Error("Shortcode harus 4–8 digit angka.");
      }
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
  });
}

export async function removeGuest(code: string): Promise<boolean> {
  return withWriteLock(async () => {
    const normalized = normalizeGuestCode(code);
    if (!normalized) return false;
    const list = await readGuests();
    const next = list.filter((g) => g.code !== normalized);
    if (next.length === list.length) return false;
    await writeGuests(next);
    return true;
  });
}

export function invitePath(guest: GuestInvite, siteUrl?: string): string {
  const base = (siteUrl ?? "").replace(/\/$/, "");
  const path = `/?c=${guest.code}`;
  return base ? `${base}${path}` : path;
}
