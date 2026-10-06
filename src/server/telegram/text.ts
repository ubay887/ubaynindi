export type WishView = {
  id: string;
  name: string;
  message: string;
  attendance: "hadir" | "tidak_hadir" | "ragu";
  guestCount?: number;
  createdAt: string;
};

export type Button = { text: string; data: string };
export type Keyboard = Button[][];

export type Incoming =
  | { kind: "message"; chatId: number; chatType: string; fromId: number | null; text: string }
  | { kind: "callback"; chatId: number; chatType: string; fromId: number | null; data: string; callbackId: string; messageId: number };

const attendanceLabel: Record<WishView["attendance"], string> = {
  hadir: "Hadir",
  tidak_hadir: "Tidak hadir",
  ragu: "Belum pasti",
};

export function parseAdminIds(raw: string | undefined) {
  const ids = new Set<number>();
  for (const part of (raw ?? "").split(",")) {
    const trimmed = part.trim();
    if (!/^\d{1,15}$/.test(trimmed)) continue;
    const id = Number(trimmed);
    if (Number.isSafeInteger(id) && id > 0) ids.add(id);
  }
  return ids;
}

export function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function readUpdate(update: unknown): Incoming | null {
  if (!update || typeof update !== "object") return null;
  const value = update as Record<string, unknown>;
  const callback = record(value.callback_query);
  if (callback) {
    const message = record(callback.message);
    const chat = record(message?.chat);
    const from = record(callback.from);
    if (!chat || typeof chat.id !== "number" || typeof callback.id !== "string" || typeof callback.data !== "string" || typeof message?.message_id !== "number") return null;
    return {
      kind: "callback",
      chatId: chat.id,
      chatType: typeof chat.type === "string" ? chat.type : "",
      fromId: typeof from?.id === "number" ? from.id : null,
      data: callback.data.slice(0, 64),
      callbackId: callback.id,
      messageId: message.message_id,
    };
  }
  const message = record(value.message);
  if (!message || typeof message.text !== "string") return null;
  const chat = record(message.chat);
  const from = record(message.from);
  if (!chat || typeof chat.id !== "number") return null;
  return {
    kind: "message",
    chatId: chat.id,
    chatType: typeof chat.type === "string" ? chat.type : "",
    fromId: typeof from?.id === "number" ? from.id : null,
    text: message.text.slice(0, 300),
  };
}

export function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }).format(date);
}

export function formatWish(entry: WishView, detailed = false) {
  const when = formatWhen(entry.createdAt);
  const count = entry.attendance === "hadir" && entry.guestCount ? ` · ${entry.guestCount} orang` : "";
  const body = detailed ? clip(entry.message.trim(), 300) : clip(entry.message.replace(/\s+/g, " ").trim(), 140);
  return `<b>${escapeHtml(entry.name)}</b> · ${attendanceLabel[entry.attendance]}${count}${when ? ` · ${escapeHtml(when)}` : ""}\n<code>${escapeHtml(detailed ? entry.id : entry.id.slice(0, 8))}</code>\n${escapeHtml(body)}`;
}

export function byLatest(entries: WishView[]) {
  return [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
}

export function formatPage(entries: WishView[], total: number, page: number, pageSize: number) {
  if (total === 0) return "Belum ada ucapan.";
  const ordered = byLatest(entries);
  const start = (page - 1) * pageSize + 1;
  const end = start + ordered.length - 1;
  if (!ordered.length) return "Halaman itu tidak ada. Kirim /list untuk kembali ke awal.";
  return `Terbaru dulu · ${start}–${end} dari ${total}\n\n${ordered.map((entry) => formatWish(entry)).join("\n\n")}`;
}

export function pageKeyboard(entries: WishView[], total: number, page: number, pageSize: number): Keyboard {
  const rows = byLatest(entries).map((entry) => [{ text: `Hapus ${clip(entry.name, 18)} · ${entry.id.slice(0, 4)}`, data: `ask:${entry.id}` }]);
  const nav: Button[] = [];
  if (page > 1) nav.push({ text: "Sebelumnya", data: `list:${page - 1}` });
  if (page * pageSize < total) nav.push({ text: "Berikutnya", data: `list:${page + 1}` });
  if (nav.length) rows.push(nav);
  return rows;
}

export function confirmText(entry: WishView) {
  return `Hapus ucapan ini?\n\n${formatWish(entry, true)}\n\nPenghapusan tidak bisa dibatalkan dari bot.`;
}

export function confirmKeyboard(id: string): Keyboard {
  return [[{ text: "Ya, hapus", data: `yes:${id}` }, { text: "Batal", data: `no:${id}` }]];
}

export function helpText() {
  return [
    "Perintah buku tamu:",
    "/list — ucapan terbaru di atas",
    "/list 2 — ucapan yang lebih lama",
    "/hapus <awalan-id> — pilih ucapan untuk dihapus",
    "/id — ID Telegram kamu",
    "",
    "Tombol Hapus selalu meminta konfirmasi.",
  ].join("\n");
}

export function lockedText(fromId: number | null) {
  const id = fromId ?? "tidak diketahui";
  return `Perintah ini hanya untuk admin.\nID Telegram kamu: ${id}\nTambahkan angka itu ke TELEGRAM_ADMIN_IDS, lalu jalankan ulang server.`;
}

function clip(value: string, max: number) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

function record(value: unknown) {
  return value && typeof value === "object" ? value as Record<string, unknown> : null;
}
